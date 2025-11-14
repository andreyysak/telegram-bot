import { Telegraf, session } from "telegraf";
import { startTripCommand } from "./commands/trip";
import { setupStartCommand } from "./commands/start";
import { MyContext } from "./types/context";
import { config } from "dotenv";

config();

console.log("🔑 TELEGRAM_BOT_TOKEN:", JSON.stringify(process.env.TELEGRAM_BOT_TOKEN));

export const bot = new Telegraf<MyContext>(process.env.TELEGRAM_BOT_TOKEN!);

bot.use(session({
  defaultSession: () => ({})
}));

bot.use((ctx, next) => {
  console.log("📦 Session:", ctx.session);
  return next();
});

setupStartCommand(bot);
startTripCommand(bot);
