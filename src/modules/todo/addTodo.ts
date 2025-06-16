import { Composer } from "grammy";
import { BotContext } from "../../bot.js";
import { ADD_TEXT, todoKeyboard } from "../../keyboard/todoKeyboard.js";
import { BACK_TO_MAIN_TEXT } from "../../keyboard/backToMenu.js";
import { mainMenuKeyboard } from "../../keyboard/mainMenu.js";
import pool from "../../db/client.js";

export const addTodoModule = new Composer<BotContext>()

addTodoModule.hears(ADD_TEXT, async (ctx) => {
  await ctx.reply('💬 Введи назву:', {
    reply_markup: todoKeyboard
  })

  ctx.session.todo = {
    state: 'add_todo'
  }
})

addTodoModule.hears(BACK_TO_MAIN_TEXT, async (ctx) => {
  await ctx.reply('⬅️ Назад до головного меню', {
    reply_markup: mainMenuKeyboard
  })
  
  ctx.session.todo = {
    state: null
  }
})

addTodoModule.on(':text').filter(
  (ctx): boolean => ctx.session.todo?.state === 'add_todo',
  async (ctx) => {
    const title = ctx.message?.text
    const userId = ctx.from?.id

    if (!title) throw new Error('❌ Не отримано жодних даних.')
      
    ctx.session.todo = {
      ...ctx.session.todo,
      title: title,
      state: 'add_todo'
    }

    try {
      // Отримуємо user_id із таблиці users
      const userRes = await pool.query(
        'SELECT id FROM users WHERE telegram_user_id = $1',
        [userId]
      );

      if (userRes.rows.length === 0) {
        return ctx.reply('❌ Користувача не знайдено у системі.');
      }

      const dbUserId = userRes.rows[0].id;

      // Зберігаємо справу в БД
      await pool.query(
        'INSERT INTO todos (user_id, text, done, created_at) VALUES ($1, $2, $3, NOW())',
        [dbUserId, title, false]
      );

      await ctx.reply(`✅ Справу "${title}" успішно додано.`, {
        reply_markup: todoKeyboard,
      });

      ctx.session.todo = {
        state: null,
      };

    } catch (e) {
      console.error('❌ Помилка при додаванні To-Do:', e);
      await ctx.reply('⚠️ Сталася помилка при додаванні справи.', {
        reply_markup: todoKeyboard,
      });
  }
}
)