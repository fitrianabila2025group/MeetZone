'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Save } from 'lucide-react';

interface SiteSettings {
  [key: string]: string;
}

const settingFields = [
  { key: 'siteName', label: 'Site Name', placeholder: 'TimeWise' },
  { key: 'siteUrl', label: 'Site URL', placeholder: 'https://timewise.online' },
  { key: 'siteDescription', label: 'Site Description', placeholder: 'Time Zone & Meeting Planner Hub' },
  { key: 'twitterHandle', label: 'Twitter Handle', placeholder: '@timewise' },
  { key: 'facebookUrl', label: 'Facebook URL', placeholder: 'https://facebook.com/timewise' },
  { key: 'linkedinUrl', label: 'LinkedIn URL', placeholder: '' },
  { key: 'ga4Id', label: 'Google Analytics 4 ID', placeholder: 'G-XXXXXXXXXX' },
  { key: 'gscVerification', label: 'Google Search Console Verification', placeholder: '' },
  { key: 'bingVerification', label: 'Bing Webmaster Verification', placeholder: '' },
];

export default function AdminSiteSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const fetchData = useCallback(async () => {
    const res = await fetch('/api/admin/site-settings');
    if (res.ok) {
      const d = await res.json();
      setSettings(d.settings || {});
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    const res = await fetch('/api/admin/site-settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settings }),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      alert('Failed to save');
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Site Settings</h1>

      <form onSubmit={saveSettings}>
        <Card>
          <CardContent className="pt-6 space-y-4">
            {settingFields.map(field => (
              <div key={field.key}>
                <Label>{field.label}</Label>
                <Input
                  value={settings[field.key] || ''}
                  onChange={e => setSettings({ ...settings, [field.key]: e.target.value })}
                  placeholder={field.placeholder}
                />
              </div>
            ))}
            <div className="flex items-center gap-4 pt-4">
              <Button type="submit" disabled={saving}>
                <Save className="h-4 w-4 mr-1" /> {saving ? 'Saving...' : 'Save Settings'}
              </Button>
              {saved && <span className="text-sm text-green-600">Settings saved!</span>}
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
