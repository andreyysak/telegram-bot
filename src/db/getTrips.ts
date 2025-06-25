import { Trip } from "../types/Trip.js";
import pool from "./client.js";

export async function getTrips(userId: number): Promise<Trip[]> {
  const result = await pool.query(
    'SELECT id, kilometers, direction, created_at FROM trips WHERE user_id = $1 ORDER BY created_at ASC',
    [userId]
  )

  return result.rows.map(row => ({
    id: row.id,
    kilometers: Number(row.kilometers),
    direction: row.direction,
    created_at: new Date(row.created_at)
  }));
}