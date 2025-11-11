"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startTripCommand = startTripCommand;
const client_1 = require("@prisma/client");
const path_1 = __importDefault(require("path"));
const prisma = new client_1.PrismaClient();
function startTripCommand(bot) {
    bot.command("trip", async (ctx) => {
        ctx.session.step = "awaiting_kilometers";
        await ctx.reply("🚗 Введи кілометраж:");
    });
    bot.on("text", async (ctx) => {
        if (ctx.session.step === "awaiting_kilometers") {
            const km = parseFloat(ctx.message.text);
            if (isNaN(km) || km <= 0) {
                return ctx.reply("❌ Введи правильне число");
            }
            ctx.session.kilometers = km;
            ctx.session.step = "awaiting_direction";
            return ctx.reply("🧭 Введи напрямок поїздки:");
        }
        if (ctx.session.step === "awaiting_direction") {
            const direction = ctx.message.text.trim();
            const km = ctx.session.kilometers;
            if (!km) {
                ctx.session.step = undefined;
                return ctx.reply("⚠️ Почни спочатку — напиши /trip");
            }
            const telegram_user_id = ctx.from?.id.toString();
            if (!telegram_user_id) {
                return ctx.reply("❌ Не вдалося визначити твій Telegram ID.");
            }
            const existingUser = await prisma.user.findUnique({
                where: { telegram_user_id },
            });
            if (!existingUser) {
                await prisma.user.create({
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
                source: path_1.default.join(__dirname, "../assets/stickers/greenLezard.tgs")
            });
            ctx.session.step = undefined;
            ctx.session.kilometers = undefined;
            ctx.session.direction = undefined;
        }
    });
}
