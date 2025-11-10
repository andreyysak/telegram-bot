import { config } from "dotenv";
import { bot } from "./bot";

config(); // завантажує .env

async function launchBot() {
  try {
    await bot.launch();
    console.log("✅ Bot started successfully!");
  } catch (error) {
    console.error("❌ Failed to start bot:", error);
  }
}

launchBot();

// Graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
