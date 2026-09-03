import Link from 'next/link';
import type { ReactNode } from 'react';

export function IconLink({
  href,
  label,
  count,
  children,
}: {
  href: string;
  label: string;
  count?: number;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      className="relative flex items-center justify-center text-foreground transition-colors hover:text-primary"
    >
      {children}
      {!!count && count > 0 && (
        <span className="absolute -top-1 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-primary-foreground">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </Link>
  );
}
