import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import { ArrowLeft, Inbox, MessageCircle, Package, RefreshCw, Search, Send, ShieldCheck, User } from 'lucide-react';
import io from 'socket.io-client';
import { chatApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getImageUrl, placeholderImage } from '../utils/image';

const socketUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL?.replace('/api', '') || '/';

const chatListStyles = `
  .cl-page {
    min-height: calc(100vh - 80px);
    padding: 20px 12px 30px;
    background: #f8fafc;
  }

  .cl-shell {
    width: min(100%, 1040px);
    margin: 0 auto;
  }

  .cl-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    margin-bottom: 14px;
    border: 1px solid rgba(45, 39, 32, 0.10);
    border-radius: 22px;
    background: #ffffff;
    padding: 16px;
    box-shadow: 0 14px 36px rgba(15, 23, 42, 0.08);
  }

  .cl-title-wrap {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: 12px;
  }

  .cl-title-icon {
    display: flex;
    width: 48px;
    height: 48px;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    border-radius: 16px;
    background: linear-gradient(135deg, #1354d8, #ff7a00 55%, #168b2f);
    color: #ffffff;
    box-shadow: 0 10px 24px rgba(212, 87, 26, 0.20);
  }

  .cl-title {
    margin: 0;
    color: #17120f;
    font-size: 24px;
    font-weight: 900;
    letter-spacing: 0;
  }

  .cl-subtitle {
    margin: 2px 0 0;
    color: #6f665d;
    font-size: 13px;
    font-weight: 650;
  }

  .cl-back {
    display: inline-flex;
    min-height: 42px;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border: 1px solid rgba(45, 39, 32, 0.10);
    border-radius: 14px;
    background: rgba(255,255,255,0.76);
    padding: 0 14px;
    color: #4b4038;
    font-size: 13px;
    font-weight: 850;
    transition: transform 0.16s ease, background 0.16s ease, color 0.16s ease;
  }

  .cl-back:hover {
    transform: translateY(-1px);
    background: #ffffff;
    color: #d4571a;
  }

  .cl-toolbar {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto auto;
    gap: 12px;
    margin-bottom: 14px;
  }

  .cl-search {
    display: flex;
    align-items: center;
    gap: 10px;
    border: 1px solid rgba(45, 39, 32, 0.10);
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.88);
    padding: 0 14px;
    color: #786f65;
    box-shadow: 0 10px 28px rgba(36, 28, 20, 0.08);
  }

  .cl-search input {
    min-width: 0;
    width: 100%;
    height: 46px;
    border: 0;
    outline: 0;
    background: transparent;
    color: #17120f;
    font-size: 14px;
    font-weight: 650;
  }

  .cl-search input::placeholder {
    color: #9b9289;
  }

  .cl-filter {
    display: inline-flex;
    overflow: hidden;
    border: 1px solid rgba(45, 39, 32, 0.10);
    border-radius: 16px;
    background: rgba(255,255,255,0.88);
    box-shadow: 0 10px 28px rgba(36, 28, 20, 0.08);
  }

  .cl-filter button {
    min-width: 78px;
    border: 0;
    background: transparent;
    padding: 0 14px;
    color: #6f665d;
    font-size: 13px;
    font-weight: 850;
  }

  .cl-filter button[aria-pressed="true"] {
    background: #17120f;
    color: #ffffff;
  }

  .cl-refresh {
    display: inline-flex;
    min-height: 46px;
    align-items: center;
    justify-content: center;
    gap: 7px;
    border: 1px solid rgba(45, 39, 32, 0.10);
    border-radius: 16px;
    background: rgba(255,255,255,0.88);
    padding: 0 14px;
    color: #d4571a;
    font-size: 13px;
    font-weight: 900;
    box-shadow: 0 10px 28px rgba(36, 28, 20, 0.08);
  }

  .cl-refresh:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .cl-spin {
    animation: cl-spin 0.8s linear infinite;
  }

  .cl-panel {
    overflow: hidden;
    border: 1px solid rgba(45, 39, 32, 0.10);
    border-radius: 22px;
    background: #ffffff;
    box-shadow: 0 14px 36px rgba(15, 23, 42, 0.08);
  }

  .cl-summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    border-bottom: 1px solid rgba(45, 39, 32, 0.08);
    background: #ffffff;
    padding: 12px 16px;
    color: #6f665d;
    font-size: 13px;
    font-weight: 800;
  }

  .cl-unread-pill {
    display: inline-flex;
    min-width: 28px;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    background: #fff2ea;
    padding: 5px 9px;
    color: #d4571a;
    font-size: 12px;
    font-weight: 900;
  }

  .cl-list {
    display: flex;
    flex-direction: column;
  }

  .cl-row {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    gap: 13px;
    align-items: center;
    border-bottom: 1px solid rgba(45, 39, 32, 0.07);
    background: #ffffff;
    padding: 15px 16px;
    transition: background 0.16s ease, transform 0.16s ease;
  }

  .cl-row:last-child {
    border-bottom: 0;
  }

  .cl-row:hover {
    background: #ffffff;
    transform: translateY(-1px);
  }

  .cl-row--unread {
    background: #fff7ed;
  }

  .cl-avatar {
    position: relative;
    display: flex;
    width: 58px;
    height: 58px;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border: 2px solid #ffffff;
    border-radius: 18px;
    background: linear-gradient(135deg, #1354d8, #ff7a00 55%, #168b2f);
    color: #ffffff;
    box-shadow: 0 10px 24px rgba(36, 28, 20, 0.12);
  }

  .cl-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .cl-badge {
    position: absolute;
    right: -4px;
    top: -5px;
    display: flex;
    min-width: 22px;
    height: 22px;
    align-items: center;
    justify-content: center;
    border: 2px solid #ffffff;
    border-radius: 999px;
    background: #dc2626;
    padding: 0 5px;
    color: #ffffff;
    font-size: 11px;
    font-weight: 900;
  }

  .cl-main {
    min-width: 0;
  }

  .cl-line {
    display: flex;
    min-width: 0;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .cl-name {
    margin: 0;
    overflow: hidden;
    color: #17120f;
    font-size: 15px;
    font-weight: 900;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .cl-time {
    flex-shrink: 0;
    color: #8b8178;
    font-size: 11px;
    font-weight: 800;
  }

  .cl-message {
    margin: 5px 0 8px;
    overflow: hidden;
    color: #5f554d;
    font-size: 13px;
    font-weight: 650;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .cl-row--unread .cl-message {
    color: #201915;
    font-weight: 850;
  }

  .cl-you {
    color: #9b9289;
    font-weight: 800;
  }

  .cl-product {
    display: inline-flex;
    max-width: 100%;
    align-items: center;
    gap: 7px;
    border: 1px solid rgba(45, 39, 32, 0.08);
    border-radius: 999px;
    background: #ffffff;
    padding: 5px 9px;
    color: #6f665d;
    font-size: 11px;
    font-weight: 850;
  }

  .cl-product-thumb {
    width: 22px;
    height: 22px;
    flex-shrink: 0;
    overflow: hidden;
    border-radius: 7px;
    background: #f5f4f1;
  }

  .cl-product-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .cl-product span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .cl-price {
    flex-shrink: 0;
    color: #d4571a;
  }

  .cl-action {
    display: flex;
    width: 38px;
    height: 38px;
    align-items: center;
    justify-content: center;
    border-radius: 13px;
    background: #fff2ea;
    color: #d4571a;
    opacity: 0;
    transform: translateX(4px);
    transition: opacity 0.16s ease, transform 0.16s ease;
  }

  .cl-row:hover .cl-action {
    opacity: 1;
    transform: translateX(0);
  }

  .cl-empty,
  .cl-state {
    display: flex;
    min-height: 380px;
    align-items: center;
    justify-content: center;
    padding: 34px 18px;
    text-align: center;
  }

  .cl-empty-inner,
  .cl-state-inner {
    max-width: 390px;
  }

  .cl-empty-icon,
  .cl-state-icon {
    display: flex;
    width: 78px;
    height: 78px;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px;
    border-radius: 24px;
    background: #fff2ea;
    color: #d4571a;
  }

  .cl-empty h3,
  .cl-state h3 {
    margin: 0 0 8px;
    color: #17120f;
    font-size: 22px;
    font-weight: 900;
  }

  .cl-empty p,
  .cl-state p {
    margin: 0 0 18px;
    color: #6f665d;
    font-size: 14px;
    line-height: 1.55;
  }

  .cl-primary {
    display: inline-flex;
    min-height: 44px;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border-radius: 15px;
    background: #d4571a;
    padding: 0 16px;
    color: #ffffff;
    font-size: 13px;
    font-weight: 900;
    box-shadow: 0 12px 24px rgba(212, 87, 26, 0.22);
  }

  .cl-safe-note {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    border-top: 1px solid rgba(45, 39, 32, 0.08);
    background: #fffdf9;
    padding: 10px 14px;
    color: #1a7a4a;
    font-size: 12px;
    font-weight: 850;
  }

  .cl-spinner {
    width: 42px;
    height: 42px;
    margin: 0 auto 14px;
    border: 4px solid rgba(212, 87, 26, 0.18);
    border-top-color: #d4571a;
    border-radius: 999px;
    animation: cl-spin 0.8s linear infinite;
  }

  @keyframes cl-spin {
    to { transform: rotate(360deg); }
  }

  @media (max-width: 640px) {
    .cl-page {
      padding: 10px 0 18px;
    }

    .cl-header,
    .cl-panel {
      border-left: 0;
      border-right: 0;
      border-radius: 0;
    }

    .cl-header {
      margin-bottom: 10px;
    }

    .cl-title {
      font-size: 20px;
    }

    .cl-title-icon {
      width: 44px;
      height: 44px;
      border-radius: 15px;
    }

    .cl-back span {
      display: none;
    }

    .cl-toolbar {
      grid-template-columns: 1fr auto;
      padding: 0 10px;
    }

    .cl-search {
      grid-column: 1 / -1;
    }

    .cl-refresh {
      width: 46px;
      padding: 0;
      font-size: 0;
    }

    .cl-filter button {
      flex: 1;
      height: 42px;
    }

    .cl-row {
      grid-template-columns: auto minmax(0, 1fr);
      padding: 14px 12px;
    }

    .cl-avatar {
      width: 50px;
      height: 50px;
      border-radius: 16px;
    }

    .cl-action {
      display: none;
    }

    .cl-time {
      max-width: 82px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
`;

