import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { chatApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MessageCircle, User, Clock, Phone, MapPin, Package, ArrowLeft, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import io from 'socket.io-client';

const socketUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL?.replace('/api', '') || '/';

const ChatList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: chats, isLoading, error, refetch } = useQuery({
    queryKey: ['chats'],
    queryFn: chatApi.getChats,
    enabled: !!user,
    refetchInterval: 5000,
  });

  useEffect(() => {
    if (!user?._id) return undefined;
    const socket = io(socketUrl, { transports: ['websocket', 'polling'] });
    socket.emit('join_user', user._id);
    socket.on('chat_updated', () => refetch());
    return () => socket.disconnect();
  }, [refetch, user?._id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Loading your conversations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center max-w-md bg-white rounded-2xl shadow-xl p-8">
          <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle size={40} className="text-red-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Failed to load messages</h3>
          <p className="text-gray-600 mb-6">{error.message || 'Please try again later'}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Ensure chats is always an array
  const chatsArray = Array.isArray(chats) ? chats : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-primary-500 to-emerald-500 p-3 rounded-2xl">
                <MessageCircle size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
                <p className="text-gray-600 text-sm">
                  {chatsArray.length === 0 
                    ? 'No conversations yet' 
                    : `${chatsArray.length} active conversation${chatsArray.length !== 1 ? 's' : ''}`}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-primary-600 transition-colors rounded-xl hover:bg-gray-50"
            >
              <ArrowLeft size={20} />
              <span className="hidden sm:inline">Browse Products</span>
            </button>
          </div>
        </div>

        {chatsArray.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl shadow-xl border border-gray-100">
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageCircle size={48} className="text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">No messages yet</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto px-4">
              Start a conversation by contacting sellers about products you're interested in. Your messages will appear here.
            </p>
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-600 to-emerald-600 text-white font-semibold rounded-2xl hover:from-primary-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl"
            >
              <Package size={20} />
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Stats Bar */}
            <div className="bg-gradient-to-r from-primary-50 to-emerald-50 p-4 border-b border-gray-100">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Recent conversations</span>
                <span className="text-primary-600 font-semibold">
                  {chatsArray.filter(c => c.unreadCount > 0).length} unread
                </span>
              </div>
            </div>

            {/* Chat List */}
            <div className="divide-y divide-gray-100">
              {chatsArray.map((chat) => {
                // Ensure otherUser exists
                const lastMessage = chat.lastMessage;
                const unreadCount = chat.unreadCount || 0;
                
// Handle both users and participants from backend
                const chatUsers = chat.users || chat.participants || [];
                const otherUserChat = chatUsers.find(u => u && u._id !== user._id) || chatUsers[0];
                
                return (
                  <Link 
                    key={chat._id}
                    to={`/chats/${chat._id}`}
                    className={`flex items-start p-6 hover:bg-gray-50 transition-all group ${
                      unreadCount > 0 ? 'bg-primary-50/30' : ''
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative flex-shrink-0 mr-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                        unreadCount > 0 
                          ? 'bg-gradient-to-r from-primary-500 to-emerald-500 shadow-lg' 
                          : 'bg-gradient-to-r from-gray-400 to-gray-500'
                      }`}>
                        <User size={24} className="text-white" />
                      </div>
                      {unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                          <span className="text-white text-xs font-bold">{unreadCount}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`font-semibold truncate ${
                          unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'
                        } group-hover:text-primary-600 transition-colors`}>
                          {otherUserChat?.name || 'Unknown User'}
                        </h3>
                        <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                          {lastMessage?.createdAt 
                            ? formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: true })
                            : formatDistanceToNow(new Date(chat.updatedAt), { addSuffix: true })
                          }
                        </span>
                      </div>
                      
                      <p className={`text-sm truncate mb-2 ${
                        unreadCount > 0 ? 'text-gray-800 font-medium' : 'text-gray-500'
                      }`}>
                        {lastMessage ? (
                          <>
                            {lastMessage.sender?._id === user._id && (
                              <span className="text-gray-400 mr-1">You: </span>
                            )}
                            {lastMessage.text || lastMessage.content || 'Sent an image'}
                          </>
                        ) : (
                          'Say hi to start the conversation'
                        )}
                      </p>
                      
                      {/* Product Info */}
                      {chat.product && (
                        <div className="flex items-center gap-3 text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg inline-flex">
                          <Package size={12} />
                          <span className="truncate max-w-[200px]">{chat.product.title}</span>
                          {chat.product.price && (
                            <span className="font-semibold text-primary-600">
                              ₹{chat.product.price.toLocaleString()}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Quick Action Icon */}
                    <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <Send size={18} className="text-primary-500" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;
