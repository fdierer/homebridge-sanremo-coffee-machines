# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.1] - 2025-11-27

### Changed
- Metadata-only release to ensure `CHANGELOG.md` is bundled with the npm package and visible in the Homebridge UI release notes and changelog tabs.

## [1.4.0] - 2025-11-27

### Added
- Added `debugLogging` setting to the config schema and platform, plus accessory-level debug output.
- Documented installation, configuration, and child bridge setup more clearly in the README.

### Fixed
- Hardened UUID seed generation in `discoverDevices()` to avoid crashes when config fields are missing.
- Set default `TargetHeaterCoolerState` and `HeatingThresholdTemperature` to avoid initial HomeKit warnings.

### Changed
- Updated `engines.node` to explicitly support Node.js 24.x while maintaining Homebridge 1.x compatibility.

## [1.3.1] - 2025-11-26

### Fixed
- Added safeguards around UUID generation and config handling to prevent startup errors on some platforms.

## [1.3.0] - 2025-11-26

### Added
- Initial release of `homebridge-sanremo-cube-coffeemachine` fork based on the original Sanremo Cube plugin.
- Support for controlling Sanremo Cube via HomeKit with power control, temperature monitoring, and filter maintenance tracking.

