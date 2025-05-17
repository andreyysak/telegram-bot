import { BACK_TO_MAIN_TEXT } from "./backToMenu.js";

export const CAR_MENU = {
  TRIP: '🛣️ Поїздка',
  SERVICE: '⚙️ ТО',
  FUEL: '⛽ Паливо',
  WASH: '🚿 Мийка',
  HISTORY: '📜 Історія',
  STATISTIC: '📊 Статистика',
  DOWNLOAD: '💾 Експорт',
};

export const carMenuKeyboard = {
  keyboard: [
    [
      { text: CAR_MENU.TRIP },
      { text: CAR_MENU.SERVICE }
    ],
    [
      { text: CAR_MENU.FUEL },
      { text: CAR_MENU.WASH }
    ],
    [
      { text: CAR_MENU.HISTORY },
      { text: CAR_MENU.STATISTIC }
    ],
    [
      { text: CAR_MENU.DOWNLOAD },
      { text: BACK_TO_MAIN_TEXT }
    ],
  ],
  resize_keyboard: true,
  one_time_keyboard: false,
};
