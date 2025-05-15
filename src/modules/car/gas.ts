import { Composer } from "grammy";
import { BotContext } from "../../bot.js";

export const gasModule = new Composer<BotContext>()

gasModule.hears('PathComponent', async (ctx) => {
  await ctx.reply('Введи кількість літрів:', {
    reply_markup: {remove_keyboard: true}
  })

  ctx.session.gas = {
    state: 'awaiting_liters'
  }
})