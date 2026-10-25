export default function SearchBar({ value, onChange }) {
  return (
    <input
      className="input search"
      type="search"
      placeholder="Search title, description, URL or tag"
      aria-label="Search bookmarks"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
