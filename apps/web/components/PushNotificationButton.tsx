'use client';

import { BellIcon, BellRingIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { usePushSubscription } from '@/hooks/use-push-subscription';

export function PushNotificationButton() {
  const { status, subscribe } = usePushSubscription();

  if (status === 'unsupported') {
    return <p className="text-sm text-muted-foreground">Notifications non supportées sur cet appareil.</p>;
  }

  if (status === 'denied') {
    return (
      <p className="text-sm text-muted-foreground">
        Notifications refusées. Active-les depuis les réglages de ton navigateur pour ce site.
      </p>
    );
  }

  if (status === 'subscribed') {
    return (
      <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <BellRingIcon className="h-4 w-4" />
        Notifications activées sur cet appareil
      </p>
    );
  }

  return (
    <Button onClick={subscribe} disabled={status === 'subscribing'} variant="outline" className="gap-1.5">
      <BellIcon className="h-4 w-4" />
      {status === 'subscribing' ? 'Activation...' : 'Activer les notifications'}
    </Button>
  );
}
