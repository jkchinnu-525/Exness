import { Candle, Timeframe } from "../types/candles";
import { CreateUserRequest, User } from "../types/user";
import { query } from "./connection";

export async function getCandles(
  symbol: string,
  timeframe: Timeframe,
  limit: number = 100
): Promise<Candle[]> {
  try {
    let tableName: string;
    switch (timeframe) {
      case "30s":
        tableName = "candles_30s";
        break;
      case "1m":
        tableName = "candles_1m";
        break;
      case "5m":
        tableName = "candles_5m";
        break;
      case "1h":
        tableName = "candles_1h";
        break;
      default:
        throw new Error(`Invalid timeframe: ${timeframe}`);
    }

    const result = await query(
      `SELECT (EXTRACT(EPOCH FROM bucket) * 1000)::bigint AS time, symbol, open, high, low, close
             FROM ${tableName}
             WHERE symbol = $1
             ORDER BY bucket DESC
             LIMIT $2`,
      [symbol, limit]
    );
    return result.rows.map((row) => ({
      time: row.time,
      symbol: row.symbol,
      open: parseFloat(row.open),
      high: parseFloat(row.high),
      low: parseFloat(row.low),
      close: parseFloat(row.close),
    }));
  } catch (error) {
    console.error("Error fetching candles:", error);
    throw error;
  }
}

// User queries
export async function createUser(
  userData: CreateUserRequest & { password_hash: string }
): Promise<User> {
  try {
    const result = await query(
      `INSERT INTO users (email, password_hash, full_name)
       VALUES ($1, $2, $3)
       RETURNING id, email, full_name, demo_balance, created_at, updated_at`,
      [userData.email, userData.password_hash, userData.full_name]
    );
    return result.rows[0];
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

export async function getUserByEmail(
  email: string
): Promise<(User & { password_hash: string }) | null> {
  try {
    const result = await query(
      `SELECT id, email, password_hash, full_name, demo_balance, created_at, updated_at
       FROM users
       WHERE email = $1`,
      [email]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error("Error fetching user by email:", error);
    throw error;
  }
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    const result = await query(
      `SELECT id, email, full_name, demo_balance, created_at, updated_at
       FROM users
       WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error("Error fetching user by id:", error);
    throw error;
  }
}
