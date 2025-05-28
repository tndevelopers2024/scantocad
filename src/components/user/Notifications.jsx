import React, { useState, useEffect } from 'react';
import {
  getUserNotifications,
  markNotificationAsRead,
  deleteUserNotification,
} from '../../api';
import { useNavigate } from 'react-router-dom';
import {
  FiTrash2,
  FiMail,
  FiBell,
  FiCheckCircle,
  FiAlertCircle,
  FiRefreshCw,
  FiChevronDown,
  FiChevronUp,
  FiCheck
} from 'react-icons/fi';
import { toast } from 'react-toastify';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [processingIds, setProcessingIds] = useState(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await getUserNotifications();
      if (res && Array.isArray(res.data)) {
        setNotifications(res.data);
      } else {
        throw new Error('Invalid response format');
      }
      setError(null);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError('Failed to load notifications. Please try again.');
      toast.error('Failed to load notifications');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      setProcessingIds(prev => new Set(prev).add(id));
      
      const response = await markNotificationAsRead(id);
      
      if (!response || !response.success) {
        throw new Error(response?.message || 'Failed to mark as read');
      }
      
      setNotifications(prev =>
        prev.map(n => (n._id === id ? { ...n, isRead: true } : n))
      );
      toast.success('Notification marked as read');
    } catch (err) {
      console.error('Failed to mark as read:', err);
      toast.error(err.message || 'Failed to mark notification as read');
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      setProcessingIds(prev => new Set(prev).add(id));
      
      const response = await deleteUserNotification(id);
      
      if (!response || !response.success) {
        throw new Error(response?.message || 'Failed to delete notification');
      }
      
      setNotifications(prev => prev.filter(n => n._id !== id));
      toast.success('Notification deleted');
    } catch (err) {
      console.error('Failed to delete notification:', err);
      toast.error(err.message || 'Failed to delete notification');
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'read') return n.isRead;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="text-gray-600">Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className=" mx-auto p-4 sm:p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-600 mr-3">
                <FiBell className="text-xl" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Notifications</h1>
                <p className="text-sm text-gray-500">
                  {unreadCount > 0 
                    ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                    : 'All caught up!'}
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-md pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All notifications</option>
                  <option value="unread">Unread only</option>
                  <option value="read">Read only</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <FiChevronDown />
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mx-4 mt-4 rounded">
            <div className="flex items-center">
              <FiAlertCircle className="text-red-500 text-xl mr-2" />
              <p className="text-red-700 font-medium">{error}</p>
            </div>
            <button
              onClick={fetchNotifications}
              className="mt-3 flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FiRefreshCw className="mr-2" />
              Retry
            </button>
          </div>
        )}

        {filteredNotifications.length === 0 ? (
          <div className="p-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <FiMail className="text-gray-400 text-2xl" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No notifications</h3>
            <p className="text-gray-500">
              {filter === 'all'
                ? "You don't have any notifications yet."
                : filter === 'unread'
                ? "You've read all your notifications."
                : "You don't have any read notifications."}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredNotifications.map((n) => (
              <li
                key={n._id}
                className={`${n.isRead ? 'bg-white' : 'bg-blue-50'} hover:bg-gray-50 transition-colors`}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3
                          className={`text-sm ${
                            n.isRead ? 'font-medium text-gray-800' : 'font-semibold text-blue-700'
                          }`}
                        >
                          {n.title || 'Notification'}
                        </h3>
                        {!n.isRead && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            New
                          </span>
                        )}
                      </div>
                      
                      <div className="mt-1">
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {n.message}
                        </p>
                         {n.createdAt && (
                            <p className="mt-2 text-xs text-gray-500">
                              {new Date(n.createdAt).toLocaleString()}
                            </p>
                          )}
                       
                      </div>
                      
                    
                    </div>
                    
                    <div className="ml-4 flex-shrink-0 flex gap-2">
                      {!n.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(n._id)}
                          disabled={processingIds.has(n._id)}
                          title="Mark as read"
                          className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-gray-100 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processingIds.has(n._id) ? (
                            <FiRefreshCw className="animate-spin" />
                          ) : (
                            <FiCheck />
                          )}
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(n._id)}
                        disabled={processingIds.has(n._id)}
                        title="Delete"
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-gray-100 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processingIds.has(n._id) ? (
                          <FiRefreshCw className="animate-spin" />
                        ) : (
                          <FiTrash2 />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
