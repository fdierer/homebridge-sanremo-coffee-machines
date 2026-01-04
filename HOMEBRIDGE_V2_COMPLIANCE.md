# Homebridge v2 Compliance Statement  
**Plugin:** homebridge-sanremo-cube-coffeemachine  
**Current Version:** 1.4.5  
**Author:** Franc Dierer  
**Repository:** https://github.com/fdierer/homebridge-sanremo-coffee-machines  

---

## Summary

This plugin is fully compatible with Homebridge v2 and has no known security vulnerabilities as of v1.4.5.

**Key Points:**
- Homebridge v2 compatible (also supports Homebridge v1.6+)
- No vulnerable dependencies (erroneous hap-js dependency removed)
- Local-only network access (no cloud services or external APIs)
- Clean dependency tree with zero npm audit findings
- Actively maintained and tested on real hardware

**Dependency Status:**
- No direct or transitive vulnerable dependencies
- Erroneous hap-js dependency removed from package.json
- Plugin does not import, reference, or rely on hap-js or hap-nodejs
- npm audit reports zero vulnerabilities

**Security:**
- All network communication restricted to user-configured local IP address
- No cloud services, external APIs, or telemetry endpoints
- No authentication material or credentials transmitted externally
- Plugin does not expand the Homebridge security boundary

For complete details, see the sections below.

---

## 1. Purpose of This Document

This document provides a formal compliance statement for the Homebridge plugin **homebridge-sanremo-cube-coffeemachine**, confirming its compatibility with Homebridge v2 and outlining its runtime behaviour, dependency posture, configuration validation, and security characteristics.

It is intended for:
- Homebridge maintainers reviewing plugin verification requests
- Technical reviewers assessing Homebridge v2 readiness
- Users seeking a clear statement of compatibility and known constraints

---

## 2. Homebridge v2 Compatibility Summary

The plugin is compatible with both Homebridge v1.6+ and Homebridge v2.x.

Compatibility is achieved through:
- Use of the official Homebridge platform APIs
- Strict adherence to JSON schema validation
- Avoidance of deprecated Homebridge APIs
- Runtime validation against real Sanremo Cube hardware

The plugin does not rely on undocumented or internal Homebridge APIs.

---

## 3. Runtime Architecture Overview

- The plugin operates entirely within the Homebridge runtime.
- All device communication occurs over HTTP to a user-configured Sanremo Cube on the local network.
- No cloud services, external APIs, or telemetry endpoints are used.
- The plugin performs periodic polling using configurable intervals and defensive error handling.

There is no background execution outside the Homebridge process.

---

## 4. Configuration Schema and Validation

The plugin includes a strict JSON schema (`config.schema.json`) that is compatible with Homebridge v2.

Key characteristics:
- All required fields are explicitly declared
- Optional fields include defaults and validation constraints
- Invalid configurations are rejected by Homebridge prior to runtime
- Schema has been validated against Homebridge Config UI X

This ensures predictable behaviour and prevents runtime misconfiguration.

---

## 5. Dependency and Security Assessment

### 5.1 Dependency Posture

As of version **1.4.5**, the plugin has **no direct or transitive vulnerable dependencies**.

Key points:
- The plugin declares **only required runtime dependencies**
- `homebridge` is declared as a peer dependency
- A previously listed direct dependency on `hap-js` was identified as erroneous and has been **removed**
- The plugin does not import, reference, or rely on `hap-js` or `hap-nodejs`

A clean install using `npm ci` followed by `npm audit` reports **zero vulnerabilities**.

---

### 5.2 Correction of Prior Security Assessment

Earlier versions of this document referenced security advisories associated with `hap-js`.  
This assessment was based on the presence of `hap-js` in `package.json`.

That dependency was **not required** by the plugin and has now been removed.

As a result:
- The plugin has **no association with `hap-js`**
- There are **no inherited or transitive vulnerabilities**
- Previous references to `hap-js` security advisories are **no longer applicable and have been corrected**

This correction does not affect plugin functionality or runtime behaviour.

---

### 5.3 Network Exposure

- All network communication is restricted to a user-specified local IP address
- No inbound listeners are created
- No remote connectivity is initiated
- No authentication material or credentials are transmitted externally

The plugin does not expand the Homebridge security boundary.

---

## 6. Testing and Validation

The plugin has been validated through:
- Continuous real-world use with Sanremo Cube hardware
- Restart, disconnect, and recovery testing
- Schema validation within Homebridge Config UI X
- Clean dependency installation and audit verification

The plugin has been stable in daily operation and exhibits predictable failure handling under network interruption scenarios.

---

## 7. Version Alignment

All documentation, metadata, and runtime behaviour are aligned to **v1.4.5**, which is the version submitted for Homebridge v2 verification.

No behavioural changes were introduced as part of the dependency correction.

---

## 8. Revision History

### v1.4.5 – January 2026 (Documentation & Dependency Correction)
- Removed erroneous direct dependency on `hap-js` from `package.json`
- Corrected prior security assessment that incorrectly attributed vulnerabilities to `hap-js`
- Confirmed clean dependency tree with zero `npm audit` findings
- No changes to runtime behaviour, configuration schema, or Homebridge v2 compatibility

---

## 9. Conclusion

The plugin **homebridge-sanremo-cube-coffeemachine** is fully compatible with Homebridge v2.

It:
- Uses supported APIs
- Enforces strict configuration validation
- Operates entirely on the local network
- Declares only required dependencies
- Has no known security vulnerabilities as of v1.4.5

This document supersedes earlier compliance statements and reflects the current, corrected dependency posture.

---