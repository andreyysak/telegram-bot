import { Composer } from 'grammy';
import pool from '../../db/client.js';
import { BotContext } from '../../bot.js';
import { carMenuKeyboard } from '../../keyboard/carMenu.js';

export const tripHistoryModule = new Composer<BotContext>();

// === Callback Query для inline-клавіатури ===
tripHistoryModule.callbackQuery('history_trip', async (ctx) => {
  const telegramUserId = ctx.from?.id;

  if (!telegramUserId) {
    return ctx.reply('❌ Не вдалося отримати ID користувача.', {
      reply_markup: carMenuKeyboard,
    });
  }

  try {
    // Знаходимо user_id з таблиці users
    const userRes = await pool.query(
      'SELECT id FROM users WHERE telegram_user_id = $1',
      [telegramUserId]
    );

    if (userRes.rows.length === 0) {
      return ctx.reply('❌ Користувача не знайдено у системі.');
    }

    const dbUserId = userRes.rows[0].id;

    // Отримуємо останні 10 поїздок
    const tripsRes = await pool.query(
      'SELECT kilometers, direction, created_at FROM trips WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10',
      [dbUserId]
    );

    if (tripsRes.rows.length === 0) {
      return ctx.reply('📭 У тебе ще немає записів про поїздки.', {
        reply_markup: carMenuKeyboard,
      });
    }

    const historyText = tripsRes.rows
      .map((row, index, array) => {
        const currentKm = row.kilometers;
        const prevKm = index < array.length - 1 ? array[index + 1].kilometers : null;
        const distance = prevKm !== null ? (currentKm - prevKm) : 0;

        const date = new Date(row.created_at);
        const time = date.toLocaleTimeString('uk-UA', {
          hour: '2-digit',
          minute: '2-digit',
        });
        const fullDate = date.toLocaleDateString('uk-UA');
        const direction = row.direction || 'Невідомий напрямок';

        return `${index + 1}. ${direction} | ${distance} км | ${time} | ${fullDate}`;
      })
      .join('\n');

    await ctx.reply(`📄 Історія поїздок:\n\n${historyText}`, {
      reply_markup: carMenuKeyboard,
    });

    await ctx.answerCallbackQuery(); // Прибираємо годинник "завантаження" після натискання

  } catch (e) {
    console.error('Помилка при отриманні історії:', e);
    await ctx.reply('⚠️ Сталася помилка при завантаженні історії.');
    await ctx.answerCallbackQuery();
  }
});