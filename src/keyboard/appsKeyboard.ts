import { BACK_TO_MAIN_TEXT } from "./backToMenu.js"

export const NOMER_ZNAK = '🪪 Пошук за номерним знаком'
export const SALARY_TEXT = '💸 Заробітня плата'

export const appsMenuKeyboard = {
  keyboard: [
    [
      { text: NOMER_ZNAK },
      { text: SALARY_TEXT },
    ],
    [{ text: BACK_TO_MAIN_TEXT }]
  ],
  resize_keyboard: true,
  one_time_keyboard: false,
}