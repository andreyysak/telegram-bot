import { Composer } from "grammy";
import { BotContext } from "../../bot.js";
import { CAR_MENU, carMenuKeyboard } from "../../keyboard/carMenu.js";
import { carStatisticMenu } from "../../keyboard/carStatisticMenu.js";
import { getUserId } from "../../db/getUserId.js";
import { getTrips } from "../../db/getTrips.js";
import { getGasRefuels } from "../../db/getGasRefuels.js";

export const statisticModule = new Composer<BotContext>()

statisticModule.hears(CAR_MENU.STATISTIC, async (ctx) => {
  ctx.session.statistic = {
    state: 'await_statistic'
  }

  await ctx.reply('📊 Ти обрав статистику')

  const telegramUserId = ctx.from?.id

  if (!telegramUserId) throw new Error('Не вдалось завантажити Telegram ID.')

  const userId = await getUserId(telegramUserId)

  if (!userId) throw new Error('Не вдалось завантажити User ID.')

  const now = new Date()
  const month = now.getMonth()
  const year = now.getFullYear()

  const trips = await getTrips(userId)
  const gasRefuels = await getGasRefuels(userId)

  const filteredTrips = trips
    .filter(t => t.created_at.getFullYear() === year && t.created_at.getMonth() === month)
    .sort((a, b) => a.created_at.getTime() - b.created_at.getTime());

  const filteredRefuels = gasRefuels.filter(r =>
    r.created_at.getFullYear() === year && r.created_at.getMonth() === month
  );

  const distance =
    filteredTrips.length >= 2
      ? filteredTrips.at(-1)!.kilometers - filteredTrips[0].kilometers
      : 0;

  const totalLiters = filteredRefuels.reduce((sum, r) => sum + r.liters, 0);
  const totalCost = filteredRefuels.reduce((sum, r) => sum + r.totalPrice, 0);

  const localeMonth = now.toLocaleString('uk-UA', { month: 'long', year: 'numeric' });

  await ctx.reply(
    `📆 За *${localeMonth}*\n` +
    `🚘 Проїхав *${distance.toFixed(1)} км*\n` +
    `⛽️ Заправився на *${totalLiters.toFixed(2)} л*\n` +
    `💸 Витратив на пальне *${totalCost.toFixed(2)} грн*`,
    {
      parse_mode: 'Markdown',
      reply_markup: carMenuKeyboard
    }
  );

  ctx.session.statistic = {
    state: null
  }
})
