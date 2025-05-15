import { Bot, Context, GrammyError, HttpError, session, SessionFlavor } from 'grammy';
import dotenv from 'dotenv';
import pool from './db/client.js';

import { tripModule } from './modules/car/trip.js';
import { tripHistoryModule } from './modules/car/tripHistory.js';
import { weatherModule } from './modules/weather/weather.js';
import { gasModule } from './modules/car/gas.js';
import { ipInfoModule } from './modules/network/ipinfo.js';

import { contactKeyboard } from './keyboard/shareContact.js';
import { CAR_MENU_TEXT, mainMenuKeyboard, NETWORK_MENU_TEXT } from './keyboard/mainMenu.js';
import { carMenuKeyboard } from './keyboard/carMenu.js';
import { BACK_TO_MAIN_TEXT } from './keyboard/backToMenu.js';
import { SessionData } from './types/SessionData.js';
import { networkMenuKeyboard } from './keyboard/networkMenu.js';

dotenv.config();

export type BotContext = Context & SessionFlavor<SessionData>;

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) throw new Error('Telegram bot token was not found');

const bot = new Bot<BotContext>(token);

// Сесія
bot.use(
  session({
    initial: (): SessionData => ({
      registered: false,
    }),
  })
);

// Імпорт модулів
bot.use(tripModule)
bot.use(tripHistoryModule)
bot.use(weatherModule)
bot.use(gasModule)
bot.use(ipInfoModule)

// Команда start
bot.command('start', async (ctx) => {
  await ctx.reply('Привіт! Щоб почати роботу, поділись своїм контактом:', {
    reply_markup: contactKeyboard,
  });
});

// Обробка отриманого контакту
bot.on(':contact', async (ctx) => {
  const contact = ctx.message?.contact;
  const username = ctx.from?.username;

  if (!contact) {
    return ctx.reply('Не вдалося отримати контакт.', {
      reply_markup: { remove_keyboard: true },
    });
  }

  const { phone_number, first_name, last_name, user_id } = contact;

  try {
    // Записуємо користувача у БД
    const res = await pool.query(
      `
      INSERT INTO users 
        (telegram_user_id, username, first_name, last_name, phone_number) 
      VALUES 
        ($1, $2, $3, $4, $5) 
      ON CONFLICT (telegram_user_id) DO NOTHING
      RETURNING *`,
      [user_id, username, first_name, last_name || null, phone_number]
    );

    if (res.rows.length > 0) {
      const user = res.rows[0];
      console.log('Користувач збережений:', user);
      await ctx.reply('✅ Реєстрація успішна!', {
        reply_markup: mainMenuKeyboard
      });
    } else {
      await ctx.reply(`👋 Привіт, ${first_name}!`, {
        reply_markup: mainMenuKeyboard,
      });
    }

    // Позначаємо користувача як зареєстрованого
    ctx.session.registered = true;

  } catch (error) {
    console.error('Помилка при роботі з БД:', error);
    await ctx.reply('⚠️ Сталася помилка. Спробуйте ще раз.', {
      reply_markup: { remove_keyboard: true },
    });
  }
});

// Головне меню
bot.hears(BACK_TO_MAIN_TEXT, async (ctx) => {
  await ctx.reply('⬅️ Повертаємось назад', {
    reply_markup: mainMenuKeyboard,
  });
});

bot.hears(CAR_MENU_TEXT, async (ctx) => {
  await ctx.reply('🚗 Ти обрав авто', {
    reply_markup: carMenuKeyboard,
  });
});

bot.hears(NETWORK_MENU_TEXT, async (ctx) => {
  await ctx.reply('🌐 Ти обрав мережу', {
    reply_markup: networkMenuKeyboard
  })
})

// Обробка тексту для незареєстрованих користувачів
bot.on(':text').filter(
  (ctx): boolean => !ctx.session.registered,
  async (ctx) => {
    return ctx.reply('Будь ласка, спочатку поділіться своїм контактом.', {
      reply_markup: contactKeyboard,
    });
  }
);

// Обробка помилок
bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Помилка під час обробки оновлення ${ctx.update.update_id}:`);
  const e = err.error;
  if (e instanceof GrammyError) {
    console.error("Помилка в запиті:", e.description);
  } else if (e instanceof HttpError) {
    console.error("Не вдалося звʼязатися з Telegram:", e);
  } else {
    console.error("Невідома помилка:", e);
  }
});

export default bot