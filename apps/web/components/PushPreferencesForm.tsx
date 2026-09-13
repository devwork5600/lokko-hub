'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import {
  updateNotificationPreference,
  type NotificationPreferences,
} from '@/actions/notification-preferences-actions';

const OPTIONS: { field: keyof NotificationPreferences; label: string }[] = [
  { field: 'pushMessagesEnabled', label: 'Nouveaux messages' },
  { field: 'pushListingStatusEnabled', label: 'Statut de mes annonces' },
  { field: 'pushSavedSearchEnabled', label: 'Annonces qui correspondent à mes recherches' },
];

export function PushPreferencesForm({ initial }: { initial: NotificationPreferences }) {
  const [preferences, setPreferences] = useState(initial);

  async function toggle(field: keyof NotificationPreferences) {
    const nextValue = !preferences[field];
    setPreferences((prev) => ({ ...prev, [field]: nextValue }));

    const result = await updateNotificationPreference(field, nextValue);
    if (!result.success) {
      // Roll back on failure — the checkbox already flipped optimistically.
      setPreferences((prev) => ({ ...prev, [field]: !nextValue }));
      toast.error('Impossible de mettre à jour cette préférence.');
    }
  }

  return (
    <div className="space-y-2">
      {OPTIONS.map(({ field, label }) => (
        <label key={field} className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={preferences[field]}
            onChange={() => toggle(field)}
            className="h-4 w-4 cursor-pointer accent-primary"
          />
          {label}
        </label>
      ))}
    </div>
  );
}
