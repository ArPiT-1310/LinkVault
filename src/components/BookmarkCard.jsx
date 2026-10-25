import TagChip from './TagChip.jsx';

function hostOf(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return url; }
}

export default function BookmarkCard({ bookmark, onFavorite, onEdit, onDelete, onTagClick }) {
  const { url, title, description, category, tags = [], favorite, createdAt } = bookmark;
  const host = hostOf(url);

  return (
    <article className="bookmark">
      <img
        className="favicon"
        src={`https://www.google.com/s2/favicons?domain=${host}&sz=64`}
        alt=""
        width="32"
        height="32"
        loading="lazy"
      />
      <div className="bookmark-body">
        <div className="bookmark-head">
          <a href={url} target="_blank" rel="noopener noreferrer" className="bookmark-title">{title}</a>
          {category && <span className="badge">{category}</span>}
        </div>
        <p className="muted small">{host}{createdAt && ` · saved ${new Date(createdAt).toLocaleDateString()}`}</p>
        {description && <p className="bookmark-desc">{description}</p>}
        {tags.length > 0 && (
          <div className="chips">
            {tags.map((t) => <TagChip key={t} label={t} onClick={() => onTagClick(t)} />)}
          </div>
        )}
      </div>
      <div className="bookmark-actions">
        <button
          className={`btn icon ${favorite ? 'fav-on' : ''}`}
          onClick={() => onFavorite(bookmark)}
          aria-pressed={favorite}
          aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          {favorite ? '★' : '☆'}
        </button>
        <button className="btn ghost" onClick={() => onEdit(bookmark)}>Edit</button>
        <button className="btn ghost danger" onClick={() => onDelete(bookmark)}>Delete</button>
      </div>
    </article>
  );
}
