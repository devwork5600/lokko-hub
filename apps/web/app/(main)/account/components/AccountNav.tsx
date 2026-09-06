'use client';

import { ClipboardListIcon, HeartIcon, MessageCircleIcon, SearchIcon, BellIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Button } from '@/components/ui/button';

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
};

const navItems: NavItem[] = [
  { label: 'Mes annonces', href: '/account/listings', icon: ClipboardListIcon },
  { label: 'Favoris', href: '/account/favorites', icon: HeartIcon },
  { label: 'Messages', href: '/account/messages', icon: MessageCircleIcon },
  { label: 'Recherches sauvegardées', href: '/account/saved-searches', icon: SearchIcon },
  { label: 'Notifications', href: '/account/notifications', icon: BellIcon },
];

export function AccountNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-2 overflow-x-auto pb-2">
      {navItems.map((item) => {
        const isActive = pathname.startsWith(item.href);
        const Icon = item.icon;

        return (
          <Link key={item.href} href={item.href}>
            <Button variant={isActive ? 'default' : 'ghost'} className="flex items-center gap-2">
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{item.label}</span>
            </Button>
          </Link>
        );
      })}
    </nav>
  );
}
