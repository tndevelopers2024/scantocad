import { useEffect, useState, useRef, useCallback } from "react";
import { getMe, getUserNotifications, markNotificationAsRead } from "../../api";
import { FiBell, FiSettings, FiChevronDown, FiChevronUp, FiUser, FiLogOut, FiHelpCircle } from "react-icons/fi";
import { useSocket } from "../../contexts/SocketProvider";
import { Link } from "react-router-dom";

const Header = () => {
  const [username, setUsername] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const { socket } = useSocket();

  const notificationRef = useRef(null);
  const settingsRef = useRef(null);

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

  // Handle adding new notifications
  const addNotification = useCallback((payload, title) => {
    const payloads = Array.isArray(payload) ? payload : [payload];
    const newNotifs = payloads.map((p) => ({
      _id: p.quotationId || Date.now().toString(), // Use quotationId if available, otherwise generate an ID
      title,
      message: p.message,
      isRead: false,
      createdAt: new Date().toISOString(),
    }));
    setNotifications((prev) => [...newNotifs, ...prev]);
  }, []);

  // Fetch notifications and setup WebSocket listeners
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await getUserNotifications();
        const unread = res?.data?.filter((n) => !n.isRead) || [];
        setNotifications(unread);
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
        setNotifications([]);
      }
    };

    fetchNotifications();

    if (!socket) return;

    const handleQuotationRaised = (payload) => addNotification(payload, "Quotation Raised");
    const handleQuotationDecision = (payload) => addNotification(payload, "Quotation Status Updated");
    const handleQuotationOngoing = (payload) => addNotification(payload, "Quotation Ongoing");
    const handleQuotationCompleted = (payload) => addNotification(payload, "Quotation Completed");
    const handleNotificationRead = (update) => {
      setNotifications((prev) =>
        prev.map((n) => (n._id === update.id ? { ...n, isRead: true } : n))
      );
    };

    const attachListeners = () => {
      socket.on("quotation:raised", handleQuotationRaised);
      socket.on("quotation:decision", handleQuotationDecision);
      socket.on("quotation:ongoing", handleQuotationOngoing);
      socket.on("quotation:completed", handleQuotationCompleted);
      socket.on("notification:read", handleNotificationRead);
    };

    if (socket.connected) {
      attachListeners();
    } else {
      socket.once("connect", attachListeners);
    }

    return () => {
      socket.off("quotation:raised", handleQuotationRaised);
      socket.off("quotation:decision", handleQuotationDecision);
      socket.off("quotation:ongoing", handleQuotationOngoing);
      socket.off("quotation:completed", handleQuotationCompleted);
      socket.off("notification:read", handleNotificationRead);
      socket.off("connect", attachListeners);
    };
  }, [socket, addNotification]);

  // Click outside handler
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

  const toggleExpand = async (id) => {
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
    setExpandedId(expandedId === id ? null : id);
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

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
            <div className="absolute top-8 right-0 bg-white shadow-lg rounded-xl w-72 p-4 z-50 max-h-80 overflow-auto">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Notifications
              </h3>

              {notifications.length === 0 ? (
                <p className="text-gray-500 text-sm">No unread notifications.</p>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {notifications.map((n) => (
                    <li
                      key={n._id}
                      className={`py-2 cursor-pointer ${n.isRead ? "opacity-75" : ""}`}
                      onClick={() => toggleExpand(n._id)}
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
            onClick={() => setShowSettings(prev => !prev)}
          >
            <FiSettings className="text-xl text-gray-700" />
          </button>
          
          {/* Settings Dropdown */}
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