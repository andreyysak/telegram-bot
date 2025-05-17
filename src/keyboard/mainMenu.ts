export const CAR_MENU_TEXT = '🏎️ Авто';
export const WEATHER_MENU_TEXT = '⛅ Погода';
export const NETWORK_MENU_TEXT = '🌐 Мережа'
export const APPS_MENU_TEXT = '🤖 Додатки'
export const TODO_MENU_TEXT = '✅ Todo list'

export const mainMenuKeyboard = {
  keyboard: [
    [
      { text: CAR_MENU_TEXT },
      { text: WEATHER_MENU_TEXT },
    ],
    [
      { text: TODO_MENU_TEXT },
      { text: NETWORK_MENU_TEXT },
    ],
    [{ text: APPS_MENU_TEXT }]
  ],
  resize_keyboard: true,
  one_time_keyboard: false,
};

export const mainMenuKeyboardRestricted = {
  keyboard: [
    [{ text: CAR_MENU_TEXT }],
    // [{ text: '⛔️ Доступ заблоковано' }],
  ],
  resize_keyboard: true,
  one_time_keyboard: false,
};