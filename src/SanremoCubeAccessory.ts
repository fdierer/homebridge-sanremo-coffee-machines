import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';

import { SanremoCoffeeMachines } from './SanremoCoffeeMachines';

import fetch from "node-fetch";

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class SanremoCubeAccessory {
    
    private heaterService: Service;
    private powerSwitchService: Service | null = null;
    private pollingInterval: NodeJS.Timeout | null = null;
    private readonly pollingIntervalMs: number;
    private readonly enablePowerSwitch: boolean;
    private readonly filterLifeDays: number;
    private readonly debugLogging: boolean;
    
    /** REST Commands */
    private readonly cmdGetDeviceInfo = 'key=150';
    private readonly cmdGetReadOnlyParameters =  'key=151';
    private readonly cmdGetReadWriteParameters = 'key=152';
    private readonly cmdStandby = 'key=200&id=12&value=1'
    private readonly cmdActive = 'key=200&id=11&value=1'
    private readonly cmdSetTemperature = 'key=200&id=1&value='
    private readonly cmdResetFilterExpiration = 'key=200&id=23&value=0'
    
    
    /** Read-only registers */
    private readonly regString = 'registers'
    
    private readonly roRegIndexTemp = 0;
    private readonly roRegIndexDayCoffee = 0;
    private readonly roRegIndexWeekCoffee = 0;
    private readonly roRegIndexMonthCoffee = 0;
    private readonly roRegIndexYearCoffee = 0;
    private readonly roRegIndexTotalCoffee = 0;
    private readonly roRegIndexFilterDaysRemaining = 10;
    private readonly roRegIndexStatus = 12;
    private readonly roRegIndexAlarm = 14;
    
    private roFilterChangeThresholdDays = 0;
    
    private readonly statusMaskTankLevelOk = 1;
    private readonly statusMaskBoilerLevelOk = 2;
    private readonly statusMaskPreAlarmTankLevel = 4;
    private readonly statusMaskWaterSource = 8;
    private readonly statusMaskStandby = 16;
    private readonly statusMaskReady = 32;
    private readonly statusMaskSteamBoosterHeating = 256;
    private readonly statusMaskSteamBoosterSetPointOk = 512;
    
    private readonly alarmMaskNeedChangeFilters = 128;
    
    private readonly cubeMinTempDegC = 115;
    private readonly cubeMaxTempDegC = 130;
    
    private roRegStatus = 0;
    private roRegAlarm = 0;
    private roRegTemp = 0;
    private roRegFilterDaysRemaining = 0;
    
    /** Read-write registers */
    private readonly rwRegIndexTemp = 0;
    
    private rwRegTemp = this.cubeMinTempDegC;
    
    /** Filter Maintenance Tracking */
    private nextFilterReplacementDate: Date | null = null;
    private hasInitialPollCompleted = false;
    private lastPollTimestamp: number | null = null;
    
    private readonly postUrl: string;
    
    constructor(
      private readonly platform: SanremoCoffeeMachines,
      private readonly accessory: PlatformAccessory,
      private readonly ipAddress: string,
      pollingIntervalSeconds: number = 30,
      enablePowerSwitch: boolean = false,
      filterLifeDays: number = 180,
      debugLogging: boolean = false)
    {
        this.postUrl = 'http://' + ipAddress + '/ajax/post';
        this.pollingIntervalMs = pollingIntervalSeconds * 1000;
        this.enablePowerSwitch = enablePowerSwitch;
        this.filterLifeDays = filterLifeDays;
        this.debugLogging = debugLogging;
        
        // Ensure accessory name is "Sanremo Cube" by default
        if (!this.accessory.displayName || this.accessory.displayName === 'Coffee Machine') {
            this.accessory.displayName = 'Sanremo Cube';
        }
        
        // set accessory information
        this.accessory.getService(this.platform.Service.AccessoryInformation)!
        .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Sanremo')
        .setCharacteristic(this.platform.Characteristic.Model, 'Cube')
        .setCharacteristic(this.platform.Characteristic.SerialNumber, ipAddress);
        
        // Setup HeaterCooler service with name "Sanremo Cube"
        this.heaterService = this.accessory.getService(this.platform.Service.HeaterCooler) ||
        this.accessory.addService(this.platform.Service.HeaterCooler, 'Sanremo Cube');
        
        // Setup heater service on/off
        this.heaterService.getCharacteristic(this.platform.Characteristic.Active).onGet(
                                                                                        this.handleActiveGet.bind(this));
        this.heaterService.getCharacteristic(this.platform.Characteristic.Active).onSet(
                                                                                        this.handleActiveSet.bind(this));
        
        // Setup heater service current temperature
        const currentTemperatureCharacteristic = this.heaterService.getCharacteristic(this.platform.Characteristic.CurrentTemperature);
        currentTemperatureCharacteristic.onGet(this.handleCurrentTemperatureGet.bind(this));
        currentTemperatureCharacteristic.setProps({ minValue: 0, maxValue: 150 });
        
        // Setup heater service target temperature
        const heatingThresholdCharacteristic = this.heaterService.getCharacteristic(this.platform.Characteristic.HeatingThresholdTemperature);
        heatingThresholdCharacteristic.onSet(this.handleTargetTemperatureSet.bind(this));
        heatingThresholdCharacteristic.onGet(this.handleTargetTemperatureGet.bind(this));
        heatingThresholdCharacteristic.setProps( {minValue: this.cubeMinTempDegC, maxValue: this.cubeMaxTempDegC, minStep: 1});
        
        // Setup heater service current heater cooler state
        const currentHeaterState = this.heaterService.getCharacteristic(this.platform.Characteristic.CurrentHeaterCoolerState);
        currentHeaterState.onGet(this.handleCurrentHeaterStateGet.bind(this));
        currentHeaterState.setProps({
          // validValues: hap.Characteristic.CurrentHeaterCoolerState.INACTIVE,
          //              hap.Characteristic.CurrentHeaterCoolerState.IDLE,
          //              hap.Characteristic.CurrentHeaterCoolerState.HEATING,
          //              hap.Characteristic.CurrentHeaterCoolerState.COOLING
            minValue: 0,
            maxValue: 2,
            validValues: [0, 1, 2]
        });
        
        const targetHeaterState = this.heaterService.getCharacteristic(this.platform.Characteristic.TargetHeaterCoolerState);
        targetHeaterState.onSet(this.handleTargetHeaterStateSet.bind(this));
        targetHeaterState.onGet(this.handleTargetHeaterStateGet.bind(this));
        targetHeaterState.setProps({
          // validValues: [hap.Characteristic.TargetHeaterCoolerState.HEAT,hap.Characteristic.TargetHeaterCoolerState.COOL],
          minValue: 1,
          maxValue: 1,
          validValues: [1, 1]
        });
        targetHeaterState.updateValue(this.platform.Characteristic.TargetHeaterCoolerState.HEAT);

        const defaultThreshold = Math.min(Math.max(120, this.cubeMinTempDegC), this.cubeMaxTempDegC);
        this.rwRegTemp = defaultThreshold;
        this.heaterService.updateCharacteristic(
          this.platform.Characteristic.HeatingThresholdTemperature,
          defaultThreshold);
        
        this.heaterService
            .getCharacteristic(this.platform.Characteristic.FilterChangeIndication)
            .onGet(this.handleFilterChangeIndicationGet.bind(this));

        this.heaterService
            .getCharacteristic(this.platform.Characteristic.FilterLifeLevel)
            .onGet(this.handleFilterLifeLevelGet.bind(this));

        this.heaterService
            .getCharacteristic(this.platform.Characteristic.ResetFilterIndication)
            .onSet(this.ResetFilterIndicationSet.bind(this));
        
        // Optionally add Power Switch service
        if (this.enablePowerSwitch) {
            this.powerSwitchService = this.accessory.getService(this.platform.Service.Switch) ||
                this.accessory.addService(this.platform.Service.Switch, 'Sanremo Cube Power');
            
            this.powerSwitchService
                .getCharacteristic(this.platform.Characteristic.On)
                .onGet(this.handlePowerSwitchGet.bind(this))
                .onSet(this.handlePowerSwitchSet.bind(this));
            
            this.platform.log.info(`Power Switch service enabled for ${this.accessory.displayName}`);
        }
        
        // Initialize filter replacement date from accessory context or calculate new one
        this.initializeFilterReplacementDate();
        
        // Start automatic polling for status updates
        this.startPolling();
    }
    
    /**
     * Start automatic polling to keep HomeKit status updated
     */
    private startPolling() {
        this.platform.log.info(`Starting automatic polling every ${this.pollingIntervalMs / 1000} seconds for ${this.accessory.displayName}`);
        this.debugLog(`Debug logging active for ${this.accessory.displayName}`);
        
        // Initial poll
        this.pollStatus();
        
        // Set up interval
        this.pollingInterval = setInterval(() => {
            this.pollStatus();
        }, this.pollingIntervalMs);
    }
    
    /**
     * Poll the coffee machine and update all characteristics
     */
    private async pollStatus() {
        try {
            this.debugLog('Beginning poll cycle');
            await this.getReadOnlyParameters();
            await this.getReadWriteParameters();
            
            // Update all characteristics
            const isActive = (this.roRegStatus & this.statusMaskStandby) == 0;
            this.heaterService.updateCharacteristic(this.platform.Characteristic.Active, isActive);
            
            // Update power switch if enabled
            if (this.powerSwitchService) {
                this.powerSwitchService.updateCharacteristic(this.platform.Characteristic.On, isActive);
            }
            
            this.heaterService.updateCharacteristic(this.platform.Characteristic.CurrentTemperature, this.roRegTemp);
            this.heaterService.updateCharacteristic(this.platform.Characteristic.HeatingThresholdTemperature, this.rwRegTemp);
            
            const readyToBrew = !((this.roRegStatus & this.statusMaskReady) == 0);
            const heaterState = readyToBrew ? 
                this.platform.Characteristic.CurrentHeaterCoolerState.IDLE : 
                this.platform.Characteristic.CurrentHeaterCoolerState.HEATING;
            this.heaterService.updateCharacteristic(this.platform.Characteristic.CurrentHeaterCoolerState, heaterState);
            
            const needChangeFilter = ((this.roRegAlarm & this.alarmMaskNeedChangeFilters) != 0);
            const filterIndication = needChangeFilter ? 
                this.platform.Characteristic.FilterChangeIndication.CHANGE_FILTER : 
                this.platform.Characteristic.FilterChangeIndication.FILTER_OK;
            this.heaterService.updateCharacteristic(this.platform.Characteristic.FilterChangeIndication, filterIndication);
            
            const filterRemainingPercent = this.roRegFilterDaysRemaining / this.roFilterChangeThresholdDays * 100;
            this.heaterService.updateCharacteristic(
                this.platform.Characteristic.FilterLifeLevel, 
                isNaN(filterRemainingPercent) ? 0 : filterRemainingPercent
            );
            this.debugLog(`Poll successful: Active=${isActive}, Temp=${this.roRegTemp}, Target=${this.rwRegTemp}`);
            if (!this.hasInitialPollCompleted) {
                this.debugLog('Initial poll completed');
            }
            this.hasInitialPollCompleted = true;
            this.lastPollTimestamp = Date.now();
        } catch (error) {
            this.debugLog(`Poll failed: ${error}`);
            this.platform.log.error(`Error polling ${this.accessory.displayName}:`, error);
        }
    }
    
    /**
     * Stop polling (cleanup)
     */
    public stopPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
            this.platform.log.info(`Stopped polling for ${this.accessory.displayName}`);
        }
    }
    
    getReadWriteParameters() {
        this.debugLog('Sending getReadWriteParameters request');
        return fetch(this.postUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Connection': 'close',
            },
            body: this.cmdGetReadWriteParameters,
        })
        .then(r => r.json())
        .then(r => {
            // Defensive check: validate response structure before indexing
            if (!r || typeof r !== 'object' || !r[this.regString] || !Array.isArray(r[this.regString])) {
                this.platform.log.error(`[${this.accessory.displayName}] Invalid read/write response structure: ${JSON.stringify(r).substring(0, 150)}`);
                return false;
            }
            const regArray = r[this.regString];
            if (!regArray[this.rwRegIndexTemp] || !Array.isArray(regArray[this.rwRegIndexTemp]) || regArray[this.rwRegIndexTemp].length < 2) {
                this.platform.log.error(`[${this.accessory.displayName}] Invalid read/write response: missing temperature register at index ${this.rwRegIndexTemp}`);
                return false;
            }
            const raw = Number(regArray[this.rwRegIndexTemp][1]) / 10;
            const clamped =
                Math.min(this.cubeMaxTempDegC,
                Math.max(this.cubeMinTempDegC, raw));
            this.rwRegTemp = clamped;
            this.debugLog(`Received read/write parameters: target temp=${this.rwRegTemp}`);
            return true;
        }).catch(error => {
            this.platform.log.error(`[${this.accessory.displayName}] Error in getReadWriteParameters:`, error);
            return false;
        });
    }
    
    getReadOnlyParameters() {
        this.debugLog('Sending getReadOnlyParameters request');
        return fetch(this.postUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Connection': 'close',
            },
            body: this.cmdGetReadOnlyParameters,
        }).then((response) => {
          if (response.ok) {
            return response.json();
          }
          throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);
        })
        .then((responseJson) => {
            // Defensive check: validate response structure before indexing
            if (!responseJson || typeof responseJson !== 'object' || !responseJson[this.regString] || !Array.isArray(responseJson[this.regString])) {
                this.platform.log.error(`[${this.accessory.displayName}] Invalid read-only response structure: ${JSON.stringify(responseJson).substring(0, 150)}`);
                return false;
            }
            const regArray = responseJson[this.regString];
            
            // Helper to safely get a register value
            const getRegisterValue = (index: number): number | null => {
                if (!regArray[index] || !Array.isArray(regArray[index]) || regArray[index].length < 2) {
                    return null;
                }
                return Number(regArray[index][1]);
            };
            
            // Extract register values with validation
            const status = getRegisterValue(this.roRegIndexStatus);
            const alarm = getRegisterValue(this.roRegIndexAlarm);
            const temp = getRegisterValue(this.roRegIndexTemp);
            const filterDays = getRegisterValue(this.roRegIndexFilterDaysRemaining);
            
            // If any critical register is missing, log and skip update
            if (status === null || alarm === null || temp === null || filterDays === null) {
                this.platform.log.error(`[${this.accessory.displayName}] Invalid read-only response: missing required registers. Status: ${status !== null}, Alarm: ${alarm !== null}, Temp: ${temp !== null}, FilterDays: ${filterDays !== null}`);
                return false;
            }
            
            this.roRegStatus = status;
            this.roRegAlarm = alarm;
            this.roRegTemp = temp;
            this.roRegFilterDaysRemaining = filterDays;
            
            // Filter threshold is optional
            if (responseJson['ThesholdWarningChangeFilter'] !== undefined) {
                this.roFilterChangeThresholdDays = Number(responseJson['ThesholdWarningChangeFilter']);
            }
            
            this.debugLog(`Received read-only parameters: status=${this.roRegStatus}, alarm=${this.roRegAlarm}, temp=${this.roRegTemp}`);
            return true;
        })
        .catch((error) => {
            this.platform.log.error(`[${this.accessory.displayName}] Error in getReadOnlyParameters:`, error);
            return false;
        });
    }
    
    /*** Heater-cooler implementation ***/
    async handleActiveGet() {
        if (!this.hasInitialPollCompleted) {
            return false;
        }
        return ( (this.roRegStatus & this.statusMaskStandby) == 0 );
    }
    
    async handleActiveSet(value: CharacteristicValue) {
        const content = value? this.cmdActive : this.cmdStandby;
        this.debugLog(`Sending power ${value ? 'ON' : 'STANDBY'} command`);
        fetch(this.postUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Connection': 'close',
            },
            body: content,
        });
    }
    
    async handleCurrentTemperatureGet() {
        if (!this.hasInitialPollCompleted || isNaN(this.roRegTemp)) {
            return 0;
        }
        return this.roRegTemp as number;
    }
    
    async handleTargetTemperatureSet(value: CharacteristicValue) {
        const requested = Number(value);

        const targetTemperature =
            Math.min(this.cubeMaxTempDegC,
            Math.max(this.cubeMinTempDegC, requested));

        this.rwRegTemp = targetTemperature;
        this.debugLog(`Sending target temperature ${targetTemperature}°C`);

        const content = this.cmdSetTemperature + String(targetTemperature);

        fetch(this.postUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Connection': 'close',
            },
            body: content,
        });
    }
    
    async handleTargetTemperatureGet() {
      if (!this.hasInitialPollCompleted || isNaN(this.rwRegTemp)) {
        return this.cubeMinTempDegC;
      }
      return this.rwRegTemp;
    }
    
    async handleCurrentHeaterStateGet() {
      if (!this.hasInitialPollCompleted) {
        return this.platform.Characteristic.CurrentHeaterCoolerState.INACTIVE;
      }
        
      const readyToBrew = !( (this.roRegStatus & this.statusMaskReady) == 0);
      return readyToBrew ? this.platform.Characteristic.CurrentHeaterCoolerState.IDLE : this.platform.Characteristic.CurrentHeaterCoolerState.HEATING;
    }
    
    async handleTargetHeaterStateSet() {
        
    }
    
    handleTargetHeaterStateGet() {
        return this.platform.Characteristic.TargetHeaterCoolerState.HEAT;
    }
    

    /*** Filter maintenance implementation ***/
    
    async handleFilterChangeIndicationGet() {
        if (!this.hasInitialPollCompleted) {
            return this.platform.Characteristic.FilterChangeIndication.FILTER_OK;
        }
        const needChangeFilter = ( (this.roRegAlarm & this.alarmMaskNeedChangeFilters) != 0);
        
        return needChangeFilter ? this.platform.Characteristic.FilterChangeIndication.CHANGE_FILTER : this.platform.Characteristic.FilterChangeIndication.FILTER_OK;
    }
    
    async handleFilterLifeLevelGet() {
        if (!this.hasInitialPollCompleted) {
            return 0;
        }
        const filterRemainingPercent = this.roRegFilterDaysRemaining / this.roFilterChangeThresholdDays * 100;
        return isNaN(filterRemainingPercent) ? 0 : filterRemainingPercent;
    }
    
    async ResetFilterIndicationSet() {
        this.debugLog('Sending reset filter indication command');
        fetch(this.postUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Connection': 'close',
            },
            body: this.cmdResetFilterExpiration,
        });
        
        // Reset filter replacement date when filter is replaced
        this.resetFilterReplacementDate();
    }
    
    /*** Filter Reminder Logic Structure ***/
    
    /**
     * Initialize filter replacement date from accessory context or calculate new one
     */
    private initializeFilterReplacementDate() {
        // Try to load from accessory context (persisted across restarts)
        if (this.accessory.context.nextFilterReplacementDate) {
            this.nextFilterReplacementDate = new Date(this.accessory.context.nextFilterReplacementDate);
            this.platform.log.info(`Loaded filter replacement date: ${this.nextFilterReplacementDate.toLocaleDateString()}`);
        } else {
            // Calculate new replacement date based on filterLifeDays
            this.calculateNextFilterReplacementDate();
        }
    }
    
    /**
     * Calculate and store next filter replacement date
     */
    private calculateNextFilterReplacementDate() {
        const now = new Date();
        this.nextFilterReplacementDate = new Date(now.getTime() + (this.filterLifeDays * 24 * 60 * 60 * 1000));
        
        // Store in accessory context for persistence
        this.accessory.context.nextFilterReplacementDate = this.nextFilterReplacementDate.toISOString();
        
        this.platform.log.info(`Filter replacement date set to: ${this.nextFilterReplacementDate.toLocaleDateString()} (${this.filterLifeDays} days from now)`);
    }
    
    /**
     * Reset filter replacement date (called when filter is replaced)
     */
    private resetFilterReplacementDate() {
        this.calculateNextFilterReplacementDate();
        this.platform.log.info(`Filter replacement date reset for ${this.accessory.displayName}`);
        
        // TODO: Future implementation - send HomeKit notification when replacement date is reached
        // This structure is ready for notification implementation
    }
    
    /**
     * Get days until filter replacement
     * @returns Number of days until replacement, or null if not set
     */
    private getDaysUntilFilterReplacement(): number | null {
        if (!this.nextFilterReplacementDate) {
            return null;
        }
        
        const now = new Date();
        const diffTime = this.nextFilterReplacementDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays;
    }

    /*** Power Switch implementation ***/
    
    async handlePowerSwitchGet() {
        if (!this.hasInitialPollCompleted) {
            return false;
        }
        return (this.roRegStatus & this.statusMaskStandby) == 0;
    }
    
    async handlePowerSwitchSet(value: CharacteristicValue) {
        const isOn = value as boolean;
        const content = isOn ? this.cmdActive : this.cmdStandby;
        
        this.platform.log.info(`${isOn ? 'Powering ON' : 'Powering OFF'} ${this.accessory.displayName} via Power Switch`);
        this.debugLog(`Power switch set to ${isOn ? 'ON' : 'OFF'}`);
        
        fetch(this.postUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Connection': 'close',
            },
            body: content,
        });
    }

    private debugLog(message: string) {
        if (this.debugLogging) {
            this.platform.log.debug(`[${this.accessory.displayName}] ${message}`);
        }
    }
}
