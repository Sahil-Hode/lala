'use client';

import { useState } from 'react';
import { GalleryItem } from '@/types/database';

interface GalleryManagerProps {
  initialItems: GalleryItem[];
}

export default function GalleryManager({ initialItems }: GalleryManagerProps) {
  const [items, setItems] = useState<GalleryItem[]>(initialItems);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('ops');
  const [description, setDescription] = useState('');
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [file, setFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [flash, setFlash] = useState<{ type: 'ok' | 'err'; message: string } | null>(null);

  const resetForm = () => {
    setEditingItem(null);
    setTitle('');
    setCategory('ops');
    setDescription('');
    setSortOrder(0);
    setIsActive(true);
    setFile(null);
    const fileInput = document.getElementById('gallery-file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleEditClick = (item: GalleryItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setCategory(item.category);
    setDescription(item.description || '');
    setSortOrder(item.sort_order || 0);
    setIsActive(Boolean(item.is_active));
    setFile(null);
    const fileInput = document.getElementById('gallery-file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const refreshItems = async () => {
    try {
      const res = await fetch('/api/gallery?all=true');
      const data = await res.json();
      if (res.ok && data.success) {
        setItems(data.data);
      }
    } catch {
      // ignore
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFlash(null);

    const formData = new FormData();
    formData.append('action', 'save');
    formData.append('id', String(editingItem?.id || 0));
    formData.append('title', title);
    formData.append('category', category);
    formData.append('description', description);
    formData.append('sort_order', String(sortOrder));
    formData.append('is_active', isActive ? '1' : '0');
    if (file) {
      formData.append('image', file);
    }

    try {
      const res = await fetch('/api/admin/gallery', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setFlash({ type: 'ok', message: data.message || 'Asset saved successfully.' });
        resetForm();
        await refreshItems();
      } else {
        setFlash({ type: 'err', message: data.error || 'Failed to save asset.' });
      }
    } catch (err: unknown) {
      setFlash({ type: 'err', message: err instanceof Error ? err.message : 'Upload failed.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Purge this asset?')) return;
    setLoading(true);
    setFlash(null);

    const formData = new FormData();
    formData.append('action', 'delete');
    formData.append('id', String(id));

    try {
      const res = await fetch('/api/admin/gallery', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFlash({ type: 'ok', message: 'Asset purged.' });
        if (editingItem?.id === id) resetForm();
        await refreshItems();
      } else {
        setFlash({ type: 'err', message: data.error || 'Delete failed.' });
      }
    } catch (err: unknown) {
      setFlash({ type: 'err', message: err instanceof Error ? err.message : 'Error.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {flash && (
        <div className={`flash ${flash.type === 'ok' ? 'ok' : 'err'}`}>
          {flash.message}
        </div>
      )}

      <div className="form-panel">
        <h2>{editingItem ? `EDIT ASSET #${editingItem.id}` : 'UPLOAD NEW ASSET'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid-2">
            <div>
              <label>Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                {['ops', 'field', 'intel', 'lab'].map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="grid-2">
            <div>
              <label>Sort Order</label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
              />
            </div>
            <div>
              <label>
                Image {editingItem ? '(leave empty to keep current)' : ''}
              </label>
              <input
                id="gallery-file-input"
                type="file"
                accept="image/*"
                required={!editingItem}
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            Visible on front site
          </label>

          <div className="actions">
            <button className="btn" type="submit" disabled={loading}>
              {loading
                ? 'PROCESSING...'
                : editingItem
                ? 'UPDATE ASSET →'
                : 'UPLOAD ASSET →'}
            </button>
            {editingItem && (
              <button className="btn btn-ghost" type="button" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Preview</th>
              <th>Title</th>
              <th>Category</th>
              <th>Status</th>
              <th>Order</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={6}>No assets yet.</td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id}>
                  <td>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image_path.startsWith('/') ? item.image_path : `/${item.image_path}`}
                      alt=""
                    />
                  </td>
                  <td>{item.title}</td>
                  <td>{item.category.toUpperCase()}</td>
                  <td>
                    <span className={`badge ${item.is_active ? 'on' : 'off'}`}>
                      {item.is_active ? 'LIVE' : 'HIDDEN'}
                    </span>
                  </td>
                  <td>{item.sort_order}</td>
                  <td className="actions">
                    <button
                      className="btn btn-ghost"
                      type="button"
                      onClick={() => handleEditClick(item)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger"
                      type="button"
                      onClick={() => handleDelete(item.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
