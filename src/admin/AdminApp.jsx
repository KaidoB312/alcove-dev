import { useState, useEffect } from 'react';
import { api } from '../api';
import Login from './Login';
import Dashboard from './Dashboard';
import MembersList from './MembersList';
import MemberForm from './MemberForm';
import ProjectsList from './ProjectsList';
import ProjectForm from './ProjectForm';

function AdminDarkToggle() {
  useEffect(() => {
    const el = document.createElement('button');
    el.id = 'darkModeToggle';
    el.className = 'dark-mode-toggle';
    el.setAttribute('aria-label', 'Toggle dark mode');
    el.style.cssText = 'background:none;border:none;cursor:pointer;font-size:1.2rem;padding:0.3rem;margin-left:1rem;color:inherit';
    document.querySelector('.admin-header-wrap')?.prepend(el);

    const saved = localStorage.getItem('darkMode');
    if (saved === 'enabled') setDark(true);
    else if (saved === 'disabled') setDark(false);
    else if (window.matchMedia('(prefers-color-scheme: dark)').matches) setDark(true);

    el.addEventListener('click', () => {
      const isDark = document.body.classList.contains('dark');
      setDark(!isDark);
    });

    function setDark(on) {
      if (on) {
        document.body.classList.add('dark');
        localStorage.setItem('darkMode', 'enabled');
        el.innerHTML = '<i class="fas fa-sun"></i>';
      } else {
        document.body.classList.remove('dark');
        localStorage.setItem('darkMode', 'disabled');
        el.innerHTML = '<i class="fas fa-moon"></i>';
      }
    }

    return () => el.remove();
  }, []);

  return null;
}

export default function AdminApp() {
  const [token, setToken] = useState(null);
  const [page, setPage] = useState('dashboard');
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('admin_token');
    if (saved) {
      api('/auth/verify').then(r => {
        if (r.valid) setToken(saved);
        else localStorage.removeItem('admin_token');
      }).catch(() => {});
    }
  }, []);

  const onLogin = (t) => { localStorage.setItem('admin_token', t); setToken(t); };
  const onLogout = () => { localStorage.removeItem('admin_token'); setToken(null); };
  const navigate = (p, id) => { setPage(p); setEditId(id || null); };

  if (!token) return <Login onLogin={onLogin} />;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem' }}>
      <div className="admin-header-wrap" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '2rem' }}>
        <AdminDarkToggle />
        <button className="btn secondary btn-sm" onClick={onLogout} style={{ marginRight: '1rem' }}>Logout</button>
        <a href="/" className="btn secondary btn-sm">View Site</a>
      </div>
      {page === 'dashboard' && <Dashboard navigate={navigate} />}
      {page === 'members' && <MembersList navigate={navigate} />}
      {page === 'memberForm' && <MemberForm id={editId} onSaved={() => navigate('members')} onCancel={() => navigate('members')} />}
      {page === 'projects' && <ProjectsList navigate={navigate} />}
      {page === 'projectForm' && <ProjectForm id={editId} onSaved={() => navigate('projects')} onCancel={() => navigate('projects')} />}
    </div>
  );
}
