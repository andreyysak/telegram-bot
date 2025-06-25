import { GasRefuel } from "../types/GasRefuel.js";
import pool from "./client.js";

export async function getGasRefuels(userId: number): Promise<GasRefuel[]> {
  const result = await pool.query(
    'SELECT id, liters, total_price, station, created_at FROM gas_refuels WHERE user_id = $1 ORDER BY created_at ASC',
    [userId]
  );

  return result.rows.map(row => ({
    id: row.id,
    liters: Number(row.liters),
    totalPrice: Number(row.total_price),
    station: row.station,
    created_at: new Date(row.created_at)
  }));
}