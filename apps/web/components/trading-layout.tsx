"use client";

import { AuthHeader } from "@/components/auth-header";
import { ChartArea } from "@/components/chart-area";
import { InstrumentsSidebar } from "@/components/instruments-sidebar";
import { ProtectedRoute } from "@/components/protected-route";
import { TradingPanel } from "@/components/trading-panel";
import { TradingDashboard } from "@/components/trading_dashboard";
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

          {/* Main Content Area - Chart with overlay */}
          <div className="flex-1 relative min-h-0 bg-[#0b0e11]">
            {/* Chart Area - Full height */}
            <div className="absolute inset-0">
              <ChartArea
                symbol={selectedSymbol}
                timeframe={selectedTimeframe}
                onTimeframeChange={setSelectedTimeframe}
              />
            </div>

            {/* Trading Dashboard - Overlay at bottom */}
            <TradingDashboard />
          </div>

          {/* Right Panel - Trading (Separate from main content) */}
          <TradingPanel symbol={selectedSymbol} />
        </div>
      </div>
    </ProtectedRoute>
  );
}
