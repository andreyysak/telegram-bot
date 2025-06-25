import pool from "./client.js";

export async function getUserId(telegramUserId: number) {
  const result = await pool.query(
    'SELECT id FROM users WHERE telegram_user_id = $1 LIMIT 1',
    [telegramUserId]
  );

  return result.rows[0]?.id || null;
}
