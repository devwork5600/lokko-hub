'use client';

import { useRef, useState } from 'react';

import type { CitySuggestion } from '@/app/api/city/route';

export function CityAutocomplete({
  value,
  onSelect,
  placeholder = 'Ville...',
}: {
  value: string;
  onSelect: (suggestion: CitySuggestion) => void;
  placeholder?: string;
}) {
  // `value` only seeds the initial text (e.g. prefilling an edit form) — once the
  // user types, this input's own state is the source of truth, not a prop sync.
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  function handleChange(next: string) {
    setQuery(next);
    clearTimeout(debounceRef.current);

    if (next.trim().length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      const response = await fetch(`/api/city?q=${encodeURIComponent(next)}`);
      const result = await response.json();
      setSuggestions(result.suggestions ?? []);
      setOpen(true);
    }, 250);
  }

  function handleSelect(suggestion: CitySuggestion) {
    setQuery(`${suggestion.city} (${suggestion.postalCode})`);
    setOpen(false);
    setSuggestions([]);
    onSelect(suggestion);
  }

  return (
    <div>
      <input
        type="text"
        value={query}
        placeholder={placeholder}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      {open && suggestions.length > 0 && (
        <ul>
          {suggestions.map((suggestion) => (
            <li key={`${suggestion.city}-${suggestion.postalCode}`}>
              <button type="button" onMouseDown={() => handleSelect(suggestion)}>
                {suggestion.city} ({suggestion.postalCode})
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
