import { Composer } from "grammy";
import { BotContext } from "../../bot.js";
import { EXPENSE_TEXT, expenseTrackerMainMenu } from "../../keyboard/expenseTrackerMenu.js";
import { incomeCategories } from "../../keyboard/incomeCategories.js";
import { expenseCategories } from "../../keyboard/expenseCategories.js";
import pool from "../../db/client.js";
import { CATEGORY_UA_ICONS } from "../../assets/categoryUA.js";

export const expenseTrackerModule = new Composer<BotContext>()

expenseTrackerModule.hears([EXPENSE_TEXT.income, EXPENSE_TEXT.expense], async (ctx) => {
  const isIncome = ctx.match === EXPENSE_TEXT.income;

  ctx.session.expense_tracker = {
    state: 'category',
    type: isIncome ? 'income' : 'expense'
  }

  const keyboard = isIncome ? incomeCategories : expenseCategories;

  await ctx.reply(isIncome ? '💼 Оберіть тип доходу:' : '🧾 Оберіть категорію витрат:', {
    reply_markup: keyboard,
  });
})

expenseTrackerModule.callbackQuery(/^komunalni_platezhi|produkty|avto|pidpysky|rozvagy|podorozhi|liky|taxi|tech|zasoby_osobystoi_hihieny|sport|podarunky|osvita|odyag_ta_vzuttya|zvyazok_ta_internet|knygy_ta_samoosvita|pobutovi_tovary_ta_remont|robochi_vytraty_biznes|investytsii|vidkladennya|inshe|salary|gift_income|investment_returns|side_job|other_income$/, async (ctx) => {
  const category = ctx.callbackQuery.data;
  const type = ctx.session.expense_tracker?.type;

  if (!type) {
    return ctx.reply('❌ Не вдалося отримати тип запису.');
  }

  ctx.session.expense_tracker = {
    ...ctx.session.expense_tracker,
    category,
    state: 'amount',
  };

  await ctx.editMessageText(`🔢 Введіть суму ${type === 'income' ? 'доходу' : 'витрат'}:`);

  await ctx.answerCallbackQuery();
});


expenseTrackerModule.on(':text').filter(
  (ctx): boolean => ctx.session.expense_tracker?.state === 'amount',
  async (ctx) => {
    const text = ctx.message?.text.trim();
    const userId = ctx.from?.id;
    const sessionData = ctx.session.expense_tracker;

    if (!text) throw new Error('❌ Не отримано жодних даних.')

    if (!userId || !sessionData || !sessionData.type || !sessionData.category) {
      return ctx.reply('❌ Дані втрачено. Спробуйте ще раз.', {
        reply_markup: expenseTrackerMainMenu,
      });
    }

    const amount = parseFloat(text.replace(',', '.'));

    if (isNaN(amount)) {
      return ctx.reply('❌ Будь ласка, введіть правильну суму.');
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

      // Додаємо до БД
      await pool.query(
        'INSERT INTO expense_tracker (user_id, type, category, amount) VALUES ($1, $2, $3, $4)',
        [dbUserId, sessionData.type, sessionData.category, amount]
      );

      // Переводимо категорію на українську із смайлом
      const translation = CATEGORY_UA_ICONS[sessionData.category as keyof typeof CATEGORY_UA_ICONS];

      const uaCategory = translation
        ? `${translation.icon} ${translation.name}`
        : sessionData.category;

      // Повідомлення користувачу
      await ctx.reply(`✅ ${sessionData.type === 'income' ? 'Дохід' : 'Витрата'} додано:\n\n${uaCategory} — ${amount} грн`, {
        reply_markup: expenseTrackerMainMenu,
      });

      ctx.session.expense_tracker = undefined;

    } catch (e) {
      console.error('❌ Помилка при збереженні запису:', e);
      await ctx.reply('⚠️ Сталася помилка при збереженні запису.');
    }
  }
);