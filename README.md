# homebridge-sanremo-cube-coffeemachine

[![npm version](https://img.shields.io/npm/v/homebridge-sanremo-cube-coffeemachine.svg)](https://www.npmjs.com/package/homebridge-sanremo-cube-coffeemachine)
[![npm downloads](https://img.shields.io/npm/dm/homebridge-sanremo-cube-coffeemachine.svg)](https://www.npmjs.com/package/homebridge-sanremo-cube-coffeemachine)

Homebridge plugin for Sanremo Coffee Machines. Control your Sanremo Cube coffee machine via HomeKit with real-time status updates, temperature control, power management, and filter maintenance tracking.

## Overview

This plugin provides full HomeKit integration for Sanremo Cube coffee machines, allowing you to control and monitor your machine through the Apple Home app, Siri, and HomeKit automations. The plugin communicates with your coffee machine via its built-in HTTP interface at `/ajax/post`.

> **Note**: This project is an enhanced and actively maintained fork of the original `homebridge-sanremo-cube` plugin by [Nareg Sinenian](https://github.com/nsinenian). All original credit belongs to the upstream author. This fork adds new features, documentation, and Homebridge v2 compatibility.

## Key Features

- **HeaterCooler Service**: Full HomeKit integration with power, temperature, and status control
- **Automatic Status Polling**: Real-time status updates with configurable polling interval (5-300 seconds)
- **Optional Power Switch**: Additional HomeKit Switch service for quick power control
- **Temperature Control**: Monitor and adjust boiler temperature (115-130°C range)
- **Filter Maintenance**: Track filter life and get replacement reminders
- **HomeKit Native**: Works seamlessly with Apple Home app, Siri, and HomeKit automations
- **Homebridge v2.0 Ready**: Fully compatible with Homebridge v2.0 and HAP-NodeJS v1

## Prerequisites

1. **Coffee Machine Setup**:
   - Machine must be powered on (hard rocker switch in the on position)
   - Machine must be connected to the same network as Homebridge
   - A static IP address must be assigned to the machine

2. **Homebridge Requirements**:
   - Homebridge v1.6.0 or later (v2.0 compatible ✅)
   - Node.js v18.20.4 or newer (supported up to, but not including, v25)

## Installation

### From npm

```bash
npm install -g homebridge-sanremo-cube-coffeemachine
```

### From GitHub

```bash
npm install -g https://github.com/fdierer/homebridge-sanremo-coffee-machines.git
```

After installation, restart Homebridge and add the platform to your `config.json`.

## Installation & Setup

1. **Install** the plugin using npm or GitHub.
2. **Restart Homebridge** so the platform is detected.
3. **Add configuration** (see below) and restart again.

### Example Configuration

```json
{
  "platforms": [
    {
      "platform": "SanremoCoffeeMachines",
      "name": "SanremoCoffeeMachines",
      "debugLogging": false,
      "machines": [
        {
          "name": "Sanremo Cube",
          "type": "Cube",
          "ip": "192.168.1.100",
          "pollingInterval": 5,
          "enablePowerSwitch": true,
          "filterLifeDays": 180
        }
      ],
      "_bridge": {
        "username": "0E:CC:88:96:48:DF",
        "port": 42846,
        "name": "Sanremo Bridge"
      }
    }
  ]
}
```

## Configuration

### Basic Configuration

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

### Recommended Configuration (with All Features)

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

### Configuration with Child Bridge (Recommended)

Using a child bridge isolates the plugin and improves stability:

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
      ],
      "_bridge": {
        "username": "0E:CC:88:96:48:DF",
        "port": 42846,
        "name": "Sanremo Bridge"
      }
    }
  ]
}
```

### Multiple Machines

You can configure multiple coffee machines:

```json
{
  "platforms": [
    {
      "platform": "SanremoCoffeeMachines",
      "name": "SanremoCoffeeMachines",
      "machines": [
        {
          "name": "Kitchen Coffee Machine",
          "type": "Cube",
          "ip": "192.168.1.100",
          "pollingInterval": 5,
          "enablePowerSwitch": true
        },
        {
          "name": "Office Coffee Machine",
          "type": "Cube",
          "ip": "192.168.1.101",
          "pollingInterval": 10,
          "enablePowerSwitch": false
        }
      ]
    }
  ]
}
```

## Configuration Options

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `platform` | string | Yes | - | Must be `"SanremoCoffeeMachines"` |
| `name` | string | Yes | "SanremoCoffeeMachines" | Platform name (can be any name) |
| `debugLogging` | boolean | No | false | Emit verbose debug messages to the Homebridge log |
| `machines` | array | Yes | - | Array of coffee machines |
| `machines[].name` | string | Yes | "Sanremo Cube" | Machine name in HomeKit |
| `machines[].type` | string | Yes | - | Machine type (currently only `"Cube"`) |
| `machines[].ip` | string | Yes | - | Static IP address of machine |
| `machines[].pollingInterval` | number | No | 30 | Status polling interval in seconds (5-300) |
| `machines[].enablePowerSwitch` | boolean | No | false | Enable optional HomeKit Switch service |
| `machines[].filterLifeDays` | number | No | 180 | Expected filter life in days (1-365) |

## Feature Details

### HeaterCooler Service

The primary service exposed to HomeKit:

- **Power Control**: Turn machine on/off (standby mode)
- **Temperature Monitoring**: Real-time boiler temperature (115-130°C)
- **Temperature Control**: Adjust target brewing temperature (115-130°C range)
- **Status Indicators**: Ready to brew, heating, idle states
- **Service Name**: Same as machine name (default: "Sanremo Cube")

### Power Switch Service (Optional)

When `enablePowerSwitch: true` is set:

- **Quick Power Control**: Simple on/off switch for power management
- **Independent Operation**: Works separately from HeaterCooler service
- **Service Name**: `<Machine Name> Power` (e.g., "Sanremo Cube Power")
- **Use Case**: Useful for Siri shortcuts, automations, or quick power toggles

### Filter Maintenance

Built-in filter tracking:

- **Filter Life Tracking**: Monitor filter remaining days from machine
- **Change Indicator**: Alert when filter needs replacement (based on machine alarm status)
- **Life Percentage**: Visual filter life level in HomeKit
- **Reset Function**: Reset filter timer after replacement
- **Configurable Life**: Set expected filter life with `filterLifeDays` (default: 180 days)
- **Note**: Filter replacement date tracking structure is implemented, but HomeKit notifications are not yet implemented

### Automatic Status Updates

- **Background Polling**: Automatic status checks at configured interval
- **Push Updates**: All characteristics update automatically in HomeKit
- **Real-time Accuracy**: HomeKit always shows current machine state
- **Configurable Frequency**: Set polling interval from 5-300 seconds

### Polling Interval Guide

| Interval | Update Speed | Network Load | Use Case |
|----------|--------------|--------------|----------|
| 5 seconds | ⚡ Very Fast | 🔴 High | Best accuracy, recommended for active use |
| 10 seconds | ⚡ Fast | 🟡 Medium | Good balance between accuracy and network usage |
| 30 seconds | 🐢 Moderate | 🟢 Low | Default, acceptable for most users |
| 60+ seconds | 🐢 Slow | 🟢 Very Low | Minimal updates, reduce network traffic |

## Troubleshooting

### Machine Not Responding

1. Verify machine is powered on (hard rocker switch)
2. Check machine is connected to WiFi
3. Verify IP address is correct and static
4. Test connectivity: `ping [machine-ip]` from Homebridge host
5. Check firewall isn't blocking HTTP traffic

### Status Not Updating

1. Check `pollingInterval` is set in config
2. Verify logs show: `Starting automatic polling every X seconds`
3. Check for network errors in logs
4. Ensure machine is reachable from Homebridge host

### Debug Logging

- Set `"debugLogging": true` temporarily to print every HTTP request, poll cycle, and command to the Homebridge logs. This is extremely helpful when investigating slow responses or dropped packets.
- Remember to set it back to `false` to avoid noisy logs once issues are resolved.

### Child Bridge Setup

- Use the `_bridge` block shown in the example configuration to place this platform inside its own child bridge.
- Benefits: isolates crashes, keeps the main Homebridge instance responsive, and makes it easy to restart just the Sanremo devices.

### HomeKit Not Showing Accessory

1. Restart Homebridge after configuration changes
2. Check config JSON syntax is correct
3. Check logs for plugin initialization errors
4. Remove and re-add accessory in Home app

## Known Limitations

- **Single Model Support**: Currently only supports Sanremo Cube (other models may be added in future)
- **Network Dependency**: Requires machine to be on the same network as Homebridge
- **Static IP Required**: Machine must have a static IP address
- **HTTP Only**: Communication is via HTTP (not HTTPS)
- **Filter Notifications**: Filter replacement date tracking is implemented, but HomeKit notifications are not yet implemented (structure is ready for future implementation)

## Attribution

This plugin is an enhanced fork of the original [`homebridge-sanremo-cube`](https://github.com/nsinenian/homebridge-sanremo-cube) plugin by [Nareg Sinenian](https://github.com/nsinenian).

**Fork Maintainer**: Franc Dierer

**Enhancements in this fork**:
- Automatic status polling system with configurable interval
- Temperature clamping to prevent HomeKit warnings
- Optional Power Switch service
- Enhanced filter maintenance tracking structure
- Homebridge v2.0 compatibility improvements
- Comprehensive documentation

We are grateful to the original author for the foundation of this plugin.

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

- **GitHub Issues**: [Report an issue](https://github.com/fdierer/homebridge-sanremo-coffee-machines/issues)
- **Homebridge Discord**: Join the Homebridge community
- **Homebridge Reddit**: r/homebridge

## License

MIT License - see [LICENSE](LICENSE) file for details

---

**Made with ☕ for coffee lovers**
