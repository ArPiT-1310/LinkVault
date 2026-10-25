import { CATEGORIES } from '../constants.js';
import TagChip from './TagChip.jsx';

export default function FilterSidebar({ filters, tags, onChange, onClear }) {
  const { category, tag, favorite } = filters;
  const nothingActive = !category && !tag && !favorite;

  const navItem = (label, active, onClick) => (
    <button key={label} className={`nav-item ${active ? 'active' : ''}`} onClick={onClick}>{label}</button>
  );

  return (
    <aside className="sidebar">
      <nav>
        {navItem('All bookmarks', nothingActive, onClear)}
        {navItem('Favorites', favorite, () => onChange({ favorite: !favorite }))}
      </nav>

      <h3>Categories</h3>
      <nav>
        {CATEGORIES.map((c) => navItem(c, category === c, () => onChange({ category: category === c ? '' : c })))}
      </nav>

      <h3>Tags</h3>
      <div className="chips">
        {tags.length === 0 && <p className="muted small">Tags you add will show up here.</p>}
        {tags.map((t) => (
          <TagChip
            key={t.name}
            label={t.name}
            count={t.count}
            active={tag === t.name}
            onClick={() => onChange({ tag: tag === t.name ? '' : t.name })}
          />
        ))}
      </div>
    </aside>
  );
}
