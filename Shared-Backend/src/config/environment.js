
import dotenv from "dotenv";

dotenv.config();

const NODE_ENV = process.env.NODE_ENV || "development";
const isProduction = NODE_ENV === "production";

const configuredJwtSecret = process.env.JWT_SECRET?.trim();

const DEVELOPMENT_JWT_SECRET =
  "electionverify_local_development_secret_only_change_me";

if (
  isProduction &&
  (!configuredJwtSecret || configuredJwtSecret.length < 32)
) {
  throw new Error(
    "Production requires a JWT_SECRET containing at least 32 characters."
  );
}

const JWT_SECRET =
  configuredJwtSecret ||
  (isProduction ? undefined : DEVELOPMENT_JWT_SECRET);

export const env = Object.freeze({
  NODE_ENV,

  PORT: parseInt(process.env.PORT || "5000", 10),

  MONGODB_URI:
    process.env.MONGODB_URI ||
    "mongodb://127.0.0.1:27017/electionverify",

  JWT_SECRET,

  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",

  CORS_ORIGIN:
    process.env.CORS_ORIGIN ||
    "http://localhost:5173,http://localhost:3000,http://localhost:4173,https://electionverify-react.vercel.app",

  // AI Provider Configuration
  AI_PROVIDER: process.env.AI_PROVIDER || "auto",

  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",

  GEMINI_MODEL:
    process.env.GEMINI_MODEL || "gemini-3.5-flash-lite",

  OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",

  OPENAI_MODEL: process.env.OPENAI_MODEL || "gpt-4o-mini",

  // Evidence Search Configuration
  SEARCH_PROVIDER: process.env.SEARCH_PROVIDER || "unconfigured",

  TAVILY_API_KEY: process.env.TAVILY_API_KEY || "",

  GOOGLE_SEARCH_API_KEY: process.env.GOOGLE_SEARCH_API_KEY || "",

  GOOGLE_SEARCH_CX: process.env.GOOGLE_SEARCH_CX || "",

  // Social OAuth Credentials
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
  FACEBOOK_APP_ID: process.env.FACEBOOK_APP_ID || "",
  FACEBOOK_APP_SECRET: process.env.FACEBOOK_APP_SECRET || "",

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(
    process.env.RATE_LIMIT_WINDOW_MS || "900000",
    10
  ),

  RATE_LIMIT_MAX_REQUESTS: parseInt(
    process.env.RATE_LIMIT_MAX_REQUESTS || "100",
    10
  ),

  AUTH_RATE_LIMIT_MAX: parseInt(
    process.env.AUTH_RATE_LIMIT_MAX || "20",
    10
  ),
});
