import { Composer } from "grammy";
import { BotContext } from "../../bot.js";
import { gasStationsKeyboard } from "../../keyboard/gasStations.js";
import { CAR_MENU, carMenuKeyboard } from "../../keyboard/carMenu.js";
import pool from "../../db/client.js";

export const gasModule = new Composer<BotContext>()

gasModule.hears(CAR_MENU.FUEL, async (ctx) => {
  await ctx.reply('Введи кількість літрів:', {
    reply_markup: { remove_keyboard: true }
  })

  ctx.session.gas = {
    state: 'awaiting_liters'
  }
})

gasModule.on(':text').filter(
  (ctx): boolean => ctx.session.gas?.state === 'awaiting_liters',
  async (ctx) => {
    const text = ctx.message?.text.trim()

    if (!text) throw new Error('❌ Не отримано жодних даних.')

    const liters = parseFloat(text.replace(',', '.'))

    if (isNaN(liters)) {
      return ctx.reply('❌ Будь ласка, введи правильне число.')
    }

    ctx.session.gas = {
      ...ctx.session.gas,
      liters,
      state: 'awaiting_total_price'
    }

    await ctx.reply('💸 Введи витрачену суму:')
  }
)

gasModule.on(':text').filter(
  (ctx): boolean => ctx.session.gas?.state === 'awaiting_total_price',
  async (ctx) => {
    const text = ctx.message?.text.trim()

    if (!text) throw new Error('❌ Не отримано жодних даних.')

    const totalPrice = parseFloat(text.replace(',', '.'))

    if (isNaN(totalPrice)) {
      return ctx.reply('❌ Будь ласка, введи правильне число.')
    }

    ctx.session.gas = {
      ...ctx.session.gas,
      totalPrice,
      state: 'awaiting_gas_stattion'
    }

    await ctx.reply('🏪 Обери АЗС:', {
      reply_markup: gasStationsKeyboard
    })
  }
)

gasModule.callbackQuery(/gas_/, async (ctx) => {
  const station = ctx.callbackQuery.data.replace('gas_', '');

  const userId = ctx.from.id;
  const gasData = ctx.session.gas;

  if (!gasData || !gasData.liters || !gasData.totalPrice) {
    return ctx.reply('⚠️ Не вистачає даних для збереження');
  }

  try {
    // Отримуємо ID користувача з БД
    const userRes = await pool.query(
      'SELECT id FROM users WHERE telegram_user_id = $1',
      [userId]
    );

    if (userRes.rows.length === 0) {
      return ctx.reply('Користувача не знайдено.');
    }

    const dbUserId = userRes.rows[0].id;
    const { liters, totalPrice } = gasData;

    await pool.query(
      'INSERT INTO gas_refuels (user_id, liters, total_price, station) VALUES ($1, $2, $3, $4)',
      [dbUserId, liters, totalPrice, station]
    );

    await ctx.reply(`✅ Заправлено ${liters} л на ${totalPrice} грн\nАЗС: ${station}`, {
      reply_markup: carMenuKeyboard,
    });

    ctx.session.gas = undefined;

  } catch (e) {
    console.error('Помилка при збереженні заправки:', e);
    await ctx.reply('⚠️ Сталася помилка при збереженні.');
  }
});