"use client";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";

interface PriceData {
  [symbol: string]: {
    price: number;
    change: number;
    changePercent: number;
    trending: "up" | "down";
    bid: number;
    ask: number;
  };
}

interface PriceContextType {
  prices: PriceData;
  isConnected: boolean;
}

const PriceContext = createContext<PriceContextType>({
  prices: {},
  isConnected: false,
});

export const usePrices = () => useContext(PriceContext);

export function PriceProvider({ children }: { children: ReactNode }) {
  const [prices, setPrices] = useState<PriceData>({});
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io("http://localhost:3001");
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("🔌 Price service connected");
      setIsConnected(true);

      // Subscribe to all symbol trades for real-time prices
      newSocket.emit("subscribe-trades", { symbol: "BTCUSDT" });
      newSocket.emit("subscribe-trades", { symbol: "ETHUSDT" });
      newSocket.emit("subscribe-trades", { symbol: "SOLUSDT" });
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
    });

    newSocket.on("live-trade", (trade: any) => {
      setPrices((prev) => ({
        ...prev,
        [trade.symbol]: {
          price: trade.price,
          change: Math.random() * 10 - 5, // Replace with actual calculation
          changePercent: Math.random() * 2 - 1,
          trending: Math.random() > 0.5 ? "up" : "down",
          bid: trade.price - trade.price * 0.0001,
          ask: trade.price + trade.price * 0.0001,
        },
      }));
    });

    return () => {
      newSocket.close();
    };
  }, []);

  return (
    <PriceContext.Provider value={{ prices, isConnected }}>
      {children}
    </PriceContext.Provider>
  );
}
