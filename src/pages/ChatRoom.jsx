import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { chatApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import io from 'socket.io-client';
import ChatMessage from '../components/ChatMessage';
import ChatInput from '../components/ChatInput';
import { MessageCircle, ArrowLeft, User, Phone } from 'lucide-react';
import toast from 'react-hot-toast';

const ChatRoom = () => {
  const { chatId } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);

  const { data: chat } = useQuery({
    queryKey: ['chat', chatId],
    queryFn: () => chatApi.getMessages(chatId).then(res => res.data.data),
    enabled: !!chatId && !!user,
  });

  useEffect(() => {
    if (chatId) {
      const newSocket = io.connect('/'); // Backend socket base
      setSocket(newSocket);

      newSocket.emit('joinChat', chatId);

      newSocket.on('message', (message) => {
        setMessages(prev => [...prev, message]);
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [chatId]);

  const sendMessage = async (content) => {
    try {
      const res = await chatApi.sendMessage(chatId, content);
      // Socket emit already in ChatInput
      setMessages(prev => [...prev, res.data.data]);
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const otherUser = chat?.users.find(u => u._id !== user?._id);

  if (!chat) {
    return <div>Loading chat...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-full max-w-4xl mx-auto flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-emerald-500 rounded-2xl flex items-center justify-center">
              <User size={20} className="text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg">{otherUser?.name}</h2>
              <p className="text-sm text-gray-500">{chat.product?.title || 'General chat'}</p>
            </div>
            <button className="ml-auto p-2 hover:bg-gray-100 rounded-xl">
              <Phone size={20} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, index) => (
            <ChatMessage 
              key={msg._id || index} 
              message={msg} 
              isOwn={msg.sender._id === user._id}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <ChatInput chatId={chatId} onSendMessage={sendMessage} socket={socket} />
      </div>
    </div>
  );
};

export default ChatRoom;

