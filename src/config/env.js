const dotenv = require("dotenv");

dotenv.config();

const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT) || 5000,
  APP_BASE_URL: process.env.APP_BASE_URL || "http://localhost:5000",
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "1d",
  GLOBAL_RATE_LIMIT_WINDOW_MS: Number(process.env.GLOBAL_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  GLOBAL_RATE_LIMIT_MAX: Number(process.env.GLOBAL_RATE_LIMIT_MAX) || 300,
  AUTH_RATE_LIMIT_WINDOW_MS: Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 10 * 60 * 1000,
  AUTH_RATE_LIMIT_MAX: Number(process.env.AUTH_RATE_LIMIT_MAX) || 20,
};

if (!env.MONGO_URI) {
  throw new Error("Missing required environment variable: MONGO_URI");
}

if (!env.JWT_SECRET) {
  throw new Error("Missing required environment variable: JWT_SECRET");
}

module.exports = env;
