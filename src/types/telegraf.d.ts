export interface SessionData {
  user_id?: number;
  telegram_user_id?: string;
  name?: string;
  phone?: string;

  step?: "awaiting_kilometers" | "awaiting_direction";
  kilometers?: number;
  direction?: string;
}
