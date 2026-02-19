import { Metadata } from 'next';
import { WorldClockClient } from '@/components/world-clock-client';

export const metadata: Metadata = {
  title: 'World Clock – Current Time in Major Cities | TimeWise',
  description: 'See the current time in cities around the world. Add up to 12 cities to your personal world clock dashboard.',
  alternates: { canonical: '/world-clock' },
};

export default function WorldClockPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">World Clock</h1>
        <p className="text-muted-foreground mb-8">
          Track the current time in cities around the world. Add up to 12 cities to your personal clock dashboard.
        </p>
        <WorldClockClient />
      </div>
    </main>
  );
}
