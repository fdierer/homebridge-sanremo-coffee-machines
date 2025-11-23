import { PlatformAccessory, CharacteristicValue } from 'homebridge';
import { SanremoCoffeeMachines } from './SanremoCoffeeMachines';
/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export declare class SanremoCubeAccessory {
    private readonly platform;
    private readonly accessory;
    private readonly ipAddress;
    private heaterService;
    private powerSwitchService;
    private pollingInterval;
    private readonly pollingIntervalMs;
    private readonly enablePowerSwitch;
    private readonly filterLifeDays;
    /** REST Commands */
    private readonly cmdGetDeviceInfo;
    private readonly cmdGetReadOnlyParameters;
    private readonly cmdGetReadWriteParameters;
    private readonly cmdStandby;
    private readonly cmdActive;
    private readonly cmdSetTemperature;
    private readonly cmdResetFilterExpiration;
    /** Read-only registers */
    private readonly regString;
    private readonly roRegIndexTemp;
    private readonly roRegIndexDayCoffee;
    private readonly roRegIndexWeekCoffee;
    private readonly roRegIndexMonthCoffee;
    private readonly roRegIndexYearCoffee;
    private readonly roRegIndexTotalCoffee;
    private readonly roRegIndexFilterDaysRemaining;
    private readonly roRegIndexStatus;
    private readonly roRegIndexAlarm;
    private roFilterChangeThresholdDays;
    private readonly statusMaskTankLevelOk;
    private readonly statusMaskBoilerLevelOk;
    private readonly statusMaskPreAlarmTankLevel;
    private readonly statusMaskWaterSource;
    private readonly statusMaskStandby;
    private readonly statusMaskReady;
    private readonly statusMaskSteamBoosterHeating;
    private readonly statusMaskSteamBoosterSetPointOk;
    private readonly alarmMaskNeedChangeFilters;
    private readonly cubeMinTempDegC;
    private readonly cubeMaxTempDegC;
    private roRegStatus;
    private roRegAlarm;
    private roRegTemp;
    private roRegFilterDaysRemaining;
    /** Read-write registers */
    private readonly rwRegIndexTemp;
    private rwRegTemp;
    /** Filter Maintenance Tracking */
    private nextFilterReplacementDate;
    private readonly postUrl;
    constructor(platform: SanremoCoffeeMachines, accessory: PlatformAccessory, ipAddress: string, pollingIntervalSeconds?: number, enablePowerSwitch?: boolean, filterLifeDays?: number);
    /**
     * Start automatic polling to keep HomeKit status updated
     */
    private startPolling;
    /**
     * Poll the coffee machine and update all characteristics
     */
    private pollStatus;
    /**
     * Stop polling (cleanup)
     */
    stopPolling(): void;
    getReadWriteParameters(): any;
    getReadOnlyParameters(): any;
    /*** Heater-cooler implementation ***/
    handleActiveGet(): Promise<boolean>;
    handleActiveSet(value: CharacteristicValue): Promise<void>;
    handleCurrentTemperatureGet(): Promise<number>;
    handleTargetTemperatureSet(value: CharacteristicValue): Promise<void>;
    handleTargetTemperatureGet(): Promise<number>;
    handleCurrentHeaterStateGet(): Promise<1 | 2>;
    handleTargetHeaterStateSet(): Promise<void>;
    handleTargetHeaterStateGet(): number;
    /*** Filter maintenance implementation ***/
    handleFilterChangeIndicationGet(): Promise<0 | 1>;
    handleFilterLifeLevelGet(): Promise<number>;
    ResetFilterIndicationSet(): Promise<void>;
    /*** Filter Reminder Logic Structure ***/
    /**
     * Initialize filter replacement date from accessory context or calculate new one
     */
    private initializeFilterReplacementDate;
    /**
     * Calculate and store next filter replacement date
     */
    private calculateNextFilterReplacementDate;
    /**
     * Reset filter replacement date (called when filter is replaced)
     */
    private resetFilterReplacementDate;
    /**
     * Get days until filter replacement
     * @returns Number of days until replacement, or null if not set
     */
    private getDaysUntilFilterReplacement;
    /*** Power Switch implementation ***/
    handlePowerSwitchGet(): Promise<boolean>;
    handlePowerSwitchSet(value: CharacteristicValue): Promise<void>;
}
//# sourceMappingURL=SanremoCubeAccessory.d.ts.map