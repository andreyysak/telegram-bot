"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupStartCommand = setupStartCommand;
const telegraf_1 = require("telegraf");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
function setupStartCommand(bot) {
    bot.start(async (ctx) => {
        const name = `${ctx.from.first_name || ""} ${ctx.from.last_name || ""}`.trim();
        await ctx.reply(`👋 Привіт, ${name}!\n\nБудь ласка, поділися своїм номером телефону, щоб продовжити.`, telegraf_1.Markup.keyboard([
            [telegraf_1.Markup.button.contactRequest("📱 Надіслати номер телефону")],
        ])
            .oneTime()
            .resize());
    });
    bot.on("contact", async (ctx) => {
        const contact = ctx.message.contact;
        const telegramId = ctx.from.id.toString();
        const telegramUsername = ctx.from.username || null;
        const telegramName = `${ctx.from.first_name || ""} ${ctx.from.last_name || ""}`.trim();
        const user = await prisma.user.upsert({
            where: { telegram_user_id: telegramId },
            update: {
                phone: contact.phone_number,
                telegram_username: telegramUsername,
                telegram_name: telegramName,
            },
            create: {
                telegram_user_id: telegramId,
                telegram_username: telegramUsername,
                telegram_name: telegramName,
                phone: contact.phone_number,
            },
        });
        ctx.session = {
            user_id: user.user_id,
            telegram_user_id: user.telegram_user_id,
            name: user.telegram_name ?? undefined,
            phone: user.phone ?? undefined,
        };
        await ctx.reply("✅ Дякую! Ви успішно зареєстровані", telegraf_1.Markup.removeKeyboard());
        await ctx.reply("🚀 Можеш тепер користуватись ботом");
    });
}
