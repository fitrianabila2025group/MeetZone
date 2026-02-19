'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2 } from 'lucide-react';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  isPublished: boolean;
  publishedAt: string | null;
  tags: string[];
  readingTimeMinutes: number | null;
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    slug: '', title: '', excerpt: '', contentHtml: '',
    metaTitle: '', metaDescription: '', tags: '', readingTimeMinutes: '5',
    isPublished: false,
  });
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    const res = await fetch('/api/admin/blog');
    if (res.ok) { const d = await res.json(); setPosts(d.posts || []); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  function resetForm() {
    setForm({ slug: '', title: '', excerpt: '', contentHtml: '', metaTitle: '', metaDescription: '', tags: '', readingTimeMinutes: '5', isPublished: false });
    setEditId(null);
    setShowForm(false);
  }

  async function loadPost(id: string) {
    const res = await fetch(`/api/admin/blog/${id}`);
    if (!res.ok) return;
    const { post } = await res.json();
    setForm({
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt || '',
      contentHtml: post.contentHtml,
      metaTitle: post.metaTitle || '',
      metaDescription: post.metaDescription || '',
      tags: post.tags.join(', '),
      readingTimeMinutes: String(post.readingTimeMinutes || 5),
      isPublished: post.isPublished,
    });
    setEditId(id);
    setShowForm(true);
  }

  async function savePost(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const body = {
      slug: form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      title: form.title,
      excerpt: form.excerpt || null,
      contentHtml: form.contentHtml,
      metaTitle: form.metaTitle || null,
      metaDescription: form.metaDescription || null,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      readingTimeMinutes: parseInt(form.readingTimeMinutes) || 5,
      isPublished: form.isPublished,
    };
    const url = editId ? `/api/admin/blog/${editId}` : '/api/admin/blog';
    const method = editId ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    setSaving(false);
    if (res.ok) { resetForm(); fetchData(); } else { const d = await res.json(); alert(d.error || 'Failed'); }
  }

  async function deletePost(id: string) {
    if (!confirm('Delete this post?')) return;
    await fetch(`/api/admin/blog/${id}`, { method: 'DELETE' });
    fetchData();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Blog Posts</h1>
        <Button size="sm" onClick={() => { resetForm(); setShowForm(true); }}><Plus className="h-4 w-4 mr-1" /> Add</Button>
      </div>

      {showForm && (
        <Card className="mb-6"><CardContent className="pt-6">
          <form onSubmit={savePost} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label>Title</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required /></div>
              <div><Label>Slug</Label><Input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated" /></div>
            </div>
            <div><Label>Excerpt</Label><Textarea value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} rows={2} /></div>
            <div><Label>Content (HTML)</Label><Textarea value={form.contentHtml} onChange={e => setForm({ ...form, contentHtml: e.target.value })} rows={12} className="font-mono text-xs" /></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label>Meta Title</Label><Input value={form.metaTitle} onChange={e => setForm({ ...form, metaTitle: e.target.value })} /></div>
              <div><Label>Meta Description</Label><Input value={form.metaDescription} onChange={e => setForm({ ...form, metaDescription: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><Label>Tags (comma-separated)</Label><Input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} /></div>
              <div><Label>Reading Time (min)</Label><Input type="number" value={form.readingTimeMinutes} onChange={e => setForm({ ...form, readingTimeMinutes: e.target.value })} /></div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.isPublished} onChange={e => setForm({ ...form, isPublished: e.target.checked })} /> Published
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

      <div className="border rounded-md overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-accent/50">
            <tr>
              <th className="text-left py-2 px-3">Title</th>
              <th className="text-left py-2 px-3 hidden md:table-cell">Slug</th>
              <th className="text-center py-2 px-3">Status</th>
              <th className="text-left py-2 px-3 hidden lg:table-cell">Tags</th>
              <th className="text-right py-2 px-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map(p => (
              <tr key={p.id} className="border-t hover:bg-accent/30">
                <td className="py-2 px-3 font-medium">{p.title}</td>
                <td className="py-2 px-3 font-mono text-xs hidden md:table-cell">{p.slug}</td>
                <td className="py-2 px-3 text-center">
                  <Badge variant={p.isPublished ? 'default' : 'secondary'}>
                    {p.isPublished ? 'Published' : 'Draft'}
                  </Badge>
                </td>
                <td className="py-2 px-3 hidden lg:table-cell">
                  <div className="flex gap-1 flex-wrap">{p.tags.map(t => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}</div>
                </td>
                <td className="py-2 px-3 text-right">
                  <div className="flex gap-1 justify-end">
                    <button onClick={() => loadPost(p.id)} className="p-1 rounded hover:bg-accent"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => deletePost(p.id)} className="p-1 rounded hover:bg-accent text-red-500"><Trash2 className="h-4 w-4" /></button>
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
