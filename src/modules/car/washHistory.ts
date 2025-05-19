import { Composer } from 'grammy';
import pool from '../../db/client.js';
import { BotContext } from '../../bot.js';
import { carMenuKeyboard } from '../../keyboard/carMenu.js';

export const washHistoryModule = new Composer<BotContext>();

washHistoryModule.callbackQuery('history_wash', async (ctx) => {
  const telegramUserId = ctx.from?.id;

  if (!telegramUserId) {
    return ctx.reply('❌ Не вдалося отримати ваш Telegram ID.', {
      reply_markup: carMenuKeyboard,
    });
  }

  try {
    // Отримуємо ID користувача з таблиці users
    const userRes = await pool.query(
      'SELECT id FROM users WHERE telegram_user_id = $1',
      [telegramUserId]
    );

    if (userRes.rows.length === 0) {
      return ctx.reply('❌ Користувача не знайдено у системі.');
    }

    const dbUserId = userRes.rows[0].id;

    // Отримуємо останні записи про мийки
    const res = await pool.query(
      'SELECT price, created_at FROM car_washes WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10',
      [dbUserId]
    );

    if (res.rows.length === 0) {
      return ctx.reply('📭 У тебе ще немає записів про мийки.', {
        reply_markup: carMenuKeyboard,
      });
    }

    // Форматуємо кожен запис
    const historyText = res.rows.map((row, index) => {
      const date = new Date(row.created_at);
      const fullDate = date.toLocaleDateString('uk-UA'); // 14.05.2025
      const time = date.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }); // 17:52

      return `${index + 1}. 💰 ${row.price} грн | ${time} | ${fullDate}`;
    }).join('\n');

    // Повідомлення з історією
    await ctx.reply(`🚿 Історія мийки авто:\n\n${historyText}`, {
      reply_markup: carMenuKeyboard,
    });

    await ctx.answerCallbackQuery(); // Прибираємо "годинник завантаження"

  } catch (e) {
    console.error('Помилка при завантаженні історії:', e);
    await ctx.reply('⚠️ Сталася помилка при отриманні історії мийок.');

    await ctx.answerCallbackQuery();
  }
});