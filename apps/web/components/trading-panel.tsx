"use client";

import { Settings, TrendingDown, TrendingUp } from "lucide-react";
import { useState } from "react";
import { useOrders } from "../contexts/orders-context";
import { usePrices } from "../contexts/price-context";

interface TradingPanelProps {
  symbol: string;
}

export function TradingPanel({ symbol }: TradingPanelProps) {
  const [orderType, setOrderType] = useState<"market" | "pending">("market");
  const [volume, setVolume] = useState("0.01");
  const [leverage, setLeverage] = useState("1");
  const [stopLoss, setStopLoss] = useState("");
  const [takeProfit, setTakeProfit] = useState("");
  const [activeTab, setActiveTab] = useState<"buy" | "sell">("buy");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Get real-time prices and orders context
  const { prices, isConnected } = usePrices();
  const { placeOrder, error: orderError } = useOrders();
  const priceData = prices[symbol];

  const handlePlaceOrder = async () => {
    if (!priceData || !volume) return;

    setIsPlacingOrder(true);

    try {
      const orderData = {
        type: activeTab,
        asset: symbol,
        openprice: activeTab === "buy" ? priceData.ask : priceData.bid,
        quantity: parseFloat(volume),
        leverage: parseFloat(leverage),
      };

      await placeOrder(orderData);

      // Reset form after successful order
      setVolume("0.01");
      setStopLoss("");
      setTakeProfit("");
    } catch (err) {
      console.error("Failed to place order:", err);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Fallback for when data isn't available yet
  if (!priceData || !isConnected) {
    return (
      <div className="w-80 bg-[#0f1419] border-l border-[#1f2a35] flex flex-col">
        <div className="p-4 border-b border-[#1f2a35]">
          <div className="text-center text-gray-400">Loading price data...</div>
        </div>
      </div>
    );
  }

  // Calculate spread
  const spread = priceData.ask - priceData.bid;

  return (
    <div className="w-80 bg-[#0f1419] border-l border-[#1f2a35] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[#1f2a35]">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-white">{symbol}</h3>
          <button className="p-1 hover:bg-[#1f2a35] rounded text-gray-400 hover:text-white transition-colors">
            <Settings size={14} />
          </button>
        </div>

        {/* Real-time Price Display */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400">Sell (Bid)</span>
            <span className="text-lg font-mono text-red-400">
              {priceData.bid.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 8,
              })}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400">Buy (Ask)</span>
            <span className="text-lg font-mono text-green-400">
              {priceData.ask.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 8,
              })}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            Spread: {spread.toFixed(2)} USD
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">
              Change: {priceData.changePercent.toFixed(2)}%
            </span>
            <div className="flex items-center">
              {priceData.trending === "up" ? (
                <TrendingUp className="w-3 h-3 text-green-400 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-400 mr-1" />
              )}
              <span
                className={
                  priceData.trending === "up"
                    ? "text-green-400"
                    : "text-red-400"
                }
              >
                {priceData.change.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Order Type Tabs */}
      <div className="p-4 border-b border-[#1f2a35]">
        <div className="flex bg-[#1f2a35] rounded p-1">
          <button
            onClick={() => setOrderType("market")}
            className={`flex-1 py-2 px-3 text-sm rounded transition-colors ${
              orderType === "market"
                ? "bg-[#0b0e11] text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Buy
          </button>
          <button
            onClick={() => setOrderType("pending")}
            className={`flex-1 py-2 px-3 text-sm rounded transition-colors ${
              orderType === "pending"
                ? "bg-[#0b0e11] text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Sell
          </button>
        </div>
      </div>

      {/* Trading Form */}
      <div className="flex-1 p-4 space-y-4">
        {/* Volume */}
        <div>
          <label className="block text-xs text-gray-400 mb-2">Volume</label>
          <div className="flex items-center bg-[#1f2a35] rounded">
            <input
              type="number"
              value={volume}
              onChange={(e) => setVolume(e.target.value)}
              className="flex-1 bg-transparent px-3 py-2 text-white text-sm focus:outline-none"
              step="0.01"
              min="0.01"
            />
            <span className="px-3 text-xs text-gray-400">Lots</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            ~${(parseFloat(volume) * 100000).toLocaleString()}
          </div>
        </div>

        {/* Leverage */}
        <div>
          <label className="block text-xs text-gray-400 mb-2">Leverage</label>
          <div className="flex items-center bg-[#1f2a35] rounded">
            <input
              type="number"
              value={leverage}
              onChange={(e) => setLeverage(e.target.value)}
              className="flex-1 bg-transparent px-3 py-2 text-white text-sm focus:outline-none"
              step="1"
              min="1"
              max="100"
            />
            <span className="px-3 text-xs text-gray-400">x</span>
          </div>
        </div>

        {/* Error Display */}
        {orderError && (
          <div className="p-2 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm">
            {orderError}
          </div>
        )}

        {/* Place Order Button */}
        <button
          onClick={handlePlaceOrder}
          disabled={isPlacingOrder || !volume}
          className="w-full cursor-pointer py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded font-medium transition-colors"
        >
          {isPlacingOrder
            ? "Placing Order..."
            : `Place ${activeTab.toUpperCase()} Order`}
        </button>
      </div>
    </div>
  );
}
