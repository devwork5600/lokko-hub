import { getUnreadMessagesCount } from '@/actions/messages-actions';
import { getUnreadNotificationsCount } from '@/actions/notification-actions';
import { getUser } from '@/lib/auth/auth-session';

import { HeaderBar } from './HeaderBar';

export async function Header() {
  const user = await getUser();
  const [unreadMessages, unreadNotifications] = user
    ? await Promise.all([getUnreadMessagesCount(), getUnreadNotificationsCount()])
    : [0, 0];

  return (
    <HeaderBar
      isSignedIn={!!user}
      unreadMessages={unreadMessages}
      unreadNotifications={unreadNotifications}
    />
  );
}
