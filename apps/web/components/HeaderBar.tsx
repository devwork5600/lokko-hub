'use client';

import { Bell, Bookmark, Menu, MessageCircle, Search, SquarePlus, UserRound, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { useNotificationCounts } from '@/hooks/useNotificationCounts';

import { IconLink } from './IconLink';
import { MobileDrawer } from './MobileDrawer';
import { ModeToggle } from './ModeToggle';
import { NavSearchbar } from './NavSearchbar';
import { SignOutButton } from './SignOutButton';
import { UserMenu } from './UserMenu';

export function HeaderBar({ isSignedIn }: { isSignedIn: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { data: counts } = useNotificationCounts();
  const unreadMessages = counts?.unreadMessages ?? 0;
  const unreadNotifications = counts?.unreadNotifications ?? 0;

  return (
    <div className="fixed top-0 left-0 z-40 flex h-14 w-full items-center border-b border-border bg-background px-4 shadow-sm lg:h-16 lg:px-8">
      <div className="relative mx-auto flex h-full w-full max-w-6xl items-center lg:justify-between">
        <button onClick={() => setMenuOpen(true)} aria-label="Menu" className="lg:hidden">
          <Menu size={24} />
        </button>

        <Link
          href="/"
          className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center lg:static lg:translate-x-0 lg:translate-y-0"
        >
          <span className="font-poppins text-xl font-black text-primary lg:text-2xl">Lokko Hub</span>
        </Link>

        <Link
          href={isSignedIn ? '/listings/create' : '/sign-in'}
          className="ml-8 hidden h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 lg:flex"
        >
          <SquarePlus className="h-4 w-4" />
          Publier une annonce
        </Link>

        <NavSearchbar className="mx-6 hidden grow lg:block" />

        <div className="hidden items-center gap-4 lg:flex">
          <ModeToggle />
          <IconLink
            href={isSignedIn ? '/account/saved-searches' : '/sign-in'}
            label="Recherches sauvegardées"
          >
            <Bookmark className="h-5 w-5" />
          </IconLink>
          <IconLink
            href={isSignedIn ? '/account/notifications' : '/sign-in'}
            label="Notifications"
            count={unreadNotifications}
          >
            <Bell className="h-5 w-5" />
          </IconLink>
          <IconLink href={isSignedIn ? '/account/messages' : '/sign-in'} label="Messages" count={unreadMessages}>
            <MessageCircle className="h-5 w-5" />
          </IconLink>
          {isSignedIn ? (
            <UserMenu />
          ) : (
            <IconLink href="/sign-in" label="Connexion">
              <UserRound className="h-5 w-5" />
            </IconLink>
          )}
        </div>
      </div>

      <button onClick={() => setSearchOpen(true)} aria-label="Rechercher" className="ml-2 lg:hidden">
        <Search size={20} />
      </button>

      <div
        className={`absolute inset-x-0 top-0 z-10 flex h-full items-center gap-2 bg-background px-4 transition-transform duration-300 ease-in-out lg:hidden ${
          searchOpen ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <NavSearchbar
          className="flex-1"
          inputClassName="h-10"
          onNavigate={() => setSearchOpen(false)}
        />
        <button onClick={() => setSearchOpen(false)} aria-label="Fermer la recherche">
          <X size={22} />
        </button>
      </div>

      <MobileDrawer open={menuOpen} onClose={() => setMenuOpen(false)}>
        <nav className="flex flex-col gap-1 p-4">
          <div className="mb-4 flex items-center justify-between">
            <span className="font-poppins text-lg font-black text-primary">Lokko Hub</span>
            <button onClick={() => setMenuOpen(false)} aria-label="Fermer le menu">
              <X size={22} />
            </button>
          </div>

          <Link
            href={isSignedIn ? '/listings/create' : '/sign-in'}
            onClick={() => setMenuOpen(false)}
            className="mb-2 flex h-10 items-center justify-center gap-1.5 rounded-lg bg-primary text-sm font-medium text-primary-foreground"
          >
            <SquarePlus className="h-4 w-4" />
            Publier une annonce
          </Link>

          <Link
            href="/listings"
            onClick={() => setMenuOpen(false)}
            className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted"
          >
            Annonces
          </Link>

          {isSignedIn ? (
            <>
              <Link
                href="/account/saved-searches"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted"
              >
                Recherches sauvegardées
              </Link>
              <Link
                href="/account/notifications"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted"
              >
                Notifications
                {unreadNotifications > 0 && (
                  <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                    {unreadNotifications}
                  </span>
                )}
              </Link>
              <Link
                href="/account/messages"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted"
              >
                Messages
                {unreadMessages > 0 && (
                  <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                    {unreadMessages}
                  </span>
                )}
              </Link>
              <Link
                href="/account/listings"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted"
              >
                Mes annonces
              </Link>
              <div className="px-3 py-2.5">
                <SignOutButton />
              </div>
            </>
          ) : (
            <Link
              href="/sign-in"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted"
            >
              Se connecter
            </Link>
          )}

          <div className="mt-2 flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium">
            Thème
            <ModeToggle />
          </div>
        </nav>
      </MobileDrawer>
    </div>
  );
}
