import { config } from "dotenv";
import { bot } from "./bot";

config();

async function launchBot() {
  try {
    // 🔥 Пробуємо видалити webhook, але не зупиняємо запуск, якщо буде помилка
    try {
      await bot.telegram.deleteWebhook({ drop_pending_updates: true });
      console.log("🧹 Webhook deleted");
    } catch (err: any) {
      console.warn("⚠️ Failed to delete webhook (можливо, бот ще не активований):", err.description || err.message);
    }

    await bot.launch();
    console.log("✅ Bot started successfully!");
  } catch (error) {
    console.error("❌ Failed to start bot:", error);
  }
}

launchBot();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
