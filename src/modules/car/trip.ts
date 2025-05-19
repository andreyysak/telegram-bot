import { Composer } from 'grammy';
import pool from '../../db/client.js';
import { CAR_MENU, carMenuKeyboard } from '../../keyboard/carMenu.js';
import { BotContext } from '../../bot.js';

export const tripModule = new Composer<BotContext>();

tripModule.hears(CAR_MENU.TRIP, async (ctx) => {
  await ctx.reply('Введи кілометраж:', {
    reply_markup: carMenuKeyboard,
  });

  // ✅ Додаємо або скидаємо попередню сесію trip
  ctx.session.trip = {
    state: 'awaiting_kilometers',
  };
});

tripModule.on(':text').filter(
  (ctx): boolean => ctx.session.trip?.state === 'awaiting_kilometers',
  async (ctx) => {
    const text = ctx.message?.text.trim();

    if (!text) throw new Error('❌ Не отримано жодних даних.')

    const km = parseFloat(text.replace(',', '.'));

    if (isNaN(km)) {
      return ctx.reply('❌ Будь ласка, введи правильне число.', {
        reply_markup: carMenuKeyboard,
      });
    }

    // ✅ Зберігаємо кілометри в загальному типі SessionData
    ctx.session.trip = {
      ...ctx.session.trip,
      km,
      state: 'awaiting_direction',
    };

    await ctx.reply('Вееди напрямок поїздки:', {
      reply_markup: carMenuKeyboard,
    });
  }
);

tripModule.on(':text').filter(
  (ctx): boolean => ctx.session.trip?.state === 'awaiting_direction',
  async (ctx) => {
    const text = ctx.message?.text.trim();

    const userId = ctx.from?.id;

    try {
      const userRes = await pool.query(
        'SELECT id FROM users WHERE telegram_user_id = $1',
        [userId]
      );
      if (userRes.rows.length === 0) {
        return ctx.reply('Користувача не знайдено у системі.');
      }

      const dbUserId = userRes.rows[0].id;
      const km = ctx.session.trip?.km;
      const direction = text;

      if (!km) {
        return ctx.reply('❌ Не вдалося отримати кілометри', {
          reply_markup: carMenuKeyboard,
        });
      }

      // ✅ Зберігаємо до БД
      await pool.query(
        'INSERT INTO trips (user_id, kilometers, direction) VALUES ($1, $2, $3)',
        [dbUserId, km, direction]
      );

      await ctx.reply(`✅ Поїздка: ${km} км\n🧭 Напрямок: ${direction}`, {
        reply_markup: carMenuKeyboard,
      });

      // ✅ Чистимо стан
      ctx.session.trip = undefined;

    } catch (e) {
      console.error('Помилка при збереженні поїздки:', e);
      await ctx.reply('⚠️ Сталася помилка при збереженні.', {
        reply_markup: carMenuKeyboard,
      });
    }
  }
);