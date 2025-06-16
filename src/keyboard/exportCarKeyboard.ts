import { InlineKeyboard } from "grammy";

export const exportCarKeyboard = new InlineKeyboard()
  .text('🛣️ Поїздки', 'export_trip')
  .row()
  .text('⛽ Заправка', 'export_gas')
  .row()
  .text('🚿 Мийка', 'export_wash')
  .row()
  .text('🛠️ ТО', 'export_maintenance')
  .row()