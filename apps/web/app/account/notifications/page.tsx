import Image from 'next/image';
import Link from 'next/link';

import { getUserNotifications, markNotificationsAsRead } from '@/actions/notification-actions';
import { getUser } from '@/lib/auth/auth-session';

export default async function NotificationsPage() {
  const user = await getUser();
  if (!user) {
    return (
      <main>
        <p>Connecte-toi pour voir tes notifications.</p>
      </main>
    );
  }

  const notifications = await getUserNotifications();
  await markNotificationsAsRead();

  return (
    <main>
      <h1>Notifications</h1>

      {notifications.length === 0 ? (
        <p>Aucune notification pour le moment.</p>
      ) : (
        <ul>
          {notifications.map((notification) => {
            const payload = notification.payload as {
              listingId: string;
              listingTitle: string;
              listingImage: string | null;
            };

            return (
              <li key={notification.id}>
                <Link href={`/listings/${payload.listingId}`}>
                  {payload.listingImage && (
                    <Image src={payload.listingImage} alt="" width={60} height={60} />
                  )}
                  Nouvelle annonce : {payload.listingTitle}
                  {!notification.read && <span> (nouveau)</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
