import { Router } from "express";
import {
  getProfile,
  updateProfile,
  updatePreferences,
  updatePassword,
  listUsers,
  updateUserRole,
} from "../controllers/userController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { USER_ROLES } from "../config/constants.js";

const router = Router();

// Profile operations require authentication
router.get("/profile", requireAuth, getProfile);
router.put("/profile", requireAuth, updateProfile);
router.put("/preferences", requireAuth, updatePreferences);
router.put("/password", requireAuth, updatePassword);

// Administrative user operations
router.get("/", requireAuth, requireRole(USER_ROLES.ADMIN), listUsers);
router.patch("/:id/role", requireAuth, requireRole(USER_ROLES.ADMIN), updateUserRole);

export default router;
