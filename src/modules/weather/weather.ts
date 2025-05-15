import { Composer } from "grammy";
import { BotContext } from "../../bot.js";
import { getWeatherData } from "../../services/weather.js";

export const weatherModule = new Composer<BotContext>()

weatherModule.hears('⛅ Погода', async (ctx) => {
  ctx.session.weather = {
    state: 'weather_session'
  };

  const data = await getWeatherData();

  const sortedMessage = data
    .sort((a, b) => {
      const textA = a.label.replace(/^[^\p{L}\p{N}]+/u, '').trim();
      const textB = b.label.replace(/^[^\p{L}\p{N}]+/u, '').trim();
      return textA.localeCompare(textB, 'uk');
    })
    .map(item => `${item.label} ${Array.isArray(item.value) ? item.value.join(', ') : item.value}`)
    .join('\n');

  await ctx.reply(sortedMessage);
});


