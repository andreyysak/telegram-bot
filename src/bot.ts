import { Bot, Context, session, SessionFlavor } from 'grammy';
import dotenv from 'dotenv';
import pool from './db/client.js';

import { tripModule } from './modules/car/trip.js';

import { contactKeyboard } from './keyboard/shareContact.js';
import { mainMenuKeyboard } from './keyboard/mainMenu.js';
import { carMenuKeyboard } from './keyboard/carMenu.js';
import { backToMainKeyboard } from './keyboard/backToMenu.js';
import { SessionData } from './types/SessionData.js';
import { tripHistoryModule } from './modules/car/tripHistory.js';

dotenv.config();

export type BotContext = Context & SessionFlavor<SessionData>;

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) throw new Error('Telegram bot token was not found');

const bot = new Bot<BotContext>(token);

// === Сесія ===
bot.use(
  session({
    initial: (): SessionData => ({
      registered: false,
    }),
  })
);

bot.use(tripModule)
bot.use(tripHistoryModule)

// === Команда /start ===
bot.command('start', async (ctx) => {
  await ctx.reply('Привіт! Щоб почати роботу, будь ласка, поділіться своїм контактом:', {
    reply_markup: contactKeyboard,
  });
});

// === Обробка отриманого контакту ===
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
        reply_markup: mainMenuKeyboard,
      });
    } else {
      await ctx.reply(`👋 Привіт знову, ${first_name}!`, {
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

// === Обробка всіх інших повідомлень (до реєстрації) ===
bot.on(':text', async (ctx) => {
  const text = ctx.message?.text;

  // Якщо користувач ще не зареєстрований
  if (!ctx.session.registered) {
    return ctx.reply('Будь ласка, спочатку поділіться своїм контактом.', {
      reply_markup: contactKeyboard,
    });
  }

  // Якщо користувач уже зареєстрований, обробляємо команди
  if (text === '⬅️ Назад до головного меню') {
    return ctx.reply('Головне меню:', {
      reply_markup: mainMenuKeyboard,
    });
  }

  if (text === '🚗 Car') {
    return ctx.reply('🚗 Ви обрали Car', {
      reply_markup: carMenuKeyboard,
    });
  }

  if (text === '⬅️ Назад') {
    return ctx.reply('⬅️ Повертаємось назад', {
      reply_markup: mainMenuKeyboard,
    });
  }

  if (text === '🛣️ Поїздка') {
    await ctx.reply('Введіть кількість кілометрів:', {
      reply_markup: backToMainKeyboard,
    });

    ctx.session.trip = {
      state: 'awaiting_kilometers',
    };
  }
});

export default bot