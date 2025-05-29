import { Composer } from "grammy";
import { BotContext } from "../../bot.js";
import { EDIT_TEXT, todoKeyboard } from "../../keyboard/todoKeyboard.js";
import pool from "../../db/client.js";

export const editTodoModule = new Composer<BotContext>()

editTodoModule.hears(EDIT_TEXT, async (ctx) => {
  await ctx.reply('🔢 Введіть номер справи для редагування:');

  ctx.session.todo = {
    state: 'edit_todo_index',
  };
});

editTodoModule.on(':text').filter(
  (ctx): boolean => ctx.session.todo?.state === 'edit_todo_index',
  async (ctx) => {
    const text = ctx.message?.text.trim();
    const userId = ctx.from?.id;

    if (!text) throw new Error('❌ Не отримано жодних даних.')

    if (!userId) {
      return ctx.reply('❌ Не вдалося отримати ID користувача.');
    }

    const index = parseInt(text, 10);

    if (isNaN(index)) {
      return ctx.reply('❌ Будь ласка, введіть правильний номер.', {
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

      // Отримуємо список справ
      const todosRes = await pool.query(
        'SELECT id, text FROM todos WHERE user_id = $1 ORDER BY created_at DESC',
        [dbUserId]
      );

      if (todosRes.rows.length === 0) {
        return ctx.reply('📭 У тебе ще немає справ для редагування.', {
          reply_markup: todoKeyboard,
        });
      }

      const todoIndex = index - 1;

      if (todoIndex < 0 || todoIndex >= todosRes.rows.length) {
        return ctx.reply(`❌ Такого запису не існує. Введіть число від 1 до ${todosRes.rows.length}`, {
          reply_markup: todoKeyboard,
        });
      }

      // Зберігаємо ID справи в сесії
      const todoId = todosRes.rows[todoIndex].id;

      ctx.session.todo = {
        state: 'edit_todo_title',
        todoId,
      };

      await ctx.reply('✏️ Введіть новий текст для справи:', {
        reply_markup: { remove_keyboard: true },
      });

    } catch (e) {
      console.error('❌ Помилка при роботі з БД:', e);
      await ctx.reply('⚠️ Сталася помилка при підготовці до редагування.', {
        reply_markup: todoKeyboard,
      });
    }
  }
);

editTodoModule.on(':text').filter(
  (ctx): boolean => ctx.session.todo?.state === 'edit_todo_title',
  async (ctx) => {
    const newText = ctx.message?.text.trim();
    const userId = ctx.from?.id;

    if (!userId) {
      return ctx.reply('❌ Не вдалося отримати ваш Telegram ID.');
    }

    const todoId = ctx.session.todo?.todoId;

    if (!todoId) {
      return ctx.reply('❌ Не вдалося отримати ID справи для редагування.');
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

      // Оновлюємо текст справи
      await pool.query(
        'UPDATE todos SET text = $1 WHERE id = $2 AND user_id = $3',
        [newText, todoId, dbUserId]
      );

      await ctx.reply(`✅ Справу успішно оновлено на:\n"${newText}"`, {
        reply_markup: todoKeyboard,
      });

      ctx.session.todo = {
        state: null,
      };

    } catch (e) {
      console.error('❌ Помилка при редагуванні справи:', e);
      await ctx.reply('⚠️ Сталася помилка при оновленні тексту справи.');
    }
  }
);
