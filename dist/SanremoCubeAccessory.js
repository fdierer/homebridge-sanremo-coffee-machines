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
    constructor(platform, accessory, ipAddress, pollingIntervalSeconds = 30) {
        this.platform = platform;
        this.accessory = accessory;
        this.ipAddress = ipAddress;
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
        this.postUrl = 'http://' + ipAddress + '/ajax/post';
        this.pollingIntervalMs = pollingIntervalSeconds * 1000;
        // set accessory information
        this.accessory.getService(this.platform.Service.AccessoryInformation)
            .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Sanremo')
            .setCharacteristic(this.platform.Characteristic.Model, 'Cube')
            .setCharacteristic(this.platform.Characteristic.SerialNumber, ipAddress);
        this.heaterService = this.accessory.getService(this.platform.Service.HeaterCooler) ||
            this.accessory.addService(this.platform.Service.HeaterCooler);
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
        return (0, node_fetch_1.default)(this.postUrl, { method: 'POST', body: this.cmdGetReadWriteParameters })
            .then(r => r.json())
            .then(r => {
            this.rwRegTemp = Number(r[this.regString][this.rwRegIndexTemp][1]) / 10;
        }).catch(error => console.error('Error', error));
    }
    getReadOnlyParameters() {
        return (0, node_fetch_1.default)(this.postUrl, { method: 'POST', body: this.cmdGetReadOnlyParameters }).then((response) => {
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
        (0, node_fetch_1.default)(this.postUrl, { method: 'POST', body: content });
    }
    async handleCurrentTemperatureGet() {
        await this.getReadOnlyParameters();
        return this.roRegTemp;
    }
    async handleTargetTemperatureSet(value) {
        const targetTemperature = Number(value);
        const content = this.cmdSetTemperature + String(targetTemperature);
        (0, node_fetch_1.default)(this.postUrl, { method: 'POST', body: content });
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
        (0, node_fetch_1.default)(this.postUrl, { method: 'POST', body: this.cmdResetFilterExpiration });
    }
}
exports.SanremoCubeAccessory = SanremoCubeAccessory;
//# sourceMappingURL=SanremoCubeAccessory.js.map