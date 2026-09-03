'use client';

import { X } from 'lucide-react';
import { useEffect } from 'react';

import { CategoryFilter } from './CategoryFilter';
import { GeoSearch } from './GeoSearch';
import { PriceFilter } from './PriceFilter';

export function FilterDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />
      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-80 max-w-[85vw] overflow-y-auto bg-background shadow-xl transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-border p-4">
          <span className="font-semibold text-foreground">Filtres</span>
          <button type="button" onClick={onClose} aria-label="Fermer les filtres">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-8 p-4">
          <GeoSearch />
          <PriceFilter />
          <CategoryFilter />
        </div>
      </aside>
    </>
  );
}
