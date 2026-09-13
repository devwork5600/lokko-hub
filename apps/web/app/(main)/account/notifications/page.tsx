import { getUserNotifications, markNotificationsAsRead } from '@/actions/notification-actions';
import { getNotificationPreferences } from '@/actions/notification-preferences-actions';
import { NotificationCard } from '@/components/NotificationCard';
import { PushNotificationButton } from '@/components/PushNotificationButton';
import { PushPreferencesForm } from '@/components/PushPreferencesForm';
import { SyncNotificationBadge } from '@/components/SyncNotificationBadge';
import { getUser } from '@/lib/auth/auth-session';

export default async function NotificationsPage() {
  const user = await getUser();
  if (!user) {
    return <p className="text-sm text-muted-foreground">Connecte-toi pour voir tes notifications.</p>;
  }

  const [notifications, preferences] = await Promise.all([
    getUserNotifications(),
    getNotificationPreferences(),
  ]);
  await markNotificationsAsRead();

  return (
    <div>
      <SyncNotificationBadge />
      <div className="mb-4 flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold text-foreground">Notifications</h1>
        <PushNotificationButton />
      </div>

      {preferences && (
        <div className="mb-6 rounded-lg border border-border p-4">
          <p className="mb-3 text-sm font-medium text-foreground">Recevoir une notification push pour :</p>
          <PushPreferencesForm initial={preferences} />
        </div>
      )}

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
