"use client";
import {
  CandlestickSeries,
  createChart,
  type CandlestickData,
  type IChartApi,
  type Time,
} from "lightweight-charts";
import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

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
  const socketRef = useRef<any>(null);
  const candlesRef = useRef<CandlestickData[]>([]);
  const liveCandle = useRef<CandlestickData | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const chart = createChart(ref.current, {
      width: ref.current.clientWidth,
      height: 400,
      layout: { background: { color: "#0b0e11" }, textColor: "#d1d4dc" },
      grid: {
        vertLines: { color: "#1f2a35" },
        horzLines: { color: "#1f2a35" },
      },
      timeScale: {
        rightOffset: 2,
        fixLeftEdge: false,
        fixRightEdge: false,
        borderVisible: false,
      },
      crosshair: { mode: 0 },
    });
    chartRef.current = chart;
    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderUpColor: "#26a69a",
      borderDownColor: "#ef5350",
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
    });

    seriesRef.current = series;

    const loadInitialData = async () => {
      const res = await fetch(
        `http://localhost:3001/api/candles/${symbol}/${timeframe}`,
        { cache: "no-store" }
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
      series.setData(data);
      chart.timeScale().fitContent();
    };

    const setupWebSocket = () => {
      socketRef.current = io("http://localhost:3001");
      socketRef.current.on("connect", () => {
        console.log("Connected to server");
        socketRef.current.emit("subscribe-candles", { symbol, timeframe });
        socketRef.current.emit("subscribe-trades", { symbol });
      });

      socketRef.current.on("candle-update", (candleUpdate: any) => {
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

          // Update historical data
          const existingIndex = candlesRef.current.findIndex(
            (c) => c.time === newCandle.time
          );
          if (existingIndex >= 0) {
            candlesRef.current[existingIndex] = newCandle;
          } else {
            candlesRef.current.push(newCandle);
            candlesRef.current = candlesRef.current.slice(-100);
          }

          updateChart();
        }
      });

      socketRef.current.on("live-trade", (trade: any) => {
        if (trade.symbol === symbol) {
          updateLiveCandle(trade);
        }
      });
    };

    const updateLiveCandle = (trade: any) => {
      const currentTime = getTimeBucket(trade.timestamp, timeframe);
      const candleTime = Math.floor(currentTime / 1000) as Time;

      if (!liveCandle.current || liveCandle.current.time !== candleTime) {
        liveCandle.current = {
          time: candleTime,
          open: trade.price,
          high: trade.price,
          low: trade.price,
          close: trade.price,
        };
      } else {
        liveCandle.current.high = Math.max(
          liveCandle.current.high,
          trade.price
        );
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

      seriesRef.current.setData(allData);
      chart.timeScale().scrollToRealTime();
    };

    loadInitialData();
    setupWebSocket();

    const onResize = () =>
      chart.applyOptions({ width: ref.current!.clientWidth });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      chart.remove();
    };
  }, [symbol, timeframe]);

  return <div ref={ref} style={{ width: "100%", height: 400 }} />;
}
