import { InlineKeyboard } from "grammy";

export const incomeCategories = new InlineKeyboard()
  .text('💼 Заробітня плата', 'salary')
  .row()
  .text('🎁 Подарункові кошти', 'gift_income')
  .row()
  .text('📈 Інвестиційні повернення', 'investment_returns')
  .row()
  .text('🛠️ Підробіток', 'side_job')
  .row()
  .text('📌 Інше', 'other_income')
  .row();
