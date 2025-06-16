import { Composer } from "grammy";
import { BotContext } from "../../bot.js";
import { CAR_MENU, carMenuKeyboard } from "../../keyboard/carMenu.js";

export const statisticModule = new Composer<BotContext>()

statisticModule.hears(CAR_MENU.STATISTIC, async (ctx) => {
  await ctx.reply('Поки що не готово...', {
    reply_markup: carMenuKeyboard
  })
})