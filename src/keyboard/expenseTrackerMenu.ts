import { BACK_TO_MAIN_TEXT } from "./backToMenu.js";

export const EXPENSE_TEXT = {
  income: '💰 Дохід',
  expense: '💸 Витрати',
  add: '➕ Додати',
  remove: '➖ Видалити',
  list: '📋 Транзакції',
  statistic: '📊 Статистика',
};

export const expenseTrackerMainMenu = {
  keyboard: [
    [
      { text: EXPENSE_TEXT.income },
      { text: EXPENSE_TEXT.expense }
    ],

    [
      { text: EXPENSE_TEXT.list },
      { text: EXPENSE_TEXT.statistic },
    ],
    [
      { text: BACK_TO_MAIN_TEXT },
    ],
  ],

  resize_keyboard: true,
  one_time_keyboard: false,
}
export const expenseTrackerMenu = {
  keyboard: [
     [
      { text: EXPENSE_TEXT.add },
      { text: EXPENSE_TEXT.remove }
    ],
     [
      { text: EXPENSE_TEXT.income },
      { text: EXPENSE_TEXT.expense }
    ],
  ],
  resize_keyboard: true,
  one_time_keyboard: false,
}

export const incomeTrackerMenu = {
  keyboard: [],
  resize_keyboard: true,
  one_time_keyboard: false,
}
