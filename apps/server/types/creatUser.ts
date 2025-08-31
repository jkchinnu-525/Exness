import { v4 as uuidv4 } from "uuid";
import { User } from "./user";

const users: Array<User & { password: string }> = [];

export function addUser(email: string, password: string): User {
  const newUser = {
    email,
    password,
    id: uuidv4(),
    demo_balance: 5000,
  };
  users.push(newUser);
  return {
    id: newUser.id,
    email: newUser.email,
    demo_balance: newUser.demo_balance,
  };
}

export function findByEmail(email: string) {
  return users.find((user) => user.email == email);
}

export function findById(userId: string) {
  const user = users.find((user) => user.id == userId);
  if (!user) {
    return null;
  }
  return user;
}