const getChatDate = (chat) => {
  const value = chat?.lastMessage?.createdAt || chat?.updatedAt || chat?.createdAt;
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatChatTime = (date) => {
  if (!date) return 'Now';
  if (isToday(date)) return format(date, 'h:mm a');
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'd MMM');
};

const formatChatTitle = (date) => {
  if (!date) return 'Just now';
  return `${format(date, 'EEEE, d MMM yyyy, h:mm a')} (${formatDistanceToNow(date, { addSuffix: true })})`;
};

const getOtherUser = (chat, currentUserId) => {
  const chatUsers = chat?.users || chat?.participants || [];
  return chatUsers.find((chatUser) => chatUser && chatUser._id !== currentUserId) || chatUsers[0];
};

const getLastMessageText = (lastMessage, currentUserId) => {
  if (!lastMessage) return 'Say hi to start the conversation';
  const text = lastMessage.text || lastMessage.content || 'Sent an attachment';
  const senderId = lastMessage.sender?._id || lastMessage.sender;
  return senderId === currentUserId ? `You: ${text}` : text;
};

const getProductImage = (product) => getImageUrl(product?.images?.[0]) || placeholderImage;

const ChatList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

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

  const chatsArray = useMemo(() => {
    const list = Array.isArray(chats) ? chats : [];
    return [...list].sort((a, b) => (getChatDate(b)?.getTime() || 0) - (getChatDate(a)?.getTime() || 0));
  }, [chats]);

  const unreadTotal = useMemo(
    () => chatsArray.reduce((total, chat) => total + (chat.unreadCount || 0), 0),
    [chatsArray]
  );

  const visibleChats = useMemo(() => {
    const term = search.trim().toLowerCase();
    return chatsArray.filter((chat) => {
      if (filter === 'unread' && !chat.unreadCount) return false;
      if (!term) return true;

      const otherUser = getOtherUser(chat, user?._id);
      const lastMessage = getLastMessageText(chat.lastMessage, user?._id);
      const productTitle = chat.product?.title || '';
      return `${otherUser?.name || ''} ${productTitle} ${lastMessage}`.toLowerCase().includes(term);
    });
  }, [chatsArray, filter, search, user?._id]);

  if (isLoading) {
    return (
      <div className="cl-page">
        <style>{chatListStyles}</style>
        <div className="cl-shell">
          <div className="cl-panel cl-state">
            <div className="cl-state-inner">
              <div className="cl-spinner" />
              <h3>Loading messages</h3>
              <p>Your latest conversations are being prepared.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cl-page">
        <style>{chatListStyles}</style>
        <div className="cl-shell">
          <div className="cl-panel cl-state">
            <div className="cl-state-inner">
              <div className="cl-state-icon">
                <MessageCircle size={30} />
              </div>
              <h3>Failed to load messages</h3>
              <p>{error.message || 'Please try again later.'}</p>
              <button type="button" onClick={() => refetch()} className="cl-primary">
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cl-page">
      <style>{chatListStyles}</style>
      <div className="cl-shell">
        <div className="cl-header">
          <div className="cl-title-wrap">
            <div className="cl-title-icon">
              <MessageCircle size={25} />
            </div>
            <div className="min-w-0">
              <h1 className="cl-title">Messages</h1>
              <p className="cl-subtitle">
                {chatsArray.length === 0
                  ? 'No conversations yet'
                  : `${chatsArray.length} conversation${chatsArray.length !== 1 ? 's' : ''} active`}
              </p>
            </div>
          </div>

          <button type="button" onClick={() => navigate('/')} className="cl-back">
            <ArrowLeft size={18} />
            <span>Browse Products</span>
          </button>
        </div>

        {chatsArray.length > 0 && (
          <div className="cl-toolbar">
            <label className="cl-search">
              <Search size={18} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by user, product, or message"
              />
            </label>

            <div className="cl-filter" aria-label="Message filter">
              <button type="button" onClick={() => setFilter('all')} aria-pressed={filter === 'all'}>
                All
              </button>
              <button type="button" onClick={() => setFilter('unread')} aria-pressed={filter === 'unread'}>
                Unread
              </button>
            </div>
            <button type="button" onClick={() => refetch()} disabled={isLoading} className="cl-refresh">
              <RefreshCw size={16} className={isLoading ? 'cl-spin' : ''} />
              Refresh
            </button>
          </div>
        )}

        <div className="cl-panel">
          {chatsArray.length === 0 ? (
            <div className="cl-empty">
              <div className="cl-empty-inner">
                <div className="cl-empty-icon">
                  <Inbox size={34} />
                </div>
                <h3>No messages yet</h3>
                <p>Start a conversation from any product page. Your active deals and replies will appear here.</p>
                <Link to="/" className="cl-primary">
                  <Package size={17} />
                  Browse Products
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="cl-summary">
                <span>{visibleChats.length} shown</span>
                <span className="cl-unread-pill">{unreadTotal} unread</span>
              </div>

              {visibleChats.length === 0 ? (
                <div className="cl-empty">
                  <div className="cl-empty-inner">
                    <div className="cl-empty-icon">
                      <Search size={32} />
                    </div>
                    <h3>No matching chats</h3>
                    <p>Try another keyword or switch back to all conversations.</p>
                  </div>
                </div>
              ) : (
                <div className="cl-list">
                  {visibleChats.map((chat) => {
                    const lastMessage = chat.lastMessage;
                    const unreadCount = chat.unreadCount || 0;
                    const otherUserChat = getOtherUser(chat, user._id);
                    const chatDate = getChatDate(chat);
                    const avatarUrl = otherUserChat?.avatar?.url;

                    return (
                      <Link
                        key={chat._id}
                        to={`/chats/${chat._id}`}
                        className={`cl-row ${unreadCount > 0 ? 'cl-row--unread' : ''}`}
                      >
                        <div className="cl-avatar" title={otherUserChat?.name || 'User'}>
                          {avatarUrl ? (
                            <img src={avatarUrl} alt={otherUserChat?.name || 'User'} />
                          ) : (
                            <User size={23} />
                          )}
                          {unreadCount > 0 && (
                            <span className="cl-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                          )}
                        </div>

                        <div className="cl-main">
                          <div className="cl-line">
                            <h3 className="cl-name">{otherUserChat?.name || 'Unknown User'}</h3>
                            <span className="cl-time" title={formatChatTitle(chatDate)}>
                              {formatChatTime(chatDate)}
                            </span>
                          </div>

                          <p className="cl-message">
                            {getLastMessageText(lastMessage, user._id).startsWith('You: ') ? (
                              <>
                                <span className="cl-you">You: </span>
                                {getLastMessageText(lastMessage, user._id).slice(5)}
                              </>
                            ) : (
                              getLastMessageText(lastMessage, user._id)
                            )}
                          </p>

                          {chat.product && (
                            <div className="cl-product">
                              <span className="cl-product-thumb">
                                <img
                                  src={getProductImage(chat.product)}
                                  alt=""
                                  onError={(event) => { event.currentTarget.src = placeholderImage; }}
                                />
                              </span>
                              <span>{chat.product.title || 'Product chat'}</span>
                              {chat.product.price && (
                                <strong className="cl-price">Rs {chat.product.price.toLocaleString()}</strong>
                              )}
                            </div>
                          )}
                        </div>

                        <span className="cl-action" aria-hidden="true">
                          <Send size={17} />
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
              <div className="cl-safe-note">
                <ShieldCheck size={14} />
                <span>Meet safely, inspect the item, and avoid advance payments.</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatList;
