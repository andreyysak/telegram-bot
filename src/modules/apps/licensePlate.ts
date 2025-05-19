import { Composer } from "grammy";
import { BotContext } from "../../bot.js";
import { appsMenuKeyboard, NOMER_ZNAK } from "../../keyboard/appsKeyboard.js";
import { getLicenseCarInfo } from "../../services/licensePlate.js";

export const licensePlate = new Composer<BotContext>()

licensePlate.hears(NOMER_ZNAK, async (ctx) => {
  ctx.session.license_plate = {
    state: 'awaiting_license_plate'
  }

  await ctx.reply('🎫 Введи номерний знак авто: ', {
    reply_markup: appsMenuKeyboard
  })
})

licensePlate.on(':text').filter(
  (ctx): boolean => ctx.session.license_plate?.state === 'awaiting_license_plate',
  async (ctx) => {
    const text = ctx.message?.text

    const nomer_znak = text?.trim().toUpperCase()

    if (!nomer_znak) {
      await ctx.reply("❌ Не отримано номерний знак", {
        reply_markup: appsMenuKeyboard
      })

      return
    }

    try {
      const data = await getLicenseCarInfo(nomer_znak)

      const sortedMessage = data
        .sort((a, b) => {
          const textA = a.name.replace(/^[^\p{L}\p{N}]+/u, '').trim();
          const textB = b.name.replace(/^[^\p{L}\p{N}]+/u, '').trim();
          return textA.localeCompare(textB, 'uk');
        })
        .map(item => `${item.name} ${Array.isArray(item.value) ? item.value.join(', ') : item.value}`)
        .join('\n');

      await ctx.reply(sortedMessage);

      ctx.session.license_plate = {
        state: null
      }
    } catch (e) {
      console.error('Помилка при отриманні даних про IP:', e);
      await ctx.reply('⚠️ Не вдалося отримати дані про IP.', {
        reply_markup: appsMenuKeyboard,
      });
    }
  }
)