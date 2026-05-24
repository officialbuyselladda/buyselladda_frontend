import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Bell, CheckCircle, AlertCircle, Mail, ChevronRight } from 'lucide-react';
import { cn } from '../utils';
import { toast } from 'react-hot-toast';

const BRAND_NAME = 'BuySellAdda';
const OFFICIAL_NOTIFICATION_TYPES = new Set(['product_status', 'system', 'promotion']);

const normalizeOfficialText = (text) => String(text || '').replace(/\badmin\b/gi, BRAND_NAME);
const isOfficialNotification = (notification) => OFFICIAL_NOTIFICATION_TYPES.has(notification?.type);

const Notifications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingRead, setLoadingRead] = useState({});

  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.data.notifications || []);
    } catch (error) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const { data } = await api.get('/notifications/unread-count');
      setUnreadCount(data.data.unreadCount);
    } catch (error) {
      console.error('Unread count error:', error);
    }
  };

  const markAsRead = async (id) => {
    try {
      setLoadingRead(prev => ({ ...prev, [id]: true }));
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => 
        n._id === id ? { ...n, isRead: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
      toast.success('Marked as read');
    } catch (error) {
      toast.error('Failed to mark as read');
    } finally {
      setLoadingRead({});
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  if (!user) {
    return null; // Protected by route
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Bell className="w-10 h-10 text-blue-500" />
            <div>
              <h1 className="text-3xl font-black text-gray-900">Notifications</h1>
              <p className="text-gray-600">
                {unreadCount > 0 && (
                  <span className="font-semibold text-blue-600 ml-2">{unreadCount} unread</span>
                )}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all"
              >
                Mark all read
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 border border-gray-100 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-gray-100">
            <Bell className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No notifications</h3>
            <p className="text-gray-500 mb-8">You'll see updates here when someone messages you or your ad status changes.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={cn(
                  "bg-white rounded-xl border p-6 hover:shadow-md transition-all cursor-pointer group",
                  !notification.isRead && "border-blue-200 bg-blue-50 shadow-sm ring-2 ring-blue-100"
                )}
                onClick={async () => {
                  if (!notification.isRead) await markAsRead(notification._id);
                  if (notification.type === 'new_message' && notification.relatedChat?._id) {
                    navigate(`/chats/${notification.relatedChat._id}`);
                  }
                }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 pt-0.5">
                    {notification.type === 'new_message' && <Mail className="w-10 h-10 text-blue-500" />}
                    {notification.type === 'product_status' && (
                      notification.data.status === 'approved' ? 
                      <CheckCircle className="w-10 h-10 text-green-500" /> :
                      <AlertCircle className="w-10 h-10 text-yellow-500" />
                    )}
                    {notification.priority === 'high' && (
                      <AlertCircle className="w-10 h-10 text-orange-500 animate-pulse" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    {isOfficialNotification(notification) && (
                      <p className="mb-1 text-xs font-black uppercase tracking-wide text-orange-600">
                        {BRAND_NAME}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900 text-lg line-clamp-1">
                        {isOfficialNotification(notification)
                          ? normalizeOfficialText(notification.title || `${BRAND_NAME} ki taraf se message aaya`)
                          : normalizeOfficialText(notification.title)}
                      </h4>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      )}
                    </div>
                    <p className="text-gray-600 mb-2 line-clamp-2">{normalizeOfficialText(notification.message)}</p>
                    
                    {notification.relatedProduct && (
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2 p-2 bg-gray-50 rounded-lg">
                        <img src={notification.relatedProduct.images?.[0]?.url} alt="" className="w-8 h-8 rounded object-cover" />
                        <span className="font-medium">{notification.relatedProduct.title}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span>{new Date(notification.createdAt).toLocaleString()}</span>
                      <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                    </div>
                  </div>
                  
                  {!notification.isRead && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(notification._id);
                      }}
                      disabled={loadingRead[notification._id]}
                      className="flex-shrink-0 p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-all ml-auto"
                      title="Mark as read"
                    >
                      {loadingRead[notification._id] ? (
                        <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                      ) : (
                        <CheckCircle className="w-5 h-5" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;

