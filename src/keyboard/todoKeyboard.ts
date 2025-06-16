import { BACK_TO_MAIN_TEXT } from "./backToMenu.js";

export const ADD_TEXT = '✅ Додати';
export const DELETE_TEXT = '⛔ Видалити';
export const COMPLETE_TEXT = '🌟 Виконати';
export const EDIT_TEXT = '✏️ Редагувати';
export const LIST_TEXT = '📋 Список';

export const todoKeyboard = {
  keyboard: [
    [
      { text: ADD_TEXT },
      { text: DELETE_TEXT },
      { text: COMPLETE_TEXT},
    ],
    [
      { text: EDIT_TEXT},
      { text: LIST_TEXT},
      { text: BACK_TO_MAIN_TEXT},
    ],
  ],
  resize_keyboard: true,
  one_time_keyboard: true,
}