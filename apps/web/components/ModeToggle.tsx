'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function ModeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Server always renders the light-mode icon state; the real theme is only
  // known client-side (localStorage/system preference), so this must wait
  // until after hydration or React flags a mismatch on every load.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mount-only hydration guard, not a cascading update
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === 'dark';

  function toggle() {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  }

  return (
    <button
      onClick={toggle}
      aria-label="Changer de thème"
      title="Changer de thème"
      className="relative flex cursor-pointer items-center justify-center text-foreground transition-colors hover:text-primary"
    >
      <Sun className={`h-5 w-5 transition-all ${isDark ? 'scale-0 -rotate-90' : 'scale-100 rotate-0'}`} />
      <Moon className={`absolute h-5 w-5 transition-all ${isDark ? 'scale-100 rotate-0' : 'scale-0 rotate-90'}`} />
    </button>
  );
}
