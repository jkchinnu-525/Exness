"use client";

import { AuthHeader } from "@/components/auth-header";
import { ChartArea } from "@/components/chart-area";
import { InstrumentsSidebar } from "@/components/instruments-sidebar";
import { PositionsPanel } from "@/components/positions-panel";
import { ProtectedRoute } from "@/components/protected-route";
import { TradingPanel } from "@/components/trading-panel";
import { useState } from "react";

export function TradingLayout() {
  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSDT");
  const [selectedTimeframe, setSelectedTimeframe] = useState("1m");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <ProtectedRoute>
      <div className="h-screen bg-[#0b0e11] text-white flex flex-col overflow-hidden">
        {/* Auth Header */}
        <AuthHeader />

        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Instruments */}
          <InstrumentsSidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            selectedSymbol={selectedSymbol}
            onSymbolSelect={setSelectedSymbol}
          />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col">
            {/* Top Section - Chart and Trading Panel */}
            <div className="flex-1 flex">
              {/* Chart Area */}
              <ChartArea
                symbol={selectedSymbol}
                timeframe={selectedTimeframe}
                onTimeframeChange={setSelectedTimeframe}
              />

              {/* Right Panel - Trading */}
              <TradingPanel symbol={selectedSymbol} />
            </div>

            {/* Bottom Panel - Positions/Orders */}
            <PositionsPanel />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
