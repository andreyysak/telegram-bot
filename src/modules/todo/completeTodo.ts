import { Composer } from "grammy";
import { BotContext } from "../../bot.js";
import { COMPLETE_TEXT, todoKeyboard } from "../../keyboard/todoKeyboard.js";
import { BACK_TO_MAIN_TEXT } from "../../keyboard/backToMenu.js";
import { mainMenuKeyboard } from "../../keyboard/mainMenu.js";
import pool from "../../db/client.js";

export const completeTodoModule = new Composer<BotContext>()

completeTodoModule.hears(COMPLETE_TEXT, async (ctx) => {
  await ctx.reply('🆔 Введи ID справи:', {
    reply_markup: todoKeyboard
  })

  ctx.session.todo = {
    state: 'complete_todo'
  }
})

completeTodoModule.hears(BACK_TO_MAIN_TEXT, async (ctx) => {
  await ctx.reply('⬅️ Назад до головного меню', {
    reply_markup: mainMenuKeyboard
  })

  ctx.session.todo = {
    state: null
  }
})

completeTodoModule.on(':text').filter(
  (ctx): boolean => ctx.session.todo?.state === 'complete_todo',
  async (ctx) => {
    const text = ctx.message?.text.trim();
    const userId = ctx.from?.id;

    if (!text) throw new Error('❌ Не отримано жодних даних.')

    if (!userId) {
      return ctx.reply('❌ Не вдалося отримати ваш Telegram ID.');
    }

    const index = parseInt(text, 10);

    if (isNaN(index)) {
      return ctx.reply('❌ Будь ласка, введіть правильний номер справи.', {
        reply_markup: todoKeyboard,
      });
    }

    try {
      // Отримуємо user_id з БД
      const userRes = await pool.query(
        'SELECT id FROM users WHERE telegram_user_id = $1',
        [userId]
      );

      if (userRes.rows.length === 0) {
        return ctx.reply('❌ Користувача не знайдено у системі.');
      }

      const dbUserId = userRes.rows[0].id;

      // Отримуємо список справ (відсортований як у тебе в чаті)
      const todosRes = await pool.query(
        'SELECT id, text FROM todos WHERE user_id = $1 ORDER BY created_at DESC',
        [dbUserId]
      );

      if (todosRes.rows.length === 0) {
        return ctx.reply('📭 У тебе ще немає записів у списку To-Do.', {
          reply_markup: todoKeyboard,
        });
      }

      // Перевіряємо, чи існує такий індекс
      const todoIndex = index - 1;

      if (todoIndex < 0 || todoIndex >= todosRes.rows.length) {
        return ctx.reply(`❌ Справи з таким номером немає. Введіть число від 1 до ${todosRes.rows.length}`, {
          reply_markup: todoKeyboard,
        });
      }

      const todoId = todosRes.rows[todoIndex].id;
      const todoText = todosRes.rows[todoIndex].text;

      // Оновлюємо статус у БД
      await pool.query(
        'UPDATE todos SET done = TRUE WHERE id = $1 AND user_id = $2',
        [todoId, dbUserId]
      );

      await ctx.reply(`✅ Справу "${todoText}" відзначено виконаною.`, {
        reply_markup: todoKeyboard,
      });

      ctx.session.todo = {
        state: null,
      };

    } catch (e) {
      console.error('❌ Помилка при відзначенні виконаної справи:', e);
      await ctx.reply('⚠️ Сталася помилка при оновленні статусу.');
    }
  }
);