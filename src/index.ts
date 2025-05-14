import bot from "./bot.js";

async function startBot() {
  try {
    await bot.start();
    console.log('🟢 Бот успішно запущений!');
  } catch (error) {
    console.error('🔴 Помилка при запуску бота:', error);
  }
}

startBot();