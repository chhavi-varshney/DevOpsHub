import express from "express";
import {
  signup,
  login,
  forgotPassword,
  resetPassword,
  getProfile,
  adminDashboard,
} from "../controllers/authController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.get("/profile", authMiddleware, getProfile);

router.get(
  "/admin",
  authMiddleware,
  roleMiddleware("admin"),
  adminDashboard
);

export default router;