'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

interface Pair {
  id: string;
  fromCity: { id: string; name: string; slug: string };
  toCity: { id: string; name: string; slug: string };
  slug: string;
  priority: number;
}

interface City {
  id: string;
  name: string;
  slug: string;
  countryName: string;
}

export default function AdminPopularPairsPage() {
  const [pairs, setPairs] = useState<Pair[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ fromCityId: '', toCityId: '', priority: '0' });
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/popular-pairs');
    if (res.ok) { const d = await res.json(); setPairs(d.pairs || []); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => {
    fetch('/api/admin/cities?limit=999').then(r => r.json()).then(d => setCities(d.cities || []));
  }, []);

  function resetForm() {
    setForm({ fromCityId: '', toCityId: '', priority: '0' });
    setEditId(null);
    setShowForm(false);
  }

  async function savePair(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const body = { fromCityId: form.fromCityId, toCityId: form.toCityId, priority: parseInt(form.priority) };
    const url = editId ? `/api/admin/popular-pairs/${editId}` : '/api/admin/popular-pairs';
    const method = editId ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    setSaving(false);
    if (res.ok) { resetForm(); fetchData(); } else { const d = await res.json(); alert(d.error || 'Failed'); }
  }

  async function deletePair(id: string) {
    if (!confirm('Delete this pair?')) return;
    await fetch(`/api/admin/popular-pairs/${id}`, { method: 'DELETE' });
    fetchData();
  }

  async function updatePriority(id: string, delta: number) {
    const pair = pairs.find(p => p.id === id);
    if (!pair) return;
    await fetch(`/api/admin/popular-pairs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priority: pair.priority + delta }),
    });
    fetchData();
  }

  async function bulkGenerate() {
    if (!confirm('Generate pairs for all top cities? This may take a moment.')) return;
    setSaving(true);
    await fetch('/api/admin/popular-pairs/generate', { method: 'POST' });
    setSaving(false);
    fetchData();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Popular Pairs</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={bulkGenerate} disabled={saving}>Bulk Generate</Button>
          <Button size="sm" onClick={() => { resetForm(); setShowForm(true); }}><Plus className="h-4 w-4 mr-1" /> Add</Button>
        </div>
      </div>

      {showForm && (
        <Card className="mb-6"><CardContent className="pt-6">
          <form onSubmit={savePair} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>From City</Label>
              <select className="w-full h-10 px-3 rounded-md border bg-background text-sm" value={form.fromCityId} onChange={e => setForm({ ...form, fromCityId: e.target.value })} required>
                <option value="">Select...</option>
                {cities.map(c => <option key={c.id} value={c.id}>{c.name} ({c.countryName})</option>)}
              </select>
            </div>
            <div>
              <Label>To City</Label>
              <select className="w-full h-10 px-3 rounded-md border bg-background text-sm" value={form.toCityId} onChange={e => setForm({ ...form, toCityId: e.target.value })} required>
                <option value="">Select...</option>
                {cities.map(c => <option key={c.id} value={c.id}>{c.name} ({c.countryName})</option>)}
              </select>
            </div>
            <div><Label>Priority</Label><Input type="number" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} /></div>
            <div className="md:col-span-3 flex gap-2">
              <Button type="submit" disabled={saving}>{saving ? 'Saving...' : editId ? 'Update' : 'Create'}</Button>
              <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
            </div>
          </form>
        </CardContent></Card>
      )}

      <div className="border rounded-md overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-accent/50">
            <tr>
              <th className="text-left py-2 px-3">From</th>
              <th className="text-left py-2 px-3">To</th>
              <th className="text-left py-2 px-3 hidden md:table-cell">Slug</th>
              <th className="text-center py-2 px-3">Priority</th>
              <th className="text-right py-2 px-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pairs.map(pair => (
              <tr key={pair.id} className="border-t hover:bg-accent/30">
                <td className="py-2 px-3">{pair.fromCity.name}</td>
                <td className="py-2 px-3">{pair.toCity.name}</td>
                <td className="py-2 px-3 font-mono text-xs hidden md:table-cell">{pair.slug}</td>
                <td className="py-2 px-3 text-center">{pair.priority}</td>
                <td className="py-2 px-3 text-right">
                  <div className="flex gap-1 justify-end">
                    <button onClick={() => updatePriority(pair.id, 1)} className="p-1 rounded hover:bg-accent"><ArrowUp className="h-4 w-4" /></button>
                    <button onClick={() => updatePriority(pair.id, -1)} className="p-1 rounded hover:bg-accent"><ArrowDown className="h-4 w-4" /></button>
                    <button onClick={() => deletePair(pair.id)} className="p-1 rounded hover:bg-accent text-red-500"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-muted-foreground mt-2">{pairs.length} pairs</p>
    </div>
  );
}
