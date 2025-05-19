import { Composer } from "grammy";
import { BotContext } from "../../bot.js";
import { networkMenuKeyboard, PING_MENU_TEXT } from "../../keyboard/networkMenu.js";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec)

export const pingModule = new Composer<BotContext>()

pingModule.hears(PING_MENU_TEXT, async (ctx) => {
  ctx.session.ping = {
    state: 'ping_session'
  }

  await ctx.reply('📍 Введіть IP-адресу / домен сервера для ping:')
})

pingModule.on(':text').filter(
  (ctx): boolean => ctx.session.ping?.state === 'ping_session',
  async (ctx) => {
    const text = ctx.message?.text

    if (!text) throw new Error('❌ Не вдалося отримати IP-адресу.')

    await ctx.reply(`⏳ Виконую ping до ${text}...`)


    try {
      // Виконуємо ping на 20 пакетів
      const command = `ping -c 20 ${text}`;
      const { stdout } = await execAsync(command);

      // Відправляємо результат користувачу
      await ctx.reply(`✅ Результат ping до ${text}:\n\n${stdout}`, {
        reply_markup: networkMenuKeyboard,
      });

      ctx.session.ping = {
        state: null,
      };

    } catch (e) {
      console.error('Помилка при виконанні ping:', e);
      await ctx.reply('⚠️ Сталася помилка при виконанні ping.', {
        reply_markup: { remove_keyboard: true },
      });
    }
  }
)