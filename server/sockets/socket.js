const users = {};

let ioInstance = null;

export const notifyUser = (userId, notification) => {
  if (!ioInstance || !userId) return;

  const socketId = users[userId.toString()];

  if (socketId) {
    ioInstance.to(socketId).emit(
      "new-notification",
      notification
    );
  }
};
const initializeSocket = (io) => {
  ioInstance = io;
  io.on("connection", (socket) => {
    console.log("User Connected:", socket.id);

    // ==========================
    // JOIN USER
    // ==========================
    socket.on("join", (userId) => {
      if (!userId) return;

      users[userId] = socket.id;

      console.log(`User ${userId} joined`);

      // Send current online users
      io.emit("online-users", Object.keys(users));
    });

    // ==========================
    // SEND MESSAGE
    // ==========================
    socket.on(
      "send-message",
      ({ receiverId, message }) => {
        if (!receiverId || !message) return;

        const receiverSocketId = users[receiverId];

        if (receiverSocketId) {
          io.to(receiverSocketId).emit(
            "receive-message",
            message
          );
        }
      }
    );

    // ==========================
    // TYPING
    // ==========================
    socket.on(
      "typing",
      ({ receiverId, senderName }) => {
        if (!receiverId) return;

        const receiverSocketId = users[receiverId];

        if (receiverSocketId) {
          io.to(receiverSocketId).emit(
            "typing",
            {
              senderName,
            }
          );
        }
      }
    );

    // ==========================
    // STOP TYPING
    // ==========================
    socket.on(
      "stop-typing",
      ({ receiverId }) => {
        if (!receiverId) return;

        const receiverSocketId = users[receiverId];

        if (receiverSocketId) {
          io.to(receiverSocketId).emit(
            "stop-typing"
          );
        }
      }
    );

    // ==========================
    // MESSAGES SEEN
    // ==========================
    socket.on(
      "messages-seen",
      ({ senderId }) => {
        if (!senderId) return;

        const senderSocketId = users[senderId];

        if (senderSocketId) {
          io.to(senderSocketId).emit(
            "messages-seen",
            {
              senderId,
            }
          );
        }
      }
    );

    // ==========================
    // DISCONNECT
    // ==========================
    socket.on("disconnect", () => {
      for (const userId in users) {
        if (users[userId] === socket.id) {
          delete users[userId];
          break;
        }
      }

      console.log(
        "User Disconnected:",
        socket.id
      );

      // Update online users
      io.emit(
        "online-users",
        Object.keys(users)
      );
    });
  });
};

export default initializeSocket;