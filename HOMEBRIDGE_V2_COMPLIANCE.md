# Homebridge v2 Compliance Report  
(for `homebridge-sanremo-cube-coffeemachine` v1.4.5)

This document outlines compatibility of the `homebridge-sanremo-cube-coffeemachine` plugin with  
Homebridge v1.6+, Homebridge v2.0, and Node.js v18.20.4 to <25.

---

## 1. Overview

Version 1.4.5 is the current stable release.  
It is fully compatible with Homebridge v1.6 and Homebridge v2.0.  
The plugin uses only supported APIs, compiles cleanly, and behaves reliably in real-world testing.

---

## 2. Compatibility Summary

### Node.js and Homebridge Versions
- Node.js: **>=18.20.4 <25**  
- Homebridge: **^1.6.0 || ^2.0.0-beta.0**  
- Supports and is validated under child bridge mode.

### API Usage
- Uses modern Homebridge platform APIs  
- No deprecated HAP-NodeJS imports  
- No legacy camera services or removed API calls  
- Accessories are constructed only via `this.platform.Service` and `this.platform.Characteristic`

### Build and Runtime
- TypeScript compiles cleanly  
- Runtime tested on Synology NAS Docker environment  
- Behaviour confirmed on a real Sanremo Cube machine  
- No unhandled errors or unsupported API warnings reported

---

## 3. Configuration Schema

The included `config.schema.json`:
- Correctly defines `pluginAlias` and `pluginType`  
- Provides validation for platform-level options  
- Uses JSON Schema `required` arrays (correct for Homebridge UI-X)  
- Ensures each machine entry includes required fields:
  - `name`
  - `type`
  - `ip`

---

## 4. Security Assessment

### Direct Dependencies
The plugin has **no direct dependencies with known vulnerabilities**.  
Version 1.4.5 removed all deprecated HTTP libraries such as `node-fetch`.

### Transitive Vulnerabilities
`npm audit` may report two critical vulnerabilities originating from **`hap-js`**, specifically through:
- `request`
- `form-data`

These packages are not directly used by the plugin.  
They are part of the underlying HAP client implementation.

### Risk Evaluation
- All communication is restricted to the user’s Sanremo Cube via a local network IP  
- No external endpoints or user-supplied URLs  
- The vulnerable code paths are not exposed in normal operation  
- Not considered a meaningful attack surface in this context

A future minor release may evaluate replacing `hap-js` if advisable, but this is not required for Homebridge v2 compatibility.

---

## 5. Real-World Verification

Validated operations:
- Power state control  
- Temperature reading and setpoint changes  
- Automatic polling and accessory state updates  
- Correct behaviour under intermittent device availability  
- No repeated error spam or unexpected resets

Environment tested:
- Homebridge Docker on Synology NAS  
- Sanremo Cube hardware (real device)

---

## 6. Conclusion

Version 1.4.5 meets all Homebridge v2 requirements:
- Modern API usage  
- Correct engine constraints  
- Valid configuration schema  
- Stable runtime behaviour  
- Clean build process  

The only outstanding audit items originate from transitive dependencies in `hap-js`.

**Compliance Status:** Fully compatible with Homebridge v2.0.

**Last Updated:** November 29, 2025  
**Plugin Version:** 1.4.5
