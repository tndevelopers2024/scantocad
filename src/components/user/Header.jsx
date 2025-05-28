import { useEffect, useState } from "react";
import { getMe, getUserNotifications } from "../../api";
import { FiBell, FiSettings, FiChevronDown, FiChevronUp, FiUser } from "react-icons/fi";

const Header = () => {
  const [username, setUsername] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

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

  // Fetch unread notifications
  const fetchUnreadNotifications = async () => {
    try {
      const res = await getUserNotifications();
      const unread = res?.data?.filter((n) => !n.isRead) || [];
      setNotifications(unread);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      setNotifications([]);
    }
  };

  // Fetch on dropdown toggle and setup polling
  useEffect(() => {
    // Polling every 15 seconds
    const interval = setInterval(fetchUnreadNotifications, 15000);
    fetchUnreadNotifications(); // initial call

    return () => clearInterval(interval); // cleanup
  }, []);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const unreadCount = notifications.length;

  return (
    <header className="flex justify-end items-center px-6 py-4 relative">
      <div className="flex items-center gap-6 relative">
        {/* Notification */}
        <div className="relative">
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

          {/* Dropdown */}
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
                      className="py-2 cursor-pointer"
                      onClick={() => toggleExpand(n._id)}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-800 truncate max-w-[60%]">
                          {n.title || "Notification"}
                        </span>
                        {expandedId === n._id ? (
                          <FiChevronUp className="text-gray-600" />
                        ) : (
                          <FiChevronDown className="text-gray-600" />
                        )}
                      </div>
                      {expandedId === n._id && (
                        <p className="mt-1 text-sm text-gray-600 whitespace-pre-wrap">
                          {n.message}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}

              <div className="absolute -top-2 right-4 w-3 h-3 bg-white transform rotate-45 shadow-md"></div>
            </div>
          )}
        </div>

        {/* Settings */}
        <FiSettings className="text-xl text-gray-700 cursor-pointer" />

        {/* Profile */}
        <div className="flex items-center gap-2 cursor-pointer">
           <FiUser className="w-6 h-6 rounded-full bg-white" />
          
          <span className="text-sm text-gray-800 font-medium">{username}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
