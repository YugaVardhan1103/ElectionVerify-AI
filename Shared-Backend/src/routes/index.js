import { Router } from "express";
import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";
import claimRoutes from "./claimRoutes.js";
import verificationRoutes from "./verificationRoutes.js";
import { VERDICTS, CLAIM_STATUS } from "../config/constants.js";

const router = Router();

// API Health Check
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "ElectionVerify AI Shared Backend",
  });
});

// Meta information endpoint
router.get("/meta", (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      canonicalVerdicts: Object.values(VERDICTS),
      claimStatuses: Object.values(CLAIM_STATUS),
    },
  });
});

// Mount Resource Routes
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/claims", claimRoutes);
router.use("/verification", verificationRoutes);

export default router;
