import { Router } from "express";
import { getCandles } from "../db/queries";
import { Timeframe } from "../types/candles";

const router = Router();

router.get("/:symbol/:timeframe", async (req, res) => {
  try {
    const { symbol, timeframe } = req.params;
    const limit = 100;

    if (!["30s", "1m", "5m", "1h"].includes(timeframe)) {
      return res.status(400).json({
        error: "Invalid timeframe. Use: 30s, 1m, 5m, or 1h",
      });
    }

    const candles = await getCandles(
      symbol.toUpperCase(),
      timeframe as Timeframe,
      limit
    );

    res.json({
      symbol: symbol.toUpperCase(),
      timeframe,
      candles: candles.reverse(),
    });
  } catch (error) {
    console.error("Error in candle endpoint:", error);
    res.status(500).json({ error: "Failed to fetch candles" });
  }
});

export default router;
