'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Pencil, Trash2 } from 'lucide-react';

interface LinkBlock {
  id: string;
  blockKey: string;
  title: string;
  linksJson: string;
  isActive: boolean;
}

export default function AdminInternalLinksPage() {
  const [blocks, setBlocks] = useState<LinkBlock[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ blockKey: '', title: '', linksJson: '[]', isActive: true });
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    const res = await fetch('/api/admin/internal-links');
    if (res.ok) { const d = await res.json(); setBlocks(d.blocks || []); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  function resetForm() {
    setForm({ blockKey: '', title: '', linksJson: '[]', isActive: true });
    setEditId(null);
    setShowForm(false);
  }

  function editBlock(b: LinkBlock) {
    setForm({ blockKey: b.blockKey, title: b.title, linksJson: b.linksJson, isActive: b.isActive });
    setEditId(b.id);
    setShowForm(true);
  }

  async function saveBlock(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try { JSON.parse(form.linksJson); } catch { alert('Invalid JSON'); setSaving(false); return; }
    const body = { blockKey: form.blockKey, title: form.title, linksJson: form.linksJson, isActive: form.isActive };
    const url = editId ? `/api/admin/internal-links/${editId}` : '/api/admin/internal-links';
    const method = editId ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    setSaving(false);
    if (res.ok) { resetForm(); fetchData(); } else { const d = await res.json(); alert(d.error || 'Failed'); }
  }

  async function deleteBlock(id: string) {
    if (!confirm('Delete this link block?')) return;
    await fetch(`/api/admin/internal-links/${id}`, { method: 'DELETE' });
    fetchData();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Internal Link Blocks</h1>
        <Button size="sm" onClick={() => { resetForm(); setShowForm(true); }}><Plus className="h-4 w-4 mr-1" /> Add</Button>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Define reusable link blocks that appear on converter pages. Links JSON format: {`[{"label":"...", "href":"..."}]`}
      </p>

      {showForm && (
        <Card className="mb-6"><CardContent className="pt-6">
          <form onSubmit={saveBlock} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label>Block Key</Label><Input value={form.blockKey} onChange={e => setForm({ ...form, blockKey: e.target.value })} required placeholder="popular-conversions" /></div>
              <div><Label>Title</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required /></div>
            </div>
            <div>
              <Label>Links JSON</Label>
              <Textarea value={form.linksJson} onChange={e => setForm({ ...form, linksJson: e.target.value })} rows={6} className="font-mono text-xs" />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} /> Active
            </label>
            <div className="flex gap-2">
              <Button type="submit" disabled={saving}>{saving ? 'Saving...' : editId ? 'Update' : 'Create'}</Button>
              <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
            </div>
          </form>
        </CardContent></Card>
      )}

      <div className="space-y-3">
        {blocks.map(b => (
          <Card key={b.id}>
            <CardContent className="py-4 flex items-center justify-between">
              <div>
                <p className="font-semibold">{b.title}</p>
                <p className="text-xs text-muted-foreground font-mono">{b.blockKey} · {b.isActive ? 'Active' : 'Inactive'}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => editBlock(b)} className="p-1 rounded hover:bg-accent"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => deleteBlock(b.id)} className="p-1 rounded hover:bg-accent text-red-500"><Trash2 className="h-4 w-4" /></button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
