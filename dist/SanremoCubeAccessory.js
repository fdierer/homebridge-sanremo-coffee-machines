"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SanremoCubeAccessory = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
class SanremoCubeAccessory {
    constructor(platform, accessory, ipAddress, pollingIntervalSeconds = 30, enablePowerSwitch = false, filterLifeDays = 180) {
        this.platform = platform;
        this.accessory = accessory;
        this.ipAddress = ipAddress;
        this.powerSwitchService = null;
        this.pollingInterval = null;
        /** REST Commands */
        this.cmdGetDeviceInfo = 'key=150';
        this.cmdGetReadOnlyParameters = 'key=151';
        this.cmdGetReadWriteParameters = 'key=152';
        this.cmdStandby = 'key=200&id=12&value=1';
        this.cmdActive = 'key=200&id=11&value=1';
        this.cmdSetTemperature = 'key=200&id=1&value=';
        this.cmdResetFilterExpiration = 'key=200&id=23&value=0';
        /** Read-only registers */
        this.regString = 'registers';
        this.roRegIndexTemp = 0;
        this.roRegIndexDayCoffee = 0;
        this.roRegIndexWeekCoffee = 0;
        this.roRegIndexMonthCoffee = 0;
        this.roRegIndexYearCoffee = 0;
        this.roRegIndexTotalCoffee = 0;
        this.roRegIndexFilterDaysRemaining = 10;
        this.roRegIndexStatus = 12;
        this.roRegIndexAlarm = 14;
        this.roFilterChangeThresholdDays = 0;
        this.statusMaskTankLevelOk = 1;
        this.statusMaskBoilerLevelOk = 2;
        this.statusMaskPreAlarmTankLevel = 4;
        this.statusMaskWaterSource = 8;
        this.statusMaskStandby = 16;
        this.statusMaskReady = 32;
        this.statusMaskSteamBoosterHeating = 256;
        this.statusMaskSteamBoosterSetPointOk = 512;
        this.alarmMaskNeedChangeFilters = 128;
        this.cubeMinTempDegC = 115;
        this.cubeMaxTempDegC = 130;
        this.roRegStatus = 0;
        this.roRegAlarm = 0;
        this.roRegTemp = 0;
        this.roRegFilterDaysRemaining = 0;
        /** Read-write registers */
        this.rwRegIndexTemp = 0;
        this.rwRegTemp = this.cubeMinTempDegC;
        /** Filter Maintenance Tracking */
        this.nextFilterReplacementDate = null;
        this.postUrl = 'http://' + ipAddress + '/ajax/post';
        this.pollingIntervalMs = pollingIntervalSeconds * 1000;
        this.enablePowerSwitch = enablePowerSwitch;
        this.filterLifeDays = filterLifeDays;
        // Ensure accessory name is "Sanremo Cube" by default
        if (!this.accessory.displayName || this.accessory.displayName === 'Coffee Machine') {
            this.accessory.displayName = 'Sanremo Cube';
        }
        // set accessory information
        this.accessory.getService(this.platform.Service.AccessoryInformation)
            .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Sanremo')
            .setCharacteristic(this.platform.Characteristic.Model, 'Cube')
            .setCharacteristic(this.platform.Characteristic.SerialNumber, ipAddress);
        // Setup HeaterCooler service with name "Sanremo Cube"
        this.heaterService = this.accessory.getService(this.platform.Service.HeaterCooler) ||
            this.accessory.addService(this.platform.Service.HeaterCooler, 'Sanremo Cube');
        // Setup heater service on/off
        this.heaterService.getCharacteristic(this.platform.Characteristic.Active).onGet(this.handleActiveGet.bind(this));
        this.heaterService.getCharacteristic(this.platform.Characteristic.Active).onSet(this.handleActiveSet.bind(this));
        // Setup heater service current temperature
        const currentTemperatureCharacteristic = this.heaterService.getCharacteristic(this.platform.Characteristic.CurrentTemperature);
        currentTemperatureCharacteristic.onGet(this.handleCurrentTemperatureGet.bind(this));
        currentTemperatureCharacteristic.setProps({ minValue: 0, maxValue: 150 });
        // Setup heater service target temperature
        const heatingThresholdCharacteristic = this.heaterService.getCharacteristic(this.platform.Characteristic.HeatingThresholdTemperature);
        heatingThresholdCharacteristic.onSet(this.handleTargetTemperatureSet.bind(this));
        heatingThresholdCharacteristic.onGet(this.handleTargetTemperatureGet.bind(this));
        heatingThresholdCharacteristic.setProps({ minValue: this.cubeMinTempDegC, maxValue: this.cubeMaxTempDegC, minStep: 1 });
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
        targetHeaterState.onSet(this.handleTargetHeaterStateSet.bind(this)); // this.handleTarget//hap.Characteristic.CurrentHeaterCoolerState.IDLE);
        targetHeaterState.onGet(this.handleTargetHeaterStateGet.bind(this));
        targetHeaterState.setProps({
            // validValues: [hap.Characteristic.TargetHeaterCoolerState.HEAT,hap.Characteristic.TargetHeaterCoolerState.COOL],
            minValue: 1,
            maxValue: 1,
            validValues: [1, 1]
        });
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
    startPolling() {
        this.platform.log.info(`Starting automatic polling every ${this.pollingIntervalMs / 1000} seconds for ${this.accessory.displayName}`);
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
    async pollStatus() {
        try {
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
            this.heaterService.updateCharacteristic(this.platform.Characteristic.FilterLifeLevel, isNaN(filterRemainingPercent) ? 0 : filterRemainingPercent);
        }
        catch (error) {
            this.platform.log.error(`Error polling ${this.accessory.displayName}:`, error);
        }
    }
    /**
     * Stop polling (cleanup)
     */
    stopPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
            this.platform.log.info(`Stopped polling for ${this.accessory.displayName}`);
        }
    }
    getReadWriteParameters() {
        return (0, node_fetch_1.default)(this.postUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Connection': 'close',
            },
            body: this.cmdGetReadWriteParameters,
        })
            .then(r => r.json())
            .then(r => {
            const raw = Number(r[this.regString][this.rwRegIndexTemp][1]) / 10;
            const clamped = Math.min(this.cubeMaxTempDegC, Math.max(this.cubeMinTempDegC, raw));
            this.rwRegTemp = clamped;
        }).catch(error => console.error('Error', error));
    }
    getReadOnlyParameters() {
        return (0, node_fetch_1.default)(this.postUrl, {
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
            throw new this.platform.api.hap.HapStatusError(-70402 /* this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE */);
        })
            .then((responseJson) => {
            this.roRegStatus = Number(responseJson[this.regString][this.roRegIndexStatus][1]);
            this.roRegAlarm = Number(responseJson[this.regString][this.roRegIndexAlarm][1]);
            this.roRegTemp = Number(responseJson[this.regString][this.roRegIndexTemp][1]);
            this.roRegFilterDaysRemaining = Number(responseJson[this.regString][this.roRegIndexFilterDaysRemaining][1]);
            this.roFilterChangeThresholdDays = Number(responseJson['ThesholdWarningChangeFilter']);
        })
            .catch((error) => {
            console.log(error);
            return false;
        });
    }
    /*** Heater-cooler implementation ***/
    async handleActiveGet() {
        await this.getReadOnlyParameters();
        return ((this.roRegStatus & this.statusMaskStandby) == 0);
    }
    async handleActiveSet(value) {
        const content = value ? this.cmdActive : this.cmdStandby;
        (0, node_fetch_1.default)(this.postUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Connection': 'close',
            },
            body: content,
        });
    }
    async handleCurrentTemperatureGet() {
        await this.getReadOnlyParameters();
        return this.roRegTemp;
    }
    async handleTargetTemperatureSet(value) {
        const requested = Number(value);
        const targetTemperature = Math.min(this.cubeMaxTempDegC, Math.max(this.cubeMinTempDegC, requested));
        this.rwRegTemp = targetTemperature;
        const content = this.cmdSetTemperature + String(targetTemperature);
        (0, node_fetch_1.default)(this.postUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Connection': 'close',
            },
            body: content,
        });
    }
    async handleTargetTemperatureGet() {
        await this.getReadWriteParameters();
        return this.rwRegTemp;
    }
    async handleCurrentHeaterStateGet() {
        await this.getReadOnlyParameters();
        const readyToBrew = !((this.roRegStatus & this.statusMaskReady) == 0);
        return readyToBrew ? this.platform.Characteristic.CurrentHeaterCoolerState.IDLE : this.platform.Characteristic.CurrentHeaterCoolerState.HEATING;
    }
    async handleTargetHeaterStateSet() {
    }
    handleTargetHeaterStateGet() {
        return this.platform.Characteristic.TargetHeaterCoolerState.HEAT;
    }
    /*** Filter maintenance implementation ***/
    async handleFilterChangeIndicationGet() {
        await this.getReadOnlyParameters();
        const needChangeFilter = ((this.roRegAlarm & this.alarmMaskNeedChangeFilters) != 0);
        return needChangeFilter ? this.platform.Characteristic.FilterChangeIndication.CHANGE_FILTER : this.platform.Characteristic.FilterChangeIndication.FILTER_OK;
    }
    async handleFilterLifeLevelGet() {
        await this.getReadOnlyParameters();
        const filterRemainingPercent = this.roRegFilterDaysRemaining / this.roFilterChangeThresholdDays * 100;
        return isNaN(filterRemainingPercent) ? 0 : filterRemainingPercent;
    }
    async ResetFilterIndicationSet() {
        (0, node_fetch_1.default)(this.postUrl, {
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
    initializeFilterReplacementDate() {
        // Try to load from accessory context (persisted across restarts)
        if (this.accessory.context.nextFilterReplacementDate) {
            this.nextFilterReplacementDate = new Date(this.accessory.context.nextFilterReplacementDate);
            this.platform.log.info(`Loaded filter replacement date: ${this.nextFilterReplacementDate.toLocaleDateString()}`);
        }
        else {
            // Calculate new replacement date based on filterLifeDays
            this.calculateNextFilterReplacementDate();
        }
    }
    /**
     * Calculate and store next filter replacement date
     */
    calculateNextFilterReplacementDate() {
        const now = new Date();
        this.nextFilterReplacementDate = new Date(now.getTime() + (this.filterLifeDays * 24 * 60 * 60 * 1000));
        // Store in accessory context for persistence
        this.accessory.context.nextFilterReplacementDate = this.nextFilterReplacementDate.toISOString();
        this.platform.log.info(`Filter replacement date set to: ${this.nextFilterReplacementDate.toLocaleDateString()} (${this.filterLifeDays} days from now)`);
    }
    /**
     * Reset filter replacement date (called when filter is replaced)
     */
    resetFilterReplacementDate() {
        this.calculateNextFilterReplacementDate();
        this.platform.log.info(`Filter replacement date reset for ${this.accessory.displayName}`);
        // TODO: Future implementation - send HomeKit notification when replacement date is reached
        // This structure is ready for notification implementation
    }
    /**
     * Get days until filter replacement
     * @returns Number of days until replacement, or null if not set
     */
    getDaysUntilFilterReplacement() {
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
        await this.getReadOnlyParameters();
        return (this.roRegStatus & this.statusMaskStandby) == 0;
    }
    async handlePowerSwitchSet(value) {
        const isOn = value;
        const content = isOn ? this.cmdActive : this.cmdStandby;
        this.platform.log.info(`${isOn ? 'Powering ON' : 'Powering OFF'} ${this.accessory.displayName} via Power Switch`);
        (0, node_fetch_1.default)(this.postUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Connection': 'close',
            },
            body: content,
        });
    }
}
exports.SanremoCubeAccessory = SanremoCubeAccessory;
//# sourceMappingURL=SanremoCubeAccessory.js.map