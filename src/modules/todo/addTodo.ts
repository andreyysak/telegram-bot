import { Composer } from "grammy";
import { BotContext } from "../../bot.js";
import { ADD_TEXT, todoKeyboard } from "../../keyboard/todoKeyboard.js";
import { getDb } from "../../db/mongo_client.js";

export const addTodoModule = new Composer<BotContext>()

addTodoModule.hears(ADD_TEXT, async (ctx) => {
  await ctx.reply('💬 Enter todo title:', {
    reply_markup: todoKeyboard
  })

  ctx.session.todo = {
    state: 'add_todo'
  }
})

addTodoModule.on(':text').filter(
  (ctx): boolean => ctx.session.todo?.state === 'add_todo',
  async (ctx) => {
    const text = ctx.message?.text
    const userId = ctx.from?.id

    if (!text) throw new Error('❌ Не отримано жодних даних.')

    try {
      const colection = getDb()

      // await colection.insertOne({
      //   telegram.user.id: userId
      // })
    } catch (e) {
      console.error('Помилка при додаванні To-Do:', e);
      await ctx.reply('⚠️ Сталася помилка при додаванні справи.');
    }
  }
)