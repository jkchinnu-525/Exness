"use client";

import { MoreHorizontal, TrendingDown, TrendingUp, X } from "lucide-react";
import { useState } from "react";

interface Position {
  id: string;
  symbol: string;
  type: "buy" | "sell";
  volume: number;
  openPrice: number;
  currentPrice: number;
  profit: number;
  profitPercent: number;
  openTime: string;
}

const MOCK_POSITIONS: Position[] = [
  // Empty for now - will be populated when trades are made
];

export function PositionsPanel() {
  const [activeTab, setActiveTab] = useState<"open" | "pending" | "closed">(
    "open"
  );
  const [collapsed, setCollapsed] = useState(false);

  const tabs = [
    { key: "open", label: "Open", count: MOCK_POSITIONS.length },
    { key: "pending", label: "Pending", count: 0 },
    { key: "closed", label: "Closed", count: 0 },
  ];

  if (collapsed) {
    return (
      <div className="h-8 bg-[#0f1419] border-t border-[#1f2a35] flex items-center px-4">
        <button
          onClick={() => setCollapsed(false)}
          className="text-xs text-gray-400 hover:text-white transition-colors"
        >
          Show Positions
        </button>
      </div>
    );
  }

  return (
    <div className="h-64 bg-[#0f1419] border-t border-[#1f2a35] flex flex-col">
      {/* Header */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-[#1f2a35]">
        <div className="flex items-center gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-3 py-1 text-sm rounded transition-colors ${
                activeTab === tab.key
                  ? "bg-[#1f2a35] text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[16px] text-center">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button className="p-1 hover:bg-[#1f2a35] rounded text-gray-400 hover:text-white transition-colors">
            <MoreHorizontal size={16} />
          </button>
          <button
            onClick={() => setCollapsed(true)}
            className="p-1 hover:bg-[#1f2a35] rounded text-gray-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "open" && (
          <div className="h-full">
            {MOCK_POSITIONS.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-[#1f2a35] rounded-full flex items-center justify-center">
                    <TrendingUp className="text-gray-500" size={24} />
                  </div>
                  <h3 className="text-white font-medium mb-2">
                    No open positions
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Your open positions will appear here when you place trades
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col">
                {/* Table Header */}
                <div className="px-4 py-2 border-b border-[#1f2a35] bg-[#0b0e11]">
                  <div className="grid grid-cols-12 gap-4 text-xs text-gray-400 font-medium">
                    <div className="col-span-2">Symbol</div>
                    <div className="col-span-1">Type</div>
                    <div className="col-span-1">Volume</div>
                    <div className="col-span-2">Open Price</div>
                    <div className="col-span-2">Current Price</div>
                    <div className="col-span-2">Profit</div>
                    <div className="col-span-1">Time</div>
                    <div className="col-span-1">Actions</div>
                  </div>
                </div>

                {/* Positions List */}
                <div className="flex-1 overflow-y-auto">
                  {MOCK_POSITIONS.map((position) => (
                    <div
                      key={position.id}
                      className="px-4 py-3 border-b border-[#1f2a35] hover:bg-[#1f2a35] transition-colors"
                    >
                      <div className="grid grid-cols-12 gap-4 items-center text-sm">
                        <div className="col-span-2">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-xs">
                              ₿
                            </div>
                            <span className="text-white font-medium">
                              {position.symbol}
                            </span>
                          </div>
                        </div>

                        <div className="col-span-1">
                          <div
                            className={`flex items-center gap-1 ${
                              position.type === "buy"
                                ? "text-green-400"
                                : "text-red-400"
                            }`}
                          >
                            {position.type === "buy" ? (
                              <TrendingUp size={14} />
                            ) : (
                              <TrendingDown size={14} />
                            )}
                            <span className="uppercase text-xs font-medium">
                              {position.type}
                            </span>
                          </div>
                        </div>

                        <div className="col-span-1">
                          <span className="text-white font-mono">
                            {position.volume}
                          </span>
                        </div>

                        <div className="col-span-2">
                          <span className="text-white font-mono">
                            {position.openPrice.toLocaleString()}
                          </span>
                        </div>

                        <div className="col-span-2">
                          <span className="text-white font-mono">
                            {position.currentPrice.toLocaleString()}
                          </span>
                        </div>

                        <div className="col-span-2">
                          <div
                            className={`font-mono ${position.profit >= 0 ? "text-green-400" : "text-red-400"}`}
                          >
                            <div>${position.profit.toFixed(2)}</div>
                            <div className="text-xs">
                              ({position.profitPercent.toFixed(2)}%)
                            </div>
                          </div>
                        </div>

                        <div className="col-span-1">
                          <span className="text-gray-400 text-xs">
                            {position.openTime}
                          </span>
                        </div>

                        <div className="col-span-1">
                          <button className="text-red-400 hover:text-red-300 text-xs font-medium">
                            Close
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "pending" && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-[#1f2a35] rounded-full flex items-center justify-center">
                <TrendingUp className="text-gray-500" size={24} />
              </div>
              <h3 className="text-white font-medium mb-2">No pending orders</h3>
              <p className="text-gray-400 text-sm">
                Your pending orders will appear here
              </p>
            </div>
          </div>
        )}

        {activeTab === "closed" && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-[#1f2a35] rounded-full flex items-center justify-center">
                <TrendingUp className="text-gray-500" size={24} />
              </div>
              <h3 className="text-white font-medium mb-2">
                No closed positions
              </h3>
              <p className="text-gray-400 text-sm">
                Your trading history will appear here
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer - Account Summary */}
      <div className="h-10 px-4 border-t border-[#1f2a35] flex items-center justify-between text-xs">
        <div className="flex items-center gap-6">
          <div>
            <span className="text-gray-400">Equity: </span>
            <span className="text-white font-mono">10,000.00 USD</span>
          </div>
          <div>
            <span className="text-gray-400">Free Margin: </span>
            <span className="text-white font-mono">10,000.00 USD</span>
          </div>
          <div>
            <span className="text-gray-400">Balance: </span>
            <span className="text-white font-mono">10,000.00 USD</span>
          </div>
          <div>
            <span className="text-gray-400">Margin: </span>
            <span className="text-white font-mono">0.00 USD</span>
          </div>
          <div>
            <span className="text-gray-400">Margin level: </span>
            <span className="text-white font-mono">-</span>
          </div>
        </div>
      </div>
    </div>
  );
}
