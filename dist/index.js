"use strict";
const settings_1 = require("./settings");
const SanremoCoffeeMachines_1 = require("./SanremoCoffeeMachines");
module.exports = (api) => {
    api.registerPlatform(settings_1.PLATFORM_NAME, SanremoCoffeeMachines_1.SanremoCoffeeMachines);
};
//# sourceMappingURL=index.js.map