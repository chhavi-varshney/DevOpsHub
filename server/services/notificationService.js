import Notification from "../models/Notification.js";
import { notifyUser } from "../sockets/socket.js";

export const createNotification = async ({
  recipient,
  sender = null,
  type,
  message,
  relatedId = null,
}) => {
  try {
    const notification = await Notification.create({
      recipient,
      sender,
      type,
      message,
      relatedId,
    });

    // Send notification in real-time through Socket.io
    notifyUser(notification.recipient, notification);

    return notification;
  } catch (error) {
    console.error("Create notification error:", error);
    throw error;
  }
};