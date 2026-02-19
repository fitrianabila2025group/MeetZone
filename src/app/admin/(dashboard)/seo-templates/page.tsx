'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Pencil, Save } from 'lucide-react';

interface Template {
  id: string;
  scope: string;
  titleTpl: string;
  metaTpl: string;
  introTpl: string;
  faqTplJson: string;
}

export default function AdminSeoTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ titleTpl: '', metaTpl: '', introTpl: '', faqTplJson: '[]' });
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState<Record<string, string>>({});

  const fetchData = useCallback(async () => {
    const res = await fetch('/api/admin/seo-templates');
    if (res.ok) { const d = await res.json(); setTemplates(d.templates || []); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  function editTemplate(t: Template) {
    setForm({
      titleTpl: t.titleTpl,
      metaTpl: t.metaTpl,
      introTpl: t.introTpl,
      faqTplJson: t.faqTplJson || '[]',
    });
    setEditId(t.id);
    // Generate preview with sample values
    const sampleVars: Record<string, string> = {
      '{fromCity}': 'New York',
      '{toCity}': 'London',
      '{fromCountry}': 'United States',
      '{toCountry}': 'United Kingdom',
      '{fromZone}': 'America/New_York',
      '{toZone}': 'Europe/London',
    };
    const result: Record<string, string> = {};
    for (const [key, val] of Object.entries(form)) {
      let s = val;
      for (const [k, v] of Object.entries(sampleVars)) {
        s = s.replaceAll(k, v);
      }
      result[key] = s;
    }
    setPreview(result);
  }

  async function saveTemplate(e: React.FormEvent) {
    e.preventDefault();
    if (!editId) return;
    setSaving(true);
    const res = await fetch(`/api/admin/seo-templates/${editId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) { setEditId(null); fetchData(); } else { const d = await res.json(); alert(d.error || 'Failed'); }
  }

  // Live preview
  useEffect(() => {
    const sampleVars: Record<string, string> = {
      '{fromCity}': 'New York', '{toCity}': 'London',
      '{fromCountry}': 'United States', '{toCountry}': 'United Kingdom',
      '{fromZone}': 'America/New_York', '{toZone}': 'Europe/London',
    };
    const result: Record<string, string> = {};
    for (const [key, val] of Object.entries(form)) {
      let s = val;
      for (const [k, v] of Object.entries(sampleVars)) s = s.replaceAll(k, v);
      result[key] = s;
    }
    setPreview(result);
  }, [form]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">SEO Templates</h1>
      <p className="text-sm text-muted-foreground mb-4">
        Variables: {'{fromCity}, {toCity}, {fromCountry}, {toCountry}, {fromZone}, {toZone}'}
      </p>

      {editId && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <form onSubmit={saveTemplate} className="space-y-4">
              <div>
                <Label>Title Template</Label>
                <Input value={form.titleTpl} onChange={e => setForm({ ...form, titleTpl: e.target.value })} />
                {preview.titleTpl && <p className="text-xs text-muted-foreground mt-1">Preview: {preview.titleTpl}</p>}
              </div>
              <div>
                <Label>Meta Description Template</Label>
                <Textarea value={form.metaTpl} onChange={e => setForm({ ...form, metaTpl: e.target.value })} />
                {preview.metaTpl && <p className="text-xs text-muted-foreground mt-1">Preview: {preview.metaTpl}</p>}
              </div>
              <div>
                <Label>Intro Template</Label>
                <Textarea value={form.introTpl} onChange={e => setForm({ ...form, introTpl: e.target.value })} rows={4} />
                {preview.introTpl && <p className="text-xs text-muted-foreground mt-1">Preview: {preview.introTpl}</p>}
              </div>
              <div>
                <Label>FAQ Template JSON</Label>
                <Textarea value={form.faqTplJson} onChange={e => setForm({ ...form, faqTplJson: e.target.value })} rows={3} />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={saving}><Save className="h-4 w-4 mr-1" /> {saving ? 'Saving...' : 'Save'}</Button>
                <Button type="button" variant="outline" onClick={() => setEditId(null)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {templates.map(t => (
          <Card key={t.id} className={editId === t.id ? 'ring-2 ring-primary' : ''}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold font-mono text-sm capitalize">{t.scope}</h3>
                <button onClick={() => editTemplate(t)} className="p-1 rounded hover:bg-accent">
                  <Pencil className="h-4 w-4" />
                </button>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <p><strong>Title:</strong> {t.titleTpl}</p>
                <p><strong>Desc:</strong> {(t.metaTpl || '').slice(0, 100)}{t.metaTpl && t.metaTpl.length > 100 ? '...' : ''}</p>
                <p><strong>Intro:</strong> {(t.introTpl || '').slice(0, 80)}{t.introTpl && t.introTpl.length > 80 ? '...' : ''}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
