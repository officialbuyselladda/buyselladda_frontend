import { formatDistanceToNow } from 'date-fns';
import { CheckCheck, User } from 'lucide-react';
import { cn } from '../utils';

const ChatMessage = ({ message, isOwn }) => {
  const senderName = message.sender?.name || 'User';
  const avatarUrl = message.sender?.avatar?.url;

  return (
    <div className={cn('group flex items-end gap-2', isOwn ? 'justify-end' : 'justify-start')}>
      {!isOwn && (
        <div className="mb-5 flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-slate-200 to-slate-300 text-slate-600">
          {avatarUrl ? <img src={avatarUrl} alt={senderName} className="h-full w-full object-cover" /> : <User size={15} />}
        </div>
      )}

      <div
        className={cn(
          'max-w-[78%] px-4 py-2.5 shadow-sm sm:max-w-md lg:max-w-lg',
          isOwn
            ? 'rounded-3xl rounded-br-md bg-emerald-600 text-white'
            : 'rounded-3xl rounded-bl-md border border-gray-100 bg-white text-gray-800'
        )}
      >
        {message.text && (
          <p className="whitespace-pre-wrap break-words text-[14.5px] leading-relaxed">{message.text}</p>
        )}

        <div
          className={cn(
            'mt-1.5 flex items-center justify-end gap-1.5 text-[11px]',
            isOwn ? 'text-white/75' : 'text-gray-400'
          )}
        >
          <span>{formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}</span>
          {isOwn && (
            <span className="inline-flex items-center gap-1">
              <CheckCheck size={13} />
              {message.pending ? 'Sending' : message.read ? 'Seen' : 'Sent'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
