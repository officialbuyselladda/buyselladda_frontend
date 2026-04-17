import React, { useState } from 'react';
import { Send, Paperclip, Smile } from 'lucide-react';
// Socket passed as prop from parent (ChatRoom provides socket)


const ChatInput = ({ chatId, onSendMessage, socket }) => {
  const [message, setMessage] = useState('');


  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && onSendMessage) {
      onSendMessage(message);
      socket?.emit('sendMessage', { chatId, content: message });
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-200">
      <div className="flex items-end gap-2">
        <button type="button" className="p-2 text-gray-400 hover:text-gray-500 transition-colors">
          <Smile size={20} />
        </button>
        <button type="button" className="p-2 text-gray-400 hover:text-gray-500 transition-colors">
          <Paperclip size={20} />
        </button>
        <div className="flex-1 relative">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSubmit(e)}
          />
        </div>
        <button 
          type="submit" 
          disabled={!message.trim()}
          className="p-3 bg-primary-600 text-white rounded-2xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
        >
          <Send size={20} />
        </button>
      </div>
    </form>
  );
};

export default ChatInput;

