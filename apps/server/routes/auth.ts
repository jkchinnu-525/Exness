import bcrypt from "bcryptjs";
import { Request, Response, Router } from "express";
import jwt from "jsonwebtoken";
import { createUser, getUserByEmail, getUserById } from "../db/queries";
import {
  AuthResponse,
  CreateUserRequest,
  JwtPayload,
  LoginRequest,
} from "../types/user";

const router = Router();

// JWT secret - in production, this should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";

// Register endpoint
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { email, password, full_name }: CreateUserRequest = req.body;

    // Validate input
    if (!email || !password || !full_name) {
      return res.status(400).json({
        error: "All fields (email, password, full_name) are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters long",
      });
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        error: "User with this email already exists",
      });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 12);

    // Create user
    const user = await createUser({
      email,
      password: "",
      full_name,
      password_hash,
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email } as JwtPayload,
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const response: AuthResponse = {
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        demo_balance: user.demo_balance,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
      token,
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      error: "Internal server error during registration",
    });
  }
});

// Login endpoint
router.post("/signin", async (req: Request, res: Response) => {
  try {
    const { email, password }: LoginRequest = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    // Get user from database
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email } as JwtPayload,
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const response: AuthResponse = {
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        demo_balance: user.demo_balance,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
      token,
    };

    res.json(response);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      error: "Internal server error during login",
    });
  }
});

// Get current user endpoint (protected)
router.get("/me", async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        error: "No token provided",
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    // Get user from database
    const user = await getUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        error: "User not found",
      });
    }

    res.json({ user });
  } catch (error) {
    console.error("Get current user error:", error);
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        error: "Invalid token",
      });
    }
    res.status(500).json({
      error: "Internal server error",
    });
  }
});

export default router;
