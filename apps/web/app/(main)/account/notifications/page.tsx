import { getUserNotifications, markNotificationsAsRead } from '@/actions/notification-actions';
import { NotificationCard } from '@/components/NotificationCard';
import { SyncNotificationBadge } from '@/components/SyncNotificationBadge';
import { getUser } from '@/lib/auth/auth-session';

export default async function NotificationsPage() {
  const user = await getUser();
  if (!user) {
    return <p className="text-sm text-muted-foreground">Connecte-toi pour voir tes notifications.</p>;
  }

  const notifications = await getUserNotifications();
  await markNotificationsAsRead();

  return (
    <div>
      <SyncNotificationBadge />
      <h1 className="mb-6 text-xl font-semibold text-foreground">Notifications</h1>

      {notifications.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">Aucune notification pour le moment.</p>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <NotificationCard key={notification.id} notification={notification} />
          ))}
        </div>
      )}
    </div>
  );
}
