import { Composer } from 'grammy';
import pool from '../../db/client.js';
import { BotContext } from '../../bot.js';
import { carMenuKeyboard } from '../../keyboard/carMenu.js';

export const maintenanceHistoryModule = new Composer<BotContext>();

maintenanceHistoryModule.callbackQuery('history_maintenance', async (ctx) => {
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

    // Отримуємо історію ТО
    const maintenanceRes = await pool.query(
      'SELECT work_type, kilometers, cost, created_at FROM maintenance WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10',
      [dbUserId]
    );

    if (maintenanceRes.rows.length === 0) {
      return ctx.reply('📭 У тебе ще немає записів про технічне обслуговування.', {
        reply_markup: carMenuKeyboard,
      });
    }

    const historyText = maintenanceRes.rows.map((row, index) => {
      const date = new Date(row.created_at);
      const time = date.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }); // 17:52
      const fullDate = date.toLocaleDateString('uk-UA'); // 14.05.2025

      return `
📝 Запис ${index + 1}:
📌 Заміна: 
- ${row.work_type}

🔢 Кілометраж: ${row.kilometers} км
💰 Сума: ${row.cost} грн
📅 Дата: ${fullDate}
`;
    }).join('\n\n');

    await ctx.reply(`📄 Історія технічного обслуговування:\n\n${historyText}`, {
      reply_markup: carMenuKeyboard,
    });

    await ctx.answerCallbackQuery()

  } catch (e) {
    console.error('Помилка при отриманні історії:', e);
    await ctx.reply('⚠️ Сталася помилка при завантаженні історії.');
    await ctx.answerCallbackQuery();
  }
});