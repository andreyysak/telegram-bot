"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const bot_1 = require("./bot");
(0, dotenv_1.config)();
async function launchBot() {
    try {
        // 🔥 Видаляємо webhook і очищуємо старі оновлення
        await bot_1.bot.telegram.deleteWebhook({ drop_pending_updates: true });
        await bot_1.bot.launch();
        console.log("✅ Bot started successfully!");
    }
    catch (error) {
        console.error("❌ Failed to start bot:", error);
    }
}
// Запуск
launchBot();
process.once("SIGINT", () => bot_1.bot.stop("SIGINT"));
process.once("SIGTERM", () => bot_1.bot.stop("SIGTERM"));
