import { Router } from "express";
import { addUser, findById, findByEmail } from "../types/creatUser";
import { UserRequest } from "../types/user";
import jwt from "jsonwebtoken";
import { JwtPayload } from "../types/user";
const JWT_SECRET = process.env.JWT_SECRET || "123";
const router = Router();

router.post("/register", (req, res) => {
  const { email, password }: UserRequest = req.body;
  if (findByEmail(email)) {
    return res.status(400).json({ error: "User found" });
  }

  const user = addUser(email, password);
  const token = jwt.sign({ userId: user.id, email } as JwtPayload, JWT_SECRET);
  return res.json({
    user: {
      id: user.id,
      email: user.email,
      demo_balance: user.demo_balance,
    },
    token,
  });
});

router.post("/signin", (req, res) => {
  const { email, password }: UserRequest = req.body;
  const user = findByEmail(email);
  if (!user || user.password !== password) {
    return res.status(400).json({ error: "Invalid Credentials" });
  }

  const token = jwt.sign({ userId: user.id, email } as JwtPayload, JWT_SECRET);
  return res.json({
    user: {
      id: user.id,
      email: user.email,
      demo_balance: user.demo_balance,
    },
    token,
  });
});

router.get("/me", (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    const user = findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    res.json({ user });
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
});

export default router;
