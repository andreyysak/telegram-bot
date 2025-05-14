import { Composer } from 'grammy';
import pool from '../../db/client.js';
import { BotContext } from '../../bot.js';
import { carMenuKeyboard } from '../../keyboard/carMenu.js';

export const tripHistoryModule = new Composer<BotContext>();

tripHistoryModule.hears('📜 Історія поїздок', async (ctx) => {
  const telegramUserId = ctx.from?.id;

  if (!telegramUserId) {
    return ctx.reply('❌ Не вдалося отримати ID користувача');
  }

  try {
    // Знаходимо `user_id` з таблиці `users` за `telegram_user_id`
    const userRes = await pool.query(
      'SELECT id FROM users WHERE telegram_user_id = $1',
      [telegramUserId]
    );

    if (userRes.rows.length === 0) {
      return ctx.reply('❌ Користувача не знайдено у системі.');
    }

    const dbUserId = userRes.rows[0].id;

    // Шукаємо всі поїздки користувача
    const tripsRes = await pool.query(
      'SELECT kilometers, direction, created_at FROM trips WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10',
      [dbUserId]
    );

    if (tripsRes.rows.length === 0) {
      return ctx.reply('📭 У вас ще немає записів про поїздки.', {
        reply_markup: { remove_keyboard: true },
      });
    }

    // Форматуємо історію
    const historyText = tripsRes.rows.map((row, index) => {
      const date = new Date(row.created_at);
      const time = date.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }); // 17:52
      const fullDate = date.toLocaleDateString('uk-UA'); // 14.05.2025

      const direction = row.direction || 'Напрямок невідомий';

      return `${index + 1}. ${direction} | ${row.kilometers} км | ${time} | ${fullDate}`;
    }).join('\n');

    await ctx.reply(`📄 Останні поїздки:\n\n${historyText}`, {
      reply_markup: carMenuKeyboard,
    });

  } catch (e) {
    console.error('Помилка при отриманні історії:', e);
    await ctx.reply('⚠️ Сталася помилка при отриманні історії.');
  }
});