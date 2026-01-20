import { Context } from "telegraf";

export interface SessionData {
  user_id?: number;
  telegram_user_id?: string;
  name?: string;
  phone?: string;
  tripStep?: "awaiting_kilometers" | "awaiting_direction" | null;
  fuelStep?: "awaiting_liters" | "awaiting_price" | "awaiting_station" | null;
  kilometers?: number;
  direction?: string;
  liters?: number;
  price?: number;
  station?: string;
  balanceStep: 'awaiting_balance' | null;
  maintenanceStep?: 'awaiting_description' | 'awaiting_odometer';
  maintenanceDescription?: string;
  maintenanceOdometer?: number;
}

export interface MyContext extends Context {
  session: SessionData;
}
