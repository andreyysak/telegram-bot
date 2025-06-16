import { Composer } from "grammy";
import { BotContext } from "../../bot.js";
import { EXPENSE_TEXT, expenseTrackerMainMenu } from "../../keyboard/expenseTrackerMenu.js";
import pool from "../../db/client.js";
import { CATEGORY_UA_ICONS } from "../../assets/categoryUA.js";

export const expenseHistoryModule = new Composer<BotContext>()

expenseHistoryModule.hears(EXPENSE_TEXT.list, async (ctx) => {
  const userId = ctx.from?.id;

  if (!userId) {
    return ctx.reply('❌ Не вдалося отримати ID користувача.');
  }

  try {
    // Отримуємо user_id з БД
    const userRes = await pool.query(
      'SELECT id FROM users WHERE telegram_user_id = $1',
      [userId]
    );

    if (userRes.rows.length === 0) {
      return ctx.reply('❌ Користувача не знайдено у системі.');
    }

    const dbUserId = userRes.rows[0].id;

    // Фільтруємо лише поточний місяць
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // PostgreSQL починається з 1
    const currentYear = now.getFullYear();

    const res = await pool.query(
      `
      SELECT id, type, category, amount, created_at 
      FROM expense_tracker 
      WHERE user_id = $1 AND EXTRACT(MONTH FROM created_at) = $2 AND EXTRACT(YEAR FROM created_at) = $3
      ORDER BY created_at DESC
      `,
      [dbUserId, currentMonth, currentYear]
    );

    if (res.rows.length === 0) {
      return ctx.reply('📭 У вас ще немає записів.', {
        reply_markup: expenseTrackerMainMenu,
      });
    }

    // Групуємо записи
    const expenses = res.rows.filter((row) => row.type === 'expense');
    const incomes = res.rows.filter((row) => row.type === 'income');

    // Обчислюємо загальні суми
    const totalExpense = expenses.reduce((sum, row) => sum + parseFloat(row.amount), 0);
    const totalIncome = incomes.reduce((sum, row) => sum + parseFloat(row.amount), 0);
    const balance = totalIncome - totalExpense;

    // Перекладаємо категорію
    const formatRow = (row: any) => {
      const date = new Date(row.created_at).toLocaleDateString('uk-UA');
      const translation = CATEGORY_UA_ICONS[row.category as keyof typeof CATEGORY_UA_ICONS];
      const translatedCategory = translation ? `${translation.icon} ${translation.name}` : row.category;

      return `${date} | ${translatedCategory} — ${parseFloat(row.amount)} грн`;
    };

    const monthName = now.toLocaleString('uk-UA', { month: 'long' });

    // Формуємо повідомлення
    const message = `
📄 *Витрати за ${monthName} ${currentYear}* 

📉 *Витрати*:
${expenses.map(formatRow).join('\n')}

📈 *Доходи*:
${incomes.map(formatRow).join('\n')}

📌 *Загальна сума витрат*: ${totalExpense.toFixed(2)} грн  
💰 *Загальна сума доходів*: ${totalIncome.toFixed(2)} грн  
✅ *Баланс*: ${balance.toFixed(2)} грн
    `;

    await ctx.reply(message, {
      parse_mode: 'Markdown',
      reply_markup: expenseTrackerMainMenu,
    });
  } catch (e) {
    console.error('❌ Помилка при завантаженні історії:', e);
    await ctx.reply('⚠️ Сталася помилка при завантаженні історії.', {
      reply_markup: expenseTrackerMainMenu,
    });
  }
});