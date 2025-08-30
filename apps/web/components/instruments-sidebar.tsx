"use client";

import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Instrument {
  symbol: string;
  name: string;
  bid: string;
  ask: string;
  change: string;
  changePercent: string;
  trending: "up" | "down";
}

const INSTRUMENTS: Instrument[] = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    bid: "110,889.42",
    ask: "110,912.58",
    change: "+144.46",
    changePercent: "+0.13%",
    trending: "up",
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    bid: "4,180.25",
    ask: "4,182.75",
    change: "+82.15",
    changePercent: "+2.00%",
    trending: "up",
  },
  {
    symbol: "SOL",
    name: "Solana",
    bid: "245.67",
    ask: "245.89",
    change: "-5.33",
    changePercent: "-2.12%",
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
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const filteredInstruments = INSTRUMENTS.filter(
    (instrument) =>
      instrument.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      instrument.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getFullSymbol = (symbol: string) => {
    return symbol + "USDT";
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const newWidth = e.clientX;
      if (newWidth >= 280 && newWidth <= 500) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

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
    <div
      ref={sidebarRef}
      className="bg-[#1a1f28] border-r border-[#2a3441] flex flex-col relative select-none"
      style={{ width: sidebarWidth }}
    >
      <div className="px-4 py-3 border-b border-[#2a3441]">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wide">
            Symbol
          </h2>
          <div className="flex items-center gap-1">
            <button className="p-1 hover:bg-[#2a3441] rounded text-gray-400 hover:text-white transition-colors">
              <Search size={14} />
            </button>
            <button
              onClick={onToggle}
              className="p-1 hover:bg-[#2a3441] rounded text-gray-400 hover:text-white transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
          </div>
        </div>

        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            size={14}
          />
          <input
            type="text"
            placeholder="Search symbols..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#2a3441] border border-[#3a4451] rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="px-4 py-2 border-b border-[#2a3441] bg-[#1f242d]">
        <div className="flex items-center text-xs text-gray-400 font-medium">
          <div className="text-left">Coin</div>
          {/* <div className="w-16 text-center">Signal</div> */}
          <div className="w-24 text-right">Bid</div>
          <div className="w-24 text-right">Ask</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredInstruments.map((instrument) => (
          <div
            key={instrument.symbol}
            onClick={() => onSymbolSelect(getFullSymbol(instrument.symbol))}
            className={`px-4 py-3 border-b border-[#2a3441] hover:bg-[#1f242d] cursor-pointer transition-colors ${
              selectedSymbol === getFullSymbol(instrument.symbol)
                ? "bg-[#1f242d]"
                : ""
            }`}
          >
            <div className="flex items-center">
              <div className="flex-1 flex items-center gap-3 pr-8">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                    instrument.symbol === "BTC"
                      ? "bg-orange-500"
                      : instrument.symbol === "ETH"
                        ? "bg-blue-500"
                        : "bg-purple-500"
                  }`}
                >
                  {instrument.symbol === "BTC"
                    ? "₿"
                    : instrument.symbol === "ETH"
                      ? "Ξ"
                      : "◎"}
                </div>
                <div className="text-sm font-medium text-white">
                  {instrument.symbol}
                </div>
              </div>
              <div className="py-2 gap-4 flex">
                <div className="w-24 text-left">
                  <div
                    className={`px-2 py-1 rounded text-xs font-mono ${
                      instrument.trending === "down"
                        ? "bg-red-600 text-white"
                        : "bg-gray-700 text-white"
                    }`}
                  >
                    {instrument.bid}
                  </div>
                </div>

                <div className="w-24 text-left">
                  <div
                    className={`px-2 py-1 rounded text-xs font-mono ${
                      instrument.trending === "up"
                        ? "bg-green-600 text-white"
                        : "bg-gray-700 text-white"
                    }`}
                  >
                    {instrument.ask}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div
        className="absolute top-0 right-0 w-1 h-full bg-transparent hover:bg-blue-500 cursor-col-resize transition-colors"
        onMouseDown={(e) => {
          e.preventDefault();
          setIsResizing(true);
        }}
      />
      {isResizing && (
        <div className="absolute top-0 right-0 w-1 h-full bg-blue-500" />
      )}
    </div>
  );
}
