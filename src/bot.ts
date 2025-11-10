import { Telegraf } from "telegraf";
import { config } from "dotenv";
import { setupCommands } from "./commands";

config();

export const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN!);

bot.use(async (ctx, next) => {
  console.log(`Message from: ${ctx.from?.username}`);
  await next();
});

setupCommands(bot);
