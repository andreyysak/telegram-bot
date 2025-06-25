export const CAR_MENU_TEXT = '🏎️ Авто';
export const APPS_MENU_TEXT = '📌 Інше'
export const EXPENSE_TRACKER_MENU_TEXT = '💰 Трекер витрат'

export const mainMenuKeyboard = {
  keyboard: [
    [
      { text: CAR_MENU_TEXT },
      { text: EXPENSE_TRACKER_MENU_TEXT },
    ],
    [
      { text: APPS_MENU_TEXT },
    ]
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