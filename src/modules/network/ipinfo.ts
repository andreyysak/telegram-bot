// src/modules/network/ipinfo.ts
import { Composer } from 'grammy';
import { BotContext } from '../../bot.js';
import { IPINFO_MENU_TEXT, networkMenuKeyboard } from '../../keyboard/networkMenu.js';
import { getIpData } from '../../services/ipinfo.js';

export const ipInfoModule = new Composer<BotContext>();

// === Кнопка меню ===
ipInfoModule.hears(IPINFO_MENU_TEXT, async (ctx) => {
  ctx.session.ipinfo = {
    state: 'awaiting_ip',
  };

  await ctx.reply('📍 Введіть IP-адресу:');
});

// === Обробка тексту ТІЛЬКИ якщо стан awaiting_ip ===
ipInfoModule.on(':text').filter(
  (ctx): boolean => ctx.session.ipinfo?.state === 'awaiting_ip',
  async (ctx) => {
    const text = ctx.message?.text.trim();

    if (!text) throw new Error('❌ Не отримано жодних даних.')

    try {
      const data = await getIpData(text);

      const message = data
        .map(item => `${item.label} ${item.value}`)
        .join('\n');

      await ctx.reply(message, {
        reply_markup: networkMenuKeyboard,
      });

      // Скидаємо стан
      ctx.session.ipinfo = {
        state: null,
      };

    } catch (e) {
      console.error('Помилка при отриманні даних про IP:', e);
      await ctx.reply('⚠️ Не вдалося отримати дані про IP.', {
        reply_markup: networkMenuKeyboard,
      });
    }
  }
);