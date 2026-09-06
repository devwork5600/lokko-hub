'use client';

import { Search, X } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';

import type { SearchSuggestion } from '@/app/api/search/suggestions/route';
import { getRecentSearches, saveRecentSearch, type RecentSearch } from '@/lib/recent-searches';
import { cn } from '@/lib/utils';

const MAX_SUGGESTIONS = 3;
const DEBOUNCE_MS = 300;

function buildHref(suggestion: Pick<SearchSuggestion, 'query' | 'category' | 'subCategory' | 'product'>) {
  const params = new URLSearchParams();
  if (suggestion.query) params.set('q', suggestion.query);
  if (suggestion.category) params.set('category', suggestion.category);
  if (suggestion.subCategory) params.set('subCategory', suggestion.subCategory);
  if (suggestion.product) params.set('product', suggestion.product);

  const qs = params.toString();
  return qs ? `/listings?${qs}` : '/listings';
}

export function NavSearchbar({
  className,
  inputClassName,
  placeholder = 'Rechercher sur Lokko Hub',
  onNavigate,
}: {
  className?: string;
  inputClassName?: string;
  placeholder?: string;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentQuery = searchParams.get('q') ?? '';
  const [value, setValue] = useState(currentQuery);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const isEditingRef = useRef(false);

  // Keep the field in sync with the URL's q= (saved search links, sidebar
  // navigation, browser back/forward) — but never while the user is actively
  // typing/interacting, or their in-progress input would get clobbered.
  useEffect(() => {
    if (!isEditingRef.current) setValue(currentQuery);
  }, [currentQuery]);

  const displayedSuggestions = suggestions.slice(0, MAX_SUGGESTIONS);
  const items = [...displayedSuggestions, ...recentSearches];

  function handleChange(next: string) {
    setValue(next);
    setActiveIndex(-1);
    clearTimeout(debounceRef.current);

    if (next.trim().length < 2) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(next)}`);
      const result = await response.json();
      setSuggestions(result.suggestions ?? []);
      setLoading(false);
    }, DEBOUNCE_MS);
  }

  function handleFocus() {
    isEditingRef.current = true;
    setRecentSearches(getRecentSearches());
    setOpen(true);
  }

  function handleBlur() {
    isEditingRef.current = false;
    setTimeout(() => setOpen(false), 150);
  }

  function navigateTo(suggestion: SearchSuggestion) {
    saveRecentSearch(suggestion);
    isEditingRef.current = false;
    setOpen(false);
    setValue(suggestion.query ?? '');
    setSuggestions([]);
    router.push(buildHref(suggestion));
    onNavigate?.();
  }

  function handleClear() {
    isEditingRef.current = false;
    setValue('');
    setSuggestions([]);
    setOpen(false);

    if (currentQuery) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('q');
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (activeIndex >= 0 && items[activeIndex]) {
      navigateTo(items[activeIndex]);
      return;
    }
    isEditingRef.current = false;
    setOpen(false);
    onNavigate?.();
    router.push(value ? `/listings?q=${encodeURIComponent(value)}` : '/listings');
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!open || items.length === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((i) => (i + 1) % items.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((i) => (i - 1 + items.length) % items.length);
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  }

  const showSuggestionsSection = value.trim().length >= 2;
  const showRecentSection = recentSearches.length > 0;

  return (
    <form onSubmit={handleSubmit} className={cn('relative', className)}>
      <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn(
          'h-9 w-full rounded-lg border border-border bg-background pr-3 pl-9 text-sm outline-none focus:border-primary',
          value && 'pr-8',
          inputClassName,
        )}
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Effacer la recherche"
          className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-sm text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {open && (showSuggestionsSection || showRecentSection) && (
        <div className="absolute z-20 mt-2 w-full rounded-md border border-border bg-background shadow-lg">
          {showSuggestionsSection && (
            <div className="py-1">
              {loading ? (
                <p className="px-3 py-2 text-sm text-muted-foreground">Recherche…</p>
              ) : displayedSuggestions.length === 0 ? (
                <p className="px-3 py-2 text-sm text-muted-foreground">Aucun résultat</p>
              ) : (
                <ul>
                  {displayedSuggestions.map((suggestion, index) => (
                    <li key={`${suggestion.from}-${suggestion.label}`}>
                      <button
                        type="button"
                        onMouseDown={() => navigateTo(suggestion)}
                        className={cn(
                          'block w-full px-3 py-2 text-left text-sm text-foreground hover:bg-muted',
                          activeIndex === index && 'bg-muted',
                        )}
                      >
                        {suggestion.label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {showRecentSection && (
            <div className={cn('py-1', showSuggestionsSection && 'border-t border-border')}>
              <p className="px-3 pt-1 pb-0.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Recherches récentes
              </p>
              <ul>
                {recentSearches.map((recent, index) => {
                  const itemIndex = displayedSuggestions.length + index;
                  return (
                    <li key={`recent-${recent.label}-${recent.timestamp}`}>
                      <button
                        type="button"
                        onMouseDown={() => navigateTo(recent)}
                        className={cn(
                          'block w-full px-3 py-2 text-left text-sm text-foreground hover:bg-muted',
                          activeIndex === itemIndex && 'bg-muted',
                        )}
                      >
                        🔁 {recent.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}
    </form>
  );
}
