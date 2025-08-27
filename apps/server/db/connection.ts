import { Pool } from "pg";

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME || "pooler",
  user: process.env.DB_USER || "jkchinnu",
  password: process.env.DB_PASSWORD || "postgres",
});

export const query = (text: string, params?: any[]) => pool.query(text, params);
export const client = pool;
