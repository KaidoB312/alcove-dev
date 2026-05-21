import { useState, useEffect } from 'react';
import { api } from '../api';
import Login from './Login';
import Dashboard from './Dashboard';
import MembersList from './MembersList';
import MemberForm from './MemberForm';
import ProjectsList from './ProjectsList';
import ProjectForm from './ProjectForm';

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
      });
    }
  }, []);

  const onLogin = (t) => { localStorage.setItem('admin_token', t); setToken(t); };
  const onLogout = () => { localStorage.removeItem('admin_token'); setToken(null); };
  const navigate = (p, id) => { setPage(p); setEditId(id || null); };

  if (!token) return <Login onLogin={onLogin} />;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem' }}>
      <div style={{ marginBottom: '2rem', textAlign: 'right' }}>
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
