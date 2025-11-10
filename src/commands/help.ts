import { Telegraf } from "telegraf";

export function setupHelpCommand(bot: Telegraf) {
  bot.help((ctx) => {
    ctx.reply("🧾 Список команд:\n/start — почати\n/help — допомога");
  });
}
