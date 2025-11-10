import { Telegraf } from "telegraf";
import { setupStartCommand } from "./start";
import { setupHelpCommand } from "./help";

export function setupCommands(bot: Telegraf) {
  setupStartCommand(bot);
  setupHelpCommand(bot);
}
