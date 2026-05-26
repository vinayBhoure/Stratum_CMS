import dotenv from "dotenv";

dotenv.config();

interface Env {
  databaseUrl: string;
  serverPort: number;
  clientUrl: string;
  jwtSecret: string;
  nodeEnv: "development" | "production" | "test";
}

function required(key: string): string {
  const value = process.env[key];
  if (value === undefined || value.trim() === "") {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

const parsedPort = Number(process.env.SERVER_PORT ?? "4000");
if (Number.isNaN(parsedPort)) {
  throw new Error("SERVER_PORT must be a number");
}

const nodeEnv = (process.env.NODE_ENV ?? "development") as Env["nodeEnv"];

export const env: Env = {
  databaseUrl: required("DATABASE_URL"),
  serverPort: parsedPort,
  clientUrl: required("CLIENT_URL"),
  jwtSecret: required("JWT_SECRET"),
  nodeEnv,
};
