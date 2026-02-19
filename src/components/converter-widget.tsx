'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeftRight, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface ConverterWidgetProps {
  fromCity: { name: string; slug: string; timezone: { ianaName: string } };
  toCity: { name: string; slug: string; timezone: { ianaName: string } };
}

export function ConverterWidget({ fromCity, toCity }: ConverterWidgetProps) {
  const [dateTime, setDateTime] = useState('');
  const [fromTime, setFromTime] = useState('');
  const [toTime, setToTime] = useState('');
  const [use24h, setUse24h] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    updateTimes();
    const interval = setInterval(updateTimes, 1000);
    return () => clearInterval(interval);
  }, []);

  function updateTimes() {
    const now = new Date();
    const fmtOptions: Intl.DateTimeFormatOptions = {
      timeZone: fromCity.timezone.ianaName,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: !use24h,
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    };
    const toOptions: Intl.DateTimeFormatOptions = {
      ...fmtOptions,
      timeZone: toCity.timezone.ianaName,
    };

    setFromTime(new Intl.DateTimeFormat('en-US', fmtOptions).format(now));
    setToTime(new Intl.DateTimeFormat('en-US', toOptions).format(now));
  }

  useEffect(() => {
    updateTimes();
  }, [use24h]);

  function handleCustomConvert() {
    if (!dateTime) return;
    const inputDate = new Date(dateTime);
    if (isNaN(inputDate.getTime())) return;

    const fmtOptions: Intl.DateTimeFormatOptions = {
      timeZone: fromCity.timezone.ianaName,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: !use24h,
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    };

    // The input is in the fromCity's timezone, convert to toCity
    // Create a date at the given local time in fromCity
    const localeStr = inputDate.toLocaleString('en-US', { timeZone: fromCity.timezone.ianaName });
    const fromLocale = inputDate.toLocaleString('en-US', { timeZone: toCity.timezone.ianaName });

    setFromTime(new Intl.DateTimeFormat('en-US', fmtOptions).format(inputDate));
    setToTime(new Intl.DateTimeFormat('en-US', { ...fmtOptions, timeZone: toCity.timezone.ianaName }).format(inputDate));
  }

  async function handleCopy() {
    const text = `${fromCity.name}: ${fromTime}\n${toCity.name}: ${toTime}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <ArrowLeftRight className="h-5 w-5" />
          Quick Convert
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-primary/5 border">
            <p className="text-sm text-muted-foreground mb-1">{fromCity.name}</p>
            <p className="text-2xl font-bold break-words">{fromTime || '—'}</p>
            <p className="text-xs text-muted-foreground mt-1">{fromCity.timezone.ianaName}</p>
          </div>
          <div className="p-4 rounded-lg bg-primary/5 border">
            <p className="text-sm text-muted-foreground mb-1">{toCity.name}</p>
            <p className="text-2xl font-bold break-words">{toTime || '—'}</p>
            <p className="text-xs text-muted-foreground mt-1">{toCity.timezone.ianaName}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 items-end">
          <div className="flex-1 w-full">
            <label className="text-sm font-medium mb-1 block">Custom Date/Time</label>
            <Input
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
            />
          </div>
          <Button onClick={handleCustomConvert} variant="outline" className="w-full sm:w-auto">
            Convert
          </Button>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => setUse24h(!use24h)}>
            {use24h ? '12h' : '24h'} Format
          </Button>
          <Button variant="outline" size="sm" onClick={() => { setDateTime(''); updateTimes(); }}>
            Now
          </Button>
          <Button variant="outline" size="sm" onClick={handleCopy}>
            {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
            Copy
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
