"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mainMenuKeyboard = void 0;
const telegraf_1 = require("telegraf");
exports.mainMenuKeyboard = telegraf_1.Markup.inlineKeyboard([
    [telegraf_1.Markup.button.callback("📍 Поїздка", "trip")],
    [telegraf_1.Markup.button.callback("🛢️ Паливо", "fuel")],
    [telegraf_1.Markup.button.callback("✨ AI calories", "ai_calories")],
]);
