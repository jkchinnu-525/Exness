import { Router } from "express";
import { v4 as uuid } from "uuid";
import {
  activeOrders,
  authenticateUser,
  checkBalance,
  updateBalance,
} from "../services/orders";
import { simpleOrder } from "../types/orders";
const router = Router();

// router.post("/leverage-order", authenticateUser, async (req, res) => {
//   const { quantity, openprice, security, leverage, exposure }: leverageOrder =
//     req.body;
//   const user = (req as any).user;

//   if (!quantity || !openprice || !leverage) {
//     return res.json({ error: "Please add all 3 required fields" });
//   }

//   if (quantity <= 0 || openprice <= 0) {
//     return res.json({ error: "Make sure to add values" });
//   }

//   if (leverage < 1 || leverage > 100) {
//     return res.json({ error: "Leverage must only be between 1x & 10x" });
//   }

//   const totalPrice = quantity * openprice;
//   const orderData: leverageOrder = {
//     orderId: uuid(),
//     userId: user.id,
//     quantity,
//     openprice,
//     security,
//     leverage,
//     exposure,
//   };
//   return res.json({ success: true, order: orderData });
// });

router.post("/simple-order/open", authenticateUser, async (req, res) => {
  const { type, asset, openprice, quantity }: simpleOrder = req.body;
  const user = (req as any).user;
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
});

router.post("/simple-order/close", authenticateUser, async (req, res) => {
  const { orderId, closePrice } = req.body;
  const user = (req as any).user;
  const order = activeOrders.get(orderId);
  if (!order || order.userId !== user.id) {
    return res.json({ error: "Order not found" });
  }
  const priceUpdate =
    order.type == "buy"
      ? closePrice - order.openprice
      : order.openprice - closePrice;
  const pol = priceUpdate * order.quantity;
  const originalCost = order.quantity * order.openprice;
  const totalReturn = originalCost + pol;
  const newBalance = updateBalance(user.id, totalReturn);
  activeOrders.delete(orderId);
  return res.json({
    success: true,
    message: "Order Closed",
    newBalance: newBalance,
    deductedAmount: totalReturn,
  });
});

export default router;
