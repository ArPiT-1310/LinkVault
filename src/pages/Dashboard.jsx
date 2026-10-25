import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { bookmarkApi, tagApi } from '../api/services.js';
import { errorMessage } from '../api/axios.js';
import { PAGE_SIZE, SORT_OPTIONS } from '../constants.js';
import useDebounce from '../hooks/useDebounce.js';
import BookmarkCard from '../components/BookmarkCard.jsx';
import BookmarkForm from '../components/BookmarkForm.jsx';
import FilterSidebar from '../components/FilterSidebar.jsx';
import SearchBar from '../components/SearchBar.jsx';

const EMPTY_FILTERS = { search: '', category: '', tag: '', favorite: false, sort: 'createdAt,desc', page: 0 };

export default function Dashboard() {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [data, setData] = useState({ content: [], totalPages: 0, totalElements: 0 });
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formTarget, setFormTarget] = useState(undefined); // undefined = closed, null = new, object = edit
  const [refresh, setRefresh] = useState(0);

  const search = useDebounce(filters.search);
  const { category, tag, favorite, sort, page } = filters;

  // Changing any filter jumps back to the first page.
  const update = (patch) => setFilters((f) => ({ ...f, page: 0, ...patch }));
  const reload = () => setRefresh((n) => n + 1);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    // Only send params that have a value, so Spring receives null for the rest.
    const params = { sort, page, size: PAGE_SIZE };
    if (search.trim()) params.search = search.trim();
    if (category) params.category = category;
    if (tag) params.tag = tag;
    if (favorite) params.favorite = true;

    bookmarkApi.list(params)
      .then((res) => !cancelled && setData(res))
      .catch((err) => !cancelled && toast.error(errorMessage(err)))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [search, category, tag, favorite, sort, page, refresh]);

  useEffect(() => {
    tagApi.list().then(setTags).catch(() => {});
  }, [refresh]);

  const toggleFavorite = async (b) => {
    // Optimistic update, rolled back if the request fails.
    const flip = (value) =>
      setData((d) => ({ ...d, content: d.content.map((x) => (x.id === b.id ? { ...x, favorite: value } : x)) }));
    flip(!b.favorite);
    try {
      await bookmarkApi.toggleFavorite(b.id);
      if (favorite) reload(); // viewing favorites only: the item should disappear
    } catch (err) {
      flip(b.favorite);
      toast.error(errorMessage(err));
    }
  };

  const remove = async (b) => {
    if (!window.confirm(`Delete "${b.title}"?`)) return;
    try {
      await bookmarkApi.remove(b.id);
      toast.success('Bookmark deleted');
      reload();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const hasFilters = search || category || tag || favorite;

  return (
    <div className="layout">
      <FilterSidebar
        filters={filters}
        tags={tags}
        onChange={update}
        onClear={() => setFilters({ ...EMPTY_FILTERS, sort })}
      />

      <main className="content">
        <div className="toolbar">
          <SearchBar value={filters.search} onChange={(v) => update({ search: v })} />
          <select className="input sort" value={sort} onChange={(e) => update({ sort: e.target.value })} aria-label="Sort bookmarks">
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button className="btn primary" onClick={() => setFormTarget(null)}>Add bookmark</button>
        </div>

        <p className="muted small" aria-live="polite">
          {loading ? 'Loading…' : `${data.totalElements} bookmark${data.totalElements === 1 ? '' : 's'}`}
          {tag && ` tagged #${tag}`}{category && ` in ${category}`}{favorite && ' (favorites)'}
        </p>

        {!loading && data.content.length === 0 && (
          <div className="empty">
            <h2>{hasFilters ? 'No bookmarks match these filters' : 'Your vault is empty'}</h2>
            <p className="muted">{hasFilters ? 'Try a different search or clear the filters.' : 'Save your first link to get started.'}</p>
            {!hasFilters && <button className="btn primary" onClick={() => setFormTarget(null)}>Add bookmark</button>}
          </div>
        )}

        <div className="list">
          {data.content.map((b) => (
            <BookmarkCard
              key={b.id}
              bookmark={b}
              onFavorite={toggleFavorite}
              onEdit={setFormTarget}
              onDelete={remove}
              onTagClick={(t) => update({ tag: t })}
            />
          ))}
        </div>

        {data.totalPages > 1 && (
          <div className="pager">
            <button className="btn" disabled={page === 0} onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}>Previous</button>
            <span className="muted">Page {page + 1} of {data.totalPages}</span>
            <button className="btn" disabled={page + 1 >= data.totalPages} onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}>Next</button>
          </div>
        )}
      </main>

      {formTarget !== undefined && (
        <BookmarkForm
          bookmark={formTarget}
          onClose={() => setFormTarget(undefined)}
          onSaved={() => { setFormTarget(undefined); reload(); }}
        />
      )}
    </div>
  );
}
