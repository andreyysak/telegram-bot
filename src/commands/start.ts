import { Telegraf } from "telegraf";

export function setupStartCommand(bot: Telegraf) {
  bot.start((ctx) => {
    ctx.reply(`👋 Привіт, ${ctx.from.first_name}!`);
  });
}
