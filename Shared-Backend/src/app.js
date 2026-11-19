
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { env } from "./config/environment.js";
import { connectDB } from "./config/db.js";
import { apiLimiter } from "./middleware/rateLimiter.js";
import {
  notFoundHandler,
  errorHandler,
} from "./middleware/errorHandler.js";
import apiRoutes from "./routes/index.js";

const app = express();

// Trust the Vercel reverse proxy.
app.set("trust proxy", 1);

// Security headers
app.use(helmet());

// CORS configuration
const configuredOrigins = (env.CORS_ORIGIN || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (configuredOrigins.includes("*") || configuredOrigins.includes(origin)) {
    return true;
  }
  // Allow all localhost and 127.0.0.1 origins on any port (Vite, Next.js, preview, etc.)
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
    return true;
  }
  // Allow Vercel deployment and preview domains (*.vercel.app)
  if (/^https:\/\/[a-zA-Z0-9_.-]+\.vercel\.app$/.test(origin)) {
    return true;
  }
  return false;
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }

      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Request body parsers
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Request logger
if (env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "ok",
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use(
  "/api",
  async (req, res, next) => {
    // Health and metadata endpoints do not require MongoDB.
    if (
      env.NODE_ENV === "test" ||
      req.path === "/health" ||
      req.path === "/meta"
    ) {
      return next();
    }

    try {
      await connectDB();
      next();
    } catch (error) {
      next(error);
    }
  },
  apiLimiter,
  apiRoutes
);

// 404 handler
app.use(notFoundHandler);

// Centralized error handler
app.use(errorHandler);

export default app;
