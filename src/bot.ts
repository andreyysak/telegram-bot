import { Telegraf, session } from "telegraf";
import { setupStartCommand } from "./commands/start";
import { MyContext } from "./types/context";
import { config } from "dotenv";
import { tripComposer } from "./commands/trip";
import { fuelComposer } from "./commands/fuel";

config();

export const bot = new Telegraf<MyContext>(process.env.TELEGRAM_BOT_TOKEN!);

bot.use(session({
  defaultSession: () => ({})
}));

bot.use((ctx, next) => {
  console.log("📦 Session:", ctx.session);
  return next();
});

setupStartCommand(bot);
bot.use(tripComposer);
bot.use(fuelComposer);
