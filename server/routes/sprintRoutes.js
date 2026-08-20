import express from "express";

import {
  createSprint,
  getSprints,
  getSprintById,
  updateSprint,
  deleteSprint,
  completeSprint,
} from "../controllers/sprintController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Create Sprint
router.post("/", authMiddleware, createSprint);

// Get All Sprints
router.get("/", authMiddleware, getSprints);

// Get Single Sprint
router.get("/:id", authMiddleware, getSprintById);

// Update Sprint
router.put("/:id", authMiddleware, updateSprint);

// Delete Sprint
router.delete("/:id", authMiddleware, deleteSprint);

// Complete Sprint
router.patch("/:id/complete", authMiddleware, completeSprint);

export default router;