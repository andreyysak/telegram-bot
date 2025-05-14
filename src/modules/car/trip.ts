import { Composer } from 'grammy';
import pool from '../../db/client.js';
import { BotContext } from '../../bot.js';
import { carMenuKeyboard } from '../../keyboard/carMenu.js';

export const tripModule = new Composer<BotContext>();

tripModule.hears('🛣️ Поїздка', async (ctx) => {
  await ctx.reply('Введіть кількість кілометрів:', {
    reply_markup: { remove_keyboard: true },
  });
  ctx.session.state = 'awaiting_kilometers';
});

tripModule.on(':text').filter(
  (ctx): boolean => ctx.session.state === 'awaiting_kilometers',
  async (ctx) => {
    const text = ctx.message?.text?.trim();
    const userId = ctx.from?.id;

    if (!userId) return ctx.reply('Помилка: не можу отримати ID користувача.');

    if (!text) throw new Error('Не отримано жодних даних.')

    const km = parseFloat(text.replace(',', '.'));

    if (isNaN(km)) {
      return ctx.reply('Будь ласка, введіть правильне число.');
    }

    try {
      const res = await pool.query(
        'SELECT id FROM users WHERE telegram_user_id = $1',
        [userId]
      );

      if (res.rows.length === 0) {
        return ctx.reply('Користувача не знайдено у системі.');
      }

      const dbUserId = res.rows[0].id;

      await pool.query(
        'INSERT INTO trips (user_id, kilometers) VALUES ($1, $2)',
        [dbUserId, km]
      );

      await ctx.reply(`✅ Кілометраж ${km} км успішно збережено.`, {
        reply_markup: carMenuKeyboard
      });
      ctx.session.state = null;
    } catch (e) {
      console.error('Помилка при збереженні поїздки:', e);
      await ctx.reply('⚠️ Сталася помилка при збереженні.');
    }
  }
);