import { ThumbsUp, ThumbsDown, MessageCircle } from 'lucide-react';
// formatDistanceToNow imported from utils
import { cn } from '../utils';

const ChatMessage = ({ message, isOwn, currentUser }) => {
  return (
    <div className={cn(
      'flex group',
      isOwn ? 'justify-end' : 'justify-start'
    )}>
      <div className={cn(
        'max-w-xs lg:max-w-md px-4 py-2 rounded-2xl shadow',
        isOwn 
          ? 'bg-primary-600 text-white rounded-br-sm ml-4' 
          : 'bg-white border rounded-bl-sm mr-4'
      )}>
        {message.text && (
          <p className="text-sm break-words">{message.text}</p>
        )}
        
        {message.image && (
          <img 
            src={message.image.url} 
            alt=""
            className="mt-2 rounded-lg max-h-48 w-full object-cover"
          />
        )}
        
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-opacity-20">
          <div className="flex space-x-1 text-xs opacity-75">
            <span>Seen</span>
            {message.read && <MessageCircle size={12} />}
          </div>
          <span className="text-xs">
            {formatDistanceToNow(new Date(message.createdAt))}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;

