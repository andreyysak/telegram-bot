import { Composer } from "grammy";
import { BotContext } from "../../bot.js";
import { CAR_MENU } from "../../keyboard/carMenu.js";
import { carStatisticMenu } from "../../keyboard/carStatisticMenu.js";

export const statisticModule = new Composer<BotContext>()

statisticModule.hears(CAR_MENU.STATISTIC, async (ctx) => {
  await ctx.reply('Ти обрав статистику', {
    reply_markup: carStatisticMenu
  })
})

statisticModule.callbackQuery('history_trip', )