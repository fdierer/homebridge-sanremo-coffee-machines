# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.0] - 2024-XX-XX

### Added
- Optional `debugLogging` configuration flag for verbose troubleshooting output.
- Additional documentation covering installation, setup, and child bridge usage.

### Changed
- Hardened accessory UUID generation to prevent startup crashes when config fields are missing.
- Relaxed Node.js engine requirement to `>=18.20.4 <25` for Synology compatibility.
- HeaterCooler services now start with safe default values to avoid HomeKit warnings.

## [1.3.0] - 2024-XX-XX

### Added
- Optional Power Switch service (`enablePowerSwitch` config option)
  - Adds a separate HomeKit Switch service named `<Machine Name> Power`
  - Works independently from HeaterCooler service
  - Useful for Siri shortcuts and automations
- Filter life configuration (`filterLifeDays` config option)
  - Configurable expected filter life (1-365 days, default: 180)
  - Filter replacement date tracking structure
  - Ready for future notification implementation

### Changed
- Improved naming conventions
  - Consistent "Sanremo Cube" naming across all services
  - Accessory defaults to "Sanremo Cube" name
- Renamed npm package to `homebridge-sanremo-cube` for publication
- Enhanced documentation
  - Complete README rewrite
  - Added PLUGIN_HOMEPAGE.md for Homebridge UI
  - Comprehensive configuration examples
  - Troubleshooting guide

### Fixed
- No regressions from previous versions

## [1.2.0] - Previous Release

### Added
- Automatic status polling system
  - Configurable polling interval (5-300 seconds, default: 30)
  - Real-time status updates in HomeKit
  - Eliminates stale "OFF" state when machine is actually "ON"
- Temperature clamping
  - Prevents HomeKit warnings for temperatures >100°C
  - Automatically clamps values to valid HomeKit range
  - Temperature range support: 115-130°C
- Platform-based architecture
  - Config schema for Homebridge UI-X
  - Support for multiple machines
  - Child bridge support

### Fixed
- Duplicate characteristic bug
- HomeKit temperature warnings
- Status synchronization issues

### Changed
- Migrated to Homebridge v2.0 compatible API
- Improved error handling
- Enhanced logging

## [1.1.0] and earlier

### Added
- Initial HeaterCooler service implementation
- Basic filter maintenance tracking
- Power control (standby mode)
- Temperature monitoring and control

### Notes
- Original implementation by Nareg Sinenian
- Enhanced fork with significant improvements by Franc Dierer

---

**Note**: This changelog documents the enhanced fork maintained by Franc Dierer. The original plugin by Nareg Sinenian had its own version history prior to this fork.

