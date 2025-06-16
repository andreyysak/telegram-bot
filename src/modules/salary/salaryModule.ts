import { Composer } from "grammy";
import { BotContext } from "../../bot.js";
import { SALARY_TEXT } from "../../keyboard/appsKeyboard.js";
import { mainMenuKeyboard } from "../../keyboard/mainMenu.js";
import { getXcityDataForOperator } from "../../services/xcity/xcitySalary.js";

export const salaryModule = new Composer<BotContext>()

salaryModule.hears(SALARY_TEXT, async (ctx) => {
  const operatorId = 729;

  const result = await getXcityDataForOperator(operatorId);

  if (!result) {
    return ctx.reply('❌ Дані не знайдено або сталася помилка.', {
      reply_markup: mainMenuKeyboard,
    });
  }

  const {
    sup,
    stats: {
      staj,
      operators_zmina,
      operators_night_zmina,
      plan,
      fact,
      average_load,
      calculated_staj,
      calculated_solutions,
      salary,
    },
  } = result;

  const message = `
📄 *Ваші дані*:

🔹 ПІБ: ${sup.fio}
📅 Стаж: ${staj} міс.
🛞 Кількість змін: ${operators_zmina}
🌙 Нічних змін: ${operators_night_zmina}
📆 План: ${plan}
✅ Факт: ${fact}
📈 Навантаження: ${average_load.toFixed(2)}%
💰 Заробітна плата:
- Стаж: ${calculated_staj} грн
- Зміни: ${Number(result.stats.calculated_zmin).toFixed(2)} грн
- Навантаження: ${Number(result.stats.calculated_load).toFixed(2)} грн
- Рішення: ${calculated_solutions.toFixed(2)} грн
💸 *Загалом*: ${salary.toFixed(2)} грн
`;

  await ctx.reply(message, {
    parse_mode: 'Markdown',
    reply_markup: mainMenuKeyboard,
  });
})