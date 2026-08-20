import Notification from "../models/Notification.js";

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

    return notification;
  } catch (error) {
    console.error("Create notification error:", error);
    throw error;
  }
};