import { InlineKeyboard } from "grammy";

export const expenseCategories = new InlineKeyboard()
  .text('💡 Комунальні платежі', 'komunalni_platezhi').text('🛒 Продукти', 'produkty')
  .row()
  .text('🚗 Авто', 'avto').text('📺 Підписки', 'pidpysky')
  .row()
  .text('🎉 Розваги', 'rozvagy').text('✈️ Подорожі', 'podorozhi')
  .row()
  .text('💊 Ліки', 'liky').text('🧼 Засоби особистої гігієни', 'zasoby_osobystoi_hihieny')
  .row()
  .text('🏋️ Спорт', 'sport').text('🎁 Подарунки', 'podarunky')
  .row()
  .text('🎓 Освіта', 'osvita').text('👕 Одяг та взуття', 'odyag_ta_vzuttya')
  .row()
  .text('📱 Звʼязок та інтернет', 'zvyazok_ta_internet').text('📚 Книги та самоосвіта', 'knygy_ta_samoosvita')
  .row()
  .text('🛠️ Побутові товари та ремонт', 'pobutovi_tovary_ta_remont').text('💼 Робочі витрати / Бізнес', 'robochi_vytraty_biznes')
  .row()
  .text('📈 Інвестиції', 'investytsii').text('💸 Відкладення', 'vidkladennya')
  .row()
  .text('📌 Інше', 'inshe')
  .row();

  