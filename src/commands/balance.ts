import { PrismaClient } from "@prisma/client";
import { Composer } from "telegraf";
import { MyContext } from "../types/context";

const prisma = new PrismaClient();
export const balanceComposer = new Composer<MyContext>();

balanceComposer.command("balance", async (ctx) => {
    const telegramId = ctx.from?.id.toString();

    if (!telegramId) {
        return ctx.reply("❌ Не вдалося визначити ваш Telegram ID");
    }

    try {
        const userWithAccounts = await prisma.user.findUnique({
            where: { telegram_user_id: telegramId },
            include: {
                accounts: true,
            },
        });

        if (!userWithAccounts) {
            return ctx.reply("❌ Користувача не знайдено в базі даних.");
        }

        if (!userWithAccounts.accounts || userWithAccounts.accounts.length === 0) {
            return ctx.reply("💳 У вас ще не додано жодного рахунку.");
        }

        let message = "💰 **Ваш баланс:**\n\n";
        let totalUAH = 0;

        userWithAccounts.accounts.forEach((acc) => {
            message += `🔹 ${acc.name}: ${acc.balance.toLocaleString()} ${acc.currency}\n`;

            if (acc.currency === "UAH") {
                totalUAH += acc.balance;
            }
        });

        if (userWithAccounts.accounts.length > 1) {
            message += `\n📊 Разом (UAH): ${totalUAH.toLocaleString()} UAH`;
        }

        await ctx.replyWithMarkdown(message);
    } catch (error) {
        console.error("Balance error:", error);
        await ctx.reply("❌ Помилка при отриманні балансу.");
    }
});