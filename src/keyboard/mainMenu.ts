export const CAR_MENU_TEXT = '🏎️ Авто';
export const WEATHER_MENU_TEXT = '⛅ Погода';
export const NETWORK_MENU_TEXT = '🌐 Мережа'
export const APPS_MENU_TEXT = '🤖 Додатки'
export const TODO_MENU_TEXT = '✅ Список справ'

export const mainMenuKeyboard = {
  keyboard: [
    [
      { text: CAR_MENU_TEXT },
      { text: TODO_MENU_TEXT },
    ],
  ],
  resize_keyboard: true,
  one_time_keyboard: false,
};

export const mainMenuKeyboardRestricted = {
  keyboard: [
    [{ text: CAR_MENU_TEXT }],
  ],
  resize_keyboard: true,
  one_time_keyboard: false,
};