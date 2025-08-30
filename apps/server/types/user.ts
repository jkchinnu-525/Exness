export interface User {
  id: string;
  email: string;
  demo_balance: number;
}

export interface UserRequest {
  email: string;
  password: string;
  full_name?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
}
