"use client";
import {
  CandlestickSeries,
  createChart,
  type CandlestickData,
  type IChartApi,
  type Time,
} from "lightweight-charts";
import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

type TF = "30s" | "1m" | "5m" | "1h";

function getTimeBucket(timestamp: number, timeframe: TF): number {
  const intervals = {
    "30s": 30000,
    "1m": 60000,
    "5m": 300000,
    "1h": 3600000,
  };
  const interval = intervals[timeframe];
  return Math.floor(timestamp / interval) * interval;
}

export default function Candles({
  symbol = "BTCUSDT",
  timeframe = "1m" as TF,
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<any>(null);
  const socketRef = useRef<Socket | null>(null);
  const candlesRef = useRef<CandlestickData[]>([]);
  const liveCandle = useRef<CandlestickData | null>(null);
  const currentSubscription = useRef<{
    symbol: string;
    timeframe: string;
  } | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const chart = createChart(ref.current, {
      width: ref.current.clientWidth,
      height: 500,
      layout: {
        background: { color: "#0b0e11" },
        textColor: "#d1d4dc",
        fontSize: 12,
        fontFamily: "'Trebuchet MS', sans-serif",
      },
      grid: {
        vertLines: {
          color: "#1f2a35",
          style: 1,
          visible: true,
        },
        horzLines: {
          color: "#1f2a35",
          style: 1,
          visible: true,
        },
      },
      timeScale: {
        rightOffset: 10,
        barSpacing: 20,
        fixLeftEdge: false,
        fixRightEdge: false,
        borderVisible: false,
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderVisible: false,
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: "#758696",
          width: 1,
          style: 3,
          visible: true,
          labelVisible: true,
        },
        horzLine: {
          color: "#758696",
          width: 1,
          style: 3,
          visible: true,
          labelVisible: true,
        },
      },
    });
    chartRef.current = chart;
    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#00C896",
      downColor: "#FF5252",
      borderUpColor: "#00C896",
      borderDownColor: "#FF5252",
      wickUpColor: "#00C896",
      wickDownColor: "#FF5252",
      borderVisible: true,
      wickVisible: true,
      priceLineVisible: true,
    });

    seriesRef.current = series;

    const onResize = () => {
      if (ref.current) {
        chart.applyOptions({
          width: ref.current.clientWidth,
          height: 500,
        });
      }
    };

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      chart.remove();
    };
  }, []);

  useEffect(() => {
    socketRef.current = io("http://localhost:3001");
    socketRef.current.on("connect", () => {
      console.log("Websocket Connected for charts");
    });

    socketRef.current.on("candle-snapshot", (candleUpdate: any) => {
      if (
        candleUpdate.symbol === symbol &&
        candleUpdate.timeframe === timeframe
      ) {
        const newCandle: CandlestickData = {
          time: Math.floor(Number(candleUpdate.time) / 1000) as Time,
          open: Number(candleUpdate.open),
          high: Number(candleUpdate.high),
          low: Number(candleUpdate.low),
          close: Number(candleUpdate.close),
        };

        const shouldUpdate =
          !liveCandle.current ||
          liveCandle.current.time < newCandle.time ||
          (liveCandle.current.time === newCandle.time &&
            candleUpdate.source === "snapshot");

        if (shouldUpdate) {
          const existingIndex = candlesRef.current.findIndex(
            (c) => c.time === newCandle.time
          );
          if (existingIndex >= 0) {
            if (
              !liveCandle.current ||
              liveCandle.current.time !== newCandle.time
            ) {
              candlesRef.current[existingIndex] = newCandle;
              updateChart();
            }
          } else {
            candlesRef.current.push(newCandle);
            candlesRef.current = candlesRef.current.slice(-100);
            updateChart();
          }
        }
      }
    });

    socketRef.current.on("live-trade", (trade: any) => {
      if (trade.symbol === symbol) {
        updateLiveCandle(trade);
      }
    });
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (!socketRef.current) return;

    const handleLiveTrade = (trade: any) => {
      if (trade.symbol === symbol) {
        updateLiveCandle(trade);
      }
    };

    socketRef.current.off("live-trade", handleLiveTrade);

    socketRef.current.on("live-trade", handleLiveTrade);

    return () => {
      if (socketRef.current) {
        socketRef.current.off("live-trade", handleLiveTrade);
      }
    };
  }, [symbol]);

  useEffect(() => {
    if (!socketRef.current) return;

    const loadInitialData = async () => {
      try {
        const res = await fetch(
          `http://localhost:3001/api/candles/${symbol}/${timeframe}`,
          {
            cache: "no-store",
          }
        );
        const json = await res.json();
        const data: CandlestickData[] = json.candles.map((c: any) => ({
          time: Math.floor(Number(c.time) / 1000) as Time,
          open: Number(c.open),
          high: Number(c.high),
          low: Number(c.low),
          close: Number(c.close),
        }));

        candlesRef.current = data;
        seriesRef.current?.setData(data);

        if (data.length > 0 && chartRef.current) {
          const from = Math.max(0, data.length - 25);
          const timeScale = chartRef.current.timeScale();
          const startCandle = data[from] || data[0];
          const endCandle = data[data.length - 1];
          if (startCandle && endCandle) {
            timeScale.setVisibleRange({
              from: startCandle.time,
              to: endCandle.time,
            });
          }
        }
      } catch (error) {
        console.error("Failed to load candle data:", error);
      }
    };

    const updateSubscription = () => {
      if (!socketRef.current?.connected) return;

      if (currentSubscription.current) {
        socketRef.current.emit(
          "unsubscribe-candles",
          currentSubscription.current
        );
        socketRef.current.emit("unsubscribe-trades", {
          symbol: currentSubscription.current.symbol,
        });
      }

      socketRef.current.emit("subscribe-candles", { symbol, timeframe });
      socketRef.current.emit("subscribe-trades", { symbol });

      currentSubscription.current = { symbol, timeframe };
    };

    liveCandle.current = null;

    loadInitialData();

    if (socketRef.current.connected) {
      updateSubscription();
    } else {
      socketRef.current.on("connect", updateSubscription);
    }
  }, [symbol, timeframe]);

  const updateLiveCandle = (trade: any) => {
    const currentTime = getTimeBucket(trade.timestamp, timeframe);
    const candleTime = Math.floor(currentTime / 1000) as Time;

    // ✅ FIXED: Persist completed candle when time period changes
    if (liveCandle.current && liveCandle.current.time !== candleTime) {
      // Save completed candle to historical data
      const completedCandle = liveCandle.current; // Store reference before null check
      const existingIndex = candlesRef.current.findIndex(
        (c) => c.time === completedCandle.time
      );
      
      if (existingIndex >= 0) {
        // Update existing candle in history
        candlesRef.current[existingIndex] = completedCandle;
      } else {
        // Add new candle to history
        candlesRef.current.push(completedCandle);
        candlesRef.current = candlesRef.current.slice(-100); // Keep last 100
      }
      
      console.log(`Persisted completed candle: ${completedCandle.time}`);
    }

    // Create new candle or update existing one
    if (!liveCandle.current || liveCandle.current.time !== candleTime) {
      liveCandle.current = {
        time: candleTime,
        open: trade.price,
        high: trade.price,
        low: trade.price,
        close: trade.price,
      };
      console.log(`Started new live candle: ${candleTime}`);
    } else {
      liveCandle.current.high = Math.max(liveCandle.current.high, trade.price);
      liveCandle.current.low = Math.min(liveCandle.current.low, trade.price);
      liveCandle.current.close = trade.price;
    }
    updateChart();
  };

  const updateChart = () => {
    let allData = [...candlesRef.current];
    if (liveCandle.current) {
      const lastIndex = allData.findIndex(
        (c) => c.time === liveCandle.current!.time
      );
      if (lastIndex >= 0) {
        allData[lastIndex] = liveCandle.current;
      } else {
        allData.push(liveCandle.current);
      }
    }
    seriesRef.current?.setData(allData);
    if (chartRef.current) {
      chartRef.current.timeScale().scrollToRealTime();
    }
  };

  return (
    <div
      ref={ref}
      style={{
        width: "100%",
        height: 500,
        position: "relative",
        backgroundColor: "#0b0e11",
      }}
    />
  );
}
