import { Markup } from "telegraf";

export const mainMenuKeyboard = Markup.inlineKeyboard([
  [Markup.button.callback("📍 Поїздка", "trip")],
  [Markup.button.callback("🛢️ Паливо", "fuel")],
  [Markup.button.callback("✨ AI calories", "ai_calories")],
]);
