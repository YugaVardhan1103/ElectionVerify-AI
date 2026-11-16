import { authService } from "../services/authService.js";

/**
 * Handle User Registration
 * POST /api/auth/register
 */
export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    const result = await authService.register({ name, email, password });

    res.status(201).json({
      success: true,
      message: "User account created successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Handle User Login
 * POST /api/auth/login
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });

    res.status(200).json({
      success: true,
      message: "Authentication successful.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Handle User Logout
 * POST /api/auth/logout
 */
export function logout(req, res) {
  // In JWT stateless architecture, logout is handled on client by discarding token.
  // This endpoint acknowledges the logout request cleanly for client consistency.
  res.status(200).json({
    success: true,
    message: "Logged out successfully.",
  });
}

/**
 * Get Current Authenticated User
 * GET /api/auth/me
 */
export async function getMe(req, res, next) {
  try {
    res.status(200).json({
      success: true,
      data: {
        user: req.user.toJSON(),
      },
    });
  } catch (error) {
    next(error);
  }
}
