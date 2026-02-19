'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Save } from 'lucide-react';

interface AdsSettings {
  id: string;
  provider: string;
  isEnabled: boolean;
  adsensePublisherId: string | null;
  adsenseVerificationMeta: string | null;
  adsTxtContent: string | null;
  headerSlotId: string | null;
  sidebarSlotId: string | null;
  inContentSlotId: string | null;
  footerSlotId: string | null;
  customHeadHtml: string | null;
  customBodyHtml: string | null;
}

const providers = [
  { value: 'adsense', label: 'Google AdSense' },
  { value: 'adsterra', label: 'Adsterra' },
  { value: 'monetag', label: 'Monetag' },
  { value: 'hilltopads', label: 'HilltopAds' },
  { value: 'custom', label: 'Custom' },
];

export default function AdminAdsPage() {
  const [settings, setSettings] = useState<AdsSettings | null>(null);
  const [form, setForm] = useState<Partial<AdsSettings>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const fetchData = useCallback(async () => {
    const res = await fetch('/api/admin/ads');
    if (res.ok) {
      const d = await res.json();
      setSettings(d.settings);
      setForm(d.settings || {});
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    const res = await fetch('/api/admin/ads', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      fetchData();
    } else {
      const d = await res.json();
      alert(d.error || 'Failed to save');
    }
  }

  if (!settings) return <p>Loading...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Ads Manager</h1>

      <form onSubmit={saveSettings} className="space-y-6">
        {/* Provider Selection */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <h2 className="font-semibold">Ad Provider</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Provider</Label>
                <select
                  className="w-full h-10 px-3 rounded-md border bg-background text-sm"
                  value={form.provider || 'adsense'}
                  onChange={e => setForm({ ...form, provider: e.target.value })}
                >
                  {providers.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.isEnabled ?? false}
                    onChange={e => setForm({ ...form, isEnabled: e.target.checked })}
                  />
                  Enable ads globally
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AdSense Settings */}
        {form.provider === 'adsense' && (
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h2 className="font-semibold">Google AdSense</h2>
              <div>
                <Label>Publisher ID</Label>
                <Input
                  value={form.adsensePublisherId || ''}
                  onChange={e => setForm({ ...form, adsensePublisherId: e.target.value })}
                  placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                />
              </div>
              <div>
                <Label>Verification Meta Tag</Label>
                <Input
                  value={form.adsenseVerificationMeta || ''}
                  onChange={e => setForm({ ...form, adsenseVerificationMeta: e.target.value })}
                  placeholder='<meta name="google-adsense-account" content="ca-pub-...">'
                />
                <p className="text-xs text-muted-foreground mt-1">The full meta tag for site verification</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Ad Slot IDs */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <h2 className="font-semibold">Ad Slot Configuration</h2>
            <p className="text-sm text-muted-foreground">Enter slot IDs for each ad position. Leave empty to disable that position.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Header Slot</Label>
                <Input value={form.headerSlotId || ''} onChange={e => setForm({ ...form, headerSlotId: e.target.value })} placeholder="1234567890" />
              </div>
              <div>
                <Label>Sidebar Slot</Label>
                <Input value={form.sidebarSlotId || ''} onChange={e => setForm({ ...form, sidebarSlotId: e.target.value })} placeholder="1234567890" />
              </div>
              <div>
                <Label>In-Content Slot</Label>
                <Input value={form.inContentSlotId || ''} onChange={e => setForm({ ...form, inContentSlotId: e.target.value })} placeholder="1234567890" />
              </div>
              <div>
                <Label>Footer Slot</Label>
                <Input value={form.footerSlotId || ''} onChange={e => setForm({ ...form, footerSlotId: e.target.value })} placeholder="1234567890" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ads.txt */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <h2 className="font-semibold">ads.txt</h2>
            <p className="text-sm text-muted-foreground">
              Content served at /ads.txt for ad network verification
            </p>
            <Textarea
              value={form.adsTxtContent || ''}
              onChange={e => setForm({ ...form, adsTxtContent: e.target.value })}
              rows={6}
              className="font-mono text-xs"
              placeholder="google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0"
            />
          </CardContent>
        </Card>

        {/* Custom HTML */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <h2 className="font-semibold">Custom HTML Injection</h2>
            <div>
              <Label>Custom Head HTML</Label>
              <Textarea
                value={form.customHeadHtml || ''}
                onChange={e => setForm({ ...form, customHeadHtml: e.target.value })}
                rows={4}
                className="font-mono text-xs"
                placeholder="<script>...</script>"
              />
              <p className="text-xs text-muted-foreground mt-1">Injected before {'</head>'}</p>
            </div>
            <div>
              <Label>Custom Body HTML</Label>
              <Textarea
                value={form.customBodyHtml || ''}
                onChange={e => setForm({ ...form, customBodyHtml: e.target.value })}
                rows={4}
                className="font-mono text-xs"
                placeholder="<script>...</script>"
              />
              <p className="text-xs text-muted-foreground mt-1">Injected before {'</body>'}</p>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-4">
          <Button type="submit" disabled={saving}>
            <Save className="h-4 w-4 mr-1" /> {saving ? 'Saving...' : 'Save All Settings'}
          </Button>
          {saved && <span className="text-sm text-green-600">Settings saved!</span>}
        </div>
      </form>
    </div>
  );
}
