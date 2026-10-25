import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => localStorage.getItem('lv_theme') || 'light');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('lv_theme', theme);
  }, [theme]);

  return (
    <header className="navbar">
      <Link to="/" className="brand">LinkVault</Link>
      <div className="nav-actions">
        <button className="btn ghost" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
          {theme === 'light' ? 'Dark mode' : 'Light mode'}
        </button>
        {user && (
          <>
            <span className="muted hide-sm">{user.name}</span>
            <button className="btn ghost" onClick={() => { logout(); navigate('/login'); }}>Log out</button>
          </>
        )}
      </div>
    </header>
  );
}
