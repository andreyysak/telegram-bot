// src/modules/car/historyMenuModule.ts
import { Composer } from 'grammy';
import { BotContext } from '../../bot.js';
import { carHistoryMenu } from '../../keyboard/carHistoryMenu.js';

export const carHistoryModule = new Composer<BotContext>();

const HISTORY_MENU_TEXT = '📜 Історія';

carHistoryModule.hears(HISTORY_MENU_TEXT, async (ctx) => {
  await ctx.reply('🚗 Оберіть тип історії:', {
    reply_markup: carHistoryMenu,
  });
});
