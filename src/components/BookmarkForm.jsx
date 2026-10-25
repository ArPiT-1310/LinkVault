import { useState } from 'react';
import toast from 'react-hot-toast';
import { bookmarkApi } from '../api/services.js';
import { errorMessage } from '../api/axios.js';
import { CATEGORIES } from '../constants.js';
import TagChip from './TagChip.jsx';

// Pass `bookmark` to edit, or null to create.
export default function BookmarkForm({ bookmark, onSaved, onClose }) {
  const editing = Boolean(bookmark?.id);
  const [form, setForm] = useState({
    url: bookmark?.url || '',
    title: bookmark?.title || '',
    description: bookmark?.description || '',
    category: bookmark?.category || '',
    tags: bookmark?.tags || [],
    favorite: bookmark?.favorite || false,
  });
  const [tagInput, setTagInput] = useState('');
  const [fetching, setFetching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const addTag = (raw) => {
    const t = raw.trim().toLowerCase().replace(/^#/, '');
    if (t && !form.tags.includes(t)) setForm((f) => ({ ...f, tags: [...f.tags, t] }));
    setTagInput('');
  };

  const onTagKey = (e) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(tagInput); }
    if (e.key === 'Backspace' && !tagInput && form.tags.length) {
      setForm((f) => ({ ...f, tags: f.tags.slice(0, -1) }));
    }
  };

  const fetchMeta = async () => {
    if (!form.url) return;
    setFetching(true);
    try {
      const meta = await bookmarkApi.meta(form.url);
      setForm((f) => ({ ...f, title: f.title || meta.title || '', description: f.description || meta.description || '' }));
    } catch {
      toast.error('Could not read that page. Fill in the title manually.');
    } finally {
      setFetching(false);
    }
  };

  const validate = () => {
    const e = {};
    try { new URL(form.url); } catch { e.url = 'Enter a full URL, like https://example.com'; }
    if (!form.title.trim()) e.title = 'Title is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    const pending = tagInput.trim().toLowerCase().replace(/^#/, '');
    const tags = pending && !form.tags.includes(pending) ? [...form.tags, pending] : form.tags;
    try {
      const payload = { ...form, tags };
      const saved = editing ? await bookmarkApi.update(bookmark.id, payload) : await bookmarkApi.create(payload);
      toast.success(editing ? 'Bookmark updated' : 'Bookmark saved');
      onSaved(saved);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="modal" onSubmit={submit} noValidate>
        <h2>{editing ? 'Edit bookmark' : 'Save a bookmark'}</h2>

        <label>URL
          <div className="row">
            <input className="input" value={form.url} onChange={set('url')} placeholder="https://" autoFocus
              onBlur={() => !editing && !form.title && form.url && fetchMeta()} />
            <button type="button" className="btn" onClick={fetchMeta} disabled={fetching || !form.url}>
              {fetching ? 'Fetching…' : 'Fetch details'}
            </button>
          </div>
          {errors.url && <span className="error">{errors.url}</span>}
        </label>

        <label>Title
          <input className="input" value={form.title} onChange={set('title')} maxLength={255} />
          {errors.title && <span className="error">{errors.title}</span>}
        </label>

        <label>Description
          <textarea className="input" rows={3} value={form.description} onChange={set('description')} maxLength={1000} />
        </label>

        <label>Category
          <select className="input" value={form.category} onChange={set('category')}>
            <option value="">No category</option>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>

        <label>Tags
          <div className="input tag-input">
            {form.tags.map((t) => (
              <TagChip key={t} label={t} onRemove={() => setForm((f) => ({ ...f, tags: f.tags.filter((x) => x !== t) }))} />
            ))}
            <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={onTagKey}
              onBlur={() => addTag(tagInput)} placeholder="Type a tag and press Enter" />
          </div>
        </label>

        <label className="check">
          <input type="checkbox" checked={form.favorite} onChange={set('favorite')} /> Mark as favorite
        </label>

        <div className="modal-actions">
          <button type="button" className="btn ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn primary" disabled={saving}>{saving ? 'Saving…' : 'Save bookmark'}</button>
        </div>
      </form>
    </div>
  );
}
