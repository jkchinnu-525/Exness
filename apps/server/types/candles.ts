export interface Candle {
  time: Date;
  symbol: string;
  open: number;
  close: number;
  high: number;
  low: number;
}

export interface CandleResponse {
  symbol: string;
  timeframe: string;
  candles: Candle[];
}

export type Timeframe = "30s" | "1m" | "5m" | "1h";
