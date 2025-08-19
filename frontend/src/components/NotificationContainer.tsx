import { useUIStore } from '@/stores/ui';
import { X } from 'lucide-react';
import { cn } from '@/utils';

export default function NotificationContainer() {
  const { notifications, removeNotification } = useUIStore();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={cn(
            'flex items-center justify-between p-4 rounded-lg shadow-lg max-w-sm animate-slide-up',
            {
              'bg-green-50 border border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200':
                notification.type === 'success',
              'bg-red-50 border border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200':
                notification.type === 'error',
              'bg-yellow-50 border border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200':
                notification.type === 'warning',
              'bg-blue-50 border border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200':
                notification.type === 'info',
            }
          )}
        >
          <div className="flex-1">
            <h4 className="font-medium">{notification.title}</h4>
            {notification.message && (
              <p className="text-sm mt-1">{notification.message}</p>
            )}
          </div>
          <button
            onClick={() => removeNotification(notification.id)}
            className="ml-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}