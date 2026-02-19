import { prisma } from '@/lib/prisma';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Globe, Link2, FileText, MessageSquare, Users } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const [cities, timezones, pairs, faqs, blogs, users, meetings] = await Promise.all([
    prisma.city.count(),
    prisma.timezone.count(),
    prisma.popularPair.count(),
    prisma.fAQ.count(),
    prisma.blogPost.count(),
    prisma.user.count(),
    prisma.meetingShare.count(),
  ]);

  const stats = [
    { label: 'Cities', value: cities, icon: MapPin },
    { label: 'Timezones', value: timezones, icon: Globe },
    { label: 'Popular Pairs', value: pairs, icon: Link2 },
    { label: 'FAQs', value: faqs, icon: MessageSquare },
    { label: 'Blog Posts', value: blogs, icon: FileText },
    { label: 'Users', value: users, icon: Users },
    { label: 'Shared Meetings', value: meetings, icon: Link2 },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {stats.map(stat => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
