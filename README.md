# homebridge-sanremo-cube-coffeemachine

[![npm version](https://img.shields.io/npm/v/homebridge-sanremo-cube-coffeemachine.svg)](https://www.npmjs.com/package/homebridge-sanremo-cube-coffeemachine)
[![npm downloads](https://img.shields.io/npm/dm/homebridge-sanremo-cube-coffeemachine.svg)](https://www.npmjs.com/package/homebridge-sanremo-cube-coffeemachine)

Homebridge plugin for Sanremo Coffee Machines. Control your Sanremo Cube coffee machine via HomeKit with real-time status updates, temperature control, power management, and filter maintenance tracking.

## Overview

This plugin provides HomeKit integration for Sanremo Cube coffee machines, allowing you to control and monitor your machine through the Apple Home app, Siri, and HomeKit automations. The plugin communicates with your coffee machine via its built-in HTTP interface at `/ajax/post`.

Note: This project is an enhanced and actively maintained fork of the original `homebridge-sanremo-cube` plugin by Nareg Sinenian. All original credit belongs to the upstream author. This fork adds new features, documentation, and Homebridge v2 compatibility.

## Key Features

- HeaterCooler service: HomeKit integration with power, temperature, and status control
- Automatic status polling: Real-time status updates with configurable polling interval (5-300 seconds)
- Optional power switch: Additional HomeKit Switch service for quick power control
- Temperature control: Monitor and adjust boiler temperature (115-130°C range)
- Filter maintenance: Track filter life and get replacement reminders
- HomeKit native: Works with Apple Home app, Siri, and HomeKit automations
- Homebridge v2 ready: Compatible with Homebridge v2 and current Homebridge releases

## Prerequisites

1. Coffee machine setup:
   - Machine must be powered on (hard rocker switch in the on position)
   - Machine must be connected to the same network as Homebridge
   - A static/reserved IP address should be assigned to the machine

2. Homebridge requirements:
   - Homebridge v1.6.0 or later (compatible with Homebridge v2)
   - Node.js v18.20.4 or newer (supported up to, but not including, v25)

## Quick Start

### Install via Homebridge UI (if listed)

Homebridge Config UI X lists plugins by npm package name. To install:

1. Open the Homebridge UI (Config UI X)
2. Go to Plugins -> Search
3. Search for the npm package name: `homebridge-sanremo-cube-coffeemachine`
4. Click Install
5. Restart Homebridge

If the plugin does not appear in the UI search results, use one of the manual install options below.

### Configure your machine

After installation and restart:

1. Go to Plugins -> Sanremo Coffee Machine (or the plugin settings page)
2. Enable Child Bridge (recommended) to isolate the plugin for stability
3. Add your machine:
   - Machine name: The name shown in HomeKit (for example "Sanremo Cube")
   - Machine type: "Cube"
   - IP address: The static IP address of your coffee machine
4. Polling interval: Defaults to 30 seconds. For active monitoring, values between 5-10 seconds are recommended.
5. Save and restart Homebridge

Your Sanremo Cube should now appear in the Apple Home app.

For detailed installation instructions, see INSTALLATION_GUIDE.md. For a quick reference, see QUICK_START.md.

## Installation

### From npm (manual)

```bash
npm install -g homebridge-sanremo-cube-coffeemachine
```

Restart Homebridge and add the platform to your config.

### From GitHub (manual)

```bash
npm install -g https://github.com/fdierer/homebridge-sanremo-coffee-machines.git
```

Restart Homebridge and add the platform to your config.

### Synology / Docker note

If you run Homebridge in Docker (for example on Synology), you can install a local tarball inside the container:

```bash
docker exec -it homebridge sh
cd /homebridge
npm uninstall homebridge-sanremo-cube-coffeemachine
npm install ./homebridge-sanremo-cube-coffeemachine-<version>.tgz
```

Then restart the Homebridge container.

## Example Configuration

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

- Power control: Turn machine on/off (standby mode)
- Temperature monitoring: Real-time boiler temperature (115-130°C)
- Temperature control: Adjust target brewing temperature (115-130°C range)
- Status indicators: Ready to brew, heating, idle states
- Service name: Same as machine name (default: "Sanremo Cube")

### Power Switch Service (Optional)

When `enablePowerSwitch: true` is set:

- Quick power control: Simple on/off switch for power management
- Service name: `<Machine Name> Power` (for example "Sanremo Cube Power")
- Use case: Useful for Siri shortcuts, automations, or quick power toggles

### Filter Maintenance

Built-in filter tracking:

- Filter life tracking: Monitor filter remaining days from machine
- Change indicator: Alert when filter needs replacement (based on machine alarm status)
- Life percentage: Visual filter life level in HomeKit
- Reset function: Reset filter timer after replacement
- Configurable life: Set expected filter life with `filterLifeDays` (default: 180 days)

### Automatic Status Updates

- Background polling: Automatic status checks at configured interval
- Characteristics update automatically in HomeKit
- Configurable frequency: Set polling interval from 5-300 seconds

### Polling Interval Guide

| Interval | Update speed | Network load | Use case |
|----------|--------------|--------------|----------|
| 5 seconds | Very fast | High | Best accuracy, recommended for active use |
| 10 seconds | Fast | Medium | Good balance between accuracy and network usage |
| 30 seconds | Moderate | Low | Default, acceptable for most users |
| 60+ seconds | Slow | Very low | Minimal updates, reduce network traffic |

## Troubleshooting

### Machine not responding

1. Verify machine is powered on (hard rocker switch)
2. Check machine is connected to WiFi
3. Verify IP address is correct and static/reserved
4. Test connectivity from the Homebridge host:
   - `ping <machine-ip>`
   - `curl -sS -X POST -H "Content-Type: application/x-www-form-urlencoded" --data "key=151" http://<machine-ip>/ajax/post`
5. Check firewall rules are not blocking HTTP traffic

### Status not updating

1. Confirm `pollingInterval` is set appropriately
2. Verify logs show polling started
3. Look for network errors in Homebridge logs
4. Ensure the machine is reachable from the Homebridge host

### Debug logging

Set `"debugLogging": true` temporarily to print additional diagnostic messages to the Homebridge log. Set it back to `false` once resolved.

### Child bridge setup

Using a child bridge isolates the plugin and improves stability. Use the `_bridge` block shown in the example configuration.

## Security Notes

As of v1.4.5, the plugin has no direct vulnerable dependencies. HTTP communication is restricted to the user-configured Sanremo Cube on the local network. No external telemetry or cloud services are used.

A previously listed direct dependency on `hap-js` was erroneously included in `package.json` and has been removed. The plugin does not import, reference, or rely on `hap-js` or `hap-nodejs`. After removal, a clean install (`rm -rf node_modules package-lock.json && npm install`) reports zero vulnerabilities for the plugin dependency tree.

For detailed security and compliance information, see HOMEBRIDGE_V2_COMPLIANCE.md.

## Known Limitations

- Single model support: Currently only supports Sanremo Cube
- Network dependency: Requires machine to be on the same network as Homebridge
- Static IP recommended: Machine should have a static/reserved IP address
- HTTP only: Communication is via HTTP (not HTTPS)

## Attribution

This plugin is an enhanced fork of the original `homebridge-sanremo-cube` plugin by Nareg Sinenian.

Fork maintainer: Franc Dierer

Enhancements in this fork include:
- Automatic status polling system with configurable interval
- Temperature clamping to prevent HomeKit warnings
- Optional Power Switch service
- Enhanced filter maintenance tracking
- Homebridge v2 compatibility improvements
- Expanded documentation

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

- GitHub issues: https://github.com/fdierer/homebridge-sanremo-coffee-machines/issues
- Homebridge Discord: Homebridge community
- Homebridge Reddit: r/homebridge

## Release history

Full release notes and detailed changelog are available in CHANGELOG.md.

Recent versions:

- 1.4.5: Current stable version - JSON Schema fixes and defensive polling improvements
- 1.4.2: Documentation and metadata improvements for Homebridge v2 readiness
- 1.4.1: Metadata and changelog packaging improvements for Homebridge UI integration
- 1.4.0: Debug logging option, improved installation documentation, safer UUID generation defaults
- 1.3.x: Initial fork release with stability fixes, automatic polling, and Homebridge v2 compatibility

## License

MIT License - see LICENSE file for details
