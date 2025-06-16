import { InlineKeyboard } from "grammy";

export const tripStatisticMenu = new InlineKeyboard()
  .text('Весь час', 'all_time')
  .row()
  .text('Останній рік', 'last_year')
  .row()
  .text('Останні 3 місяці', 'last_3_month')
  .row()
  .text('Останній місяць', 'last_month')