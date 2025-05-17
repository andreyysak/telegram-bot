import { Composer } from "grammy";
import { BotContext } from "../../bot.js";
import { CAR_MENU, carMenuKeyboard } from "../../keyboard/carMenu.js";
import pool from "../../db/client.js";

export const maintenanceModule = new Composer<BotContext>()

maintenanceModule.hears(CAR_MENU.SERVICE, async (ctx) => {
  await ctx.reply('🔧 Введіть опис роботи (наприклад: "Заміна масляного фільтра"):', {
    reply_markup: { remove_keyboard: true },
  });

  ctx.session.maintenance = {
    state: 'awaiting_work_type',
  };
})

// === 1. Отримання опису роботи ===
maintenanceModule.on(':text').filter(
  (ctx): boolean => ctx.session.maintenance?.state === 'awaiting_work_type',
  async (ctx) => {
    const text = ctx.message?.text.trim();

    if (!text) {
      return ctx.reply('❌ Будь ласка, введіть опис роботи.');
    }

    ctx.session.maintenance = {
      ...ctx.session.maintenance,
      workType: text,
      state: 'awaiting_kilometers',
    };

    await ctx.reply('🛞 Введіть кілометраж на момент ТО:');
  }
);

// === 2. Отримання кілометрів ===
maintenanceModule.on(':text').filter(
  (ctx): boolean => ctx.session.maintenance?.state === 'awaiting_kilometers',
  async (ctx) => {
    const text = ctx.message?.text.trim();
    const workType = ctx.session.maintenance?.workType;

    if (!text) {
      return ctx.reply('❌ Введи правильні дані.');
    }

    if (!workType) {
      return ctx.reply('⚠️ Спочатку введіть опис роботи.');
    }

    const km = parseFloat(text.replace(',', '.'));

    if (isNaN(km)) {
      return ctx.reply('❌ Будь ласка, введіть правильне число.');
    }

    ctx.session.maintenance = {
      ...ctx.session.maintenance,
      km,
      state: 'awaiting_cost',
    };

    await ctx.reply('💰 Введіть суму, за яку було виконано ТО:');
  }
);

// === 3. Отримання суми ===
maintenanceModule.on(':text').filter(
  (ctx): boolean => ctx.session.maintenance?.state === 'awaiting_cost',
  async (ctx) => {
    const text = ctx.message?.text.trim();
    const userId = ctx.from?.id;
    const workType = ctx.session.maintenance?.workType;
    const km = ctx.session.maintenance?.km;

    if (!text) {
      return ctx.reply('❌ Введи правильні дані.');
    }

    if (!workType || !km) {
      return ctx.reply('⚠️ Помилка: не вдалося отримати попередні дані.');
    }

    const cost = parseFloat(text.replace(',', '.'));

    if (isNaN(cost)) {
      return ctx.reply('❌ Будь ласка, введіть правильну суму.');
    }

    try {
      // Отримуємо ID користувача з БД
      const userRes = await pool.query(
        'SELECT id FROM users WHERE telegram_user_id = $1',
        [userId]
      );

      if (userRes.rows.length === 0) {
        return ctx.reply('❌ Користувача не знайдено у системі.');
      }

      const dbUserId = userRes.rows[0].id;

      // Зберігаємо в БД
      await pool.query(
        'INSERT INTO maintenance (user_id, work_type, kilometers, cost) VALUES ($1, $2, $3, $4)',
        [dbUserId, workType, km, cost]
      );

      await ctx.reply(`✅ Роботу "${workType}" на суму ${cost} грн\nна кілометражі ${km} км успішно збережено.`, {
        reply_markup: carMenuKeyboard,
      });

      ctx.session.maintenance = undefined; // очищуємо стан

    } catch (e) {
      console.error('Помилка при збереженні ТО:', e);
      await ctx.reply('⚠️ Сталася помилка при збереженні даних.');
    }
  }
);