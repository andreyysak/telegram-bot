// src/menus/toolsMenu.ts
import { Menu } from '@grammyjs/menu';
import { BotContext } from '../bot.js';

export const toolsMenu = new Menu<BotContext>('tools-menu')
  .text('🔧 Інструмент', async (ctx) => {
    await ctx.reply('Функція "Інструмент" ще не реалізована.');
  })
  .row()
  .back('⬅️ Назад');