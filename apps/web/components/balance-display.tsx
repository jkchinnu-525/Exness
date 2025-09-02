"use client";
import { useBalance } from "@/contexts/balance-context";

export function BalanceDisplay() {
  const { totalBalance, isLoading } = useBalance();

  if (isLoading) {
    return <div className="text-center text-gray-400">Loading balance...</div>;
  }

  return (
    <div className="space-y-2">
      <div className="text-sm text-gray-400">Welcome,</div>
      <div className="flex items-center gap-2">
        <span className="text-lg font-semibold text-white">
          Balance: $
          {totalBalance.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      </div>
    </div>
  );
}
