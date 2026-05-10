import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { chatApi, userApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import io from 'socket.io-client';
import ChatMessage from '../components/ChatMessage';
import ChatInput from '../components/ChatInput';
import { formatDistanceToNow } from 'date-fns';
import { AlertTriangle, ArrowLeft, Ban, Circle, MapPin, Package, Phone, ShieldAlert, User, X } from 'lucide-react';
import toast from 'react-hot-toast';

const socketUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL?.replace('/api', '') || '/';

const createTempMessage = (chatId, sender, text) => ({
  _id: `temp-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  chat: chatId,
  sender,
  text,
  read: false,
  pending: true,
  createdAt: new Date().toISOString(),
});

const ChatRoom = () => {
  const { chatId } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [presence, setPresence] = useState({ isOnline: false, lastSeen: null });
  const [isTyping, setIsTyping] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileDetails, setProfileDetails] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('Spam or scam');
  const [reportDetails, setReportDetails] = useState('');
  const [isBlockedByMe, setIsBlockedByMe] = useState(false);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const scrollAreaRef = useRef(null);

  const { data: chatData, isLoading } = useQuery({
    queryKey: ['chat', chatId],
    queryFn: () => chatApi.getMessages(chatId),
    enabled: !!chatId && !!user,
  });

  const chat = chatData?.chat;

  useEffect(() => {
    setMessages(chatData?.messages || []);
    queryClient.invalidateQueries({ queryKey: ['chats'] });
  }, [chatData, queryClient]);

  useEffect(() => {
    if (!chatId || !user?._id) return undefined;

    const socket = io(socketUrl, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.emit('joinChat', chatId);
    socket.emit('join_user', user._id);

    const handleMessage = (message) => {
      if (!message?._id) return;
      setIsTyping(false);
      setMessages((prev) => {
        const withoutTemp = message.clientTempId
          ? prev.filter((existing) => existing._id !== message.clientTempId)
          : prev;

        return withoutTemp.some((existing) => existing._id === message._id)
          ? withoutTemp
          : [...withoutTemp, message];
      });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    };

    const handlePresence = (status) => {
      setPresence((current) => (
        status?.userId
          ? { ...current, [status.userId]: { isOnline: status.isOnline, lastSeen: status.lastSeen } }
          : current
      ));
    };

    const handleTyping = (typing) => {
      if (typing?.chatId !== chatId || typing?.userId === user._id) return;
      setIsTyping(Boolean(typing.isTyping));
    };

    socket.on('receive_message', handleMessage);
    socket.on('message', handleMessage);
    socket.on('presence:update', handlePresence);
    socket.on('typing:update', handleTyping);

    return () => {
      socket.emit('typing:stop', { chatId, userId: user._id });
      socket.off('receive_message', handleMessage);
      socket.off('message', handleMessage);
      socket.off('presence:update', handlePresence);
      socket.off('typing:update', handleTyping);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [chatId, queryClient, user?._id]);

  const saveMessageWithApi = async (content, tempId) => {
    const res = await chatApi.sendMessage(chatId, content);
    const savedMessage = res.data.data;
    setMessages((prev) => {
      const withoutTemp = prev.filter((existing) => existing._id !== tempId);
      return withoutTemp.some((existing) => existing._id === savedMessage._id)
        ? withoutTemp
        : [...withoutTemp, savedMessage];
    });
  };

  const sendMessage = async (content) => {
    if (isBlockedByMe) {
      toast.error('Unblock this user to send messages');
      return;
    }

    const tempMessage = createTempMessage(chatId, user, content);
    setMessages((prev) => [...prev, tempMessage]);
    handleTyping(false);

    try {
      setSending(true);

      const socket = socketRef.current;
      if (socket?.connected) {
        await new Promise((resolve, reject) => {
          socket.timeout(8000).emit('send_message', {
            chatId,
            senderId: user._id,
            text: content,
            clientTempId: tempMessage._id,
          }, (error, response) => {
            if (error) {
              reject(new Error('Socket timeout'));
              return;
            }
            if (!response?.success) {
              reject(new Error(response?.message || 'Failed to send message'));
              return;
            }

            const savedMessage = response.data;
            setMessages((prev) => {
              const withoutTemp = prev.filter((existing) => existing._id !== tempMessage._id);
              return withoutTemp.some((existing) => existing._id === savedMessage._id)
                ? withoutTemp
                : [...withoutTemp, savedMessage];
            });
            resolve(savedMessage);
          });
        });
      } else {
        await saveMessageWithApi(content, tempMessage._id);
      }

      queryClient.invalidateQueries({ queryKey: ['chats'] });
    } catch (error) {
      try {
        await saveMessageWithApi(content, tempMessage._id);
        queryClient.invalidateQueries({ queryKey: ['chats'] });
      } catch (fallbackError) {
        setMessages((prev) => prev.filter((existing) => existing._id !== tempMessage._id));
        toast.error(fallbackError.response?.data?.message || error.message || 'Failed to send message');
      }
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (scrollArea) {
      scrollArea.scrollTo({ top: scrollArea.scrollHeight, behavior: 'smooth' });
      return;
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isTyping]);

  const participants = chat?.participants || chat?.users || [];
  const otherUser = useMemo(
    () => participants.find((participant) => participant?._id !== user?._id),
    [participants, user?._id]
  );
  const otherPresence = otherUser?._id ? presence[otherUser._id] : null;
  const isOtherOnline = Boolean(otherPresence?.isOnline);
  const lastSeen = otherPresence?.lastSeen || otherUser?.lastSeen;

  useEffect(() => {
    setIsBlockedByMe(Boolean(profileDetails?.isBlockedByMe));
  }, [profileDetails?.isBlockedByMe]);

  useEffect(() => {
    if (!socketRef.current || !otherUser?._id) return;
    socketRef.current.emit('presence:get', { userIds: [otherUser._id] }, (response) => {
      const status = response?.users?.[0];
      if (!status) return;
      setPresence((current) => ({
        ...current,
        [status.userId]: {
          isOnline: status.isOnline,
          lastSeen: status.lastSeen,
        },
      }));
    });
  }, [otherUser?._id]);

  const handleTyping = useCallback((typing) => {
    const socket = socketRef.current;
    if (!socket || !chatId || !user?._id) return;
    socket.emit(typing ? 'typing:start' : 'typing:stop', { chatId, userId: user._id });
  }, [chatId, user?._id]);

  const statusText = isTyping
    ? 'typing...'
    : isOtherOnline
      ? 'Online'
      : lastSeen
        ? `Last seen ${formatDistanceToNow(new Date(lastSeen), { addSuffix: true })}`
        : 'Offline';

  const openProfile = async () => {
    if (!otherUser?._id) return;
    setProfileOpen(true);
    setProfileLoading(true);
    try {
      const profile = await userApi.getProfile(otherUser._id);
      setProfileDetails(profile);
      setIsBlockedByMe(Boolean(profile.isBlockedByMe));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const toggleBlock = async () => {
    if (!otherUser?._id) return;
    try {
      const result = await userApi.toggleBlock(otherUser._id);
      setIsBlockedByMe(Boolean(result.blocked));
      setProfileDetails((current) => current ? { ...current, isBlockedByMe: Boolean(result.blocked) } : current);
      toast.success(result.blocked ? 'User blocked' : 'User unblocked');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Block action failed');
    }
  };

  const submitReport = async (event) => {
    event.preventDefault();
    if (!otherUser?._id) return;
    try {
      await userApi.report(otherUser._id, {
        chatId,
        reason: reportReason,
        details: reportDetails,
      });
      toast.success('Report submitted');
      setReportOpen(false);
      setReportDetails('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Report failed');
    }
  };

  if (isLoading || !chat) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 text-gray-500">
        Loading chat...
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-slate-100">
      <div className="mx-auto flex h-full w-full max-w-5xl flex-col overflow-hidden bg-white shadow-sm sm:my-3 sm:h-[calc(100%-24px)] sm:rounded-3xl sm:border sm:border-gray-100">
        <div className="border-b border-gray-200 bg-white/95 px-4 py-3 shadow-sm sm:px-6">
          <div className="flex items-center gap-3">
            <Link to="/chats" className="rounded-xl p-2 text-gray-500 transition-colors hover:bg-gray-100">
              <ArrowLeft size={20} />
            </Link>
            <button
              type="button"
              onClick={openProfile}
              className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-500 text-white"
              title="View profile"
            >
              {otherUser?.avatar?.url ? (
                <img src={otherUser.avatar.url} alt={otherUser?.name || 'User'} className="h-full w-full object-cover" />
              ) : (
                <User size={19} />
              )}
              <span className={`absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white ${isOtherOnline ? 'bg-emerald-500' : 'bg-gray-300'}`} />
            </button>
            <button type="button" onClick={openProfile} className="min-w-0 flex-1 text-left">
              <h2 className="truncate font-bold text-gray-900">{otherUser?.name || 'User'}</h2>
              <div className="flex min-w-0 items-center gap-2">
                <span className={`inline-flex items-center gap-1 text-xs font-semibold ${isOtherOnline || isTyping ? 'text-emerald-600' : 'text-gray-500'}`}>
                  <Circle size={7} fill="currentColor" />
                  {statusText}
                </span>
                <span className="hidden truncate text-sm text-gray-400 sm:inline">| {chat.product?.title || 'General chat'}</span>
              </div>
            </button>
            {chat.product && (
              <Link
                to={`/products/${chat.product._id}`}
                className="hidden items-center gap-2 rounded-xl bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100 sm:flex"
              >
                <Package size={16} />
                View Ad
              </Link>
            )}
          </div>
        </div>

        <div ref={scrollAreaRef} className="flex-1 overflow-y-auto overscroll-contain bg-[radial-gradient(circle_at_top_left,#ecfdf5,transparent_32%),linear-gradient(180deg,#f8fafc,#eef2f7)] p-4 sm:p-6">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center text-center text-gray-500">
              <div>
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm">
                  <User size={24} />
                </div>
                <p className="font-semibold text-gray-700">Start the conversation</p>
                <p className="text-sm">Ask about price, pickup, condition, or availability.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <ChatMessage
                  key={msg._id}
                  message={msg}
                  isOwn={(msg.sender?._id || msg.sender) === user._id}
                />
              ))}
              {isTyping && (
                <div className="flex items-end gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-slate-600">
                    <User size={15} />
                  </div>
                  <div className="flex items-center gap-1 rounded-3xl rounded-bl-md border border-gray-100 bg-white px-4 py-3 shadow-sm">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:120ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:240ms]" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {isBlockedByMe && (
          <div className="border-t border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm font-semibold text-amber-800">
            You blocked this user. Unblock from profile to continue chatting.
          </div>
        )}

        <ChatInput onSendMessage={sendMessage} onTyping={handleTyping} disabled={sending || isBlockedByMe} />
      </div>

      {profileOpen && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40 sm:items-center sm:justify-center">
          <div className="w-full rounded-t-3xl bg-white p-5 shadow-2xl sm:max-w-md sm:rounded-3xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Profile details</h3>
              <button onClick={() => setProfileOpen(false)} className="rounded-xl p-2 text-gray-500 hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>

            {profileLoading ? (
              <div className="py-10 text-center text-gray-500">Loading profile...</div>
            ) : (
              <>
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-500 text-white">
                    {profileDetails?.avatar?.url ? <img src={profileDetails.avatar.url} alt={profileDetails.name} className="h-full w-full object-cover" /> : <User size={24} />}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xl font-bold text-gray-900">{profileDetails?.name || otherUser?.name || 'User'}</p>
                    <p className="text-sm text-gray-500">{isOtherOnline ? 'Online now' : statusText}</p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-gray-50 p-3">
                    <p className="text-xs text-gray-500">Ads</p>
                    <p className="text-lg font-bold text-gray-900">{profileDetails?.stats?.totalProducts ?? 0}</p>
                  </div>
                  <div className="rounded-2xl bg-gray-50 p-3">
                    <p className="text-xs text-gray-500">Member since</p>
                    <p className="text-sm font-bold text-gray-900">
                      {profileDetails?.createdAt ? new Date(profileDetails.createdAt).toLocaleDateString() : '-'}
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-sm text-gray-600">
                  {profileDetails?.phone && <p className="flex items-center gap-2"><Phone size={15} /> {profileDetails.phone}</p>}
                  {profileDetails?.location && <p className="flex items-center gap-2"><MapPin size={15} /> {profileDetails.location}</p>}
                  <p className="flex items-center gap-2"><Package size={15} /> {chat.product?.title || 'General chat'}</p>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={toggleBlock}
                    className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold ${isBlockedByMe ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'}`}
                  >
                    <Ban size={16} />
                    {isBlockedByMe ? 'Unblock' : 'Block'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setReportOpen(true)}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700 hover:bg-red-100"
                  >
                    <ShieldAlert size={16} />
                    Report
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {reportOpen && (
        <div className="fixed inset-0 z-[60] flex items-end bg-black/40 sm:items-center sm:justify-center">
          <form onSubmit={submitReport} className="w-full rounded-t-3xl bg-white p-5 shadow-2xl sm:max-w-md sm:rounded-3xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900"><AlertTriangle size={18} /> Report user</h3>
              <button type="button" onClick={() => setReportOpen(false)} className="rounded-xl p-2 text-gray-500 hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>
            <label className="mb-3 block">
              <span className="mb-1 block text-sm font-semibold text-gray-700">Reason</span>
              <select value={reportReason} onChange={(event) => setReportReason(event.target.value)} className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-red-200">
                <option>Spam or scam</option>
                <option>Abusive behavior</option>
                <option>Fake profile</option>
                <option>Unsafe deal</option>
                <option>Other</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-gray-700">Details</span>
              <textarea value={reportDetails} onChange={(event) => setReportDetails(event.target.value)} rows={4} className="w-full resize-none rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-red-200" placeholder="Tell us what happened" />
            </label>
            <button type="submit" className="mt-4 w-full rounded-2xl bg-red-600 px-4 py-3 font-bold text-white hover:bg-red-700">
              Submit report
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatRoom;
