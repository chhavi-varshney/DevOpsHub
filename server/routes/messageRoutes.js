import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {
  sendMessage,
  getConversation,
  markAsSeen,
  getRecentChats,
  deleteMessage,
} from "../controllers/messageController.js";

const router = express.Router();

// Send Message
router.post("/", authMiddleware, sendMessage);

// Recent Chats
router.get("/recent/all", authMiddleware, getRecentChats);

// Get Conversation
router.get("/:receiverId", authMiddleware, getConversation);

// Mark as Seen
router.put("/seen", authMiddleware, markAsSeen);

// Delete Message
router.delete("/:id", authMiddleware, deleteMessage);

export default router;