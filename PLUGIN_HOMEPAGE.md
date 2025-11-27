# Sanremo Cube for Homebridge

Control your Sanremo Cube coffee machine via HomeKit with real-time status updates, temperature control, power management, and filter maintenance tracking.

## Overview

This plugin provides full HomeKit integration for Sanremo Cube coffee machines, allowing you to control and monitor your machine through the Apple Home app, Siri, and HomeKit automations.

### Key Features

- **HeaterCooler Service**: Full HomeKit integration with power, temperature, and status control
- **Automatic Status Polling**: Real-time status updates with configurable polling interval
- **Optional Power Switch**: Additional HomeKit Switch service for quick power control
- **Temperature Control**: Monitor and adjust boiler temperature (115-130°C range)
- **Filter Maintenance**: Track filter life and get replacement reminders
- **Homebridge v2.0 Ready**: Fully compatible with Homebridge v2.0

## Installation

```bash
npm install -g homebridge-sanremo-cube-coffeemachine
```

After installation, restart Homebridge and add the platform to your `config.json`.

## Configuration

```json
{
  "platforms": [
    {
      "platform": "SanremoCoffeeMachines",
      "name": "SanremoCoffeeMachines",
      "machines": [
        {
          "name": "Sanremo Cube",
          "type": "Cube",
          "ip": "192.168.1.100",
          "pollingInterval": 5,
          "enablePowerSwitch": true,
          "filterLifeDays": 180
        }
      ]
    }
  ]
}
```

## Prerequisites

- Machine must be powered on and connected to the same network as Homebridge
- Machine must have a static IP address assigned
- Homebridge v1.6.0+ (v2.0 compatible)
- Node.js v18.20.4, v20.15.1, or v22.0.0+

## Troubleshooting

- **Machine not responding**: Verify machine is powered on, connected to WiFi, and IP address is correct
- **Status not updating**: Check `pollingInterval` is set and logs show polling is active
- **HomeKit not showing accessory**: Restart Homebridge and check config JSON syntax

For detailed documentation, troubleshooting, and support, see the [full README on GitHub](https://github.com/fdierer/homebridge-sanremo-coffee-machines).

---

**Made with ☕ for coffee lovers**

