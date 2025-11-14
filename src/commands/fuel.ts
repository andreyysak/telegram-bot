import { PrismaClient } from "@prisma/client";
import { Composer } from "telegraf";
import { MyContext } from "../types/context";
import path from "path";

const prisma = new PrismaClient();
export const fuelComposer = new Composer<MyContext>();

fuelComposer.command("fuel", async (ctx) => {
  ctx.session.fuelStep = "awaiting_liters";
  await ctx.reply("🪫 Введи кількість літрів:");
});

fuelComposer.on("text", async (ctx, next) => {
  if (!ctx.session.fuelStep) return next();

  if (ctx.session.fuelStep === "awaiting_liters") {
    const liters = parseFloat(ctx.message.text);
    if (isNaN(liters) || liters <= 0) return ctx.reply("❌ Введи правильне число");

    ctx.session.liters = liters;
    ctx.session.fuelStep = "awaiting_price";
    return ctx.reply("💰 Введи вартість:");
  }

  if (ctx.session.fuelStep === "awaiting_price") {
    const price = parseFloat(ctx.message.text);
    if (isNaN(price) || price <= 0) return ctx.reply("❌ Введи правильну суму");

    ctx.session.price = price;
    ctx.session.fuelStep = "awaiting_station";
    return ctx.reply("⛽ Введи назву заправки (OKKO, WOG, UPG):");
  }

  if (ctx.session.fuelStep === "awaiting_station") {
    const station = ctx.message.text.trim().toUpperCase();
    if (!station) return ctx.reply("❌ Введи назву заправки");

    const liters = ctx.session.liters;
    const price = ctx.session.price;
    if (!liters || !price) {
      ctx.session.fuelStep = null;
      return ctx.reply("⚠️ Почни спочатку — напиши /fuel");
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

    await prisma.fuel.create({
      data: { user_id: existingUser.user_id, liters, price, station },
    });

    const stickerPath = path.resolve("assets/stickers/snowman.tgs");
    await ctx.sendSticker({ source: stickerPath });

    ctx.session.fuelStep = null;
    ctx.session.liters = undefined;
    ctx.session.price = undefined;
    ctx.session.station = undefined;
  }
});
