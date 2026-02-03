# Feature Backlog - Sanremo Cube Homebridge Plugin

**Last Updated:** 2026-01-04  
**Current Version:** 1.4.6  
**Status:** Active planning and development

---

## Overview

This document tracks planned features, enhancements, and improvements for the Sanremo Cube Homebridge plugin. Features are organized by priority and category to guide development efforts.

---

## Priority Definitions

- **P0 - Critical:** Core functionality improvements, security fixes, or breaking issues
- **P1 - High:** Significant user experience improvements or highly requested features
- **P2 - Medium:** Nice-to-have enhancements that improve usability
- **P3 - Low:** Future considerations or experimental features

---

## In Progress

_None currently_

---

## Planned Features

### Filter Timer/Reminder Refinement (P1)

**Status:** Planned  
**Category:** Filter Maintenance Enhancement  
**Estimated Effort:** Medium

#### Current State
The plugin currently has:
- Local date-based filter replacement tracking (`nextFilterReplacementDate`)
- Machine-reported filter days remaining (`roRegFilterDaysRemaining`)
- Machine-reported filter threshold (`roFilterChangeThresholdDays`)
- Alarm-based filter change indication from machine
- Unused `getDaysUntilFilterReplacement()` method
- TODO comment for HomeKit notification implementation

#### Proposed Enhancements

1. **HomeKit Notification Integration**
   - Implement HomeKit notifications when filter replacement date is reached
   - Use existing `getDaysUntilFilterReplacement()` method
   - Trigger notifications at configurable warning thresholds (e.g., 7 days before, 3 days before, due date)
   - Leverage HomeKit's built-in notification system for filter reminders

2. **Enhanced Filter Status Visibility**
   - Expose days until replacement as a HomeKit characteristic (if supported)
   - Add more granular filter status information in logs
   - Display filter replacement date in HomeKit accessory details (if possible)

3. **Improved Date/Machine Status Integration**
   - Better synchronization between local date tracking and machine-reported status
   - Handle edge cases where machine status and local tracking diverge
   - Provide clear indication when machine alarm and local date tracking both indicate filter change needed

4. **Configurable Warning Thresholds**
   - Add `filterWarningDays` configuration option (e.g., `[7, 3, 0]` for warnings at 7 days, 3 days, and due date)
   - Allow users to customize when they receive filter replacement reminders
   - Default to reasonable values (e.g., 7 days before and on due date)

5. **Filter Replacement History**
   - Track filter replacement history in accessory context
   - Log replacement dates for maintenance records
   - Optional: Expose replacement count or last replacement date

#### Technical Considerations
- Use HomeKit's notification system (if available) or Homebridge notification plugins
- Ensure notifications are not duplicated (track which notifications have been sent)
- Persist notification state across restarts
- Consider rate limiting to avoid notification spam
- Test with HomeKit automations and shortcuts

#### Acceptance Criteria
- [ ] HomeKit notifications trigger when filter replacement is due
- [ ] Configurable warning thresholds work as expected
- [ ] Filter status is clearly visible in HomeKit
- [ ] Local date tracking and machine status are properly integrated
- [ ] No duplicate notifications are sent
- [ ] Filter replacement history is tracked
- [ ] Documentation updated with new configuration options
- [ ] Backward compatible with existing configurations

#### Related Code
- `src/SanremoCubeAccessory.ts` lines 470-524 (Filter Reminder Logic Structure)
- `src/SanremoCubeAccessory.ts` lines 436-468 (Filter maintenance implementation)
- `src/SanremoCubeAccessory.ts` line 506 (TODO comment)

---

### Multi-Model Support (P2)

**Status:** Future Consideration  
**Category:** Feature Expansion  
**Estimated Effort:** High

#### Description
Extend plugin support beyond Sanremo Cube to other Sanremo coffee machine models.

#### Requirements
- Research other Sanremo models and their API compatibility
- Determine if other models use similar HTTP interface
- Implement model detection and appropriate handling
- Update configuration schema to support multiple model types
- Test with available hardware

#### Acceptance Criteria
- [ ] At least one additional Sanremo model supported
- [ ] Model detection works correctly
- [ ] Configuration schema supports multiple models
- [ ] Documentation updated with supported models

---

### HTTPS Support (P2)

**Status:** Future Consideration  
**Category:** Security Enhancement  
**Estimated Effort:** Medium

