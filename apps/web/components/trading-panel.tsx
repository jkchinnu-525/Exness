"use client";

import { Settings, TrendingDown, TrendingUp } from "lucide-react";
import { useState } from "react";

interface TradingPanelProps {
  symbol: string;
}

export function TradingPanel({ symbol }: TradingPanelProps) {
  const [orderType, setOrderType] = useState<"market" | "pending">("market");
  const [volume, setVolume] = useState("0.01");
  const [stopLoss, setStopLoss] = useState("");
  const [takeProfit, setTakeProfit] = useState("");
  const [activeTab, setActiveTab] = useState<"buy" | "sell">("buy");

  // Mock data
  const mockPrice =
    symbol === "BTCUSDT"
      ? "110,911.02"
      : symbol === "XAUUSD"
        ? "3,384.518"
        : "1.15916";
  const spread = symbol === "BTCUSDT" ? "21.60" : "0.002";

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

        {/* Price Display */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400">Sell</span>
            <span className="text-lg font-mono text-red-400">{mockPrice}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400">Buy</span>
            <span className="text-lg font-mono text-green-400">
              {mockPrice}
            </span>
          </div>
          <div className="text-xs text-gray-500">Spread: {spread} USD</div>
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
            Market
          </button>
          <button
            onClick={() => setOrderType("pending")}
            className={`flex-1 py-2 px-3 text-sm rounded transition-colors ${
              orderType === "pending"
                ? "bg-[#0b0e11] text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Pending
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

        {/* Stop Loss */}
        <div>
          <label className="block text-xs text-gray-400 mb-2">Stop Loss</label>
          <div className="flex items-center bg-[#1f2a35] rounded">
            <input
              type="text"
              value={stopLoss}
              onChange={(e) => setStopLoss(e.target.value)}
              placeholder="Not set"
              className="flex-1 bg-transparent px-3 py-2 text-white text-sm focus:outline-none placeholder-gray-500"
            />
            <button className="px-3 text-xs text-gray-400 hover:text-white">
              Price
            </button>
          </div>
        </div>

        {/* Take Profit */}
        <div>
          <label className="block text-xs text-gray-400 mb-2">
            Take Profit
          </label>
          <div className="flex items-center bg-[#1f2a35] rounded">
            <input
              type="text"
              value={takeProfit}
              onChange={(e) => setTakeProfit(e.target.value)}
              placeholder="Not set"
              className="flex-1 bg-transparent px-3 py-2 text-white text-sm focus:outline-none placeholder-gray-500"
            />
            <button className="px-3 text-xs text-gray-400 hover:text-white">
              Price
            </button>
          </div>
        </div>

        {/* Buy/Sell Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-4">
          <button
            onClick={() => setActiveTab("sell")}
            className="flex items-center justify-center gap-2 py-3 bg-red-500 hover:bg-red-600 text-white rounded font-medium transition-colors"
          >
            <TrendingDown size={16} />
            SELL
          </button>
          <button
            onClick={() => setActiveTab("buy")}
            className="flex items-center justify-center gap-2 py-3 bg-green-500 hover:bg-green-600 text-white rounded font-medium transition-colors"
          >
            <TrendingUp size={16} />
            BUY
          </button>
        </div>

        {/* Account Info */}
        <div className="pt-4 border-t border-[#1f2a35] space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Free Margin:</span>
            <span className="text-white font-mono">10,000.00 USD</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Balance:</span>
            <span className="text-white font-mono">10,000.00 USD</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Margin:</span>
            <span className="text-white font-mono">0.00 USD</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Margin level:</span>
            <span className="text-white font-mono">-</span>
          </div>
        </div>
      </div>
    </div>
  );
}
