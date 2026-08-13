import { useEffect, useState } from "react";
import {
  getRecentChats,
  getConversation,
  sendMessage,
} from "../services/messageService";
import socket from "../services/socket";


const Chat = () => {
  const [recentChats, setRecentChats] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [typing, setTyping] = useState(false);
  const [typingUser, setTypingUser] = useState("");

  const fetchRecentChats = async () => {
    try {
      setLoading(true);

      const data = await getRecentChats();

      setRecentChats(data || []);
    } catch (error) {
      console.error("Failed to fetch chats:", error);
    } finally {
      setLoading(false);
    }
  };

const openConversation = async (chat) => {
  try {
    console.log("Selected Chat:", chat);

    setSelectedUser(chat);

    const data = await getConversation(chat._id);

    console.log("Conversation Data:", data);

    setMessages(data || []);
  } catch (error) {
    console.error("Failed to fetch conversation:", error);
  }
};
const handleSendMessage = async () => {
  if (!message.trim() || !selectedUser) return;

  try {
    const newMessage = await sendMessage({
      receiver: selectedUser._id,
      message: message.trim(),
      image: "",
    });

    // Show sender's own message immediately
    setMessages((prev) => [...prev, newMessage]);

    // Send realtime message
    socket.emit("send-message", {
      receiverId: selectedUser._id,
      message: newMessage,
    });

    // Clear input
    setMessage("");

    // Update recent chats
    await fetchRecentChats();
  } catch (error) {
    console.error("Failed to send message:", error);
  }
};

  

 useEffect(() => {
  fetchRecentChats();

  const user = JSON.parse(localStorage.getItem("user"));

  if (user) {
    socket.emit("join", user._id);
    console.log("🟢 Joined socket as:", user._id);
  }

  const handleReceiveMessage = (newMessage) => {
    console.log("🔴 RECEIVE MESSAGE:", newMessage);

    setMessages((prev) => {
      console.log("Old messages:", prev);
      console.log("Adding realtime message:", newMessage);

      return [...prev, newMessage];
    });

    fetchRecentChats();
  };

  socket.on("receive-message", handleReceiveMessage);

  const handleTyping = ({ senderName }) => {
      setTypingUser(senderName);
      setTyping(true);
    };

    const handleStopTyping = () => {
      setTyping(false);
      setTypingUser("");
    };

    socket.on("typing", handleTyping);
    socket.on("stop-typing", handleStopTyping);
      return () => {
        socket.off("receive-message", handleReceiveMessage);
        socket.off("typing", handleTyping);
        socket.off("stop-typing", handleStopTyping);
  };
}, []);

    useEffect(() => {
  const handleReceiveMessage = (newMessage) => {
    console.log("📩 New Message Received:", newMessage);

    setMessages((prev) => [...prev, newMessage]);
  };

  socket.on("receive-message", handleReceiveMessage);

  return () => {
    socket.off("receive-message", handleReceiveMessage);
  };
}, []);

  return (
    <div className="h-screen bg-[#0B1020] flex text-white">

      {/* Sidebar */}
      <div className="w-1/4 bg-[#111827] border-r border-gray-800 flex flex-col">

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
            const currentUser = JSON.parse(localStorage.getItem("user"));

            const otherUser =
              chat.sender._id === currentUser.id
                ? chat.receiver
                : chat.sender;

            return (
              <div
                key={chat._id}
                onClick={() => openConversation(otherUser)}
                className={`p-4 border-b border-gray-800 cursor-pointer transition ${
                  selectedUser?._id === otherUser._id
                    ? "bg-cyan-700"
                    : "hover:bg-[#1F2937]"
                }`}
              >
                <h3 className="font-semibold">
                  {otherUser.name}
                </h3>

                <p className="text-sm text-gray-400 truncate">
                  {chat.message}
                </p>
              </div>
              );
})
          )}

        </div>

      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col">

        {/* Header */}
        <div className="p-5 border-b border-gray-800">

          <h2 className="text-xl font-bold">
            {selectedUser
              ? selectedUser.name
              : "Team Chat"}
          </h2>

          <p className="text-green-400 text-sm">
            {selectedUser
              ? "Online"
              : "Select a conversation"}
          </p>

        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6">

          {messages.length === 0 ? (
            <div className="flex justify-center items-center h-full text-gray-500">
              No messages yet.
            </div>
          ) : (
            messages.map((msg) => {
  const currentUser = JSON.parse(localStorage.getItem("user"));

  const isMine =
  msg.sender === currentUser?.id ||
  msg.sender?._id === currentUser?.id;

  return (
    <div
      key={msg._id}
      className={`mb-3 flex ${
        isMine ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`px-4 py-2 rounded-lg max-w-md ${
          isMine
            ? "bg-cyan-600"
            : "bg-gray-700"
        }`}
      >
        {msg.message}
      </div>
    </div>
  );
})
          )}

        </div>

        {/* Input */}
        <div className="p-5 border-t border-gray-800 flex gap-3">

          <input
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => {
              const value = e.target.value;

              setMessage(value);

              if (!selectedUser) return;

              const currentUser = JSON.parse(localStorage.getItem("user"));

              if (value.trim()) {
                socket.emit("typing", {
                  receiverId: selectedUser._id,
                  senderName: currentUser?.name,
                });
              } else {
                socket.emit("stop-typing", {
                  receiverId: selectedUser._id,
                });
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSendMessage();
              }
            }}
            className="flex-1 bg-[#111827] rounded-lg px-4 py-3 outline-none border border-gray-700 focus:border-cyan-500"
          />

          <button
            onClick={handleSendMessage}
            disabled={!selectedUser || !message.trim()}
            className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-700 disabled:cursor-not-allowed px-6 rounded-lg font-semibold"
          >
            Send
          </button>

        </div>

      </div>

    </div>
  );
};

export default Chat;