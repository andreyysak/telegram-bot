import { SessionData } from "./context";

declare module "telegraf" {
  interface Context {
    session: SessionData;
  }
}
