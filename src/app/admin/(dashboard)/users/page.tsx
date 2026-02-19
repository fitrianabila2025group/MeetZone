'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Key } from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ email: '', name: '', password: '', role: 'EDITOR', isActive: true });
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    const res = await fetch('/api/admin/users');
    if (res.ok) { const d = await res.json(); setUsers(d.users || []); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  function resetForm() {
    setForm({ email: '', name: '', password: '', role: 'EDITOR', isActive: true });
    setEditId(null);
    setShowForm(false);
  }

  function editUser(u: User) {
    setForm({ email: u.email, name: u.name || '', password: '', role: u.role, isActive: u.isActive });
    setEditId(u.id);
    setShowForm(true);
  }

  async function saveUser(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const body: any = { email: form.email, name: form.name || null, role: form.role, isActive: form.isActive };
    if (form.password) body.password = form.password;
    const url = editId ? `/api/admin/users/${editId}` : '/api/admin/users';
    const method = editId ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    setSaving(false);
    if (res.ok) { resetForm(); fetchData(); } else { const d = await res.json(); alert(d.error || 'Failed'); }
  }

  async function deleteUser(id: string) {
    if (!confirm('Delete this user?')) return;
    await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
    fetchData();
  }

  async function resetPassword(id: string) {
    const pw = prompt('Enter new password:');
    if (!pw) return;
    await fetch(`/api/admin/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pw }),
    });
    alert('Password updated');
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Users</h1>
        <Button size="sm" onClick={() => { resetForm(); setShowForm(true); }}><Plus className="h-4 w-4 mr-1" /> Add</Button>
      </div>

      {showForm && (
        <Card className="mb-6"><CardContent className="pt-6">
          <form onSubmit={saveUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></div>
            <div><Label>Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Password {editId ? '(leave blank to keep)' : ''}</Label><Input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} {...(!editId ? { required: true } : {})} /></div>
            <div>
              <Label>Role</Label>
              <select className="w-full h-10 px-3 rounded-md border bg-background text-sm" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                <option value="ADMIN">Admin</option>
                <option value="EDITOR">Editor</option>
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} /> Active
              </label>
            </div>
            <div className="md:col-span-2 flex gap-2">
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
              <th className="text-left py-2 px-3">Email</th>
              <th className="text-left py-2 px-3 hidden md:table-cell">Name</th>
              <th className="text-center py-2 px-3">Role</th>
              <th className="text-center py-2 px-3">Status</th>
              <th className="text-right py-2 px-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-t hover:bg-accent/30">
                <td className="py-2 px-3">{u.email}</td>
                <td className="py-2 px-3 hidden md:table-cell">{u.name || '—'}</td>
                <td className="py-2 px-3 text-center"><Badge variant={u.role === 'ADMIN' ? 'default' : 'secondary'}>{u.role}</Badge></td>
                <td className="py-2 px-3 text-center"><Badge variant={u.isActive ? 'default' : 'secondary'}>{u.isActive ? 'Active' : 'Disabled'}</Badge></td>
                <td className="py-2 px-3 text-right">
                  <div className="flex gap-1 justify-end">
                    <button onClick={() => resetPassword(u.id)} className="p-1 rounded hover:bg-accent" title="Reset password"><Key className="h-4 w-4" /></button>
                    <button onClick={() => editUser(u)} className="p-1 rounded hover:bg-accent"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => deleteUser(u.id)} className="p-1 rounded hover:bg-accent text-red-500"><Trash2 className="h-4 w-4" /></button>
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
