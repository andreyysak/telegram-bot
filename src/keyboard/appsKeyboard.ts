import { BACK_TO_MAIN_TEXT } from "./backToMenu.js"

export const appsMenuInlineKeyboard = {
  inline_keyboard: [
    [
      { text: BACK_TO_MAIN_TEXT, callback_data: 'back_to_main' },
    ],
  ],
}
