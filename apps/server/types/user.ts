export interface User {
  id: string;
  email: string;
  full_name: string;
  demo_balance: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  full_name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: Omit<User, "password_hash">;
  token: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
}
