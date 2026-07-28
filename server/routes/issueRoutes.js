import express from "express";

import {
  createIssue,
  getAllIssues,
  getIssueById,
  updateIssue,
  deleteIssue,
} from "../controllers/issueController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createIssue);
router.get("/", authMiddleware, getAllIssues);
router.get("/:id", authMiddleware, getIssueById);
router.put("/:id", authMiddleware, updateIssue);
router.delete("/:id", authMiddleware, deleteIssue);

export default router;