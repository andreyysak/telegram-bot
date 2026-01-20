import { PrismaClient } from "@prisma/client";
import { Composer } from "telegraf";
import { MyContext } from "../types/context";

const prisma = new PrismaClient();
export const maintenanceComposer = new Composer<MyContext>();

maintenanceComposer.command("maintenance", async (ctx) => {
    ctx.session.maintenanceStep = "awaiting_description";
    await ctx.reply("🔧 Що саме було зроблено по автомобілю?\n(наприклад: Заміна мастила та фільтрів)");
});

maintenanceComposer.on("text", async (ctx, next) => {
    const step = ctx.session.maintenanceStep;
    if (!step) return next();

    const text = ctx.message.text.trim();

    if (step === "awaiting_description") {
        if (text.length < 3) return ctx.reply("❌ Опис занадто короткий. Напиши детальніше:");

        ctx.session.maintenanceDescription = text;
        ctx.session.maintenanceStep = "awaiting_odometer";
        return ctx.reply("📍 Введи поточний пробіг (тільки цифри):");
    }

    if (step === "awaiting_odometer") {
        const odometer = parseInt(text);
        if (isNaN(odometer) || odometer <= 0) {
            return ctx.reply("❌ Введи коректне число для пробігу:");
        }

        ctx.session.maintenanceOdometer = odometer;

        try {
            const telegramId = ctx.from?.id.toString();
            const user = await prisma.user.findUnique({
                where: { telegram_user_id: telegramId }
            });

            if (!user) {
                ctx.session.maintenanceStep = undefined;
                return ctx.reply("❌ Користувача не знайдено. Спочатку натисніть /start");
            }

            await prisma.maintenance.create({
                data: {
                    user_id: user.user_id,
                    description: ctx.session.maintenanceDescription!,
                    odometer: ctx.session.maintenanceOdometer!,
                    date: new Date(),
                },
            });

            ctx.session.maintenanceStep = undefined;
            ctx.session.maintenanceDescription = undefined;
            ctx.session.maintenanceOdometer = undefined;

            return ctx.reply("✅ Запис про сервіс успішно збережено!");
        } catch (error) {
            console.error("Maintenance Error:", error);
            return ctx.reply("❌ Помилка при збереженні даних.");
        }
    }
});