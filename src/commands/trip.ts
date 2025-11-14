// src/commands/trip.ts
import { PrismaClient } from "@prisma/client";
import { Composer } from "telegraf";
import { MyContext } from "../types/context";
import path from "path";

const prisma = new PrismaClient();

export const tripComposer = new Composer<MyContext>();

tripComposer.command("trip", async (ctx) => {
  ctx.session.tripStep = "awaiting_kilometers";
  await ctx.reply("🚗 Введи кілометраж:");
});

tripComposer.on("text", async (ctx, next) => {
  if (!ctx.session.tripStep) return next(); // передаємо далі, якщо trip не активний

  if (ctx.session.tripStep === "awaiting_kilometers") {
    const km = parseFloat(ctx.message.text);
    if (isNaN(km) || km <= 0) {
      return ctx.reply("❌ Введи правильне число");
    }

    ctx.session.kilometers = km;
    ctx.session.tripStep = "awaiting_direction";
    return ctx.reply("🧭 Введи напрямок поїздки:");
  }

  if (ctx.session.tripStep === "awaiting_direction") {
    const direction = ctx.message.text.trim();
    const km = ctx.session.kilometers;

    if (!km) {
      ctx.session.tripStep = null;
      return ctx.reply("⚠️ Почни спочатку — напиши /trip");
    }

    const telegram_user_id = ctx.from?.id.toString();
    if (!telegram_user_id) return ctx.reply("❌ Не вдалося визначити твій Telegram ID.");

    let existingUser = await prisma.user.findUnique({ where: { telegram_user_id } });
    if (!existingUser) {
      existingUser = await prisma.user.create({
        data: {
          telegram_user_id,
          telegram_name: ctx.from?.first_name ?? "Unknown",
          telegram_username: ctx.from?.username ?? undefined,
        },
      });
    }

    await prisma.trip.create({
      data: {
        telegram_user_id,
        kilometrs: km,
        direction,
      },
    });

    await ctx.sendSticker({
      source: path.resolve("assets/stickers/greenLezard.tgs")
    });

    ctx.session.tripStep = null;
    ctx.session.kilometers = undefined;
    ctx.session.direction = undefined;
  }
});
