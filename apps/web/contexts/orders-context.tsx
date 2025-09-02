"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./auth-context";
import { usePrices } from "./price-context";

interface Order {
  orderId: string;
  userId: string;
  type: "buy" | "sell";
  asset: string;
  openprice: number;
  quantity: number;
  security?: number;
  leverage?: number;
  exposure?: number;
  openTime: string;
}

interface orderWithPL extends Order {
  currentPrice: number;
  profit: number;
  profitPercent: number;
  marketValue: number;
}

interface OrdersContextType {
  orders: orderWithPL[];
  isLoading: boolean;
  error: null | string;
  placeOrder: (orderData: any) => Promise<void>;
  closeOrder: (orderId: string) => Promise<void>;
  refreshOrders: () => void;
}

const orderContext = createContext<OrdersContextType>({
  orders: [],
  isLoading: false,
  error: null,
  placeOrder: async () => {},
  closeOrder: async () => {},
  refreshOrders: () => {},
});

export const useOrders = () => useContext(orderContext);

export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<orderWithPL[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(false);
  const { user, token } = useAuth();
  const { prices } = usePrices();

  const fetchOrders = async () => {
    if (!user || !token) return;

    try {
      const response = await fetch("http://localhost:3001/api/order/active", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch orders");
      }

      const data = await response.json();
      console.log("📦 Orders fetched:", data);

      if (data.success && data.orders) {
        const ordersWithPL = data.orders.map(calculateOrderPL);
        setOrders(ordersWithPL);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const placeOrder = async (orderData: any) => {
    if (!user || !token) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:3001/api/order/open", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to place order");
      }

      const responseData = await response.json();

      if (responseData.success) {
        await fetchOrders();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to place order");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const closeOrder = async (orderId: string) => {
    if (!user || !token) return;
    setLoading(true);
    setError(null);

    try {
      const order = orders.find((o) => o.orderId === orderId);
      if (!order) throw new Error("Order not found");

      // Get the REAL-TIME price at the moment of closing
      const priceData = prices[order.asset];
      let realTimeClosePrice: number;

      if (priceData) {
        // Use the appropriate price based on order type
        if (order.type === "buy") {
          // For BUY orders, use BID price (what you can sell at)
          realTimeClosePrice = priceData.bid;
        } else {
          // For SELL orders, use ASK price (what you can buy at)
          realTimeClosePrice = priceData.ask;
        }
      } else {
        // Fallback to the current price from the order
        realTimeClosePrice = order.currentPrice;
      }

      const response = await fetch("http://localhost:3001/api/order/close", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderId,
          closePrice: realTimeClosePrice,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to close order");
      }

      const responseData = await response.json();

      await fetchOrders();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to close order");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refreshOrders = () => {
    fetchOrders();
  };

  const calculateOrderPL = (order: Order): orderWithPL => {
    const priceData = prices[order.asset];

    // Use the appropriate price for display based on order type
    let currentPrice: number;
    if (priceData) {
      if (order.type === "buy") {
        // For BUY orders, show BID price (what you can sell at)
        currentPrice = priceData.bid;
      } else {
        // For SELL orders, show ASK price (what you can buy at)
        currentPrice = priceData.ask;
      }
    } else {
      currentPrice = order.openprice;
    }

    const safeCurrentPrice =
      typeof currentPrice === "number" && !isNaN(currentPrice)
        ? currentPrice
        : order.openprice;

    const priceChange =
      order.type === "buy"
        ? safeCurrentPrice - order.openprice
        : order.openprice - safeCurrentPrice;

    const profit = priceChange * order.quantity;
    const profitpercentage = (priceChange / order.openprice) * 100;
    const marketPrice = order.quantity * safeCurrentPrice;

    return {
      ...order,
      currentPrice: safeCurrentPrice,
      profit,
      profitPercent: profitpercentage,
      marketValue: marketPrice,
    };
  };
  useEffect(() => {
    if (orders.length > 0) {
      const updatedOrders = orders.map(calculateOrderPL);
      setOrders(updatedOrders);
    }
  }, [prices]);

  useEffect(() => {
    if (user && token) {
      fetchOrders();
    }
  }, [user, token]);

  return (
    <orderContext.Provider
      value={{
        orders,
        isLoading,
        error,
        placeOrder,
        closeOrder,
        refreshOrders,
      }}
    >
      {children}
    </orderContext.Provider>
  );
}
