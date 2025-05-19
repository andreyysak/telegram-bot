import { InlineKeyboard } from 'grammy';

export const carHistoryMenu = new InlineKeyboard()
  .text('🛣️ Історія поїздок', 'history_trip')
  .row()
  .text('⛽ Історія заправки авто', 'history_gas')
  .row()
  .text('🚿 Історія мийки авто', 'history_wash')
  .row()
  .text('🛠️ Історія ТО', 'history_maintenance')
  .row()
  .text('⬅️ Назад', 'back_to_car_menu');