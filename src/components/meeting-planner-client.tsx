'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Share2, X, Plus, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface CityResult {
  id: string;
  name: string;
  countryName: string;
  slug: string;
  timezone: { ianaName: string };
}

export function MeetingPlannerClient() {
  const [cities, setCities] = useState<CityResult[]>([]);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CityResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [bestTimes, setBestTimes] = useState<any[]>([]);
  const ref = useRef<HTMLDivElement>(null);

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

  function addCity(city: CityResult) {
    if (cities.length >= 8) { toast.error('Maximum 8 cities'); return; }
    if (cities.find(c => c.id === city.id)) { toast.error('City already added'); return; }
    setCities([...cities, city]);
    setQuery('');
    setShowResults(false);
  }

  function removeCity(id: string) {
    setCities(cities.filter(c => c.id !== id));
  }

  function calculateBestTimes() {
    if (cities.length < 2) {
      toast.error('Add at least 2 cities');
      return;
    }

    const results: any[] = [];
    for (let hour = 0; hour < 24; hour++) {
      const utcDate = new Date(`${date}T${hour.toString().padStart(2, '0')}:00:00Z`);
      let score = 0;
      const times: Record<string, { time: string; hour: number }> = {};

      for (const city of cities) {
        const localTime = new Intl.DateTimeFormat('en-US', {
          timeZone: city.timezone.ianaName,
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }).format(utcDate);

        const localHour = parseInt(
          new Intl.DateTimeFormat('en-US', {
            timeZone: city.timezone.ianaName,
            hour: 'numeric',
            hour12: false,
          }).format(utcDate)
        );

        times[city.id] = { time: localTime, hour: localHour };

        if (localHour >= 9 && localHour < 17) {
          score += localHour >= 10 && localHour < 16 ? 3 : 2;
        } else if (localHour >= 7 && localHour < 9) {
          score += 1;
        } else if (localHour >= 17 && localHour <= 19) {
          score += 1;
        }
      }

      results.push({ utcHour: hour, score, times });
    }

    setBestTimes(
      results
        .filter(r => r.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)
    );
  }

  async function shareMeeting() {
    if (cities.length < 2 || bestTimes.length === 0) return;
    try {
      const res = await fetch('/api/public/meeting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cityIds: cities.map(c => c.id),
          baseCityId: cities[0].id,
          dateTimeISO: `${date}T${bestTimes[0].utcHour.toString().padStart(2, '0')}:00:00Z`,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const url = `${window.location.origin}/meeting/${data.slug}`;
        await navigator.clipboard.writeText(url);
        toast.success('Meeting link copied to clipboard!');
      }
    } catch {
      toast.error('Failed to create shareable link');
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Cities (2–8)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative" ref={ref}>
            <Input
              placeholder="Search for a city..."
              value={query}
              onChange={(e) => { setQuery(e.target.value); setShowResults(true); }}
              onFocus={() => setShowResults(true)}
            />
            {showResults && results.length > 0 && (
              <ul className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto">
                {results.map(c => (
                  <li
                    key={c.id}
                    className="px-3 py-2 hover:bg-accent cursor-pointer text-sm"
                    onClick={() => addCity(c)}
                  >
                    {c.name}, {c.countryName}
                    <span className="text-muted-foreground ml-2 text-xs">{c.timezone.ianaName}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {cities.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {cities.map(c => (
                <Badge key={c.id} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                  {c.name}
                  <button onClick={() => removeCity(c.id)} className="ml-1 hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Select Date & Find Best Times
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="flex-1"
            />
            <Button onClick={calculateBestTimes} disabled={cities.length < 2}>
              <Clock className="h-4 w-4 mr-2" />
              Find Best Times
            </Button>
          </div>
        </CardContent>
      </Card>

      {bestTimes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Best Meeting Times
              </span>
              <Button variant="outline" size="sm" onClick={shareMeeting}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 pr-4">Score</th>
                    <th className="text-left py-2 pr-4">UTC</th>
                    {cities.map(c => (
                      <th key={c.id} className="text-left py-2 pr-4 min-w-[100px]">{c.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bestTimes.map((bt, i) => (
                    <tr key={i} className={`border-b last:border-0 ${i === 0 ? 'bg-primary/5' : ''}`}>
                      <td className="py-2 pr-4">
                        <Badge variant={i === 0 ? 'default' : 'outline'}>{bt.score}</Badge>
                      </td>
                      <td className="py-2 pr-4 font-mono">
                        {bt.utcHour.toString().padStart(2, '0')}:00
                      </td>
                      {cities.map(c => {
                        const info = bt.times[c.id];
                        const isGood = info && info.hour >= 9 && info.hour < 17;
                        return (
                          <td key={c.id} className={`py-2 pr-4 ${isGood ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                            {info?.time || '—'}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
