import { useOrders } from "@/contexts/orders-context";
import { usePrices } from "@/contexts/price-context";
import {
  Layers,
  Menu,
  MoreVertical,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

export const TradingDashboard = () => {
  const [activeTab, setActiveTab] = useState("Open");
  const { orders, closeOrder, isLoading, error } = useOrders();
  const { prices } = usePrices();

  const tabs = ["Open", "Pending", "Closed"];

  // Debug logging
  useEffect(() => {
    console.log(" TradingDashboard - Orders updated:", orders);
    console.log(" TradingDashboard - Orders count:", orders.length);
    console.log(" TradingDashboard - Is loading:", isLoading);
    console.log(" TradingDashboard - Error:", error);
  }, [orders, isLoading, error]);

  const handleCloseOrder = async (orderId: string) => {
    try {
      await closeOrder(orderId);
    } catch (error) {
      console.error("Failed to close order:", error);
    }
  };

  const getSymbolIcon = (symbol: string) => {
    if (symbol.includes("BTC")) return "₿";
    if (symbol.includes("ETH")) return "Ξ";
    if (symbol.includes("SOL")) return "◎";
    return "●";
  };

  const getSymbolColor = (symbol: string) => {
    if (symbol.includes("BTC")) return "bg-orange-500";
    if (symbol.includes("ETH")) return "bg-blue-500";
    if (symbol.includes("SOL")) return "bg-purple-500";
    return "bg-gray-500";
  };

  return (
    <div
      className="absolute bottom-0 left-0 right-0 bg-[#1a1d29] border-t border-[#2a3441] z-10"
      style={{ height: "200px" }}
    >
      {/* Header with Tabs and Controls */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#1a1d29] border-b border-[#2a3441]">
        {/* Tab Navigation */}
        <div className="flex items-center space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center space-x-2 pb-2 relative text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "text-white"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              <span>{tab}</span>
              {tab === "Open" && orders.length > 0 && (
                <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded font-medium">
                  {orders.length}
                </span>
              )}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"></div>
              )}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-[#2a3441] rounded transition-colors">
            <Layers size={16} className="text-gray-400 hover:text-white" />
          </button>
          <button className="p-2 hover:bg-[#2a3441] rounded transition-colors">
            <Menu size={16} className="text-gray-400 hover:text-white" />
          </button>
          <button className="p-2 hover:bg-[#2a3441] rounded transition-colors">
            <MoreVertical
              size={16}
              className="text-gray-400 hover:text-white"
            />
          </button>
          <button className="p-2 hover:bg-[#2a3441] rounded transition-colors">
            <X size={16} className="text-gray-400 hover:text-white" />
          </button>
        </div>
      </div>

      {/* Debug Info */}
      {error && (
        <div className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          Error: {error}
        </div>
      )}

      {/* Table Content */}
      {activeTab === "Open" && orders.length > 0 ? (
        <div className="h-full">
          {/* Table Header */}
          <div className="px-4 py-2 bg-[#151821] border-b border-[#2a3441]">
            <div className="grid grid-cols-12 gap-4 text-xs text-gray-400 font-medium">
              <div className="col-span-2">Symbol</div>
              <div className="col-span-1">Type</div>
              <div className="col-span-2">Volume, lot</div>
              <div className="col-span-2">Open price</div>
              <div className="col-span-2">Current price</div>
              <div className="col-span-2">P/L, USD</div>
              <div className="col-span-1"></div>
            </div>
          </div>

          {/* Trade Rows */}
          <div className="px-4 py-3 bg-[#1a1d29]">
            {orders.map((order) => (
              <div
                key={order.orderId}
                className="grid grid-cols-12 gap-4 items-center"
              >
                {/* Symbol */}
                <div className="col-span-2 flex items-center space-x-3">
                  <div
                    className={`w-5 h-5 ${getSymbolColor(order.asset)} rounded-full flex items-center justify-center text-xs font-bold text-white`}
                  >
                    {getSymbolIcon(order.asset)}
                  </div>
                  <span className="text-white font-medium text-sm">
                    {order.asset}
                  </span>
                </div>

                {/* Type */}
                <div className="col-span-1">
                  <span className="flex items-center space-x-2">
                    {order.type === "buy" ? (
                      <TrendingUp size={14} className="text-green-400" />
                    ) : (
                      <TrendingDown size={14} className="text-red-400" />
                    )}
                    <span
                      className={`text-sm font-medium ${
                        order.type === "buy" ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {order.type.toUpperCase()}
                    </span>
                  </span>
                </div>

                {/* Volume */}
                <div className="col-span-2">
                  <span className="text-gray-300 font-mono text-sm">
                    {order.quantity}
                  </span>
                </div>

                {/* Open Price */}
                <div className="col-span-2">
                  <span className="text-gray-300 font-mono text-sm">
                    {order.openprice.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 8,
                    })}
                  </span>
                </div>

                {/* Current Price */}
                <div className="col-span-2">
                  <span className="text-white font-mono text-sm font-medium">
                    {order.currentPrice.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 8,
                    })}
                  </span>
                </div>

                {/* P/L */}
                <div className="col-span-2">
                  <div
                    className={`font-mono text-sm font-medium ${
                      order.profit >= 0 ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    <div>${order.profit.toFixed(2)}</div>
                    <div className="text-xs">
                      ({order.profitPercent.toFixed(2)}%)
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="col-span-1 flex items-center space-x-2">
                  <button
                    onClick={() => handleCloseOrder(order.orderId)}
                    className="p-1.5 hover:bg-[#2a3441] rounded transition-colors"
                    disabled={isLoading}
                  >
                    <X size={14} className="text-red-400 hover:text-red-300" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="flex items-center justify-center h-full bg-[#1a1d29]">
          <div className="text-center text-gray-500">
            <div className="text-3xl mb-3">📊</div>
            <p className="text-sm font-medium mb-1">
              No {activeTab.toLowerCase()} positions
            </p>
            <p className="text-xs text-gray-600">
              Your {activeTab.toLowerCase()} trades will appear here
            </p>
            {isLoading && (
              <p className="text-xs text-blue-400 mt-2">Loading orders...</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TradingDashboard;
