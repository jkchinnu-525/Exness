"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./auth-context";
import { useOrders } from "./orders-context";

interface BalanceContextType {
  totalBalance: number;
  isLoading: boolean;
  error: string | null;
  refreshBalance: () => Promise<void>;
}

const BalanceContext = createContext<BalanceContextType>({
  totalBalance: 5000, // Provide a default value
  isLoading: false,
  error: null,
  refreshBalance: async () => {},
});

export const useBalance = () => useContext(BalanceContext);

export function BalanceProvider({ children }: { children: React.ReactNode }) {
  const [originalBalance, setOriginalBalance] = useState(5000); // This is the original balance before any orders
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, token } = useAuth();
  const { orders } = useOrders();

  const fetchBalance = async () => {
    if (!user || !token) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:3001/api/order/balance", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch balance");
      }

      const data = await response.json();

      // For dynamic balance, we want to show the original balance + unrealized P&L
      // The server returns the current balance after deductions, but we want to show
      // what the balance would be if we closed all positions right now

      // Calculate what the original balance was by adding back the market value of open positions
      let calculatedOriginalBalance = data.balance;

      // Add back the market value of all open positions to get the original balance
      orders.forEach((order: any) => {
        calculatedOriginalBalance += order.marketValue;
      });

      setOriginalBalance(calculatedOriginalBalance);

      console.log("�� Balance fetched:", {
        serverBalance: data.balance,
        calculatedOriginalBalance,
        ordersCount: orders.length,
        ordersMarketValue: orders.reduce((sum, o) => sum + o.marketValue, 0),
      });
    } catch (err) {
      console.error("❌ Error fetching balance:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch balance");
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate total balance: Original balance + unrealized P&L
  const calculateTotalBalance = () => {
    let totalValue = originalBalance;

    // Add unrealized P&L from all open positions
    orders.forEach((order: any) => {
      totalValue += order.profit; // Add the profit/loss
    });

    console.log("💰 Balance calculation:", {
      originalBalance,
      ordersCount: orders.length,
      totalValue,
      orders: orders.map((o) => ({
        symbol: o.asset,
        quantity: o.quantity,
        openPrice: o.openprice,
        currentPrice: o.currentPrice,
        profit: o.profit,
        marketValue: o.marketValue,
      })),
    });

    return totalValue;
  };

  const totalBalance = calculateTotalBalance();

  useEffect(() => {
    if (user && token) {
      fetchBalance();
    }
  }, [user, token]);

  // Refresh balance when orders change (number of orders)
  useEffect(() => {
    if (user && token) {
      fetchBalance();
    }
  }, [orders.length]);

  // Recalculate balance whenever orders data changes (including price updates)
  useEffect(() => {
    // This will trigger whenever the orders array changes, including price updates
    console.log("🔄 Orders updated, recalculating balance...");
  }, [orders]);

  const refreshBalance = async () => {
    await fetchBalance();
  };

  return (
    <BalanceContext.Provider
      value={{
        totalBalance,
        isLoading,
        error,
        refreshBalance,
      }}
    >
      {children}
    </BalanceContext.Provider>
  );
}
