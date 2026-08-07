const users = {};

const initializeSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("User Connected:", socket.id);

    // ==========================
    // Join User
    // ==========================
    socket.on("join", (userId) => {
      users[userId] = socket.id;

      console.log(`User ${userId} joined`);

      io.emit("online-users", Object.keys(users));
    });

    // ==========================
    // Send Message
    // ==========================
    socket.on("send-message", ({ receiverId, message }) => {
      const receiverSocketId = users[receiverId];

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receive-message", message);
      }
    });

    // ==========================
    // Typing
    // ==========================
    socket.on("typing", ({ receiverId, senderName }) => {
      const receiverSocketId = users[receiverId];

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("typing", {
          senderName,
        });
      }
    });

    // ==========================
    // Stop Typing
    // ==========================
    socket.on("stop-typing", ({ receiverId }) => {
      const receiverSocketId = users[receiverId];

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("stop-typing");
      }
    });

    // ==========================
    // Disconnect
    // ==========================
    socket.on("disconnect", () => {
      for (const userId in users) {
        if (users[userId] === socket.id) {
          delete users[userId];
          break;
        }
      }

      console.log("User Disconnected:", socket.id);

      io.emit("online-users", Object.keys(users));
    });
  });
};

export default initializeSocket;