# Sanremo Cube for Homebridge

Control your Sanremo Cube coffee machine via HomeKit through Homebridge. This plugin connects to your Sanremo Cube's local web interface to provide power control, temperature monitoring, and basic filter maintenance tracking.

## Overview

This plugin enables HomeKit integration for Sanremo Cube coffee machines, allowing you to control and monitor your machine through the Apple Home app, Siri, and HomeKit automations. All communication is local to your network—no cloud services or external telemetry.

## Features

- **Homebridge Verified**: Officially verified plugin that meets all Homebridge quality standards
- **Power Control**: Turn your coffee machine on/off (standby mode) from HomeKit
- **Temperature Monitoring**: Monitor boiler temperature in real-time (115-130°C range)
- **Temperature Control**: Adjust target brewing temperature via HomeKit
- **Status Updates**: Automatic polling keeps HomeKit in sync with machine state
- **Optional Power Switch**: Additional HomeKit Switch service for quick power toggles
- **Filter Tracking**: Basic filter life tracking and replacement reminders

## Installation

### From Homebridge UI (Recommended)

1. Open Homebridge UI (Config UI-X)
2. Go to **Plugins** → **Search**
3. Search for **"Sanremo Cube for Homebridge"**
4. Click **Install**
5. Restart Homebridge

### Enable Child Bridge

After installation, configure the plugin to use a child bridge (recommended for stability):

1. Go to **Plugins** → **Sanremo Cube for Homebridge** → **Settings**
2. Enable **Child Bridge** mode
3. Save and restart

### Basic Configuration

Add your coffee machine in the plugin settings:

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
          "ip": "192.168.1.100"
        }
      ]
    }
  ]
}
```

**Required fields:**
- `name`: The name that will appear in HomeKit
- `type`: Must be `"Cube"` (currently the only supported model)
- `ip`: Static IP address of your coffee machine on the same network as Homebridge

**Optional fields:**
- `pollingInterval`: How often to check machine status (default: 30 seconds, recommended: 5-10 seconds for active monitoring)
- `enablePowerSwitch`: Add an optional HomeKit Switch service (default: false)
- `filterLifeDays`: Expected filter life in days (default: 180)

## Limitations

- **Single Model Support**: Only Sanremo Cube is currently supported. Other Sanremo models are not yet supported.
- **Local Network Only**: Requires the coffee machine's local web interface to be reachable on your LAN. The machine must have a static IP address.
- **Filter Tracking**: Filter tracking is a simple day counter based on configuration, not an official Sanremo integration. The plugin tracks filter replacement dates locally but does not receive filter status directly from the machine's firmware.
- **HTTP Only**: Communication uses HTTP (not HTTPS) to the machine's local interface.

## Prerequisites

- Sanremo Cube coffee machine powered on and connected to WiFi
- Static IP address assigned to the coffee machine
- Homebridge v1.6.0 or later (v2.0 compatible)
- Node.js v18.20.4 or newer (up to, but not including, v25)
- Machine and Homebridge on the same local network

## Troubleshooting

- **Machine not responding**: Verify the machine is powered on, connected to WiFi, and the IP address is correct
- **Status not updating**: Check that `pollingInterval` is set and review Homebridge logs for network errors
- **HomeKit not showing accessory**: Restart Homebridge after configuration changes and verify JSON syntax

For detailed documentation, troubleshooting, and support, see the [full README on GitHub](https://github.com/fdierer/homebridge-sanremo-coffee-machines).

---

**Made with ☕ for coffee lovers**
