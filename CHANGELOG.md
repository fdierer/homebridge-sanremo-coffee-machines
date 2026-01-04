# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.6] - 2026-01-04

### Changed
- Removed erroneous direct dependency on `hap-js` from `package.json`. The plugin does not import, reference, or rely on `hap-js` or `hap-nodejs`. This dependency was not required and has been removed. After removal, a clean install reports zero vulnerabilities for the plugin dependency tree. No runtime or behavioural changes.
- Updated documentation to reflect dependency correction and consolidated compliance information.

## [1.4.5] - 2025-11-28

### Fixed
- Corrected JSON Schema 'required' usage in config.schema.json to satisfy Homebridge checks.
- Added defensive checks in polling code to avoid runtime errors when the machine returns unexpected responses (behaviour for valid responses remains unchanged from 1.4.2).

## [1.4.2] - 2025-11-28
### Changed
- Documentation and metadata improvements for Homebridge v2 readiness and plugin homepage.
- Added verification request draft and improved configuration descriptions.

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

