import { PrismaClient } from "@prisma/client";
import { Composer } from "telegraf";
import { MyContext } from "../types/context";

const prisma = new PrismaClient();
export const tripComposer = new Composer<MyContext>();

tripComposer.command("trip", async (ctx) => {
  ctx.session.tripStep = "awaiting_kilometers";
  await ctx.reply("🚗 Введи кілометраж:");
});

tripComposer.on("text", async (ctx, next) => {
  if (!ctx.session.tripStep) return next();

  if (ctx.session.tripStep === "awaiting_kilometers") {
    const km = parseFloat(ctx.message.text);
    if (isNaN(km) || km <= 0) return ctx.reply("❌ Введи правильне число");

    ctx.session.kilometers = km;
    ctx.session.tripStep = "awaiting_direction";
    return ctx.reply("🧭 Введи напрямок поїздки:");
  }

 if (ctx.session.tripStep === "awaiting_direction") {
  const direction = ctx.message.text.trim();
  if (!direction) return ctx.reply("❌ Введи напрямок");

  await prisma.trip.create({
    data: {
      telegram_user_id: ctx.from?.id.toString(),
      kilometrs: ctx.session.kilometers!,
      direction,
    },
  });

  ctx.session.tripStep = undefined;
  ctx.session.kilometers = undefined;

  return ctx.reply("✅ Поїздку збережено!");
}
});
