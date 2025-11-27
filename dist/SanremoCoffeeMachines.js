"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SanremoCoffeeMachines = void 0;
const settings_1 = require("./settings");
const SanremoCubeAccessory_1 = require("./SanremoCubeAccessory");
/**
 * HomebridgePlatform
 * This class is the main constructor for your plugin, this is where you should
 * parse the user config and discover/register accessories with Homebridge.
 */
class SanremoCoffeeMachines {
    debugLog(message) {
        if (this.debugLogging) {
            this.log.debug(message);
        }
    }
    constructor(log, config, api) {
        this.log = log;
        this.config = config;
        this.api = api;
        this.Service = this.api.hap.Service;
        this.Characteristic = this.api.hap.Characteristic;
        // this is used to track restored cached accessories
        this.accessories = [];
        this.log.debug('Finished initializing platform:', this.config.name);
        this.debugLogging = this.config.debugLogging === true;
        if (this.debugLogging) {
            this.log.info('Debug logging enabled');
        }
        // When this event is fired it means Homebridge has restored all cached accessories from disk.
        // Dynamic Platform plugins should only register new accessories after this event was fired,
        // in order to ensure they weren't added to homebridge already. This event can also be used
        // to start discovery of new accessories.
        this.api.on('didFinishLaunching', () => {
            log.debug('Executed didFinishLaunching callback');
            // run the method to discover / register your devices as accessories
            this.discoverDevices();
        });
    }
    /**
     * This function is invoked when homebridge restores cached accessories from disk at startup.
     * It should be used to setup event handlers for characteristics and update respective values.
     */
    configureAccessory(accessory) {
        this.log.info('Loading accessory from cache:', accessory.displayName);
        // add the restored accessory to the accessories cache so we can track if it has already been registered
        this.accessories.push(accessory);
    }
    /**
     * This is an example method showing how to register discovered accessories.
     * Accessories must only be registered once, previously created accessories
     * must not be registered again to prevent "duplicate UUID" errors.
     */
    discoverDevices() {
        if (!Array.isArray(this.config.machines) || this.config.machines.length === 0) {
            this.log.warn('No Sanremo machines configured; skipping discovery.');
            return;
        }
        this.config.machines.forEach((device, index) => {
            const hasConfiguredName = typeof (device === null || device === void 0 ? void 0 : device.name) === 'string' && device.name.trim().length > 0;
            const name = hasConfiguredName ? device.name : 'Sanremo Machine';
            const ip = typeof (device === null || device === void 0 ? void 0 : device.ip) === 'string' ? device.ip : '';
            if (!hasConfiguredName) {
                this.log.warn(`Machine at index ${index} is missing a name; defaulting to "${name}".`);
            }
            if (!ip) {
                this.log.warn(`Machine "${name}" is missing an IP address in config. Using fallback UUID seed.`);
            }
            const serialNumber = device === null || device === void 0 ? void 0 : device.serialNumber;
            const serial = typeof serialNumber === 'string' && serialNumber.length > 0
                ? serialNumber
                : (typeof (device === null || device === void 0 ? void 0 : device.serial) === 'string' ? device.serial : '');
            const seedParts = [
                'SanremoCoffeeMachines',
                name,
                ip,
                serial,
                index.toString(),
            ].filter(Boolean);
            const uuidSeed = seedParts.join('-') || `SanremoCoffeeMachines-${index}`;
            this.debugLog(`Accessory seed for "${name}": ${uuidSeed}`);
            // generate a unique id for the accessory this should be generated from
            // something globally unique, but constant, for example, the device serial
            // number or MAC address
            const uuid = this.api.hap.uuid.generate(uuidSeed);
            // see if an accessory with the same uuid has already been registered and restored from
            // the cached devices we stored in the `configureAccessory` method above
            const existingAccessory = this.accessories.find(accessory => accessory.UUID === uuid);
            if (existingAccessory) {
                // the accessory already exists
                this.log.info('Restoring existing accessory from cache:', existingAccessory.displayName);
                // if you need to update the accessory.context then you should run `api.updatePlatformAccessories`. eg.:
                // existingAccessory.context.device = device;
                // this.api.updatePlatformAccessories([existingAccessory]);
                // create the accessory handler for the restored accessory
                // this is imported from `platformAccessory.ts`
                const pollingInterval = device.pollingInterval || 30;
                const enablePowerSwitch = device.enablePowerSwitch || false;
                const filterLifeDays = device.filterLifeDays || 180;
                new SanremoCubeAccessory_1.SanremoCubeAccessory(this, existingAccessory, ip, pollingInterval, enablePowerSwitch, filterLifeDays, this.debugLogging);
                // it is possible to remove platform accessories at any time using `api.unregisterPlatformAccessories`, eg.:
                // remove platform accessories when no longer present
                // this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [existingAccessory]);
                // this.log.info('Removing existing accessory from cache:', existingAccessory.displayName);
            }
            else {
                // the accessory does not yet exist, so we need to create it
                this.log.info('Adding new accessory:', name);
                // create a new accessory
                const accessory = new this.api.platformAccessory(name, uuid);
                // store a copy of the device object in the `accessory.context`
                // the `context` property can be used to store any data about the accessory you may need
                accessory.context.device = device;
                // create the accessory handler for the newly create accessory
                // this is imported from `platformAccessory.ts`
                const pollingInterval = device.pollingInterval || 30;
                const enablePowerSwitch = device.enablePowerSwitch || false;
                const filterLifeDays = device.filterLifeDays || 180;
                new SanremoCubeAccessory_1.SanremoCubeAccessory(this, accessory, ip, pollingInterval, enablePowerSwitch, filterLifeDays, this.debugLogging);
                // link the accessory to your platform
                this.api.registerPlatformAccessories(settings_1.PLUGIN_NAME, settings_1.PLATFORM_NAME, [accessory]);
            }
        });
    }
}
exports.SanremoCoffeeMachines = SanremoCoffeeMachines;
//# sourceMappingURL=SanremoCoffeeMachines.js.map