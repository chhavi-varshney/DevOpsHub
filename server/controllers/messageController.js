import Message from "../models/Message.js";
import User from "../models/User.js";
import { createNotification } from "../services/notificationService.js";
// Send Message
// Send Message
export const sendMessage = async (req, res) => {
  try {
    const {
      receiver,
      message,
      image,
    } = req.body;

    if (
      !receiver ||
      (!message?.trim() && !image)
    ) {
      return res.status(400).json({
        success: false,
        message: "Message or image is required",
      });
    }

    const newMessage = await Message.create({
      sender: req.user.id,
      receiver,
      message: message?.trim() || "",
      image: image || "",
    });

    // Mention notification
// Mention notification
if (message) {
  const mentionMatches = message.match(/@([a-zA-Z0-9_]+)/g);

  if (mentionMatches) {
    const senderUser = await User.findById(req.user.id);

    for (const mention of mentionMatches) {
      const mentionedName = mention.substring(1);

      const mentionedUser = await User.findOne({
        name: {
          $regex: `^${mentionedName}$`,
          $options: "i",
        },
      });

      if (
        mentionedUser &&
        mentionedUser._id.toString() !== req.user.id.toString()
      ) {
        await createNotification({
          recipient: mentionedUser._id,
          sender: req.user.id,
          type: "MENTION",
          message: `${senderUser?.name || "Someone"} mentioned you in a message`,
          relatedId: newMessage._id,
        });
      }
    }
  }
}

    res.status(201).json({
      success: true,
      data: newMessage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// Get Conversation
export const getConversation = async (req, res) => {
  try {
    const receiverId = req.params.receiverId;

    const messages = await Message.find({
      $or: [
        {
          sender: req.user.id,
          receiver: receiverId,
        },
        {
          sender: receiverId,
          receiver: req.user.id,
        },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("sender", "name email avatar")
      .populate("receiver", "name email avatar");

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Mark Messages as Seen
export const markAsSeen = async (req, res) => {
  try {
    const { senderId } = req.body;

        await Message.updateMany(
      {
        sender: senderId,
        receiver: req.user.id,
        seen: false,
      },
      {
        seen: true,
      }
    );
    res.status(200).json({
      success: true,
      message: "Messages marked as seen",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Recent Chats
export const getRecentChats = async (req, res) => {
  try {
    const userId = req.user.id;

    const chats = await Message.find({
      $or: [
        { sender: userId },
        { receiver: userId },
      ],
    })
      .sort({ createdAt: -1 })
      .populate("sender", "name email avatar")
      .populate("receiver", "name email avatar");

    res.status(200).json({
      success: true,
      data: chats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Message
export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;

    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    await Message.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};