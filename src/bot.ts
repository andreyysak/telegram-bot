import { Bot, Context, GrammyError, HttpError, session, SessionFlavor } from 'grammy';
import dotenv from 'dotenv';
import pool from './db/client.js';

import { tripModule } from './modules/car/trip.js';
import { tripHistoryModule } from './modules/car/tripHistory.js';
import { weatherModule } from './modules/weather/weather.js';
import { gasModule } from './modules/car/gas.js';
import { ipInfoModule } from './modules/network/ipinfo.js';
import { pingModule } from './modules/network/ping.js';
import { licensePlate } from './modules/apps/licensePlate.js';
import { statisticModule } from './modules/car/statistic.js';
import { exportModule } from './modules/car/export.js';

import { contactKeyboard } from './keyboard/shareContact.js';
import { APPS_MENU_TEXT, CAR_MENU_TEXT, mainMenuKeyboard, mainMenuKeyboardRestricted, NETWORK_MENU_TEXT, TODO_MENU_TEXT, WEATHER_MENU_TEXT } from './keyboard/mainMenu.js';
import { carMenuKeyboard } from './keyboard/carMenu.js';
import { BACK_TO_MAIN_TEXT } from './keyboard/backToMenu.js';
import { SessionData } from './types/SessionData.js';
import { carHistoryModule } from './modules/car/carHistory.js';
import { gasHistoryModule } from './modules/car/gasHistory.js';
import { maintenanceModule } from './modules/car/maintenanceModule.js';
import { maintenanceHistoryModule } from './modules/car/maintenanceHistory.js';
import { washModule } from './modules/car/washModule.js';
import { washHistoryModule } from './modules/car/washHistory.js';
import { networkMenuKeyboard } from './keyboard/networkMenu.js';
import { appsMenuKeyboard } from './keyboard/appsKeyboard.js';
import { todoKeyboard } from './keyboard/todoKeyboard.js';
import { addTodoModule } from './modules/todo/addTodo.js';
import { listTodoModule } from './modules/todo/listTodo.js';
import { completeTodoModule } from './modules/todo/completeTodo.js';
import { deleteTodoModule } from './modules/todo/deleteTodo.js';
import { editTodoModule } from './modules/todo/editTodo.js';

dotenv.config();

export type BotContext = Context & SessionFlavor<SessionData>;

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) throw new Error('Telegram bot token was not found');

const bot = new Bot<BotContext>(token);

const allowedUserIds = process.env.ALLOWED_USER_IDS?.split(',').map(id => parseInt(id.trim(), 10)) || [];

// Сесія
bot.use(
  session({
    initial: (): SessionData => ({
      registered: false,
    }),
  })
);

// ⁡⁣⁣⁢Імпорт модулів⁡
bot.use(tripModule)
bot.use(gasModule)
bot.use(maintenanceModule)
bot.use(washModule)
bot.use(statisticModule)
bot.use(exportModule)
bot.use(carHistoryModule)
bot.use(tripHistoryModule)
bot.use(gasHistoryModule)
bot.use(maintenanceHistoryModule)
bot.use(washHistoryModule)

bot.use(weatherModule)
bot.use(addTodoModule)
bot.use(listTodoModule)
bot.use(completeTodoModule)
bot.use(deleteTodoModule)
bot.use(editTodoModule)

bot.use(ipInfoModule)
bot.use(pingModule)

bot.use(licensePlate)

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

// === Middleware для перевірки прав ===
bot.use(async (ctx, next) => {
  const userId = ctx.from?.id;

  if (!userId) return ctx.reply('❌ Не можу отримати ваш Telegram ID.');

  // Якщо користувач не в списку дозволених — обмежуємо функціонал
  if (!allowedUserIds.includes(userId)) {
    ctx.session.restricted = true;
    return next(); // продовжуємо обробку, але покажемо обмежене меню
  }

  ctx.session.restricted = false;
  return next();
});

// === Головне меню (тепер з перевіркою прав) ===
bot.hears(CAR_MENU_TEXT, async (ctx) => {
  await ctx.reply('🚗 Ти обрав Авто', {
    reply_markup: carMenuKeyboard,
  });
});

bot.hears(BACK_TO_MAIN_TEXT, async (ctx) => {
  if (ctx.session.restricted) {
    return ctx.reply('⬅️ Повертаємось назад', {
      reply_markup: mainMenuKeyboardRestricted,
    });
  }

  await ctx.reply('⬅️ Повертаємось назад', {
    reply_markup: mainMenuKeyboard,
  });
});

// === Головне меню для обмежених користувачів ===
bot.hears([WEATHER_MENU_TEXT, NETWORK_MENU_TEXT, APPS_MENU_TEXT, TODO_MENU_TEXT], async (ctx) => {
  const userId = ctx.from?.id;

  if (!userId) throw new Error('Не знайдено userId.')

  if (allowedUserIds.includes(userId)) {
    if (ctx.match === WEATHER_MENU_TEXT) {
      return ctx.reply('⛅ Ти обрав Погоду');
    }
    if (ctx.match === NETWORK_MENU_TEXT) {
      return ctx.reply('🌐 Ти обрав Мережу', {
        reply_markup: networkMenuKeyboard
      });
    }
    if (ctx.match === APPS_MENU_TEXT) {
      return ctx.reply('🤖 Ти обрав Додатки', {
        reply_markup: appsMenuKeyboard
      });
    }
    if (ctx.match === TODO_MENU_TEXT) {
      return ctx.reply('✅ Ти обрав Список справ', {
        reply_markup: todoKeyboard
      });
    }
  } else {
    await ctx.reply('⛔️ У вас немає доступу до цього пункту меню.', {
      reply_markup: mainMenuKeyboardRestricted,
    });
  }
});

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