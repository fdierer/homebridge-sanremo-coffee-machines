# Homebridge Plugin Verification Request Draft

**Subject**: Verification Request for `homebridge-sanremo-cube-coffeemachine`

---

## Introduction

Hello Homebridge team,

I'm requesting verification for my plugin `homebridge-sanremo-cube-coffeemachine` (npm: `homebridge-sanremo-cube-coffeemachine`). This is an enhanced and actively maintained fork of the original `homebridge-sanremo-cube` plugin by Nareg Sinenian. I've rebuilt it to be compatible with newer Node.js and Homebridge versions, added new features, and improved documentation while maintaining backward compatibility.

**Repository**: https://github.com/fdierer/homebridge-sanremo-coffee-machines  
**npm Package**: https://www.npmjs.com/package/homebridge-sanremo-cube-coffeemachine  
**Current Version**: 1.4.3

---

## Why This Plugin is Suitable for Verification

- **Modern Homebridge APIs**: Uses current Homebridge APIs and fully supports Homebridge v2.0. No deprecated APIs are used (no `AccessoryLoader`, no legacy camera/streaming APIs, etc.).

- **Explicit Node.js Engine Range**: Package.json specifies `engines.node: ">=18.20.4 <25"` with active testing on Node.js v22.x. This ensures compatibility with Homebridge v2.0 requirements while maintaining support for Homebridge v1.6+.

- **Local-Only Communication**: All communication is local to the user's network. The plugin communicates directly with the Sanremo Cube coffee machine via HTTP on the local LAN. No external telemetry, no cloud services, no data collection.

- **Clear Documentation**: Comprehensive README, config schema with user-friendly descriptions, CHANGELOG following "Keep a Changelog" format, and plugin homepage suitable for Homebridge UI.

- **Child Bridge Support**: Fully tested and working with Homebridge child bridge architecture for improved stability and isolation.

- **Privacy-Conscious**: No sensitive data logging. Debug logging is opt-in only (default: false). Only logs plugin initialization, machine discovery, and network communication status (success/failure).

---

## Testing and Stability

The plugin has been tested in a production environment:

- **Real Hardware**: Tested with an actual Sanremo Cube coffee machine on a local network
- **Environment**: Homebridge running in Docker on Synology NAS with Node.js v22.x
- **Architecture**: Running in child bridge mode for isolation
- **Polling**: Automatic status polling tested at intervals from 5 seconds to 30 seconds
- **Error Handling**: Network communication failures are handled gracefully with retry logic and proper error reporting to Homebridge logs

The plugin implements automatic status polling with configurable intervals, proper error handling for network communication, and defensive UUID generation to prevent crashes from malformed user configurations.

---

## Next Steps

I'm happy to provide any additional information, answer questions, or make adjustments if needed. The plugin is ready for verification and has been published to npm as `homebridge-sanremo-cube-coffeemachine@1.4.3`.

Thank you for your consideration.

---

**Maintainer**: Franc Dierer  
**GitHub**: https://github.com/fdierer  
**Original Author Attribution**: Nareg Sinenian (https://github.com/nsinenian)

