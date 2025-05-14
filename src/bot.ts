import { Bot, Context, session } from 'grammy';
import { Menu } from '@grammyjs/menu';
import dotenv from 'dotenv';

import pool from './db/client.js';
import { carMenu } from './menu/carMenu.js';
import { toolsMenu } from './menu/toolsMenu.js';
import { salaryMenu } from './menu/salaryMenu.js';

dotenv.config();

// === Тип для контексту з сесією ===
interface SessionData {
  state: 'awaiting_kilometers' | null;
}

export type BotContext = Context & {
  session: SessionData;
};

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) throw new Error('Telegram bot token was not found');

// === Створення бота ===
const bot = new Bot<BotContext>(token);

// === Головне меню ===
const mainMenu = new Menu<BotContext>('main-menu')
  .text('🚗 Car', async (ctx) => {
    await ctx.reply('🚗 Ви обрали Car', { reply_markup: carMenu });
  })
  .text('💸 Salary', async (ctx) => {
    await ctx.reply('💸 Ви обрали Salary', { reply_markup: salaryMenu });
  })
  .text('🛠️ Tools', async (ctx) => {
    await ctx.reply('🛠️ Ви обрали Tools', { reply_markup: toolsMenu });
  });

// === Клавіатура для отримання контакту ===
const contactKeyboard = {
  keyboard: [
    [
      {
        text: '📞 Поділитися контактом',
        request_contact: true,
      },
    ],
  ],
  resize_keyboard: true,
  one_time_keyboard: true,
};

// === Використання middleware ===
bot.use(
  session({
    initial: (): SessionData => ({
      state: null,
    }),
  })
);

// 👇 Спочатку реєструємо усі меню
bot.use(mainMenu);
bot.use(carMenu);
bot.use(salaryMenu);
bot.use(toolsMenu);

// === Команда /start ===
bot.command('start', async (ctx) => {
  await ctx.reply('Привіт! Будь ласка, поділіться своїм контактом:', {
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

      await ctx.reply(`✅ Реєстрація успішна!\nПривіт, ${first_name}!\nТвій номер: ${phone_number}\nID: ${user.id}`, {
        reply_markup: { remove_keyboard: true }, // 👈 Приховуємо клавіатуру
      });
    } else {
      await ctx.reply(`👋 Привіт знову, ${first_name}!`, {
        reply_markup: { remove_keyboard: true }, // 👈 Також приховуємо
      });
    }

    // Після успішної реєстрації показуємо головне меню
    await ctx.reply('Оберіть опцію нижче:', {
      reply_markup: mainMenu,
    });

  } catch (error) {
    console.error('Помилка при роботі з БД:', error);
    await ctx.reply('⚠️ Сталася помилка. Спробуйте ще раз.', {
      reply_markup: { remove_keyboard: true },
    });
  }
});

// === Обробник тексту (наприклад, кілометраж) ===
bot.on(':text', async (ctx) => {
  if (ctx.session.state === 'awaiting_kilometers') {
    const text = ctx.message?.text?.trim();

    if (!ctx.from) {
      return ctx.reply('Помилка: користувач не знайдений.');
    }

    if (!text || text.trim() === '') {
      return ctx.reply('Будь ласка, введіть коректне значення.');
    }

    let km: number;

    try {
      km = parseFloat(text.replace(',', '.'));

      if (isNaN(km)) {
        return ctx.reply('Будь ласка, введіть правильне число.');
      }

      // Отримуємо ID користувача з БД за telegram_user_id
      const userRes = await pool.query(
        'SELECT id FROM users WHERE telegram_user_id = $1',
        [ctx.from.id]
      );

      if (userRes.rows.length === 0) {
        return ctx.reply('Користувача не знайдено у системі.');
      }

      const dbUserId = userRes.rows[0].id;

      // Зберігаємо поїздку
      await pool.query(
        'INSERT INTO trips (user_id, kilometers) VALUES ($1, $2)',
        [dbUserId, km]
      );

      await ctx.reply(`✅ Кілометраж ${km} км успішно збережено.`);
      ctx.session.state = null; // Скидаємо стан

    } catch (e) {
      console.error('Помилка при збереженні поїздки:', e);
      await ctx.reply('⚠️ Сталася помилка при збереженні.');
    }
  }
});

export default bot;