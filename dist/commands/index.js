"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupCommands = setupCommands;
const start_1 = require("./start");
const help_1 = require("./help");
function setupCommands(bot) {
    (0, start_1.setupStartCommand)(bot);
    (0, help_1.setupHelpCommand)(bot);
}
