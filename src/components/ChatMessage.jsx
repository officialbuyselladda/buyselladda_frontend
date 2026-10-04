import { format } from 'date-fns';
import { CheckCheck, User } from 'lucide-react';

const getMessageDate = (message) => {
  const value = message?.createdAt || message?.updatedAt;
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatMessageTime = (date) => {
  if (!date) return 'Just now';
  return format(date, 'h:mm a');
};

const formatMessageTitle = (date) => {
  if (!date) return 'Sending now';
  return format(date, 'EEEE, d MMM yyyy, h:mm a');
};

const ChatMessage = ({ message, isOwn }) => {
  const senderName = message.sender?.name || 'User';
  const avatarUrl = message.sender?.avatar?.url;
  const messageDate = getMessageDate(message);

  return (
    <>
      <style>{chatMsgStyles}</style>

      <div className={`cm-row ${isOwn ? 'cm-row--own' : 'cm-row--other'}`}>

        {/* Avatar (other side only) */}
        {!isOwn && (
          <div className="cm-avatar" title={senderName}>
            {avatarUrl
              ? <img src={avatarUrl} alt={senderName} className="cm-avatar__img" />
              : <User size={14} />
            }
          </div>
        )}

        {/* Bubble */}
        <div className={`cm-bubble ${isOwn ? 'cm-bubble--own' : 'cm-bubble--other'}`}>
          {message.text && (
            <p className="cm-bubble__text">{message.text}</p>
          )}

          <div className="cm-bubble__meta">
            <span className="cm-bubble__time" title={formatMessageTitle(messageDate)}>
              {formatMessageTime(messageDate)}
            </span>
            {isOwn && (
              <span className="cm-bubble__status">
                <CheckCheck size={12} />
                {message.pending ? 'Sending' : message.read ? 'Seen' : 'Sent'}
              </span>
            )}
          </div>
        </div>

      </div>
    </>
  );
};

/* ═══════════════════════════════════════════
   STYLES
═══════════════════════════════════════════ */
const chatMsgStyles = `
  :root {
    --cm-own-bg: #ff8200;
    --cm-own-bg-2: #c04d16;
    --cm-own-text: #ffffff;
    --cm-own-meta: rgba(255,255,255,0.72);
    --cm-other-bg: #ffffff;
    --cm-other-border: #dde5f0;
    --cm-other-text: #17233c;
    --cm-other-meta: #95a1b2;
    --cm-avatar-bg: #f5f7fa;
    --cm-avatar-border: #dde5f0;
    --cm-avatar-color: #95a1b2;
    --cm-shadow-own: 0 2px 10px rgba(255,130,0,0.22);
    --cm-shadow-other: 0 1px 4px rgba(0,0,0,0.06);
    --cm-t: 0.16s cubic-bezier(0.4,0,0.2,1);
  }

  /* ── Row ── */
  .cm-row {
    display: flex;
    align-items: flex-end;
    gap: 8px;
    padding: 1px 0;
    animation: cm-fade-in 0.2s ease;
  }
  @keyframes cm-fade-in {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .cm-row--own   { justify-content: flex-end; }
  .cm-row--other { justify-content: flex-start; }

  /* ── Avatar ── */
  .cm-avatar {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: var(--cm-avatar-bg);
    border: 1.5px solid var(--cm-avatar-border);
    color: var(--cm-avatar-color);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    overflow: hidden;
    margin-bottom: 20px;
  }
  .cm-avatar__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  /* ── Bubble ── */
  .cm-bubble {
    max-width: 78%;
    padding: 10px 14px 8px;
    border-radius: 18px;
    box-shadow: var(--cm-shadow-other);
    position: relative;
    transition: box-shadow var(--cm-t);
  }
  @media (min-width: 640px)  { .cm-bubble { max-width: 440px; } }
  @media (min-width: 1024px) { .cm-bubble { max-width: 520px; } }

  /* Own bubble */
  .cm-bubble--own {
    background: linear-gradient(135deg, var(--cm-own-bg) 0%, var(--cm-own-bg-2) 100%);
    color: var(--cm-own-text);
    border-radius: 18px 18px 4px 18px;
    box-shadow: var(--cm-shadow-own);
  }

  /* Other bubble */
  .cm-bubble--other {
    background: var(--cm-other-bg);
    color: var(--cm-other-text);
    border: 1px solid var(--cm-other-border);
    border-radius: 18px 18px 18px 4px;
  }

  /* ── Text ── */
  .cm-bubble__text {
    font-size: 14px;
    line-height: 1.55;
    white-space: pre-wrap;
    word-break: break-word;
    margin: 0;
  }

  /* ── Meta ── */
  .cm-bubble__meta {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 5px;
    margin-top: 5px;
  }
  .cm-bubble__time {
    font-size: 10.5px;
    font-weight: 500;
  }
  .cm-bubble--own   .cm-bubble__time { color: var(--cm-own-meta); }
  .cm-bubble--other .cm-bubble__time { color: var(--cm-other-meta); }

  .cm-bubble__status {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    font-size: 10.5px;
    font-weight: 600;
    color: var(--cm-own-meta);
  }
`;

export default ChatMessage;
