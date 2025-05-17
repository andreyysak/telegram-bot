// src/modules/car/gasHistoryModule.ts
import { Composer } from 'grammy';
import pool from '../../db/client.js';
import { BotContext } from '../../bot.js';
import { carMenuKeyboard } from '../../keyboard/carMenu.js';

export const gasHistoryModule = new Composer<BotContext>();

gasHistoryModule.callbackQuery('history_gas', async (ctx) => {
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

    // Отримуємо останні 10 заправок
    const gasRes = await pool.query(
      'SELECT liters, total_price, station, created_at FROM gas_refuels WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10',
      [dbUserId]
    );

    if (gasRes.rows.length === 0) {
      return ctx.reply('📭 У тебе ще немає записів про заправку автомобіля.', {
        reply_markup: carMenuKeyboard,
      });
    }

    // Форматуємо текст історії
    const historyText = gasRes.rows.map((row, index) => {
      const date = new Date(row.created_at);
      const time = date.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }); // 17:52
      const fullDate = date.toLocaleDateString('uk-UA'); // 14.05.2025

      return `${index + 1}. ${row.station} | ${row.liters} л | ${row.total_price} грн | ${time} | ${fullDate}`;
    }).join('\n');

    await ctx.reply(`📄 Історія заправок:\n\n${historyText}`, {
      reply_markup: carMenuKeyboard,
    });

    await ctx.answerCallbackQuery(); // Прибираємо годинник "завантаження" після натискання

  } catch (e) {
    console.error('Помилка при отриманні історії заправок:', e);
    await ctx.reply('⚠️ Сталася помилка при завантаженні історії.');
    await ctx.answerCallbackQuery();
  }
});