import { useNotifications } from '../context/NotificationContext';
import { X } from 'lucide-react';

export default function NotificationDisplay() {
  const { notifications, removeNotification } = useNotifications();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="bg-white rounded-lg shadow-lg border border-stone-200 p-4 animate-in slide-in-from-right-full duration-300"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <span className="text-2xl" role="img" aria-label="notification icon">
                {notification.icon}
              </span>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-stone-900 mb-1">
                  {notification.title}
                </h4>
                <p className="text-sm text-stone-600">
                  {notification.message}
                </p>
                <p className="text-xs text-stone-400 mt-1">
                  {notification.timestamp.toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="flex-shrink-0 p-1 hover:bg-stone-100 rounded transition-colors"
            >
              <X className="h-4 w-4 text-stone-400" />
            </button>
          </div>
          
          {/* Progress bar for auto-dismiss */}
          <div className="mt-3">
            <div className="h-1 bg-stone-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-brand-500 rounded-full animate-shrink-width"
                style={{
                  animation: 'shrink-width 10s linear forwards'
                }}
              />
            </div>
          </div>
        </div>
      ))}
      
      <style jsx>{`
        @keyframes shrink-width {
          from { width: 100%; }
          to { width: 0%; }
        }
        .animate-shrink-width {
          animation: shrink-width 10s linear forwards;
        }
      `}</style>
    </div>
  );
}