#### Description
Add support for HTTPS communication with the coffee machine if the machine supports it.

#### Requirements
- Detect if machine supports HTTPS
- Add configuration option for protocol selection (HTTP/HTTPS)
- Handle certificate validation appropriately
- Maintain backward compatibility with HTTP-only machines

#### Acceptance Criteria
- [ ] HTTPS communication works when machine supports it
- [ ] HTTP fallback works for machines without HTTPS
- [ ] Certificate validation is handled appropriately
- [ ] Configuration option is clear and documented

---

### Advanced Polling Strategies (P2)

**Status:** Future Consideration  
**Category:** Performance Optimization  
**Estimated Effort:** Medium

#### Description
Implement adaptive polling that adjusts frequency based on machine state or user activity.

#### Proposed Features
- Adaptive polling: Faster when machine is active, slower when in standby
- Event-driven updates: Poll immediately after state changes
- Smart polling: Reduce frequency during off-hours
- Configurable polling profiles (e.g., "active", "standby", "sleep")

#### Acceptance Criteria
- [ ] Polling frequency adapts to machine state
- [ ] Network usage is reduced during idle periods
- [ ] Responsiveness is maintained when needed
- [ ] Configuration options are clear

---

### Enhanced Error Handling and Recovery (P1)

**Status:** Planned  
**Category:** Stability Improvement  
**Estimated Effort:** Medium

#### Description
Improve error handling, retry logic, and recovery mechanisms for network communication failures.

#### Proposed Features
- Exponential backoff for failed requests
- Automatic reconnection after network interruptions
- Better error messages for common failure scenarios
- Health check endpoint monitoring
- Graceful degradation when machine is unreachable

#### Acceptance Criteria
- [ ] Plugin recovers automatically from temporary network issues
- [ ] Error messages are clear and actionable
- [ ] No crashes or unhandled exceptions
- [ ] Plugin continues to function when machine is temporarily unavailable

---

### Coffee Statistics Tracking (P3)

**Status:** Future Consideration  
**Category:** Feature Enhancement  
**Estimated Effort:** Low-Medium

#### Description
Track and expose coffee brewing statistics from machine registers.

#### Proposed Features
- Daily, weekly, monthly, yearly coffee count
- Total coffee count
- Statistics exposed via HomeKit (if possible) or logged
- Optional: Export statistics to file or external service

#### Acceptance Criteria
- [ ] Coffee statistics are read from machine registers
- [ ] Statistics are accessible to users
- [ ] Statistics persist across restarts
- [ ] Documentation explains available statistics

---

### Configuration Validation Improvements (P2)

**Status:** Future Consideration  
**Category:** User Experience  
**Estimated Effort:** Low

#### Description
Add better validation and error messages for configuration issues.

#### Proposed Features
- Validate IP address format
- Test connectivity during configuration
- Provide helpful error messages for common misconfigurations
- Pre-flight checks before starting polling

#### Acceptance Criteria
- [ ] Configuration errors are caught early
- [ ] Error messages guide users to solutions
- [ ] Connectivity is verified before starting
- [ ] User experience is improved

---

## Completed Features

### Dependency Correction (v1.4.6)
- Removed erroneous `hap-js` dependency
- Cleaned dependency tree
- Zero vulnerabilities

### Homebridge v2 Compatibility (v1.4.2+)
- Full Homebridge v2 support
- Updated documentation
- Officially verified by Homebridge (Issue #897, verified February 2026)

### Debug Logging (v1.4.0)
- Added `debugLogging` configuration option
- Enhanced diagnostic output

---

## Notes

### Feature Request Process
1. Features are added to this backlog with appropriate priority
2. Features move from "Planned" to "In Progress" when work begins
3. Completed features move to "Completed" section
4. Priority may be adjusted based on user feedback or requirements

### Development Guidelines
- All features should maintain backward compatibility unless breaking changes are necessary
- Documentation must be updated for all user-facing features
- CHANGELOG.md must be updated for all releases
- Features should be tested on real hardware when possible
- Code should follow existing patterns and style

### Contributing
Feature requests and contributions are welcome. Please open an issue on GitHub for discussion before implementing major features.

---

**Document Status:** Active planning document  
**Maintainer:** Franc Dierer  
**Repository:** https://github.com/fdierer/homebridge-sanremo-coffee-machines

