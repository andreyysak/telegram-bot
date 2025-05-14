import { Menu } from '@grammyjs/menu';
import type { BotContext } from '../bot.js';

export const carMenu = new Menu<BotContext>('car-menu')
  .text('🛣️ Поїздка', async (ctx) => {
    await ctx.reply('Введіть кількість кілометрів:', {
      reply_markup: { remove_keyboard: true },
    });
    ctx.session.state = 'awaiting_kilometers';
  })
  .row()
  .back('⬅️ Назад');