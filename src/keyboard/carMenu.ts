export const CAR_MENU = {
  TRIP: '🛣️ Поїздка',
  SERVICE: '⚙️ ТО',
  FUEL: '⛽ Паливо',
  WASH: '🚿 Мийка',
  TRIP_HISTORY: '📜 Історія поїздок',
  STATISTIC: '📊 Статистика',
  DOWNLOAD: '💾 Експорт',
  BACK: '⬅️ Назад',
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
      { text: CAR_MENU.TRIP_HISTORY },
      { text: CAR_MENU.STATISTIC }
    ],
    [
      { text: CAR_MENU.DOWNLOAD },
      { text: CAR_MENU.BACK }
    ],
  ],
  resize_keyboard: true,
  one_time_keyboard: false,
};
