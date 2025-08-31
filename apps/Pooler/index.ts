import { createClient } from "redis";
import { client, connectDB } from "./db/connection";
import { integerToPrice } from "./utils/price";

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
    startCandleBroadcasting();
  } catch (err) {
    console.error("Redis connection failed:", err);
  }
}

function processTrade(trade: any) {
  const { symbol, price: priceInteger, timestamp } = trade;
  const price = integerToPrice(priceInteger);

  storeTrade(trade);

  const intervals = [30, 60, 300, 3600];
  intervals.forEach((interval) => {
    const bucketKey = `${symbol}_${interval}`;
    const currentBucketStart =
      Math.floor(timestamp / (interval * 1000)) * (interval * 1000);

    const existingCandle = candles.get(bucketKey);
    if (existingCandle && existingCandle.startTime < currentBucketStart) {
      console.log(
        `Completed candle: ${bucketKey} (${existingCandle.startTime} -> ${currentBucketStart})`,
      );
      candles.delete(bucketKey);
    }

    if (!candles.has(bucketKey)) {
      candles.set(bucketKey, {
        symbol,
        interval,
        startTime: currentBucketStart,
        open: price,
        high: price,
        low: price,
        close: price,
      });
      console.log(` Created new candle: ${bucketKey}`);
    } else {
      const candle = candles.get(bucketKey);
      candle.high = Math.max(candle.high, price);
      candle.low = Math.min(candle.low, price);
      candle.close = price;
      console.log(` Updated candle: ${bucketKey}`);
    }
  });
}

async function broadcastCandleUpdates() {
  const timeframes = ["30s", "1m", "5m", "1h"];
  const symbols = ["BTCUSDT", "ETHUSDT", "SOLUSDT"];
  const intervals = [30, 60, 300, 3600];

  for (const symbol of symbols) {
    timeframes.forEach(async (timeframe, index) => {
      const interval = intervals[index];
      const bucketKey = `${symbol}_${interval}`;
      const currentCandle = candles.get(bucketKey);

      if (currentCandle) {
        const candleData = {
          time: currentCandle.startTime,
          symbol: currentCandle.symbol,
          timeframe,
          open: currentCandle.open,
          high: currentCandle.high,
          low: currentCandle.low,
          close: currentCandle.close,
          source: "snapshot",
          timestamp: Date.now(),
        };

        try {
          await publisher.publish(
            "candle-snapshots",
            JSON.stringify(candleData),
          );
        } catch (error) {
          console.error(
            `Error broadcasting snapshot for ${symbol} ${timeframe}:`,
            error,
          );
        }
      }
    });
  }
}

async function startCandleBroadcasting() {
  setInterval(broadcastCandleUpdates, 250);
  console.log("Started candle broadcasting every 250ms");
}

async function storeTrade(trade: any) {
  try {
    await client.query(
      `INSERT INTO CANDLE_TABLE (time, symbol, price, high, low, open, close)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        new Date(trade.timestamp),
        trade.symbol,
        trade.price,
        trade.price,
        trade.price,
        trade.price,
        trade.price,
      ],
    );
    console.log(`Stored trade for ${trade.symbol} at ${trade.timestamp}`);
  } catch (err) {
    console.error("Error storing trade:", err);
  }
}

startConsumer();
