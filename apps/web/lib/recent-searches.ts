import type { SearchSuggestion } from '@/app/api/search/suggestions/route';

export type RecentSearch = SearchSuggestion & { timestamp: number };

const STORAGE_KEY = 'recent-searches';
const MAX_RECENT = 2;

export function getRecentSearches(): RecentSearch[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RecentSearch[];
    return Array.isArray(parsed) ? parsed.slice(0, MAX_RECENT) : [];
  } catch {
    return [];
  }
}

export function saveRecentSearch(suggestion: SearchSuggestion) {
  if (typeof window === 'undefined') return;

  const existing = getRecentSearches().filter((entry) => entry.label !== suggestion.label);
  const next = [{ ...suggestion, timestamp: Date.now() }, ...existing].slice(0, MAX_RECENT);

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // localStorage unavailable (private mode, quota) — recent searches are a convenience, safe to drop.
  }
}
