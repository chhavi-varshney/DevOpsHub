import { useEffect, useRef, useState } from "react";
import {
  getRecentChats,
  getConversation,
  sendMessage,
  markAsSeen,
} from "../services/messageService";
import socket from "../services/socket";

const EMOJIS = [
  "😀",
  "😂",
  "😍",
  "🥰",
  "😎",
  "😢",
  "😡",
  "👍",
  "👎",
  "❤️",
  "🔥",
  "🎉",
  "👏",
  "🙏",
  "💯",
  "🚀",
  "✨",
  "😊",
  "🤝",
  "💻",
];

const getId = (value) => {
  if (!value) return "";

  return typeof value === "string"
    ? value
    : value._id || "";
};

const Chat = () => {
  const [recentChats, setRecentChats] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);

  const [message, setMessage] = useState("");

  // Typing
  const [typing, setTyping] = useState(false);
  const [typingUser, setTypingUser] = useState("");

  // Online users
  const [onlineUsers, setOnlineUsers] = useState([]);

  // Image
  const [selectedImage, setSelectedImage] = useState("");

  // Emoji
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const [sending, setSending] = useState(false);

  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);

  const currentUser = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const currentUserId = getId(currentUser);

  const isUserOnline = selectedUser
    ? onlineUsers.includes(getId(selectedUser))
    : false;

  // ==========================================
  // GET RECENT CHATS
  // ==========================================

  const fetchRecentChats = async () => {
    try {
      setLoading(true);

      const data = await getRecentChats();

      const chats = data || [];

      const uniqueChats = [];
      const seenUsers = new Set();

      for (const chat of chats) {
        const senderId = getId(chat.sender);

        const otherUser =
          senderId === currentUserId
            ? chat.receiver
            : chat.sender;

        const otherUserId = getId(otherUser);

        if (!otherUserId) continue;

        if (seenUsers.has(otherUserId)) {
          continue;
        }

        seenUsers.add(otherUserId);

        uniqueChats.push({
          ...chat,
          otherUser,
        });
      }

      setRecentChats(uniqueChats);
    } catch (error) {
      console.error(
        "Failed to fetch chats:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // ADD MESSAGE WITHOUT DUPLICATE
  // ==========================================

  const addMessageIfNew = (newMessage) => {
    if (!newMessage?._id) return;

    setMessages((prev) => {
      const alreadyExists = prev.some(
        (msg) => msg._id === newMessage._id
      );

      if (alreadyExists) {
        return prev;
      }

      return [...prev, newMessage];
    });
  };

  // ==========================================
  // OPEN CONVERSATION
  // ==========================================

  const openConversation = async (user) => {
    try {
      setSelectedUser(user);

      setTyping(false);
      setTypingUser("");

      const data = await getConversation(
        user._id
      );

      setMessages(data || []);

      // 6.12 Mark messages as seen
      await markAsSeen(user._id);

      // Tell sender that messages are seen
      socket.emit("messages-seen", {
        senderId: user._id,
      });

      await fetchRecentChats();
    } catch (error) {
      console.error(
        "Failed to fetch conversation:",
        error
      );
    }
  };

  // ==========================================
  // STOP TYPING
  // ==========================================

  const stopTyping = () => {
    if (!selectedUser) return;

    socket.emit("stop-typing", {
      receiverId: selectedUser._id,
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);

      typingTimeoutRef.current = null;
    }
  };

  // ==========================================
  // HANDLE INPUT / TYPING
  // ==========================================

  const handleInputChange = (e) => {
    const value = e.target.value;

    setMessage(value);

    if (!selectedUser) return;

    if (!value.trim()) {
      stopTyping();
      return;
    }

    socket.emit("typing", {
      receiverId: selectedUser._id,
      senderName: currentUser?.name || "User",
    });

    if (typingTimeoutRef.current) {
      clearTimeout(
        typingTimeoutRef.current
      );
    }

    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 1200);
  };

  // ==========================================
  // EMOJI
  // ==========================================

  const handleEmojiClick = (emoji) => {
    setMessage((prev) => prev + emoji);

    setShowEmojiPicker(false);
  };

  // ==========================================
  // IMAGE
  // ==========================================

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    // Maximum 2 MB
    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be smaller than 2MB.");

      e.target.value = "";

      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setSelectedImage(reader.result);
    };

    reader.readAsDataURL(file);
  };

  // ==========================================
  // SEND MESSAGE
  // ==========================================

  const handleSendMessage = async () => {
    if (
      (!message.trim() && !selectedImage) ||
      !selectedUser ||
      sending
    ) {
      return;
    }

    try {
      setSending(true);

      stopTyping();

      const newMessage = await sendMessage({
        receiver: selectedUser._id,

        message: message.trim(),

        image: selectedImage,
      });

      // Add own message immediately
      addMessageIfNew(newMessage);

      // Realtime
      socket.emit("send-message", {
        receiverId: selectedUser._id,

        message: newMessage,
      });

      setMessage("");

      setSelectedImage("");

      setShowEmojiPicker(false);

      await fetchRecentChats();
    } catch (error) {
      console.error(
        "Failed to send message:",
        error
      );
    } finally {
      setSending(false);
    }
  };

  // ==========================================
  // SOCKET SETUP
  // ==========================================

  useEffect(() => {
    if (!currentUserId) return;

    fetchRecentChats();

    if (!socket.connected) {
      socket.connect();
    }

    // Join user
    const joinUser = () => {
      socket.emit(
        "join",
        currentUserId
      );

      console.log(
        "🟢 Joined socket as:",
        currentUserId
      );
    };

    // Receive message
    const handleReceiveMessage = (
      newMessage
    ) => {
      console.log(
        "🔴 RECEIVE MESSAGE:",
        newMessage
      );

      const senderId = getId(
        newMessage?.sender
      );

      const receiverId = getId(
        newMessage?.receiver
      );

      if (
        selectedUser &&
        (
          (
            senderId ===
              getId(selectedUser) &&
            receiverId === currentUserId
          ) ||
          (
            senderId === currentUserId &&
            receiverId ===
              getId(selectedUser)
          )
        )
      ) {
        addMessageIfNew(newMessage);

        // Automatically mark incoming
        // message as seen
        if (
          senderId ===
          getId(selectedUser)
        ) {
          markAsSeen(senderId).catch(
            (error) => {
              console.error(
                "Failed to mark message as seen:",
                error
              );
            }
          );

          socket.emit(
            "messages-seen",
            {
              senderId,
            }
          );
        }
      }

      fetchRecentChats();
    };

    // Online users
    const handleOnlineUsers = (
      users
    ) => {
      setOnlineUsers(users || []);
    };

    // Typing
    const handleTyping = ({
      senderName,
    }) => {
      setTypingUser(
        senderName || "Someone"
      );

      setTyping(true);
    };

    // Stop typing
    const handleStopTyping = () => {
      setTyping(false);

      setTypingUser("");
    };

    // Seen messages
    const handleMessagesSeen = ({
      senderId,
    }) => {
      setMessages((prev) =>
        prev.map((msg) => {
          const receiverId = getId(
            msg.receiver
          );

          const senderIdOfMessage =
            getId(msg.sender);

          if (
            receiverId === senderId &&
            senderIdOfMessage ===
              currentUserId
          ) {
            return {
              ...msg,
              seen: true,
              isSeen: true,
            };
          }

          return msg;
        })
      );
    };

    socket.on(
      "connect",
      joinUser
    );

    socket.on(
      "receive-message",
      handleReceiveMessage
    );

    socket.on(
      "online-users",
      handleOnlineUsers
    );

    socket.on(
      "typing",
      handleTyping
    );

    socket.on(
      "stop-typing",
      handleStopTyping
    );

    socket.on(
      "messages-seen",
      handleMessagesSeen
    );

    if (socket.connected) {
      joinUser();
    }

    return () => {
      socket.off(
        "connect",
        joinUser
      );

      socket.off(
        "receive-message",
        handleReceiveMessage
      );

      socket.off(
        "online-users",
        handleOnlineUsers
      );

      socket.off(
        "typing",
        handleTyping
      );

      socket.off(
        "stop-typing",
        handleStopTyping
      );

      socket.off(
        "messages-seen",
        handleMessagesSeen
      );

      if (typingTimeoutRef.current) {
        clearTimeout(
          typingTimeoutRef.current
        );
      }
    };
  }, [
    currentUserId,
    selectedUser,
  ]);

  // ==========================================
  // AUTO SCROLL
  // ==========================================

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, typing]);

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="h-screen bg-[#0B1020] flex text-white">

      {/* SIDEBAR */}

      <div className="w-1/4 min-w-[240px] bg-[#111827] border-r border-gray-800 flex flex-col">

        <div className="p-5 border-b border-gray-800">

          <h2 className="text-2xl font-bold text-cyan-400">
            💬 Team Chat
          </h2>

          <p className="text-gray-400 text-sm mt-1">
            Recent Conversations
          </p>

        </div>

        <div className="flex-1 overflow-y-auto">

          {loading ? (
            <p className="text-center mt-10 text-gray-400">
              Loading Chats...
            </p>
          ) : recentChats.length === 0 ? (
            <p className="text-center mt-10 text-gray-400">
              No Chats Yet
            </p>
          ) : (
            recentChats.map((chat) => {

              const otherUser =
                chat.otherUser;

              return (
                <div
                  key={chat._id}
                  onClick={() =>
                    openConversation(
                      otherUser
                    )
                  }
                  className={`p-4 border-b border-gray-800 cursor-pointer transition ${
                    selectedUser?._id ===
                    otherUser?._id
                      ? "bg-cyan-700"
                      : "hover:bg-[#1F2937]"
                  }`}
                >

                  <div className="flex items-center gap-2">

                    <span
                      className={`w-2 h-2 rounded-full ${
                        onlineUsers.includes(
                          getId(otherUser)
                        )
                          ? "bg-green-400"
                          : "bg-gray-500"
                      }`}
                    />

                    <h3 className="font-semibold">
                      {otherUser?.name}
                    </h3>

                  </div>

                  <p className="text-sm text-gray-400 truncate mt-1">

                    {chat.message ||
                      (
                        chat.image
                          ? "📷 Image"
                          : "No messages"
                      )}

                  </p>

                </div>
              );
            })
          )}

        </div>

      </div>

      {/* CHAT WINDOW */}

      <div className="flex-1 flex flex-col">

        {/* HEADER */}

        <div className="p-5 border-b border-gray-800">

          <h2 className="text-xl font-bold">

            {selectedUser
              ? selectedUser.name
              : "Team Chat"}

          </h2>

          <p
            className={`text-sm ${
              selectedUser &&
              isUserOnline
                ? "text-green-400"
                : "text-gray-500"
            }`}
          >

            {selectedUser
              ? isUserOnline
                ? "Online"
                : "Offline"
              : "Select a conversation"}

          </p>

        </div>

        {/* MESSAGES */}

        <div className="flex-1 overflow-y-auto p-6">

          {messages.length === 0 ? (

            <div className="flex justify-center items-center h-full text-gray-500">

              No messages yet.

            </div>

          ) : (

            messages.map((msg) => {

              const isMine =
                getId(msg.sender) ===
                currentUserId;

              return (

                <div
                  key={msg._id}
                  className={`mb-3 flex ${
                    isMine
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >

                  <div
                    className={`px-4 py-2 rounded-lg max-w-md ${
                      isMine
                        ? "bg-cyan-600"
                        : "bg-gray-700"
                    }`}
                  >

                    {/* IMAGE */}

                    {msg.image && (

                      <img
                        src={msg.image}
                        alt="Shared"
                        className="max-w-xs max-h-64 rounded-lg mb-2 object-contain"
                      />

                    )}

                    {/* TEXT */}

                    {msg.message && (
                      <p>
                        {msg.message}
                      </p>
                    )}

                    {/* SEEN */}

                    {isMine && (

                      <p className="text-[10px] text-right mt-1 opacity-70">

                        {msg.seen ||
                        msg.isSeen
                          ? "✓✓ Seen"
                          : "✓ Sent"}

                      </p>

                    )}

                  </div>

                </div>

              );
            })

          )}

          {/* TYPING INDICATOR */}

          {typing &&
            selectedUser && (

              <p className="text-sm text-gray-400 italic mb-2">

                {typingUser} is typing...

              </p>

          )}

          <div ref={messagesEndRef} />

        </div>

        {/* IMAGE PREVIEW */}

        {selectedImage && (

          <div className="px-5 pb-2 flex items-center gap-3">

            <img
              src={selectedImage}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-gray-700"
            />

            <button
              onClick={() =>
                setSelectedImage("")
              }
              className="text-red-400 hover:text-red-300"
            >
              Remove
            </button>

          </div>

        )}

        {/* INPUT */}

        <div className="p-5 border-t border-gray-800 flex gap-3 items-center relative">

          {/* EMOJI BUTTON */}

          <div className="relative">

            <button
              type="button"
              onClick={() =>
                setShowEmojiPicker(
                  (prev) => !prev
                )
              }
              disabled={!selectedUser}
              className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 px-3 py-3 rounded-lg"
            >
              😊
            </button>

            {showEmojiPicker && (

              <div className="absolute bottom-14 left-0 bg-[#1F2937] border border-gray-700 rounded-lg p-3 grid grid-cols-5 gap-2 w-60 shadow-xl z-10">

                {EMOJIS.map(
                  (emoji) => (

                    <button
                      key={emoji}
                      type="button"
                      onClick={() =>
                        handleEmojiClick(
                          emoji
                        )
                      }
                      className="text-xl hover:bg-gray-600 rounded p-1"
                    >
                      {emoji}
                    </button>

                  )
                )}

              </div>

            )}

          </div>

          {/* IMAGE BUTTON */}

          <label
            className={`bg-gray-700 hover:bg-gray-600 px-3 py-3 rounded-lg cursor-pointer ${
              !selectedUser
                ? "opacity-50 pointer-events-none"
                : ""
            }`}
          >

            📷

            <input
              type="file"
              accept="image/*"
              onChange={
                handleImageChange
              }
              className="hidden"
              disabled={!selectedUser}
            />

          </label>

          {/* TEXT INPUT */}

          <input
            type="text"
            placeholder={
              selectedUser
                ? "Type a message..."
                : "Select a conversation first"
            }
            value={message}
            onChange={
              handleInputChange
            }
            onBlur={stopTyping}
            onKeyDown={(e) => {

              if (e.key === "Enter") {

                e.preventDefault();

                handleSendMessage();

              }

            }}
            disabled={!selectedUser}
            className="flex-1 bg-[#111827] rounded-lg px-4 py-3 outline-none border border-gray-700 focus:border-cyan-500 disabled:opacity-60"
          />

          {/* SEND */}

          <button
            onClick={
              handleSendMessage
            }
            disabled={
              !selectedUser ||
              (!message.trim() &&
                !selectedImage) ||
              sending
            }
            className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-700 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-semibold"
          >

            {sending
              ? "Sending..."
              : "Send"}

          </button>

        </div>

      </div>

    </div>
  );
};

export default Chat;