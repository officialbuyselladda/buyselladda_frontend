import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { chatApi, userApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import io from 'socket.io-client';
import ChatMessage from '../components/ChatMessage';
import ChatInput from '../components/ChatInput';
import { format, formatDistanceToNow, isSameDay, isToday, isYesterday } from 'date-fns';
import { AlertTriangle, ArrowLeft, Ban, Circle, MapPin, Package, Phone, ShieldAlert, User, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { getImageUrl, placeholderImage } from '../utils/image';

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

const getMessageDate = (message) => {
  const value = message?.createdAt || message?.updatedAt;
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatMessageDateDivider = (date) => {
  if (!date) return 'Date unavailable';
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'EEE, d MMM yyyy');
};

const chatRoomStyles = `
  .cr-page {
    min-height: calc(100vh - 80px);
    padding: 18px 12px 28px;
    background: #f8fafc;
  }

  .cr-shell {
    position: relative;
    display: flex;
    flex-direction: column;
    width: min(100%, 1080px);
    height: calc(100vh - 188px);
    min-height: 590px;
    margin: 0 auto;
    overflow: hidden;
    border: 1px solid rgba(45, 39, 32, 0.10);
    border-radius: 22px;
    background: #ffffff;
    box-shadow: 0 14px 36px rgba(15, 23, 42, 0.10);
  }

  .cr-shell::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    border-radius: inherit;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.88);
    z-index: 3;
  }

  .cr-header {
    position: relative;
    z-index: 4;
    padding: 14px 16px;
    border-bottom: 1px solid rgba(45, 39, 32, 0.10);
    background:
      #ffffff;
  }

  .cr-header-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .cr-back,
  .cr-ad-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(45, 39, 32, 0.10);
    background: rgba(255,255,255,0.78);
    color: #4b4038;
    transition: transform 0.16s ease, background 0.16s ease, color 0.16s ease;
  }

  .cr-back {
    width: 40px;
    height: 40px;
    border-radius: 13px;
  }

  .cr-back:hover,
  .cr-ad-link:hover {
    transform: translateY(-1px);
    background: #ffffff;
    color: #d4571a;
  }

  .cr-avatar {
    position: relative;
    display: flex;
    width: 52px;
    height: 52px;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border: 2px solid #ffffff;
    border-radius: 18px;
    background: linear-gradient(135deg, #1354d8, #ff7a00 55%, #168b2f);
    color: #ffffff;
    box-shadow: 0 10px 24px rgba(212,87,26,0.20);
  }

  .cr-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .cr-presence {
    position: absolute;
    right: 3px;
    bottom: 3px;
    width: 12px;
    height: 12px;
    border: 2px solid #ffffff;
    border-radius: 999px;
    background: #cbd5e1;
  }

  .cr-presence--online {
    background: #10b981;
    box-shadow: 0 0 0 4px rgba(16,185,129,0.16);
  }

  .cr-profile-button {
    min-width: 0;
    flex: 1;
    text-align: left;
  }

  .cr-name {
    margin: 0;
    overflow: hidden;
    color: #15110e;
    font-size: 17px;
    font-weight: 800;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .cr-subline {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: 7px;
    color: #73695f;
    font-size: 12px;
    font-weight: 650;
  }

  .cr-status {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    color: #0f766e;
    white-space: nowrap;
  }

  .cr-product-title {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .cr-ad-link {
    flex-shrink: 0;
    gap: 8px;
    min-height: 40px;
    border-radius: 13px;
    padding: 0 14px;
    font-size: 13px;
    font-weight: 800;
  }

  .cr-product-strip {
    position: relative;
    z-index: 4;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 16px;
    border-bottom: 1px solid rgba(45, 39, 32, 0.08);
    background: #ffffff;
  }

  .cr-safety-strip {
    position: relative;
    z-index: 4;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    border-bottom: 1px solid rgba(45, 39, 32, 0.08);
    background: #f8fafc;
    padding: 8px 14px;
    color: #1a7a4a;
    font-size: 12px;
    font-weight: 850;
    text-align: center;
  }

  .cr-product-strip__meta {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: 10px;
    color: #5c5147;
    font-size: 13px;
    font-weight: 750;
  }

  .cr-product-strip__icon {
    display: flex;
    width: 42px;
    height: 42px;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border: 1px solid rgba(45, 39, 32, 0.08);
    border-radius: 13px;
    background: #fff2ea;
    color: #d4571a;
  }

  .cr-product-strip__icon img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    background: #faf9f7;
  }

  .cr-product-strip__price {
    flex-shrink: 0;
    color: #d4571a;
    font-size: 14px;
    font-weight: 900;
  }

  .cr-messages {
    position: relative;
    flex: 1;
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: 22px 16px;
    background:
      linear-gradient(180deg, rgba(248,250,252,0.96), rgba(255,255,255,0.96)),
      repeating-linear-gradient(135deg, rgba(19,84,216,0.035) 0 1px, transparent 1px 18px);
  }

  .cr-watermark {
    position: absolute;
    inset: 0;
    z-index: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    opacity: 0.085;
  }

  .cr-watermark svg {
    width: min(86%, 620px);
    height: auto;
  }

  .cr-content {
    position: relative;
    z-index: 1;
  }

  .cr-empty {
    position: relative;
    z-index: 1;
    display: flex;
    height: 100%;
    align-items: center;
    justify-content: center;
    text-align: center;
    color: #6b6258;
  }

  .cr-empty-card {
    max-width: 360px;
    padding: 26px;
    border: 1px solid rgba(45,39,32,0.08);
    border-radius: 20px;
    background: rgba(255,255,255,0.72);
    box-shadow: 0 14px 34px rgba(36,28,20,0.08);
    backdrop-filter: blur(8px);
  }

  .cr-empty-icon {
    display: flex;
    width: 58px;
    height: 58px;
    align-items: center;
    justify-content: center;
    margin: 0 auto 12px;
    border-radius: 18px;
    background: #fff2ea;
    color: #d4571a;
  }

  .cr-empty-title {
    margin: 0 0 5px;
    color: #201915;
    font-weight: 850;
  }

  .cr-empty-copy {
    margin: 0;
    font-size: 14px;
    line-height: 1.55;
  }

  .cr-message-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .cr-date-divider {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 4px 0;
    color: #7a7066;
    font-size: 11px;
    font-weight: 850;
    letter-spacing: 0;
    text-transform: uppercase;
  }

  .cr-date-divider::before,
  .cr-date-divider::after {
    content: "";
    height: 1px;
    flex: 1;
    background: rgba(45, 39, 32, 0.12);
  }

  .cr-date-divider__label {
    flex-shrink: 0;
    border: 1px solid rgba(45, 39, 32, 0.10);
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.78);
    padding: 5px 10px;
    box-shadow: 0 8px 20px rgba(36, 28, 20, 0.06);
  }

  .cr-typing {
    display: flex;
    align-items: flex-end;
    gap: 8px;
  }

  .cr-typing__avatar {
    display: flex;
    width: 32px;
    height: 32px;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    background: #fff2ea;
    color: #d4571a;
  }

  .cr-typing__bubble {
    display: flex;
    align-items: center;
    gap: 5px;
    border: 1px solid rgba(45,39,32,0.08);
    border-radius: 18px 18px 18px 5px;
    background: #ffffff;
    padding: 12px 15px;
    box-shadow: 0 8px 22px rgba(36,28,20,0.08);
  }

  .cr-typing__bubble span {
    width: 7px;
    height: 7px;
    border-radius: 999px;
    background: #a8a29e;
  }

  .cr-blocked {
    position: relative;
    z-index: 4;
    border-top: 1px solid #fde68a;
    background: #fffbeb;
    padding: 12px 16px;
    text-align: center;
    color: #92400e;
    font-size: 13px;
    font-weight: 800;
  }

  .cr-loading,
  .cr-error {
    min-height: calc(100vh - 80px);
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f8fafc;
    padding: 24px;
  }

  .cr-state-card {
    width: min(100%, 420px);
    border: 1px solid rgba(45, 39, 32, 0.10);
    border-radius: 22px;
    background: #ffffff;
    padding: 28px 22px;
    text-align: center;
    box-shadow: 0 18px 48px rgba(36, 28, 20, 0.12);
  }

  .cr-state-icon {
    display: flex;
    width: 66px;
    height: 66px;
    align-items: center;
    justify-content: center;
    margin: 0 auto 14px;
    border-radius: 20px;
    background: #fff2ea;
    color: #d4571a;
  }

  .cr-state-card h3 {
    margin: 0 0 6px;
    color: #17120f;
    font-size: 21px;
    font-weight: 900;
  }

  .cr-state-card p {
    margin: 0 0 16px;
    color: #6f665d;
    font-size: 14px;
    line-height: 1.55;
  }

  .cr-state-action {
    display: inline-flex;
    min-height: 42px;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border-radius: 14px;
    background: #d4571a;
    padding: 0 16px;
    color: #ffffff;
    font-size: 13px;
    font-weight: 900;
  }

  @media (max-width: 640px) {
    .cr-page {
      min-height: auto;
      padding: 10px 0 18px;
    }

    .cr-shell {
      height: calc(100vh - 148px);
      min-height: 540px;
      border-left: 0;
      border-right: 0;
      border-radius: 0;
    }

    .cr-header {
      padding: 12px;
    }

    .cr-avatar {
      width: 46px;
      height: 46px;
      border-radius: 16px;
    }

    .cr-name {
      font-size: 15px;
    }

    .cr-ad-link {
      display: none;
    }

    .cr-product-strip {
      padding: 9px 12px;
    }

    .cr-safety-strip {
      padding: 7px 12px;
      font-size: 11.5px;
    }

    .cr-product-strip__price {
      display: none;
    }

    .cr-messages {
      padding: 18px 12px;
    }
  }
`;

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

  const { data: chatData, isLoading, error } = useQuery({
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

  const productImage = getImageUrl(chat?.product?.images?.[0]) || placeholderImage;

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

  if (isLoading) {
    return (
      <div className="cr-loading">
        <style>{chatRoomStyles}</style>
        <div className="cr-state-card">
          <div className="cr-state-icon">
            <Package size={28} />
          </div>
          <h3>Loading chat</h3>
          <p>Your conversation is being prepared.</p>
        </div>
      </div>
    );
  }

  if (error || !chat) {
    return (
      <div className="cr-error">
        <style>{chatRoomStyles}</style>
        <div className="cr-state-card">
          <div className="cr-state-icon">
            <AlertTriangle size={28} />
          </div>
          <h3>Could not open chat</h3>
          <p>{error?.message || 'This conversation may no longer be available.'}</p>
          <Link to="/chats" className="cr-state-action">
            <ArrowLeft size={16} />
            Back to chats
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cr-page">
      <style>{chatRoomStyles}</style>

      <div className="cr-shell">
        <div className="cr-header">
          <div className="cr-header-row">
            <Link to="/chats" className="cr-back" title="Back to chats" aria-label="Back to chats">
              <ArrowLeft size={20} />
            </Link>
            <button
              type="button"
              onClick={openProfile}
              className="cr-avatar"
              title="View profile"
            >
              {otherUser?.avatar?.url ? (
                <img src={otherUser.avatar.url} alt={otherUser?.name || 'User'} />
              ) : (
                <User size={19} />
              )}
              <span className={`cr-presence ${isOtherOnline ? 'cr-presence--online' : ''}`} />
            </button>
            <button type="button" onClick={openProfile} className="cr-profile-button">
              <h2 className="cr-name">{otherUser?.name || 'User'}</h2>
              <div className="cr-subline">
                <span className="cr-status">
                  <Circle size={7} fill="currentColor" />
                  {statusText}
                </span>
                <span className="cr-product-title">| {chat.product?.title || 'General chat'}</span>
              </div>
            </button>
            {chat.product && (
              <Link
                to={`/products/${chat.product._id}`}
                className="cr-ad-link"
              >
                <Package size={16} />
                View Ad
              </Link>
            )}
          </div>
        </div>

        <div className="cr-product-strip">
          <div className="cr-product-strip__meta">
            <span className="cr-product-strip__icon">
              {chat.product?.images?.length ? (
                <img
                  src={productImage}
                  alt=""
                  onError={(event) => { event.currentTarget.src = placeholderImage; }}
                />
              ) : (
                <Package size={17} />
              )}
            </span>
            <span className="truncate">{chat.product?.title || 'BuySellAdda secure conversation'}</span>
          </div>
          {chat.product?.price && (
            <span className="cr-product-strip__price">Rs {chat.product.price.toLocaleString()}</span>
          )}
        </div>

        <div className="cr-safety-strip">
          <ShieldAlert size={14} />
          <span>Keep payment safe: meet publicly, inspect first, and avoid advance transfers.</span>
        </div>

        <div ref={scrollAreaRef} className="cr-messages">
          <div className="cr-watermark" aria-hidden="true">
            <svg viewBox="0 0 640 260" role="presentation">
              <defs>
                <path id="buyselladda-chat-path" d="M72 152 C 170 42, 318 42, 568 152" />
              </defs>
              <text fill="#d4571a" fontFamily="Inter, Arial, sans-serif" fontSize="44" fontWeight="900" letterSpacing="2">
                <textPath href="#buyselladda-chat-path" startOffset="50%" textAnchor="middle">
                  BuySellAdda
                </textPath>
              </text>
              <path d="M98 174 C 204 232, 408 232, 542 174" fill="none" stroke="#0f766e" strokeWidth="14" strokeLinecap="round" />
              <path d="M140 120 L208 90 L288 132 L364 92 L498 132" fill="none" stroke="#d4571a" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {messages.length === 0 ? (
            <div className="cr-empty">
              <div className="cr-empty-card">
                <div className="cr-empty-icon">
                  <User size={24} />
                </div>
                <p className="cr-empty-title">Start the conversation</p>
                <p className="cr-empty-copy">Ask about price, pickup, condition, or availability. Keep deals clear and friendly.</p>
              </div>
            </div>
          ) : (
            <div className="cr-content cr-message-list">
              {messages.map((msg, index) => {
                const currentDate = getMessageDate(msg);
                const previousDate = getMessageDate(messages[index - 1]);
                const showDateDivider = index === 0 || !currentDate || !previousDate || !isSameDay(currentDate, previousDate);

                return (
                  <React.Fragment key={msg._id}>
                    {showDateDivider && (
                      <div className="cr-date-divider" role="separator">
                        <span className="cr-date-divider__label">
                          {formatMessageDateDivider(currentDate)}
                        </span>
                      </div>
                    )}
                    <ChatMessage
                      message={msg}
                      isOwn={(msg.sender?._id || msg.sender) === user._id}
                    />
                  </React.Fragment>
                );
              })}
              {isTyping && (
                <div className="cr-typing">
                  <div className="cr-typing__avatar">
                    <User size={15} />
                  </div>
                  <div className="cr-typing__bubble">
                    <span className="animate-bounce" />
                    <span className="animate-bounce [animation-delay:120ms]" />
                    <span className="animate-bounce [animation-delay:240ms]" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {isBlockedByMe && (
          <div className="cr-blocked">
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
