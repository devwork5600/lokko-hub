import { describe, expect, it } from 'vitest';

import { createPresenceRegistry } from './presence';

describe('presence registry', () => {
  it('is online once a socket is added, offline once removed', () => {
    const presence = createPresenceRegistry();

    expect(presence.isOnline('user-1')).toBe(false);

    presence.addUser('user-1', 'socket-a');
    expect(presence.isOnline('user-1')).toBe(true);

    presence.removeUser('user-1', 'socket-a');
    expect(presence.isOnline('user-1')).toBe(false);
  });

  it('stays online while at least one socket (multi-tab) remains', () => {
    const presence = createPresenceRegistry();

    presence.addUser('user-1', 'socket-a');
    presence.addUser('user-1', 'socket-b');
    presence.removeUser('user-1', 'socket-a');

    expect(presence.isOnline('user-1')).toBe(true);

    presence.removeUser('user-1', 'socket-b');
    expect(presence.isOnline('user-1')).toBe(false);
  });

  it('removing a socket that was never added is a no-op', () => {
    const presence = createPresenceRegistry();
    expect(() => presence.removeUser('user-1', 'socket-a')).not.toThrow();
    expect(presence.isOnline('user-1')).toBe(false);
  });
});
