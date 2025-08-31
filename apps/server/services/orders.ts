import jwt from "jsonwebtoken";
import { findById } from "../types/creatUser";
import { simpleOrder } from "../types/orders";
import { JwtPayload } from "../types/user";

const JWT_SECRET = process.env.JWT_SECRET || "123";
export const activeOrders = new Map<string, simpleOrder>();

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
  } catch {
    res.json({ error: "Invalid Token" });
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
