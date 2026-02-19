'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Pencil, Trash2 } from 'lucide-react';

interface Tz {
  id: string;
  ianaName: string;
  abbreviation: string;
  utcOffsetMinutes: number;
  _count?: { cities: number };
}

export default function AdminTimezonesPage() {
  const [timezones, setTimezones] = useState<Tz[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ianaName: '', abbreviation: '', utcOffsetMinutes: '0' });
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/timezones?limit=999');
    if (res.ok) { const d = await res.json(); setTimezones(d.timezones || []); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  function resetForm() {
    setForm({ ianaName: '', abbreviation: '', utcOffsetMinutes: '0' });
    setEditId(null);
    setShowForm(false);
  }

  function editTz(tz: Tz) {
    setForm({ ianaName: tz.ianaName, abbreviation: tz.abbreviation, utcOffsetMinutes: String(tz.utcOffsetMinutes) });
    setEditId(tz.id);
    setShowForm(true);
  }

  async function saveTz(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const body = { ianaName: form.ianaName, abbreviation: form.abbreviation, utcOffsetMinutes: parseInt(form.utcOffsetMinutes) };
    const url = editId ? `/api/admin/timezones/${editId}` : '/api/admin/timezones';
    const method = editId ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    setSaving(false);
    if (res.ok) { resetForm(); fetchData(); } else { const d = await res.json(); alert(d.error || 'Failed'); }
  }

  async function deleteTz(id: string) {
    if (!confirm('Delete this timezone?')) return;
    await fetch(`/api/admin/timezones/${id}`, { method: 'DELETE' });
    fetchData();
  }

  function fmtOffset(m: number) {
    const s = m >= 0 ? '+' : '-'; const a = Math.abs(m);
    return `UTC${s}${Math.floor(a / 60).toString().padStart(2, '0')}:${(a % 60).toString().padStart(2, '0')}`;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Timezones</h1>
        <Button size="sm" onClick={() => { resetForm(); setShowForm(true); }}><Plus className="h-4 w-4 mr-1" /> Add</Button>
      </div>

      {showForm && (
        <Card className="mb-6"><CardContent className="pt-6">
          <form onSubmit={saveTz} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><Label>IANA Name</Label><Input value={form.ianaName} onChange={e => setForm({ ...form, ianaName: e.target.value })} required placeholder="America/New_York" /></div>
            <div><Label>Abbreviation</Label><Input value={form.abbreviation} onChange={e => setForm({ ...form, abbreviation: e.target.value })} required placeholder="EST" /></div>
            <div><Label>UTC Offset (minutes)</Label><Input type="number" value={form.utcOffsetMinutes} onChange={e => setForm({ ...form, utcOffsetMinutes: e.target.value })} required /></div>
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
              <th className="text-left py-2 px-3">IANA Name</th>
              <th className="text-left py-2 px-3">Abbreviation</th>
              <th className="text-left py-2 px-3">Offset</th>
              <th className="text-right py-2 px-3">Cities</th>
              <th className="text-right py-2 px-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {timezones.map(tz => (
              <tr key={tz.id} className="border-t hover:bg-accent/30">
                <td className="py-2 px-3 font-mono text-xs">{tz.ianaName}</td>
                <td className="py-2 px-3">{tz.abbreviation}</td>
                <td className="py-2 px-3">{fmtOffset(tz.utcOffsetMinutes)}</td>
                <td className="py-2 px-3 text-right">{tz._count?.cities ?? '-'}</td>
                <td className="py-2 px-3 text-right">
                  <div className="flex gap-1 justify-end">
                    <button onClick={() => editTz(tz)} className="p-1 rounded hover:bg-accent"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => deleteTz(tz.id)} className="p-1 rounded hover:bg-accent text-red-500"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
