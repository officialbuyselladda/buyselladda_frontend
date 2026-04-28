import React, { useState, useEffect } from 'react';
import { MessageCircle, User, Clock, CheckCircle, XCircle } from 'lucide-react';

import { toast } from 'react-hot-toast';

const Support = () => {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'support', message: 'Hello! How can we help you today?', time: '09:30' },
    { id: 2, sender: 'user', message: 'My ad got rejected...', time: '09:32' },
    { id: 3, sender: 'support', message: 'Let me check that for you.', time: '09:35' }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7 && messages.length % 2 === 0) {
        setMessages(prev => [...prev, {
          id: Date.now(),
          sender: 'support',
          message: 'Typing... One moment please.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
        setTimeout(() => {
          setMessages(prev => prev.map(msg => msg.message === 'Typing... One moment please.' ? {
            ...msg,
            message: 'Your ad status has been updated to "Under Review". Check your dashboard in 2 hours.'
          } : msg));
        }, 2000);
      }
    }, 8000);
    return () => clearInterval(interval);
  }, [messages.length]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'user',
        message: newMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setNewMessage('');
      toast('Message sent!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-orange-50">
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Live Support
          </h1>
          <div className="inline-flex items-center bg-white/70 backdrop-blur-sm px-8 py-3 rounded-2xl shadow-lg border border-indigo-200">
            <div className="w-3 h-3 bg-emerald-500 rounded-full mr-3 animate-ping" />
            <span className="font-bold text-lg text-indigo-900">Live agent online</span>
          </div>
        </div>

        {/* Chat Container */}
        <div className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-indigo-200 overflow-hidden max-h-[70vh] flex flex-col">
          {/* Messages */}
          <div className="flex-1 p-8 overflow-y-auto space-y-6">
            {messages.map((msg) => (
              <div key={msg.id} className={cn(
                'flex gap-3 max-w-[85%]',
                msg.sender === 'user' ? 'ml-auto justify-end' : 'mr-auto justify-start'
              )}>
                <div className={cn(
                  'rounded-2xl px-6 py-4 shadow-lg max-w-full break-words',
                  msg.sender === 'user' 
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-sm' 
                    : 'bg-white border border-gray-200 rounded-bl-sm'
                )}>
                  <p className="leading-relaxed">{msg.message}</p>
                  <p className={cn('text-xs mt-2 opacity-75 font-medium', 
                    msg.sender === 'user' ? 'text-indigo-100' : 'text-gray-500'
                  )}>
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-3 mr-auto justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl px-6 py-4 shadow-lg">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} className="p-6 border-t border-indigo-200 bg-white/50">
            <div className="flex gap-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-5 py-4 border border-indigo-200 rounded-2xl focus:ring-4 focus:ring-indigo-500 focus:border-indigo-400 shadow-sm transition-all outline-none bg-white/80"
                disabled={isTyping}
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || isTyping}
                className="w-14 h-14 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MessageCircle className="w-6 h-6" />
              </button>
            </div>
          </form>
        </div>

        <div className="mt-12 text-center space-y-6">
          <div className="max-w-md mx-auto p-8 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-3xl text-white shadow-2xl">
            <CheckCircle className="w-20 h-20 mx-auto mb-6 opacity-90" />
            <h3 className="text-2xl font-bold mb-4">Fast Response</h3>
            <p className="opacity-90">Average response time: 2 minutes</p>
          </div>
          
          <div className="flex flex-wrap gap-4 justify-center text-sm">
            <button className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-xl transition-all">
              End Chat
            </button>
            <a href="/help" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all">
              Help Articles
            </a>
          </div>
        </div>
      </main>
    
    </div>
  );
};

export default Support;

