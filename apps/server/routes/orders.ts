import { Router } from "express";
import { v4 as uuid } from "uuid";
import {
  activeLeverageOrders,
  activeOrders,
  authenticateUser,
  calculateExposure,
  calculateSecurity,
  checkBalance,
  updateBalance,
} from "../services/orders";
import { leverageOrder, simpleOrder } from "../types/orders";
const router = Router();

router.post("/open", authenticateUser, async (req, res) => {
  const { quantity, openprice, type, asset, leverage } = req.body;
  const user = (req as any).user;

  if (!quantity || !openprice || !type || !asset) {
    return res.json({
      error:
        "Please provide all required fields: quantity, openprice, type, asset",
    });
  }

  if (quantity <= 0 || openprice <= 0) {
    return res.json({
      error: "Quantity and open price must be positive values",
    });
  }
  if (leverage) {
    if (leverage < 1 || leverage > 100) {
      return res.json({ error: "Leverage must be between 1x & 100x" });
    }
    const security = calculateSecurity(quantity, openprice);
    const exposure = calculateExposure(security, leverage);
    if (!checkBalance(user, security)) {
      return res.json({
        error: "Insufficient funds",
        required: security,
        available: user.demo_balance,
      });
    }
    const newBalance = updateBalance(user.id, -security);
    const order: leverageOrder = {
      orderId: uuid(),
      userId: user.id,
      type,
      asset,
      quantity,
      openprice,
      security,
      leverage,
      exposure,
    };
    activeLeverageOrders.set(order.orderId, order);
    return res.json({
      success: true,
      order: order,
      securityDeducted: security,
      totalExposure: exposure,
      newBalance: newBalance,
    });
  } else {
    const totalPrice = quantity * openprice;
    if (!checkBalance(user, totalPrice)) {
      return res.json({
        error: "Insufficient Funds",
        required: totalPrice,
        available: user.demo_balance,
      });
    }
    const newBalance = updateBalance(user.id, -totalPrice);
    const order: simpleOrder = {
      orderId: uuid(),
      userId: user.id,
      type,
      asset,
      openprice,
      quantity,
    };
    activeOrders.set(order.orderId, order);
    return res.json({
      success: true,
      order: order,
      newBalance: newBalance,
      deductedAmount: totalPrice,
    });
  }
});

router.post("/close", authenticateUser, async (req, res) => {
  const { orderId, closePrice } = req.body;
  const user = (req as any).user;

  const leverageorder = activeLeverageOrders.get(orderId);
  if (leverageorder && leverageorder.userId === user.id) {
    const priceUpdate =
      leverageorder.type === "buy"
        ? closePrice - leverageorder.openprice
        : leverageorder.openprice - closePrice;

    const pnl = priceUpdate * leverageorder.quantity;
    const totalReturn = leverageorder.security + pnl;
    const newBalance = updateBalance(user.id, totalReturn);

    activeLeverageOrders.delete(orderId);

    return res.json({
      success: true,
      pnl: pnl,
      totalReturn: totalReturn,
      newBalance: newBalance,
    });
  }

  const order = activeOrders.get(orderId);
  if (order && order.userId === user.id) {
    const priceUpdate =
      order.type === "buy"
        ? closePrice - order.openprice
        : order.openprice - closePrice;
    const pnl = priceUpdate * order.quantity;

    const newBalance = updateBalance(user.id, pnl);

    console.log("💰 SERVER: Final balance update:", {
      pnl,
      newBalance,
    });

    activeOrders.delete(orderId);
    return res.json({
      success: true,
      message: "Order Closed",
      newBalance: newBalance,
      pnl: pnl,
    });
  }

  return res.json({ error: "Order not found or unauthorized" });
});

router.get("/active", authenticateUser, async (req, res) => {
  const user = (req as any).user;
  try {
    const leverageOrders = Array.from(activeLeverageOrders.values())
      .filter((order) => order.userId === user.id)
      .map((order) => ({
        ...order,
        openTime: new Date().toISOString(),
      }));
    const orders = Array.from(activeOrders.values())
      .filter((order) => order.userId === user.id)
      .map((order) => ({
        ...order,
        openTime: new Date().toISOString(),
      }));
    const allOrders = [...leverageOrders, ...orders];
    res.json({ success: true, orders: allOrders });
  } catch (error) {
    console.log(`Error while fetching orders: ${error} `);
  }
});

router.get("/balance", authenticateUser, async (req, res) => {
  const user = (req as any).user;
  const balance = user.demo_balance;
  res.json({ success: true, balance: balance });
});

export default router;
