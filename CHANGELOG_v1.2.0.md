# Changelog v1.2.0 - Automatic Status Polling

## New Features

### 🔄 Automatic Status Polling
- **Automatic status updates**: The plugin now automatically polls the coffee machine at regular intervals
- **Configurable polling interval**: Set custom polling frequency (5-300 seconds) per machine
- **Real-time HomeKit updates**: Status changes appear in the Home app within seconds
- **Background updates**: All characteristics (power, temperature, filter status) update automatically

### ✅ Homebridge v2.0 Compatibility
- **Fully compatible** with Homebridge v2.0 and HAP-NodeJS v1
- **Updated package.json engines** to declare v2.0 support
- **No deprecated APIs** - uses modern Homebridge platform API
- **Green checkmark** will appear in Homebridge UI for v2.0 readiness
- See [HOMEBRIDGE_V2_COMPLIANCE.md](HOMEBRIDGE_V2_COMPLIANCE.md) for details

### ⚙️ Configuration

New optional `pollingInterval` parameter for each machine:

```json
{
    "platform": "SanremoCoffeeMachines",
    "name": "SanremoCoffeeMachines",
    "machines": [
        {
            "name": "Coffee Machine",
            "type": "Cube",
            "ip": "192.168.68.83",
            "pollingInterval": 5
        }
    ]
}
```

**Polling Interval Options:**
- **5 seconds**: Very fast updates (recommended for best accuracy)
- **10 seconds**: Fast updates, good balance
- **30 seconds**: Default, moderate updates
- **60+ seconds**: Slower updates, minimal network traffic

## Improvements

### Before v1.2.0:
- ❌ Status only updated when HomeKit requested it
- ❌ Stale status displayed (machine ON but showing OFF)
- ❌ Manual refresh required

### After v1.2.0:
- ✅ Automatic status updates every N seconds
- ✅ Accurate real-time status in Home app
- ✅ No manual refresh needed
- ✅ All characteristics update together (power, temp, filter)

## Technical Changes

- Added `pollingInterval` property to machine configuration
- Implemented `startPolling()` method with automatic status updates
- Added `pollStatus()` method to fetch and update all characteristics
- Added `stopPolling()` cleanup method
- Updated all characteristics to use `updateCharacteristic()` for push updates
- Added comprehensive logging for polling status

## Migration from v1.1.6

### No Breaking Changes
- Existing configurations continue to work (defaults to 30-second polling)
- Simply update the plugin and optionally add `pollingInterval` to your config

### Recommended Configuration

For best user experience with Sanremo Cube:

```json
{
    "platform": "SanremoCoffeeMachines",
    "name": "SanremoCoffeeMachines",
    "machines": [
        {
            "name": "Coffee Machine",
            "type": "Cube",
            "ip": "192.168.68.83",
            "pollingInterval": 5
        }
    ],
    "_bridge": {
        "username": "XX:XX:XX:XX:XX:XX",
        "port": 42846,
        "name": "Sanremo Bridge"
    }
}
```

## Installation

### From GitHub (Recommended for Testing)

```bash
npm install https://github.com/YOUR_USERNAME/homebridge-sanremo-coffee-machines.git
```

### From npm (Once Published)

```bash
npm install homebridge-sanremo-coffee-machines@1.2.0
```

## Testing

Tested with:
- Sanremo Cube coffee machine
- Homebridge v1.6+
- Node.js v20+
- Various polling intervals (5s, 10s, 30s, 60s)

## Known Issues

None reported.

## Future Enhancements

Potential features for future versions:
- Optional temperature sensor disable
- Configurable temperature capping
- Support for additional Sanremo models
- Energy usage tracking
- Shot counter integration

## Credits

- Original plugin by Nareg Sinenian
- v1.2.0 enhancements by Francis Dierer

## License

MIT

