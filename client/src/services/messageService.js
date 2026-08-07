import api from "./api";

// ==============================
// Get Recent Chats
// ==============================
export const getRecentChats = async () => {
  const res = await api.get("/messages/recent/all");
  return res.data.data;
};

// ==============================
// Get Conversation
// ==============================
export const getConversation = async (receiverId) => {
  const res = await api.get(`/messages/${receiverId}`);
  return res.data.data;
};

// ==============================
// Send Message
// ==============================
export const sendMessage = async (data) => {
  const res = await api.post("/messages", data);
  return res.data.data;
};

// ==============================
// Mark Messages as Seen
// ==============================
export const markAsSeen = async (senderId) => {
  const res = await api.put("/messages/seen", {
    senderId,
  });

  return res.data;
};