import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { env } from "../config/environment.js";
import { User } from "../models/User.js";

const NEXTJS_JWT_SECRET =
  process.env.NEXTJS_JWT_SECRET ||
  "electionverify_nextjs_jwt_secure_secret_key_2026";

async function resolveUserFromToken(token) {
  let decoded = null;
  let isNextJsToken = false;

  try {
    decoded = jwt.verify(token, env.JWT_SECRET);
  } catch (primaryErr) {
    try {
      decoded = jwt.verify(token, NEXTJS_JWT_SECRET);
      isNextJsToken = true;
    } catch {
      throw primaryErr;
    }
  }

  let user = null;
  if (decoded.id && mongoose.isValidObjectId(decoded.id)) {
    user = await User.findById(decoded.id);
  }
  if (!user && decoded.email) {
    user = await User.findOne({ email: decoded.email.toLowerCase() });
  }

  if (!user && isNextJsToken && decoded.id) {
    // Seamless support for authenticated users from Next.js dedicated database
    user = {
      _id: mongoose.isValidObjectId(decoded.id)
        ? new mongoose.Types.ObjectId(decoded.id)
        : new mongoose.Types.ObjectId(),
      id: decoded.id,
      email: decoded.email,
      role: decoded.role || "user",
      accountStatus: "Active",
      source: "nextjs",
    };
  }

  return user;
}

/**
 * Authentication Middleware
 * Enforces valid JSON Web Token from Authorization header.
 */
export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "Authentication required. Please provide a valid Bearer token.",
      });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Authentication token missing.",
      });
    }

    const user = await resolveUserFromToken(token);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "User associated with this token no longer exists.",
      });
    }

    if (user.accountStatus === "Suspended") {
      return res.status(403).json({
        success: false,
        error: "Account has been suspended. Please contact platform administration.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        error: "Authentication token has expired. Please log in again.",
      });
    }
    return res.status(401).json({
      success: false,
      error: "Invalid authentication token.",
    });
  }
}

/**
 * Optional Authentication Middleware
 * Attaches user to req.user if a valid token is present, but does not block requests without a token.
 */
export async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      if (token) {
        const user = await resolveUserFromToken(token);
        if (user && user.accountStatus !== "Suspended") {
          req.user = user;
        }
      }
    }
  } catch {
    // Ignore invalid token in optional auth, proceed as anonymous
  }
  next();
}

/**
 * Role-Based Access Control Middleware
 * Restricts access to users having specified roles.
 *
 * @param  {...string} allowedRoles - E.g. 'reviewer', 'admin'
 */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Authentication required before role verification.",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Access denied. Requires one of the following roles: [${allowedRoles.join(", ")}]. Current role: ${req.user.role}.`,
      });
    }

    next();
  };
}
