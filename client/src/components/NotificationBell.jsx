import { useEffect, useState } from "react";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../services/notificationService";
import socket from "../services/socket";

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);

      const data = await getNotifications();

      if (data.success) {
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error(
        "Fetch Notifications Error:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
  const handleNewNotification = (notification) => {
    setNotifications((prev) => [
      notification,
      ...prev,
    ]);
  };

  socket.on(
    "new-notification",
    handleNewNotification
  );

  return () => {
    socket.off(
      "new-notification",
      handleNewNotification
    );
  };
}, []);

useEffect(() => {
  const currentUser = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const currentUserId =
    currentUser?._id || currentUser?.id;

  if (!currentUserId) return;

  const joinUser = () => {
    socket.emit("join", currentUserId);

    console.log(
      "🟢 Notification socket joined:",
      currentUserId
    );
  };

  if (!socket.connected) {
    socket.connect();
  }

  socket.on("connect", joinUser);

  if (socket.connected) {
    joinUser();
  }

  return () => {
    socket.off("connect", joinUser);
  };
}, []);

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  const handleNotificationClick = async (notification) => {
  try {
    if (!notification.isRead) {
      await markNotificationAsRead(notification._id);

      setNotifications((prev) =>
        prev.map((item) =>
          item._id === notification._id
            ? { ...item, isRead: true }
            : item
        )
      );
    }
  } catch (error) {
    console.error(
      "Mark notification as read error:",
      error.response?.data || error.message
    );
  }
};

const handleMarkAllRead = async () => {
  try {
    await markAllNotificationsAsRead();

    setNotifications((prev) =>
      prev.map((notification) => ({
        ...notification,
        isRead: true,
      }))
    );
  } catch (error) {
    console.error(
      "Mark all notifications as read error:",
      error.response?.data || error.message
    );
  }
};

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 text-white hover:bg-gray-700"
      >
        🔔

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-3 w-96 overflow-hidden rounded-xl border border-gray-700 bg-gray-900 shadow-2xl">
          <div className="flex items-center justify-between border-b border-gray-700 px-4 py-3">
          <h3 className="font-semibold text-white">
            Notifications
          </h3>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              Mark all as read
            </button>
          )}
        </div>

            <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-5 text-center text-gray-400">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <div className="mb-2 text-3xl">🔔</div>
                <p>No notifications</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`cursor-pointer border-b border-gray-800 px-4 py-4 ${
                    !notification.isRead
                      ? "bg-gray-800/70"
                      : ""
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="text-xl">
                      {notification.type === "TASK_ASSIGNED"
                        ? "📋"
                        : notification.type === "BUG_ASSIGNED"
                        ? "🐞"
                        : notification.type === "MENTION"
                        ? "💬"
                        : notification.type === "SPRINT_COMPLETE"
                        ? "🏁"
                        : "🔔"}
                    </div>

                    <div className="flex-1">
                      <p className="text-sm text-gray-200">
                        {notification.message}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {new Date(
                          notification.createdAt
                        ).toLocaleString()}
                      </p>
                    </div>

                    {!notification.isRead && (
                      <span className="mt-2 h-2 w-2 rounded-full bg-blue-500" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;