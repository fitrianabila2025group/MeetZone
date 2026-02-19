'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Plus, X, Globe } from 'lucide-react';

interface CityResult {
  id: string;
  name: string;
  countryName: string;
  slug: string;
  timezone: { ianaName: string };
}

interface ClockCity extends CityResult {
  time?: string;
  date?: string;
}

export function WorldClockClient() {
  const [cities, setCities] = useState<ClockCity[]>([]);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CityResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load default cities
    async function loadDefaults() {
      try {
        const res = await fetch('/api/public/cities?q=new%20york');
        if (res.ok) {
          const data = await res.json();
          if (data.cities.length > 0) {
            // Load a few popular cities
            const defaultSlugs = ['new-york', 'london', 'tokyo', 'sydney', 'paris', 'dubai'];
            const cities: CityResult[] = [];
            for (const slug of defaultSlugs) {
              const r = await fetch(`/api/public/cities?q=${slug}`);
              if (r.ok) {
                const d = await r.json();
                const found = d.cities.find((c: any) => c.slug === slug);
                if (found) cities.push(found);
              }
            }
            setCities(cities);
          }
        }
      } catch {}
    }
    loadDefaults();
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setShowResults(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/public/cities?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.cities || []);
        }
      } catch { setResults([]); }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  // Update times every second
  useEffect(() => {
    function updateTimes() {
      setCities(prev => prev.map(city => ({
        ...city,
        time: new Intl.DateTimeFormat('en-US', {
          timeZone: city.timezone.ianaName,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        }).format(new Date()),
        date: new Intl.DateTimeFormat('en-US', {
          timeZone: city.timezone.ianaName,
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        }).format(new Date()),
      })));
    }
    updateTimes();
    const interval = setInterval(updateTimes, 1000);
    return () => clearInterval(interval);
  }, [cities.length]);

  function addCity(city: CityResult) {
    if (cities.length >= 12) return;
    if (cities.find(c => c.id === city.id)) return;
    setCities([...cities, city]);
    setQuery('');
    setShowResults(false);
  }

  function removeCity(id: string) {
    setCities(cities.filter(c => c.id !== id));
  }

  return (
    <div className="space-y-6">
      <div className="relative max-w-md" ref={ref}>
        <div className="flex gap-2">
          <Input
            placeholder="Add a city..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setShowResults(true); }}
            onFocus={() => setShowResults(true)}
          />
        </div>
        {showResults && results.length > 0 && (
          <ul className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto">
            {results.map(c => (
              <li
                key={c.id}
                className="px-3 py-2 hover:bg-accent cursor-pointer text-sm"
                onClick={() => addCity(c)}
              >
                {c.name}, {c.countryName}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cities.map(city => (
          <Card key={city.id} className="relative">
            <button
              onClick={() => removeCity(city.id)}
              className="absolute top-2 right-2 p-1 rounded hover:bg-accent"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">{city.name}</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-2">{city.countryName} · {city.timezone.ianaName}</p>
              <p className="text-3xl font-bold font-mono">{city.time || '—'}</p>
              <p className="text-sm text-muted-foreground mt-1">{city.date || ''}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {cities.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Add cities to your world clock</p>
        </div>
      )}
    </div>
  );
}
