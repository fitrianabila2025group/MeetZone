'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  pairSlug: string | null;
  sortOrder: number;
  isPublished: boolean;
}

export default function AdminFaqsPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ question: '', answer: '', pairSlug: '', sortOrder: '0', isPublished: true });
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<'all' | 'global' | 'pair'>('all');

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/faqs');
    if (res.ok) { const d = await res.json(); setFaqs(d.faqs || []); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  function resetForm() {
    setForm({ question: '', answer: '', pairSlug: '', sortOrder: '0', isPublished: true });
    setEditId(null);
    setShowForm(false);
  }

  function editFaq(f: FAQ) {
    setForm({
      question: f.question,
      answer: f.answer,
      pairSlug: f.pairSlug || '',
      sortOrder: String(f.sortOrder),
      isPublished: f.isPublished,
    });
    setEditId(f.id);
    setShowForm(true);
  }

  async function saveFaq(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const body = {
      question: form.question,
      answer: form.answer,
      pairSlug: form.pairSlug || null,
      sortOrder: parseInt(form.sortOrder),
      isPublished: form.isPublished,
    };
    const url = editId ? `/api/admin/faqs/${editId}` : '/api/admin/faqs';
    const method = editId ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    setSaving(false);
    if (res.ok) { resetForm(); fetchData(); } else { const d = await res.json(); alert(d.error || 'Failed'); }
  }

  async function deleteFaq(id: string) {
    if (!confirm('Delete this FAQ?')) return;
    await fetch(`/api/admin/faqs/${id}`, { method: 'DELETE' });
    fetchData();
  }

  async function reorder(id: string, delta: number) {
    const f = faqs.find(x => x.id === id);
    if (!f) return;
    await fetch(`/api/admin/faqs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sortOrder: f.sortOrder + delta }),
    });
    fetchData();
  }

  const filtered = faqs.filter(f => {
    if (filter === 'global') return !f.pairSlug;
    if (filter === 'pair') return !!f.pairSlug;
    return true;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">FAQs</h1>
        <Button size="sm" onClick={() => { resetForm(); setShowForm(true); }}><Plus className="h-4 w-4 mr-1" /> Add</Button>
      </div>

      {showForm && (
        <Card className="mb-6"><CardContent className="pt-6">
          <form onSubmit={saveFaq} className="space-y-4">
            <div><Label>Question</Label><Input value={form.question} onChange={e => setForm({ ...form, question: e.target.value })} required /></div>
            <div><Label>Answer</Label><Textarea value={form.answer} onChange={e => setForm({ ...form, answer: e.target.value })} required rows={3} /></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><Label>Pair Slug (empty = global)</Label><Input value={form.pairSlug} onChange={e => setForm({ ...form, pairSlug: e.target.value })} placeholder="new-york-to-london" /></div>
              <div><Label>Sort Order</Label><Input type="number" value={form.sortOrder} onChange={e => setForm({ ...form, sortOrder: e.target.value })} /></div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.isPublished} onChange={e => setForm({ ...form, isPublished: e.target.checked })} />
                  Published
                </label>
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={saving}>{saving ? 'Saving...' : editId ? 'Update' : 'Create'}</Button>
              <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
            </div>
          </form>
        </CardContent></Card>
      )}

      <div className="flex gap-2 mb-4">
        {(['all', 'global', 'pair'] as const).map(f => (
          <Button key={f} variant={filter === f ? 'default' : 'outline'} size="sm" onClick={() => setFilter(f)}>
            {f === 'all' ? 'All' : f === 'global' ? 'Global' : 'Pair-scoped'}
          </Button>
        ))}
        <span className="text-sm text-muted-foreground self-center ml-2">{filtered.length} FAQs</span>
      </div>

      <div className="space-y-2">
        {filtered.map(f => (
          <Card key={f.id}>
            <CardContent className="py-3 flex items-start gap-3">
              <div className="flex flex-col gap-1">
                <button onClick={() => reorder(f.id, 1)} className="p-0.5 rounded hover:bg-accent"><ArrowUp className="h-3 w-3" /></button>
                <button onClick={() => reorder(f.id, -1)} className="p-0.5 rounded hover:bg-accent"><ArrowDown className="h-3 w-3" /></button>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-sm">{f.question}</p>
                  {!f.isPublished && <Badge variant="secondary">Draft</Badge>}
                  {f.pairSlug && <Badge variant="outline" className="text-xs">{f.pairSlug}</Badge>}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{f.answer}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => editFaq(f)} className="p-1 rounded hover:bg-accent"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => deleteFaq(f.id)} className="p-1 rounded hover:bg-accent text-red-500"><Trash2 className="h-4 w-4" /></button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
