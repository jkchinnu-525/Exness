export interface Candle {
  time: number;
  symbol: string;
  open: number;
  close: number;
  high: number;
  low: number;
}

export type Timeframe = "30s" | "1m" | "5m" | "1h";
