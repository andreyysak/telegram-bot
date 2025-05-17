import { BACK_TO_MAIN_TEXT } from "./backToMenu.js"

export const NOMER_ZNAK = '🪪 Пошук за номерним знаком'

export const appsMenuKeyboard = {
  keyboard: [
    [
      { text: NOMER_ZNAK },
      { text: BACK_TO_MAIN_TEXT }
    ]
  ],
  resize_keyboard: true,
  one_time_keyboard: false,
}