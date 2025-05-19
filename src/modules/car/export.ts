// src/modules/car/exportModule.ts
import { Composer } from "grammy";
import { BotContext } from "../../bot.js";
import pool from "../../db/client.js";
import { CAR_MENU, carMenuKeyboard } from "../../keyboard/carMenu.js";
import { exportToCsv } from "../../services/exportToCsv.js";
import fs from 'fs';
import { promisify } from 'util';
import { InputFile } from 'grammy';
import { exportCarKeyboard } from "../../keyboard/exportCarKeyboard.js";

const unlinkAsync = promisify(fs.unlink);

export const exportModule = new Composer<BotContext>();

exportModule.hears(CAR_MENU.DOWNLOAD, async (ctx) => {
  await ctx.reply('Обери, що ти хочеш експортувати: ', {
    reply_markup: exportCarKeyboard
  })
})

exportModule.callbackQuery(/^export_(trip|gas|wash|maintenance)$/, async (ctx) => {
  const [, type] = ctx.match;

  const telegramUserId = ctx.from?.id;

  if (!telegramUserId) {
    return ctx.reply('❌ Не вдалося отримати ID користувача.');
  }

  try {
    // Отримуємо ID користувача з БД
    const userRes = await pool.query(
      'SELECT id FROM users WHERE telegram_user_id = $1',
      [telegramUserId]
    );

    if (userRes.rows.length === 0) {
      return ctx.reply('❌ Користувача не знайдено у системі.');
    }

    const dbUserId = userRes.rows[0].id;
    let data;

    switch (type) {
      case 'trip':
        data = await pool.query('SELECT kilometers, direction, created_at FROM trips WHERE user_id = $1 ORDER BY created_at DESC', [dbUserId]);
        break;

      case 'gas':
        data = await pool.query('SELECT liters, total_price AS price, station, created_at FROM gas_refuels WHERE user_id = $1 ORDER BY created_at DESC', [dbUserId]);
        break;

      case 'wash':
        data = await pool.query('SELECT price, created_at FROM car_washes WHERE user_id = $1 ORDER BY created_at DESC', [dbUserId]);
        break;

      case 'maintenance':
        data = await pool.query('SELECT description, cost, created_at FROM maintenances WHERE user_id = $1 ORDER BY created_at DESC', [dbUserId]);
        break;

      default:
        return ctx.reply('❌ Непідтримуваний тип даних для експорту');
    }

    if (data.rows.length === 0) {
      return ctx.reply(`📭 У вас ще немає записів для експорту ${type}`, {
        reply_markup: carMenuKeyboard,
      });
    }

    // Експортуємо в CSV
    const filePath = await exportToCsv(type, data.rows);

    // Відправляємо файл через InputFile
    await ctx.replyWithDocument(
      new InputFile(fs.createReadStream(filePath), `${type}_export.csv`), // ✅ Так працює!
      {
        caption: `📄 Файл експорту для "${type}"`,
      }
    );

    // Видаляємо файл після відправки
    await unlinkAsync(filePath);

    await ctx.answerCallbackQuery();

  } catch (e) {
    console.error(`Помилка при експорті ${type}:`, e);
    await ctx.reply('⚠️ Сталася помилка при експорті даних.');
    await ctx.answerCallbackQuery();
  }
});