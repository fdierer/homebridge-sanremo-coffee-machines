# Sanremo Coffee Machines Homebridge Plugin

This plugin currently only supports the Sanremo Cube. It implements a heater widget to allow for switching the Cube into or out of standby mode, to monitor and alter the boiler temperature, and to monitor and provide indications for water filter maintenance.

## ✨ New in v1.2.0

- **🔄 Automatic Status Polling**: Real-time status updates in the Home app
- **⚙️ Configurable Polling Interval**: Set custom update frequency (5-300 seconds)
- **📊 Accurate Status**: No more stale "OFF" when machine is actually "ON"
- **🌡️ Extended Temperature Range**: Supports 115-130°C boiler temperatures without warnings
- **🔧 Better Configuration**: Platform-based architecture with config schema for Homebridge UI
- **✅ Homebridge v2.0 Ready**: Fully compatible with Homebridge v2.0 and HAP-NodeJS v1

## Prerequisites

1. The machine should be left switched on (hard rocker switch in the on position) to facilitate communication between the internal WiFi module and homebridge.
2. The machine should be connected to the same network as Homebridge (consult the machine manual on how to connect the machine to a wireless network)
3. A known static IP address should be assigned (consult the machine manual)

## Installation

### From npm (Coming Soon)

```bash
npm install -g homebridge-sanremo-coffee-machines
```

### From GitHub

```bash
npm install -g https://github.com/YOUR_USERNAME/homebridge-sanremo-coffee-machines.git
```

## Plugin Configuration

### Basic Configuration

```json
"platforms": [
    {
        "name": "Config",
        "port": 8581,
        "platform": "config"
    },
    {
        "platform": "SanremoCoffeeMachines",
        "name": "SanremoCoffeeMachines",
        "machines": [
            {
                "name": "Coffee Machine",
                "type": "Cube",
                "ip": "192.168.1.100"
            }
        ]
    }
]
```

### Recommended Configuration (with Polling)

```json
"platforms": [
    {
        "platform": "SanremoCoffeeMachines",
        "name": "SanremoCoffeeMachines",
        "machines": [
            {
                "name": "Coffee Machine",
                "type": "Cube",
                "ip": "192.168.1.100",
                "pollingInterval": 5
            }
        ]
    }
]
```

### Configuration with Child Bridge

```json
"platforms": [
    {
        "platform": "SanremoCoffeeMachines",
        "name": "SanremoCoffeeMachines",
        "machines": [
            {
                "name": "Coffee Machine",
                "type": "Cube",
                "ip": "192.168.1.100",
                "pollingInterval": 5
            }
        ],
        "_bridge": {
            "username": "0E:CC:88:96:48:DF",
            "port": 42846,
            "name": "Sanremo Bridge"
        }
    }
]
```

### Multiple Machines

```json
"platforms": [
    {
        "platform": "SanremoCoffeeMachines",
        "name": "SanremoCoffeeMachines",
        "machines": [
            {
                "name": "Kitchen Coffee Machine",
                "type": "Cube",
                "ip": "192.168.1.100",
                "pollingInterval": 5
            },
            {
                "name": "Office Coffee Machine",
                "type": "Cube",
                "ip": "192.168.1.101",
                "pollingInterval": 10
            }
        ]
    }
]
```

## Configuration Options

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `platform` | string | Yes | - | Must be `"SanremoCoffeeMachines"` |
| `name` | string | Yes | - | Platform name |
| `machines` | array | Yes | - | Array of coffee machines |
| `machines[].name` | string | Yes | - | Machine name in HomeKit |
| `machines[].type` | string | Yes | - | Machine type (currently only `"Cube"`) |
| `machines[].ip` | string | Yes | - | Static IP address of machine |
| `machines[].pollingInterval` | number | No | 30 | Status polling interval in seconds (5-300) |

## Polling Interval Guide

| Interval | Update Speed | Network Load | Use Case |
|----------|--------------|--------------|----------|
| 5 seconds | ⚡ Very Fast | 🔴 High | Best accuracy, recommended |
| 10 seconds | ⚡ Fast | 🟡 Medium | Good balance |
| 30 seconds | 🐢 Moderate | 🟢 Low | Default, acceptable |
| 60+ seconds | 🐢 Slow | 🟢 Very Low | Minimal updates |

## Features

### Heater/Cooler Service
- **Power Control**: Turn machine on/off (standby mode)
- **Temperature Monitoring**: Real-time boiler temperature (115-130°C)
- **Temperature Control**: Adjust target brewing temperature
- **Status Indicators**: Ready to brew, heating, idle states

### Filter Maintenance
- **Filter Life Tracking**: Monitor filter remaining days
- **Change Indicator**: Alert when filter needs replacement
- **Reset Function**: Reset filter timer after replacement

### Automatic Status Updates (v1.2.0+)
- **Background Polling**: Automatic status checks at configured interval
- **Push Updates**: All characteristics update automatically
- **Real-time Accuracy**: HomeKit always shows current machine state

## Troubleshooting

### Machine Not Responding

1. Verify machine is powered on (hard switch)
2. Check WiFi connection on machine
3. Verify IP address is correct and static
4. Test connectivity: `ping [machine-ip]`

### Status Not Updating

1. Check `pollingInterval` is set in config
2. Verify logs show: `Starting automatic polling every X seconds`
3. Check for network errors in logs
4. Ensure machine is reachable from Homebridge

### Temperature Warnings

If you see temperature warnings, you may be using the old `homebridge-sanremo-cube` plugin. This plugin (`homebridge-sanremo-coffee-machines`) supports temperatures up to 150°C.

## Changelog

See [CHANGELOG_v1.2.0.md](CHANGELOG_v1.2.0.md) for detailed changes.

## Installation Guide

See [INSTALLATION_GUIDE.md](INSTALLATION_GUIDE.md) for detailed installation instructions.

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Support

- **Issues**: https://github.com/nsinenian/homebridge-sanremo-coffee-machines/issues
- **Homebridge**: https://homebridge.io
- **Sanremo**: https://www.sanremomachines.com

## License

MIT License - see LICENSE file for details

## Credits

- Original plugin by Nareg Sinenian
- v1.2.0 automatic polling enhancements by Francis Dierer

## Notes

- Only the Sanremo Cube is currently supported
- Other Sanremo models may be supported in future versions
- **Requires Homebridge v1.6 or later** (v2.0 compatible ✅)
- **Requires Node.js v18.20.4, v20.15.1, or v22+**
- See [HOMEBRIDGE_V2_COMPLIANCE.md](HOMEBRIDGE_V2_COMPLIANCE.md) for v2.0 compatibility details
