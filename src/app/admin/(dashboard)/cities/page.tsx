'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Pencil, Trash2, Upload, Search, ChevronLeft, ChevronRight } from 'lucide-react';

interface City {
  id: string;
  name: string;
  slug: string;
  countryCode: string;
  countryName: string;
  lat: number;
  lng: number;
  population: number;
  isActive: boolean;
  timezone: { id: string; ianaName: string };
}

interface Timezone {
  id: string;
  ianaName: string;
}

export default function AdminCitiesPage() {
  const [cities, setCities] = useState<City[]>([]);
  const [timezones, setTimezones] = useState<Timezone[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showCsv, setShowCsv] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '', slug: '', countryCode: '', countryName: '',
    lat: '0', lng: '0', population: '0', timezoneId: '', isActive: true,
  });
  const [csvText, setCsvText] = useState('');
  const [csvDryRun, setCsvDryRun] = useState(true);
  const [csvResult, setCsvResult] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const perPage = 25;

  const fetchCities = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(perPage) });
    if (search) params.set('search', search);
    const res = await fetch(`/api/admin/cities?${params}`);
    if (res.ok) {
      const data = await res.json();
      setCities(data.cities);
      setTotal(data.total);
    }
    setLoading(false);
  }, [page, search]);

  useEffect(() => { fetchCities(); }, [fetchCities]);

  useEffect(() => {
    fetch('/api/admin/timezones?limit=999').then(r => r.json()).then(d => setTimezones(d.timezones || []));
  }, []);

  function resetForm() {
    setForm({ name: '', slug: '', countryCode: '', countryName: '', lat: '0', lng: '0', population: '0', timezoneId: '', isActive: true });
    setEditId(null);
    setShowForm(false);
  }

  function editCity(city: City) {
    setForm({
      name: city.name,
      slug: city.slug,
      countryCode: city.countryCode,
      countryName: city.countryName,
      lat: String(city.lat),
      lng: String(city.lng),
      population: String(city.population),
      timezoneId: city.timezone.id,
      isActive: city.isActive,
    });
    setEditId(city.id);
    setShowForm(true);
  }

  async function saveCity(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const body = {
      name: form.name,
      slug: form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      countryCode: form.countryCode,
      countryName: form.countryName,
      lat: parseFloat(form.lat),
      lng: parseFloat(form.lng),
      population: parseInt(form.population),
      timezoneId: form.timezoneId,
      isActive: form.isActive,
    };
    const url = editId ? `/api/admin/cities/${editId}` : '/api/admin/cities';
    const method = editId ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    setSaving(false);
    if (res.ok) {
      resetForm();
      fetchCities();
    } else {
      const data = await res.json();
      alert(data.error || 'Failed to save');
    }
  }

  async function deleteCity(id: string) {
    if (!confirm('Delete this city?')) return;
    await fetch(`/api/admin/cities/${id}`, { method: 'DELETE' });
    fetchCities();
  }

  async function handleCsvImport() {
    setSaving(true);
    setCsvResult(null);
    const res = await fetch('/api/admin/cities/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ csv: csvText, dryRun: csvDryRun }),
    });
    const data = await res.json();
    setCsvResult(data);
    setSaving(false);
    if (!csvDryRun && res.ok) {
      fetchCities();
    }
  }

  const totalPages = Math.ceil(total / perPage);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Cities</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { setShowCsv(!showCsv); setShowForm(false); }}>
            <Upload className="h-4 w-4 mr-1" /> CSV Import
          </Button>
          <Button size="sm" onClick={() => { setShowForm(!showForm); setShowCsv(false); resetForm(); setShowForm(true); }}>
            <Plus className="h-4 w-4 mr-1" /> Add City
          </Button>
        </div>
      </div>

      {/* CSV Import */}
      {showCsv && (
        <Card className="mb-6">
          <CardContent className="pt-6 space-y-4">
            <h2 className="font-semibold">CSV Import</h2>
            <p className="text-sm text-muted-foreground">
              Format: name,slug,countryCode,countryName,lat,lng,population,ianaTimezone (one per line)
            </p>
            <textarea
              className="w-full h-40 p-3 text-sm font-mono border rounded-md bg-background"
              value={csvText}
              onChange={e => setCsvText(e.target.value)}
              placeholder="Tokyo,tokyo,JP,Japan,35.6762,139.6503,13960000,Asia/Tokyo"
            />
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={csvDryRun} onChange={e => setCsvDryRun(e.target.checked)} />
                Dry run (preview only)
              </label>
              <Button onClick={handleCsvImport} disabled={saving || !csvText.trim()}>
                {saving ? 'Processing...' : csvDryRun ? 'Preview Import' : 'Import Now'}
              </Button>
            </div>
            {csvResult && (
              <div className="text-sm p-3 border rounded-md bg-accent/30">
                <p>Created: {csvResult.created ?? 0} | Updated: {csvResult.updated ?? 0} | Skipped: {csvResult.skipped ?? 0} | Errors: {csvResult.errors?.length ?? 0}</p>
                {csvResult.errors?.map((err: string, i: number) => (
                  <p key={i} className="text-red-500">{err}</p>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <h2 className="font-semibold mb-4">{editId ? 'Edit City' : 'Add City'}</h2>
            <form onSubmit={saveCity} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div><Label>Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
              <div><Label>Slug</Label><Input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated" /></div>
              <div><Label>Country Code</Label><Input value={form.countryCode} onChange={e => setForm({ ...form, countryCode: e.target.value })} required maxLength={2} /></div>
              <div><Label>Country Name</Label><Input value={form.countryName} onChange={e => setForm({ ...form, countryName: e.target.value })} required /></div>
              <div><Label>Latitude</Label><Input type="number" step="any" value={form.lat} onChange={e => setForm({ ...form, lat: e.target.value })} required /></div>
              <div><Label>Longitude</Label><Input type="number" step="any" value={form.lng} onChange={e => setForm({ ...form, lng: e.target.value })} required /></div>
              <div><Label>Population</Label><Input type="number" value={form.population} onChange={e => setForm({ ...form, population: e.target.value })} /></div>
              <div>
                <Label>Timezone</Label>
                <select
                  className="w-full h-10 px-3 rounded-md border bg-background text-sm"
                  value={form.timezoneId}
                  onChange={e => setForm({ ...form, timezoneId: e.target.value })}
                  required
                >
                  <option value="">Select timezone</option>
                  {timezones.map(tz => (
                    <option key={tz.id} value={tz.id}>{tz.ianaName}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} />
                  Active
                </label>
              </div>
              <div className="md:col-span-2 lg:col-span-3 flex gap-2">
                <Button type="submit" disabled={saving}>{saving ? 'Saving...' : editId ? 'Update' : 'Create'}</Button>
                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search cities..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <span className="text-sm text-muted-foreground self-center">{total} total</span>
      </div>

      {/* Table */}
      <div className="border rounded-md overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-accent/50">
            <tr>
              <th className="text-left py-2 px-3">Name</th>
              <th className="text-left py-2 px-3 hidden md:table-cell">Slug</th>
              <th className="text-left py-2 px-3">Country</th>
              <th className="text-left py-2 px-3 hidden lg:table-cell">Timezone</th>
              <th className="text-left py-2 px-3 hidden lg:table-cell">Population</th>
              <th className="text-center py-2 px-3">Status</th>
              <th className="text-right py-2 px-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {cities.map(city => (
              <tr key={city.id} className="border-t hover:bg-accent/30">
                <td className="py-2 px-3 font-medium">{city.name}</td>
                <td className="py-2 px-3 font-mono text-xs hidden md:table-cell">{city.slug}</td>
                <td className="py-2 px-3">{city.countryCode}</td>
                <td className="py-2 px-3 text-xs hidden lg:table-cell">{city.timezone.ianaName}</td>
                <td className="py-2 px-3 hidden lg:table-cell">{city.population.toLocaleString()}</td>
                <td className="py-2 px-3 text-center">
                  <Badge variant={city.isActive ? 'default' : 'secondary'}>{city.isActive ? 'Active' : 'Inactive'}</Badge>
                </td>
                <td className="py-2 px-3 text-right">
                  <div className="flex gap-1 justify-end">
                    <button onClick={() => editCity(city)} className="p-1 rounded hover:bg-accent"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => deleteCity(city.id)} className="p-1 rounded hover:bg-accent text-red-500"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && cities.length === 0 && (
              <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">No cities found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
