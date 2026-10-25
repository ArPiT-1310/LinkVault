export default function TagChip({ label, active, onClick, onRemove, count }) {
  return (
    <span className={`chip ${active ? 'active' : ''}`}>
      <button type="button" className="chip-main" onClick={onClick} disabled={!onClick}>
        #{label}{count !== undefined && <small>{count}</small>}
      </button>
      {onRemove && (
        <button type="button" className="chip-x" onClick={onRemove} aria-label={`Remove tag ${label}`}>×</button>
      )}
    </span>
  );
}
