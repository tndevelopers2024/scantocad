import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { getMe, getUserNotifications, markNotificationAsRead } from "../../api";
import { FiBell, FiSettings, FiChevronDown, FiChevronUp, FiUser, FiLogOut, FiHelpCircle } from "react-icons/fi";
import { useSocket } from "../../contexts/SocketProvider";
import { Link } from "react-router-dom";
import debounce from 'lodash/debounce';

const Header = () => {
  const [username, setUsername] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { socket } = useSocket();

  const notificationRef = useRef(null);
  const settingsRef = useRef(null);
  const isFetchingRef = useRef(false); // To prevent overlapping fetches

  // Fetch user info
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await getMe();
        setUsername(response?.data?.name || "User");
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        setUsername("Guest");
      }
    };

    fetchUser();
  }, []);

  // Main notifications fetch with guard
  const fetchNotifications = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setIsLoading(true);
    try {
      const res = await getUserNotifications();
      const newUnread = res?.data?.filter((n) => !n.isRead) || [];

      setNotifications((prev) => {
        if (JSON.stringify(prev) !== JSON.stringify(newUnread)) {
          return newUnread;
        }
        return prev;
      });
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      setNotifications([]);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  // Debounced fetchNotifications for socket events
  const debouncedFetchNotifications = useMemo(() => debounce(fetchNotifications, 1000), [fetchNotifications]);

  // Attach socket event listeners
useEffect(() => {
  if (!socket) return;

  const events = [
    "quotation:requested",
    "quotation:raised",
    "quotation:decision",
    "quotation:ongoing",
    "quotation:completed",
    "notification:read"
  ];

  const attachListeners = () => {
    events.forEach((event) => {
      socket.off(event);
      socket.on(event, (data) => {
        console.log(`[Socket] Received event: ${event}`, data);
        debouncedFetchNotifications();
      });
    });

    console.log("[Socket] Event listeners attached:", events);
  };

  if (socket.connected) {
    console.log("[Socket] Connected:", socket.id);
    attachListeners();
  } else {
    socket.once("connect", () => {
      console.log("[Socket] Connected (from .once):", socket.id);
      attachListeners();
    });
  }

  socket.on("disconnect", () => {
    console.log("[Socket] Disconnected");
  });

  return () => {
    events.forEach((event) => {
      socket.off(event);
    });
    socket.off("connect");
    socket.off("disconnect");
    console.log("[Socket] Event listeners cleaned up");
  };
}, [socket, debouncedFetchNotifications]);

  // Initial fetch and refresh when dropdown is open
  useEffect(() => {
    fetchNotifications(); // Initial fetch

    const interval = setInterval(() => {
      if (showNotification) {
        fetchNotifications();
      }
    }, 30000); // every 30s

    return () => clearInterval(interval);
  }, [fetchNotifications, showNotification]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotification(false);
        setExpandedId(null);
      }
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setShowSettings(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Toggle expanded notification (debounced read)
  const debouncedToggle = useMemo(
    () =>
      debounce(async (id) => {
        if (expandedId !== id) {
          try {
            await markNotificationAsRead(id);
            setNotifications((prev) =>
              prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
            );
          } catch (err) {
            console.error("Failed to mark notification as read:", err);
          }
        }
        setExpandedId((prevId) => (prevId === id ? null : id));
      }, 300),
    [expandedId]
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedToggle.cancel();
      debouncedFetchNotifications.cancel();
    };
  }, [debouncedToggle, debouncedFetchNotifications]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  return (
    <header className="flex justify-end items-center px-6 py-4 relative">
      <div className="flex items-center gap-6 relative">
        {/* Notification Bell */}
        <div className="relative" ref={notificationRef}>
          <button
            className="relative mt-2.5"
            onClick={() => setShowNotification((prev) => !prev)}
            aria-haspopup="true"
            aria-expanded={showNotification}
            aria-label="Toggle notifications dropdown"
          >
            <FiBell className="text-xl text-gray-700" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotification && (
            <div className="absolute top-8 right-0 bg-white shadow-lg rounded-xl w-[500px] p-4 z-50 max-h-80 overflow-auto">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
                {isLoading && (
                  <span className="text-xs text-gray-500">Loading...</span>
                )}
              </div>

              {notifications.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  {isLoading ? "Loading notifications..." : "No unread notifications."}
                </p>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {notifications.map((n) => (
                    <li
                      key={n._id}
                      className={`py-2 cursor-pointer ${n.isRead ? "opacity-75" : ""}`}
                      onClick={() => debouncedToggle(n._id)}
                    >
                      <div className="flex justify-between items-center">
                        <span className={`font-medium ${n.isRead ? "text-gray-600" : "text-gray-800"} truncate max-w-[60%]`}>
                          {n.title || "Notification"}
                        </span>
                        {expandedId === n._id ? (
                          <FiChevronUp className="text-gray-600" />
                        ) : (
                          <FiChevronDown className="text-gray-600" />
                        )}
                      </div>
                      {expandedId === n._id && (
                        <div className="mt-1">
                          <p className="text-sm text-gray-600 whitespace-pre-wrap">
                            {n.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(n.createdAt).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Settings and Profile */}
        <div className="relative" ref={settingsRef}>
          <button
            className="p-1"
            aria-label="Settings"
            onClick={() => setShowSettings((prev) => !prev)}
          >
            <FiSettings className="text-xl text-gray-700" />
          </button>

          {showSettings && (
            <div className="absolute top-8 right-0 bg-white shadow-lg rounded-xl w-48 p-2 z-50">
              <Link
                to="/help-center"
                className="flex items-center gap-2 p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                onClick={() => setShowSettings(false)}
              >
                <FiHelpCircle className="text-gray-600" />
                <span>Help Center</span>
              </Link>
              <Link
                to="/logout"
                className="flex items-center gap-2 p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                onClick={() => setShowSettings(false)}
              >
                <FiLogOut className="text-gray-600" />
                <span>Logout</span>
              </Link>
            </div>
          )}
        </div>

        <button className="flex items-center gap-2" aria-label="User profile">
          <FiUser className="w-6 h-6 rounded-full bg-white" />
          <span className="text-sm text-gray-800 font-medium">{username}</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
