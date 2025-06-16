import { InlineKeyboard } from "grammy";

export const carStatisticMenu = new InlineKeyboard()
  .text('🛣️ Статистика поїздок', 'history_trip')
  .row()
  .text('⛽ Статистика заправки авто', 'history_gas')
  .row()
  .text('🚿 Статистика мийки авто', 'history_wash')
  .row()
  // .text('🛠️ Історія ТО', 'history_maintenance')
  // .row()
  .text('⬅️ Назад', 'back_to_car_menu');