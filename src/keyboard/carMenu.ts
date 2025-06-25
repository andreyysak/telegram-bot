import { BACK_TO_MAIN_TEXT } from "./backToMenu.js";

export const CAR_MENU = {
  TRIP: '🛣️ Поїздка',
  SERVICE: '⚙️ ТО',
  FUEL: '⛽ Паливо',
  WASH: '🚿 Мийка',
  HISTORY: '📜 Історія',
  STATISTIC: '📊',
  DOWNLOAD: '💾',
  OTHER: '📌'
};

export const carMenuKeyboard = {
  keyboard: [
    [
      { text: CAR_MENU.TRIP },
      { text: CAR_MENU.FUEL },
    ],
    [
      { text: CAR_MENU.STATISTIC },
      { text: CAR_MENU.DOWNLOAD },
      { text: CAR_MENU.OTHER },
      { text: BACK_TO_MAIN_TEXT }
    ],
  ],
  resize_keyboard: true,
  one_time_keyboard: true,
};

