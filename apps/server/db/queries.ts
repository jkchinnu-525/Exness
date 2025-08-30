import { Candle, Timeframe } from "../types/candles";
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
