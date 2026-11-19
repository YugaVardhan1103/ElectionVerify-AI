import { Router } from "express";
import {
  register,
  login,
  socialLogin,
  googleLogin,
  facebookLogin,
  logout,
  getMe,
} from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";
import { validateRegister, validateLogin } from "../middleware/validate.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = Router();

router.post("/register", authLimiter, validateRegister, register);
router.post("/login", authLimiter, validateLogin, login);
router.post("/social", authLimiter, socialLogin);
router.post("/google", authLimiter, googleLogin);
router.post("/facebook", authLimiter, facebookLogin);
router.post("/logout", logout);
router.get("/me", requireAuth, getMe);

export default router;
