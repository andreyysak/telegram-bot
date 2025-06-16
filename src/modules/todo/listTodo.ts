import { Composer } from "grammy";
import { BotContext } from "../../bot.js";
import { LIST_TEXT, todoKeyboard } from "../../keyboard/todoKeyboard.js";
import pool from "../../db/client.js";

export const listTodoModule = new Composer<BotContext>()

listTodoModule.hears(LIST_TEXT, async (ctx) => {
  const userId = ctx.from?.id

  if (!userId) {
    return ctx.reply('❌ Не вдалося отримати ID користувача.');
  }

   try {
    // Отримуємо user_id з таблиці users
    const userRes = await pool.query(
      'SELECT id FROM users WHERE telegram_user_id = $1',
      [userId]
    );

    if (userRes.rows.length === 0) {
      return ctx.reply('❌ Користувача не знайдено у системі.');
    }

    const dbUserId = userRes.rows[0].id;

    // Отримуємо всі справи користувача
    const todosRes = await pool.query(
      'SELECT id, text, done, created_at FROM todos WHERE user_id = $1 ORDER BY created_at DESC',
      [dbUserId]
    );

    if (todosRes.rows.length === 0) {
      return ctx.reply('📭 У тебе ще немає справ.', {
        reply_markup: todoKeyboard,
      });
    }

    // Форматуємо список
    const listText = todosRes.rows.map((row, index) => {
      const statusEmoji = row.done ? '🟢' : '🔴';
      return `${statusEmoji} *${index + 1}. ${row.text}*`;
    }).join('\n');

    await ctx.reply(`📋 Твій список справ:\n\n${listText}`, {
      parse_mode: 'Markdown',
      reply_markup: todoKeyboard,
    });

  } catch (e) {
    console.error('❌ Помилка при завантаженні списку:', e);
    await ctx.reply('⚠️ Сталася помилка при завантаженні списку.', {
      reply_markup: todoKeyboard,
    });
  }
})