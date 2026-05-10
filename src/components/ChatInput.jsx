import React, { useEffect, useRef, useState } from 'react';
import { Send, Smile } from 'lucide-react';

const quickReplies = ['Hi', 'Ok', 'Thanks', 'Available?', 'Final price?', 'Done'];

const ChatInput = ({ onSendMessage, onTyping, disabled = false }) => {
  const [message, setMessage] = useState('');
  const [quickOpen, setQuickOpen] = useState(false);
  const typingTimeoutRef = useRef(null);

  const stopTypingSoon = () => {
    window.clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = window.setTimeout(() => onTyping?.(false), 900);
  };

  const updateMessage = (value) => {
    setMessage(value);
    if (value.trim()) {
      onTyping?.(true);
      stopTypingSoon();
      return;
    }
    window.clearTimeout(typingTimeoutRef.current);
    onTyping?.(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const text = message.trim();
    if (!text || !onSendMessage || disabled) return;
    onSendMessage(text);
    updateMessage('');
    setQuickOpen(false);
  };

  useEffect(() => () => {
    window.clearTimeout(typingTimeoutRef.current);
    onTyping?.(false);
  }, [onTyping]);

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-200 bg-white/95 p-3 shadow-[0_-8px_24px_rgba(15,23,42,0.04)] sm:p-4">
      {quickOpen && (
        <div className="mb-3 flex flex-wrap gap-2 rounded-2xl border border-gray-100 bg-gray-50 p-3">
          {quickReplies.map((reply) => (
            <button
              key={reply}
              type="button"
              onClick={() => updateMessage(message ? `${message} ${reply}` : reply)}
              className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 shadow-sm transition-colors hover:bg-emerald-50 hover:text-emerald-700"
            >
              {reply}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2 rounded-3xl border border-gray-200 bg-gray-50 p-1.5 focus-within:border-emerald-300 focus-within:ring-4 focus-within:ring-emerald-50">
        <button
          type="button"
          onClick={() => setQuickOpen((open) => !open)}
          className="rounded-2xl p-3 text-gray-500 transition-colors hover:bg-white hover:text-emerald-600"
          title="Quick replies"
        >
          <Smile size={20} />
        </button>
        <textarea
          value={message}
          onChange={(event) => updateMessage(event.target.value)}
          onBlur={() => onTyping?.(false)}
          placeholder="Type a message..."
          rows={1}
          className="max-h-32 min-h-[44px] flex-1 resize-none bg-transparent px-2 py-3 text-sm text-gray-800 outline-none placeholder:text-gray-400"
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              handleSubmit(event);
            }
          }}
        />
        <button
          type="submit"
          disabled={!message.trim() || disabled}
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm transition-all hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          title="Send"
        >
          <Send size={20} />
        </button>
      </div>
    </form>
  );
};

export default ChatInput;
