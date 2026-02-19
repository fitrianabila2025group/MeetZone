'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ArrowRight } from 'lucide-react';

interface CityResult {
  id: string;
  name: string;
  countryName: string;
  slug: string;
  timezone: { ianaName: string };
}

export function CitySearch() {
  const router = useRouter();
  const [fromQuery, setFromQuery] = useState('');
  const [toQuery, setToQuery] = useState('');
  const [fromResults, setFromResults] = useState<CityResult[]>([]);
  const [toResults, setToResults] = useState<CityResult[]>([]);
  const [selectedFrom, setSelectedFrom] = useState<CityResult | null>(null);
  const [selectedTo, setSelectedTo] = useState<CityResult | null>(null);
  const [showFrom, setShowFrom] = useState(false);
  const [showTo, setShowTo] = useState(false);
  const fromRef = useRef<HTMLDivElement>(null);
  const toRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (fromRef.current && !fromRef.current.contains(e.target as Node)) setShowFrom(false);
      if (toRef.current && !toRef.current.contains(e.target as Node)) setShowTo(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function searchCities(q: string, setter: (r: CityResult[]) => void) {
    if (q.length < 2) { setter([]); return; }
    try {
      const res = await fetch(`/api/public/cities?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setter(data.cities || []);
      }
    } catch { setter([]); }
  }

  useEffect(() => {
    const t = setTimeout(() => searchCities(fromQuery, setFromResults), 300);
    return () => clearTimeout(t);
  }, [fromQuery]);

  useEffect(() => {
    const t = setTimeout(() => searchCities(toQuery, setToResults), 300);
    return () => clearTimeout(t);
  }, [toQuery]);

  function handleConvert() {
    if (selectedFrom && selectedTo) {
      router.push(`/time/${selectedFrom.slug}-to-${selectedTo.slug}`);
    }
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-end w-full">
      <div className="relative flex-1 w-full" ref={fromRef}>
        <label className="text-sm font-medium mb-1 block">From City</label>
        <Input
          placeholder="Search city..."
          value={selectedFrom ? `${selectedFrom.name}, ${selectedFrom.countryName}` : fromQuery}
          onChange={(e) => {
            setFromQuery(e.target.value);
            setSelectedFrom(null);
            setShowFrom(true);
          }}
          onFocus={() => setShowFrom(true)}
        />
        {showFrom && fromResults.length > 0 && (
          <ul className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto">
            {fromResults.map((c) => (
              <li
                key={c.id}
                className="px-3 py-2 hover:bg-accent cursor-pointer text-sm"
                onClick={() => {
                  setSelectedFrom(c);
                  setFromQuery('');
                  setShowFrom(false);
                }}
              >
                {c.name}, {c.countryName}
                <span className="text-muted-foreground ml-2 text-xs">{c.timezone.ianaName}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ArrowRight className="hidden sm:block h-5 w-5 text-muted-foreground shrink-0 mb-2" />

      <div className="relative flex-1 w-full" ref={toRef}>
        <label className="text-sm font-medium mb-1 block">To City</label>
        <Input
          placeholder="Search city..."
          value={selectedTo ? `${selectedTo.name}, ${selectedTo.countryName}` : toQuery}
          onChange={(e) => {
            setToQuery(e.target.value);
            setSelectedTo(null);
            setShowTo(true);
          }}
          onFocus={() => setShowTo(true)}
        />
        {showTo && toResults.length > 0 && (
          <ul className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto">
            {toResults.map((c) => (
              <li
                key={c.id}
                className="px-3 py-2 hover:bg-accent cursor-pointer text-sm"
                onClick={() => {
                  setSelectedTo(c);
                  setToQuery('');
                  setShowTo(false);
                }}
              >
                {c.name}, {c.countryName}
                <span className="text-muted-foreground ml-2 text-xs">{c.timezone.ianaName}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Button onClick={handleConvert} disabled={!selectedFrom || !selectedTo} className="w-full sm:w-auto mb-0">
        <Search className="h-4 w-4 mr-2" />
        Convert
      </Button>
    </div>
  );
}
