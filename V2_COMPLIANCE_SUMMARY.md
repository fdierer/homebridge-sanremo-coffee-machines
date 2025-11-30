# V2 Compliance Summary  
(for `homebridge-sanremo-cube-coffeemachine` v1.4.5)

This summary provides an overview of the plugin’s compatibility with  
Homebridge v1.6+, v2.0, and Node.js v18+.

---

## Overview

Version 1.4.5 is the stable release.  
It functions correctly with Homebridge v2.0 and uses only supported APIs.  
Configuration, services, and accessory behaviour conform to current guidelines.

---

## Compatibility Details

### Supported Versions
- Node.js: **>=18.20.4 <25**
- Homebridge: **^1.6.0 || ^2.0.0-beta.0**
- HAP-NodeJS v1: Fully compatible

### API and Platform Use
- Implements `DynamicPlatformPlugin` correctly  
- Accessories use the officially supported Service and Characteristic constructors  
- No deprecated or removed API calls are present  
- Suitable for operation in a child bridge

### Build and Schema
- TypeScript build passes  
- Schema uses correct JSON Schema conventions  
- Works with Homebridge UI-X configuration editor  
- Validation for required machine fields: `name`, `type`, `ip`

---

## Security Summary

### Direct Dependencies
The plugin does not directly depend on any libraries with known vulnerabilities as of v1.4.5.

### Transitive Dependencies
`npm audit` may report vulnerabilities inherited from `hap-js` (notably through `request` and `form-data`).  
These do not directly affect plugin behaviour and are not exposed to remote input.

### Exposure Evaluation
- Only communicates with the user’s Sanremo Cube on a local network  
- No external HTTP communication  
- No user-supplied endpoints  
- Risk from transitive dependencies is minimal

---

## Testing Summary

Validated on:
- Synology NAS running Homebridge in Docker  
- Real Sanremo Cube hardware  

Verified operations:
- Temperature reading  
- Temperature setpoint changes  
- Power switching  
- Polling and status updates  
- Child bridge reliability  

---

## Verification Notes

The plugin meets all Homebridge v2.0 requirements except for the unavoidable  
transitive security advisories in the dependency chain of `hap-js`.  

The plugin itself is compliant and behaves correctly under supported environments.

---

**Last Updated:** November 29, 2025  
**Plugin Version:** 1.4.5
