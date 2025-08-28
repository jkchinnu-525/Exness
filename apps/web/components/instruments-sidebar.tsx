"use client";

import {
  ChevronLeft,
  ChevronRight,
  Search,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";

interface Instrument {
  symbol: string;
  name: string;
  price: string;
  change: string;
  changePercent: string;
  trending: "up" | "down";
}

const INSTRUMENTS: Instrument[] = [
  {
    symbol: "BTCUSDT",
    name: "Bitcoin",
    price: "110,889.42",
    change: "+144.46",
    changePercent: "+0.13%",
    trending: "up",
  },
  {
    symbol: "XAUUSD",
    name: "Gold",
    price: "3,384.518",
    change: "-0.104",
    changePercent: "-0.00%",
    trending: "down",
  },
  {
    symbol: "AAPL",
    name: "Apple Inc",
    price: "228.29",
    change: "+2.15",
    changePercent: "+0.95%",
    trending: "up",
  },
  {
    symbol: "EURUSD",
    name: "Euro/USD",
    price: "1.15916",
    change: "-0.0012",
    changePercent: "-0.10%",
    trending: "down",
  },
  {
    symbol: "GBPUSD",
    name: "Pound/USD",
    price: "1.34455",
    change: "+0.0023",
    changePercent: "+0.17%",
    trending: "up",
  },
  {
    symbol: "USDJPY",
    name: "USD/Yen",
    price: "147.905",
    change: "+0.125",
    changePercent: "+0.08%",
    trending: "up",
  },
  {
    symbol: "USTEC",
    name: "US Tech 100",
    price: "23,545.00",
    change: "+125.50",
    changePercent: "+0.54%",
    trending: "up",
  },
  {
    symbol: "USOIL",
    name: "US Oil",
    price: "62.823",
    change: "-1.177",
    changePercent: "-1.84%",
    trending: "down",
  },
];

interface InstrumentsSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  selectedSymbol: string;
  onSymbolSelect: (symbol: string) => void;
}

export function InstrumentsSidebar({
  collapsed,
  onToggle,
  selectedSymbol,
  onSymbolSelect,
}: InstrumentsSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("favorites");

  const filteredInstruments = INSTRUMENTS.filter(
    (instrument) =>
      instrument.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      instrument.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (collapsed) {
    return (
      <div className="w-12 bg-[#0f1419] border-r border-[#1f2a35] flex flex-col items-center py-4">
        <button
          onClick={onToggle}
          className="p-2 hover:bg-[#1f2a35] rounded text-gray-400 hover:text-white transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="w-80 bg-[#0f1419] border-r border-[#1f2a35] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[#1f2a35]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-gray-300">INSTRUMENTS</h2>
          <div className="flex items-center gap-2">
            <button className="p-1 hover:bg-[#1f2a35] rounded text-gray-400 hover:text-white transition-colors">
              <Search size={14} />
            </button>
            <button
              onClick={onToggle}
              className="p-1 hover:bg-[#1f2a35] rounded text-gray-400 hover:text-white transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            size={14}
          />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#1f2a35] border border-[#2a3441] rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 py-2 border-b border-[#1f2a35]">
        <div className="flex">
          <button
            onClick={() => setActiveTab("favorites")}
            className={`px-3 py-1 text-xs font-medium rounded ${
              activeTab === "favorites"
                ? "bg-[#1f2a35] text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Favorites
          </button>
        </div>
      </div>

      {/* Table Header */}
      <div className="px-4 py-2 border-b border-[#1f2a35]">
        <div className="grid grid-cols-12 gap-2 text-xs text-gray-400 font-medium">
          <div className="col-span-4">Symbol</div>
          <div className="col-span-3 text-right">Bid</div>
          <div className="col-span-3 text-right">Ask</div>
          <div className="col-span-2"></div>
        </div>
      </div>

      {/* Instruments List */}
      <div className="flex-1 overflow-y-auto">
        {filteredInstruments.map((instrument) => (
          <div
            key={instrument.symbol}
            onClick={() => onSymbolSelect(instrument.symbol)}
            className={`px-4 py-3 border-b border-[#1f2a35] hover:bg-[#1f2a35] cursor-pointer transition-colors ${
              selectedSymbol === instrument.symbol ? "bg-[#1f2a35]" : ""
            }`}
          >
            <div className="grid grid-cols-12 gap-2 items-center">
              {/* Symbol & Name */}
              <div className="col-span-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-xs font-bold">
                    {instrument.symbol.includes("BTC")
                      ? "₿"
                      : instrument.symbol.includes("XAU")
                        ? "🥇"
                        : instrument.symbol.includes("AAPL")
                          ? "🍎"
                          : instrument.symbol.includes("EUR")
                            ? "€"
                            : instrument.symbol.includes("GBP")
                              ? "£"
                              : instrument.symbol.includes("JPY")
                                ? "¥"
                                : instrument.symbol.includes("TEC")
                                  ? "📈"
                                  : "🛢️"}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">
                      {instrument.symbol}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bid Price */}
              <div className="col-span-3 text-right">
                <div
                  className={`px-2 py-1 rounded text-xs font-mono ${
                    instrument.trending === "down"
                      ? "bg-red-500/20 text-red-400"
                      : "bg-transparent text-white"
                  }`}
                >
                  {instrument.price}
                </div>
              </div>

              {/* Ask Price */}
              <div className="col-span-3 text-right">
                <div
                  className={`px-2 py-1 rounded text-xs font-mono ${
                    instrument.trending === "up"
                      ? "bg-green-500/20 text-green-400"
                      : "bg-transparent text-white"
                  }`}
                >
                  {instrument.price}
                </div>
              </div>

              {/* Trend Indicator */}
              <div className="col-span-2 flex justify-end">
                {instrument.trending === "up" ? (
                  <TrendingUp className="text-green-400" size={14} />
                ) : (
                  <TrendingDown className="text-red-400" size={14} />
                )}
              </div>
            </div>

            {/* Change Info */}
            <div className="mt-1 flex justify-between items-center text-xs">
              <span className="text-gray-500">{instrument.name}</span>
              <span
                className={`font-medium ${
                  instrument.trending === "up"
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {instrument.change} ({instrument.changePercent})
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
