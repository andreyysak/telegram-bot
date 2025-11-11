"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bot = void 0;
const telegraf_1 = require("telegraf");
const trip_1 = require("./commands/trip");
const start_1 = require("./commands/start");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
exports.bot = new telegraf_1.Telegraf(process.env.TELEGRAM_BOT_TOKEN);
exports.bot.use((0, telegraf_1.session)({
    defaultSession: () => ({})
}));
exports.bot.use((ctx, next) => {
    console.log("📦 Session:", ctx.session);
    return next();
});
(0, start_1.setupStartCommand)(exports.bot);
(0, trip_1.startTripCommand)(exports.bot);
