import { Router } from "express";
import { register, login, logout, getMe } from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";
import { validateRegister, validateLogin } from "../middleware/validate.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = Router();

router.post("/register", authLimiter, validateRegister, register);
router.post("/login", authLimiter, validateLogin, login);
router.post("/logout", logout);
router.get("/me", requireAuth, getMe);

export default router;
