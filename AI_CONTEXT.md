{\rtf1\ansi\ansicpg1252\cocoartf2867
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 # AI Project Context: homebridge-sanremo-coffee-machines\
\
This file is the single source of truth for AI tools (ChatGPT and Cursor) working on this repository.\
\
It describes the current state of the plugin, what is already implemented, what is planned, and how configuration and naming should behave.\
\
All changes proposed by AI must respect and update this file when they materially change behavior, configuration, or public surface area.\
\
---\
\
## 1. Overview\
\
- Plugin name (npm): `homebridge-sanremo-coffee-machines`\
- Display name: `Sanremo Cube for Homebridge`\
- Homebridge plugin type: platform\
- Platform alias: `SanremoCoffeeMachines`\
- Target device: Sanremo Cube coffee machine\
- Communication: HTTP interface on the machine at `/ajax/post`\
- Local development path:\
  `/Users/francisdierer/Dev Environment/homebridge-sanremo-coffee-machines`\
\
This repo is an enhanced fork of the original `homebridge-sanremo-cube` plugin by Nareg Sinenian, with significant additions and refactors.\
\
Attribution to the original author must remain clear and accurate in README, package.json, and docs.\
\
---\
\
## 2. Current implementation state\
\
Plugin is currently working in the user's environment with:\
\
- Automatic polling of machine status\
- Stable HomeKit integration as a HeaterCooler service\
- Optional extra Switch service for power control\
- Temperature clamping to stay within HomeKit limits\
- Filter related characteristics wired, with configuration for filter life\
\
The plugin has been tested:\
\
- With a Sanremo Cube on a local network with static IP\
- With Homebridge running in Docker on a Synology NAS\
- With a dedicated child bridge for this plugin\
- With polling intervals from 5 seconds up to at least 30 seconds\
\
Homebridge currently reports the plugin as:\
\
- Name: `homebridge-sanremo-coffee-machines`\
- Version in logs: `1.2.0`\
\
Planned next tagged version for release once docs and metadata are aligned:\
\
- Target: `1.3.0`\
\
Until published, treat `1.3.0` as "next version", not yet released.\
\
---\
\
## 3. Implemented features\
\
These features are already implemented in code and known to work in the live environment.\
\
1. Automatic polling\
\
- Polling is performed on a fixed interval using `setInterval`.\
- Interval is configurable via `pollingInterval` in seconds, per machine config.\
- There is a minimum and maximum allowed interval (5 to 300 seconds) to avoid silly values.\
- Logs show a line like:\
  `Starting automatic polling every X seconds for Coffee Machine`.\
\
2. HeaterCooler service\
\
- Main service exposed to HomeKit is a HeaterCooler service.\
- It provides:\
  - On / off (standby) control\
  - Current temperature reporting\
  - Target temperature control\
  - Current heater state\
- Target temperature range:\
  - Machine actual setpoint range is roughly 115 to 130 degrees Celsius.\
  - Values returned to HomeKit are clamped to avoid exceeding the HomeKit maximum (100 C for CurrentTemperature).\
- State is kept in sync via polling and API requests to `/ajax/post` with the correct key payload.\
\
3. Temperature clamping\
\
- If raw machine temperature exceeds the HomeKit safe limit, it is clamped.\
- Clamping avoids the "illegal value: number 115 exceeded maximum of 100" warning in Homebridge.\
- A log warning is emitted when clamping occurs, to help diagnose but not spam the logs.\
\
4. Optional power Switch service\
\
- When `enablePowerSwitch: true` is set for a machine, an additional HomeKit Switch service is created.\
- This Switch:\
  - Controls the same underlying power / standby state as the HeaterCooler Active characteristic.\
  - Is independent in the Home app UI and can be used in automations and Siri shortcuts.\
- Naming convention:\
  - If machine name is `Sanremo Cube`, switch service name is `Sanremo Cube Power`.\
\
5. Filter maintenance configuration (data level)\
\
- Plugin exposes filter related characteristics:\
  - FilterChangeIndication\
  - FilterLifeLevel\
  - ResetFilterIndication\
- Config supports a `filterLifeDays` numeric value (default 180).\
- Internal state tracks filter life as days/percentage based on this configuration.\
- HomeKit notifications / push alerts for filter change are not yet implemented, but the structure is ready to support them later.\
\
6. Homebridge v2 compatibility work\
\
- Plugin follows Homebridge v2 friendly patterns:\
  - Platform plugin structure\
  - Config schema via `config.schema.json`\
  - Support for child bridge configuration\
- Engines in package.json are aligned with:\
  - Homebridge `^1.6.0` and `^2.0.0-beta.0`\
  - Node `^18.20.4`, `^20.15.1`, `^22.0.0`\
\
---\
\
## 4. Planned / not yet implemented\
\
These are ideas or planned improvements that are not fully implemented yet, or only partially wired.\
\
AI tools must not document these as "working" until they actually exist in code and have been tested.\
\
1. Filter notifications\
\
- Goal: use HomeKit mechanisms (or at least logs) to remind the user when `filterLifeDays` has been exceeded.\
- Current state:\
  - Config field exists.\
  - Filter characteristics exist.\
  - No actual notification or time based decrement logic has been fully designed and implemented.\
\
2. Support for additional Sanremo models\
\
- Currently, only `type: "Cube"` is supported.\
- Future idea: extend to other Sanremo machines if their HTTP API is understood.\
- For now:\
  - `type` must remain `"Cube"`.\
  - Docs must not imply other models work.\
\
3. More advanced UI behavior\
\
- Possible future improvements:\
  - Refined mapping of machine states to HeaterCooler states.\
  - More nuanced handling of "ready", "heating", "standby", etc.\
- Not yet implemented beyond the working behavior already in place.\
\
---\
\
## 5. Naming and configuration rules\
\
These are the current rules and expectations for naming and configuration.\
\
1. Platform and plugin\
\
- `platform` in config must be `SanremoCoffeeMachines`.\
- Platform `name` is configurable, default `SanremoCoffeeMachines`.\
\
2. Machines array\
\
Each machine entry in `machines`:\
\
- Required fields:\
  - `name`: string, default `Sanremo Cube`.\
  - `type`: string, must be `"Cube"` for now.\
  - `ip`: string, IPv4 address of the machine, static and reachable from Homebridge.\
- Optional fields:\
  - `pollingInterval`: integer, seconds, default 30, range 5 to 300.\
  - `enablePowerSwitch`: boolean, default false.\
  - `filterLifeDays`: integer, default 180, range 1 to 365.\
\
3. Service names in HomeKit\
\
- Accessory name: configuration `name` for the machine, default `Sanremo Cube`.\
- HeaterCooler service name: same as the machine name.\
- Optional Switch service name: `<Machine Name> Power`.\
\
4. Child bridge configuration\
\
- Plugin supports `_bridge` configuration at platform level.\
- Example:\
  - `username`, `port`, `name` as used in the live Docker / Synology environment.\
- Child bridge is recommended and tested in the current setup.\
\
---\
\
## 6. Documentation status\
\
Cursor has drafted the following documentation artifacts, but they are not yet final:\
\
- `README.md`: large rewrite with new features and config examples.\
- `PLUGIN_HOMEPAGE.md`: short description for Homebridge UI plugin page.\
- `config.schema.json`: updated with pollingInterval, enablePowerSwitch, filterLifeDays.\
- `CHANGELOG.md`: structured using Keep a Changelog, with 1.2.0 and 1.3.0 entries.\
- `HOMEBRIDGE-PLUGIN.json` metadata (may be redundant with package.json, needs alignment).\
- `package.json` sections updated for:\
  - version 1.3.0\
  - displayName\
  - engines\
  - repository, bugs, homepage\
  - files list for npm packaging.\
\
Important:\
\
- Actual committed version in package.json may still be 1.2.0.\
- Before publishing to npm, docs and package.json must be made consistent with reality.\
- Attribution must continue to list Nareg Sinenian as the original author, and clearly describe this as an enhanced fork.\
\
---\
\
## 7. Workflow rules for AI tools\
\
These rules explain how ChatGPT and Cursor should work together on this repo.\
\
1. Always read AI_CONTEXT.md first\
\
- Before making any changes, AI tools must:\
  - Open this file.\
  - Confirm they understand the current state.\
- No AI should assume old temperature error bugs still exist, because they have been fixed.\
\
2. Do not claim features are implemented unless they exist in code\
\
- Documentation must only describe:\
  - Features that are implemented and tested.\
  - Planned or future work clearly labelled as such.\
\
3. When making changes that affect behavior or configuration\
\
- Update:\
  - This AI_CONTEXT.md file to reflect the new state.\
  - README.md and config.schema.json if public surface changes.\
  - CHANGELOG.md with a new entry under Unreleased or next version.\
\
4. Role split\
\
- ChatGPT:\
  - Designs changes at a conceptual level.\
  - Writes or refines documentation and high level plans.\
  - Produces clear instructions or diffs for Cursor.\
  - Validates that documentation matches behavior.\
- Cursor:\
  - Applies actual code changes to TypeScript / JavaScript / JSON files.\
  - Runs builds, compiles TypeScript, and resolves TypeScript errors.\
  - Shows diffs and final content for ChatGPT to review if needed.\
\
5. Ground truth\
\
- The actual plugin behavior in `dist` and `src` is the ground truth.\
- AI_CONTEXT.md and README.md must follow the code, not the other way around.\
- If there is a conflict between code and docs, code wins, and docs must be updated.\
\
---\
\
## 8. How to use this file as the user\
\
When asking ChatGPT to work on this repo, you can say things like:\
\
- "Use the current AI_CONTEXT.md in the repo as the source of truth and draft an updated README section for configuration."\
- "Generate a Cursor instruction block to update config.schema.json and AI_CONTEXT.md for a new option called X."\
\
When working in Cursor:\
\
- In a new instruction, tell Cursor:\
  - "Open AI_CONTEXT.md in the repo root and summarise it in 3 bullet points, then perform the following changes based on that state: [...]"\
\
This keeps all three parties (you, ChatGPT, Cursor) aligned on the real current state of the plugin.}