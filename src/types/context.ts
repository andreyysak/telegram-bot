import { Context } from "telegraf";
import { SessionData } from "./telegraf";

export interface MyContext extends Context {
  session: SessionData;
}
