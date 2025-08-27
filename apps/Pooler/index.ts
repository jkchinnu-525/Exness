import { createClient } from "redis";
import { client, connectDB } from "./db/connection";
const subscriber = createClient({
  url: "redis://localhost:6379",
});

const publisher = createClient({
  url: "redis://localhost:6379",
});

const candles = new Map<string, any>();

async function startConsumer() {
  try {
    await connectDB();
    await subscriber.connect();
    await publisher.connect();
    console.log("Connected to Redis");
    await subscriber.subscribe("trades", (message) => {
      const trade = JSON.parse(message);
      processTrade(trade);
    });
  } catch (err) {
    console.error("Redis connection failed:", err);
  }
}

function processTrade(trade: any) {
  const { symbol, price, timestamp } = trade;
  const intervals = [30, 60, 300, 1000];
  intervals.forEach((interval) => {
    const bucketKey = `${symbol}_${interval}`;
    const bucketStart =
      Math.floor(timestamp / (interval * 1000)) * (interval * 1000);

    if (!candles.has(bucketKey)) {
      candles.set(bucketKey, {
        symbol,
        interval,
        startTime: bucketStart,
        open: price,
        high: price,
        low: price,
        close: price,
      });
    } else {
      const candle = candles.get(bucketKey);
      candle.high = Math.max(candle.high, price);
      candle.low = Math.min(candle.low, price);
      candle.close = price;
    }

    const now = Date.now();
    const bucketEnd = bucketStart + interval * 1000;
    if (now >= bucketEnd) {
      const completedCandle = candles.get(bucketKey);
      candles.delete(bucketKey);
      publisher.publish("completed_candles", JSON.stringify(completedCandle));
      storeCandle(completedCandle);
    }
  });
}

async function storeCandle(candle: any) {
  try {
    await client.query(
      `INSERT INTO candle_table (time, symbol, price, high, low, open, close)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        new Date(candle.startTime),
        candle.symbol,
        candle.close,
        candle.high,
        candle.low,
        candle.open,
        candle.close,
      ]
    );
    console.log(`Stored candle for ${candle.symbol} at ${candle.startTime}`);
  } catch (err) {
    console.error("Error storing candle:", err);
  }
}

startConsumer();
