// src/menus/salaryMenu.ts
import { Menu } from '@grammyjs/menu';
import { BotContext } from '../bot.js';

export const salaryMenu = new Menu<BotContext>('salary-menu')
  .text('💰 Зарплата', async (ctx) => {
    await ctx.reply('Функція "Зарплата" ще не реалізована.');
  })
  .row()
  .back('⬅️ Назад');