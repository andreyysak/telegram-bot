import { Composer } from 'grammy';
import pool from '../../db/client.js';
import { BotContext } from '../../bot.js';
import { CAR_MENU, carMenuKeyboard } from '../../keyboard/carMenu.js';

export const washModule = new Composer<BotContext>();

// === Кнопка "🧼 Мийка" ===
washModule.hears(CAR_MENU.WASH, async (ctx) => {
  ctx.session.wash = {
    state: 'awaiting_price',
  };

  await ctx.reply('💲 Введіть суму за мийку:', {
    reply_markup: { remove_keyboard: true },
  });
});

// === Обробка тексту (сума мийки) ===
washModule.on(':text').filter(
  (ctx): boolean => ctx.session.wash?.state === 'awaiting_price',
  async (ctx) => {
    const text = ctx.message?.text.trim();
    const userId = ctx.from?.id;

    if (!text) {
      return ctx.reply('❌ Будь ласка, введіть суму.');
    }

    const price = parseFloat(text.replace(',', '.'));

    if (isNaN(price)) {
      return ctx.reply('❌ Сума має бути числом.');
    }

    try {
      // Отримуємо ID користувача з таблиці users
      const userRes = await pool.query(
        'SELECT id FROM users WHERE telegram_user_id = $1',
        [userId]
      );

      if (userRes.rows.length === 0) {
        return ctx.reply('❌ Користувача не знайдено у системі.', {
          reply_markup: carMenuKeyboard,
        });
      }

      const dbUserId = userRes.rows[0].id;

      await pool.query(
        'INSERT INTO expense_tracker (user_id, type, category, amount) VALUES ($1, $2, $3, $4)',
        [dbUserId, 'expense', 'avto', price]
      );

      // Зберігаємо мийку
      await pool.query(
        'INSERT INTO car_washes (user_id, price) VALUES ($1, $2)',
        [dbUserId, price]
      );

      // Повідомлення про успішне збереження
      const now = new Date().toLocaleDateString('uk-UA');
      await ctx.reply(`✅ Дані збережено:\n\n💰 Сума: ${price} грн\n📅 Дата: ${now}`, {
        reply_markup: carMenuKeyboard,
      });

      // Чистимо стан
      ctx.session.wash?.state === null

    } catch (e) {
      console.error('Помилка при збереженні мийки:', e);
      await ctx.reply('⚠️ Сталася помилка при збереженні.');
    }
  }
);
