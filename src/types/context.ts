import { Context } from "telegraf";

export interface SessionData {
  user_id?: number;
  telegram_user_id?: string;
  name?: string;
  phone?: string;
  step?: "awaiting_kilometers" | "awaiting_direction";
  kilometers?: number;
  direction?: string;
  fuel?: 'awaiting_liters' | 'awaiting_price' | 'awaiting_station';
  liters?: number;
  price?: number;
  station?: string;
}


export interface MyContext extends Context {
  session: SessionData;
}
