import jwt from "jsonwebtoken";
import { env } from "../config/environment.js";
import { User } from "../models/User.js";

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

    const decoded = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(decoded.id);

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
        const decoded = jwt.verify(token, env.JWT_SECRET);
        const user = await User.findById(decoded.id);
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
