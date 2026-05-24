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

  const handleSubmit = (e) => {
    e.preventDefault();
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
    <>
      <style>{chatInputStyles}</style>

      <form onSubmit={handleSubmit} className="ci-wrap">

        {/* ── Quick Replies ── */}
        {quickOpen && (
          <div className="ci-quick">
            {quickReplies.map((reply) => (
              <button
                key={reply}
                type="button"
                onClick={() => updateMessage(message ? `${message} ${reply}` : reply)}
                className="ci-quick__pill"
              >
                {reply}
              </button>
            ))}
          </div>
        )}

        {/* ── Input Row ── */}
        <div className="ci-row">
          <button
            type="button"
            onClick={() => setQuickOpen((o) => !o)}
            className={`ci-emoji-btn ${quickOpen ? 'ci-emoji-btn--active' : ''}`}
            title="Quick replies"
            aria-label="Quick replies"
          >
            <Smile size={19} />
          </button>

          <textarea
            value={message}
            onChange={(e) => updateMessage(e.target.value)}
            onBlur={() => onTyping?.(false)}
            placeholder="Type a message…"
            rows={1}
            className="ci-textarea"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />

          <button
            type="submit"
            disabled={!message.trim() || disabled}
            className="ci-send-btn"
            title="Send"
            aria-label="Send message"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </>
  );
};

/* ═══════════════════════════════════════════
   STYLES
═══════════════════════════════════════════ */
const chatInputStyles = `
  :root {
    --ci-bg: #ffffff;
    --ci-surface: #faf9f7;
    --ci-border: #edeae5;
    --ci-accent: #d4571a;
    --ci-accent-hover: #b84816;
    --ci-accent-light: #fff4ef;
    --ci-text: #0f0e0c;
    --ci-text-2: #6b6860;
    --ci-text-3: #9c9890;
    --ci-radius: 14px;
    --ci-radius-sm: 9px;
    --ci-radius-full: 999px;
    --ci-t: 0.16s cubic-bezier(0.4,0,0.2,1);
  }

  /* ── Wrapper ── */
  .ci-wrap {
    padding: 10px 12px 12px;
    background: var(--ci-bg);
    border-top: 1px solid var(--ci-border);
    box-shadow: 0 -4px 20px rgba(0,0,0,0.04);
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  @media (min-width: 640px) { .ci-wrap { padding: 12px 16px 14px; } }

  /* ── Quick Replies ── */
  .ci-quick {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    padding: 10px 12px;
    background: var(--ci-surface);
    border: 1px solid var(--ci-border);
    border-radius: var(--ci-radius);
    animation: ci-slide-down 0.18s ease;
  }
  @keyframes ci-slide-down {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .ci-quick__pill {
    padding: 5px 13px;
    border-radius: var(--ci-radius-full);
    font-size: 12px;
    font-weight: 600;
    color: var(--ci-text-2);
    background: var(--ci-bg);
    border: 1.5px solid var(--ci-border);
    cursor: pointer;
    transition: background var(--ci-t), color var(--ci-t), border-color var(--ci-t), transform var(--ci-t);
    white-space: nowrap;
  }
  .ci-quick__pill:hover {
    background: var(--ci-accent-light);
    color: var(--ci-accent);
    border-color: #fddcc8;
    transform: translateY(-1px);
  }

  /* ── Input Row ── */
  .ci-row {
    display: flex;
    align-items: flex-end;
    gap: 8px;
    background: var(--ci-surface);
    border: 1.5px solid var(--ci-border);
    border-radius: var(--ci-radius);
    padding: 6px 6px 6px 4px;
    transition: border-color var(--ci-t), box-shadow var(--ci-t);
  }
  .ci-row:focus-within {
    border-color: var(--ci-accent);
    box-shadow: 0 0 0 3px rgba(212,87,26,0.10);
    background: var(--ci-bg);
  }

  /* ── Emoji / Quick Toggle ── */
  .ci-emoji-btn {
    flex-shrink: 0;
    width: 38px;
    height: 38px;
    border-radius: var(--ci-radius-sm);
    border: none;
    background: transparent;
    color: var(--ci-text-3);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background var(--ci-t), color var(--ci-t);
    align-self: flex-end;
    margin-bottom: 1px;
  }
  .ci-emoji-btn:hover { background: var(--ci-accent-light); color: var(--ci-accent); }
  .ci-emoji-btn--active { background: var(--ci-accent-light); color: var(--ci-accent); }

  /* ── Textarea ── */
  .ci-textarea {
    flex: 1;
    min-height: 40px;
    max-height: 128px;
    background: transparent;
    border: none;
    outline: none;
    resize: none;
    font-size: 14px;
    color: var(--ci-text);
    line-height: 1.55;
    padding: 9px 6px 9px 2px;
    font-family: inherit;
    scrollbar-width: thin;
  }
  .ci-textarea::placeholder { color: var(--ci-text-3); }
  .ci-textarea::-webkit-scrollbar { width: 4px; }
  .ci-textarea::-webkit-scrollbar-track { background: transparent; }
  .ci-textarea::-webkit-scrollbar-thumb { background: var(--ci-border); border-radius: 99px; }

  /* ── Send Button ── */
  .ci-send-btn {
    flex-shrink: 0;
    width: 42px;
    height: 42px;
    border-radius: var(--ci-radius-sm);
    border: none;
    background: var(--ci-accent);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 2px 10px rgba(212,87,26,0.28);
    transition: background var(--ci-t), transform var(--ci-t), box-shadow var(--ci-t);
    align-self: flex-end;
  }
  .ci-send-btn:hover:not(:disabled) {
    background: var(--ci-accent-hover);
    transform: translateY(-1px);
    box-shadow: 0 4px 14px rgba(212,87,26,0.36);
  }
  .ci-send-btn:active:not(:disabled) { transform: translateY(0); }
  .ci-send-btn:disabled { opacity: 0.45; cursor: not-allowed; box-shadow: none; }
`;

export default ChatInput;