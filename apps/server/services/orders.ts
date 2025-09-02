import jwt from "jsonwebtoken";
import { findById } from "../types/creatUser";
import { leverageOrder, simpleOrder } from "../types/orders";
import { JwtPayload } from "../types/user";

const JWT_SECRET = process.env.JWT_SECRET || "123";
export const activeOrders = new Map<string, simpleOrder>();
export const activeLeverageOrders = new Map<string, leverageOrder>();

export function authenticateUser(req: any, res: any, next: any) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) {
    return res.json({ error: "User is not autheticated" });
  }
  try {
    const decode = jwt.verify(token, JWT_SECRET) as JwtPayload;
    const user = findById(decode.userId);
    if (!user) {
      return res.json({
        error: "No user associated.Please login with your credientials",
      });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.json({ error: "Invalid Token" });
  }
}

export function checkBalance(user: any, totalCost: number) {
  return user.demo_balance >= totalCost;
}

export function updateBalance(userId: string, amount: number) {
  const user = findById(userId);
  if (user) {
    user.demo_balance += amount;
    return user?.demo_balance;
  }
  return null;
}

export function calculateSecurity(quantity: number, price: number) {
  return quantity * price;
}

export function calculateExposure(security: number, leverage: number) {
  return security * leverage;
}

export function autoCloseOrder(order: leverageOrder, currentPrice: number) {
  const currentValue = order.quantity * currentPrice;
  const loss = Math.abs(order.security - currentValue);
  const lossPercentage = (loss / order.security) * 100;
  return lossPercentage >= 90;
}
