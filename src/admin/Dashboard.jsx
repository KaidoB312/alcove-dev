import { useState, useEffect } from 'react';
import { api } from '../api';

export default function Dashboard({ navigate }) {
  const [data, setData] = useState(null);

  useEffect(() => { api('/admin/dashboard').then(setData); }, []);

  if (!data) return <p>Loading...</p>;
  if (data.error) return <p style={{ color: 'var(--accent)' }}>{data.error} <button className="btn secondary btn-sm" onClick={() => { setData(null); api('/admin/dashboard').then(setData); }}>Retry</button></p>;

  return (
    <>
      <h1>Admin Dashboard</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{data.memberCount || 0}</div>
          <div className="stat-label">Team Members</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{data.projectCount || 0}</div>
          <div className="stat-label">Projects</div>
        </div>
      </div>
      <div className="action-buttons">
        <button className="btn primary" onClick={() => navigate('members')} style={{ minWidth: 180 }}>Manage Members</button>
        <button className="btn primary" onClick={() => navigate('projects')} style={{ minWidth: 180 }}>Manage Projects</button>
      </div>
      <div className="action-buttons">
        <button className="btn secondary" onClick={() => navigate('memberForm')} style={{ minWidth: 180 }}>+ Add New Member</button>
        <button className="btn secondary" onClick={() => navigate('projectForm')} style={{ minWidth: 180 }}>+ Add New Project</button>
      </div>
      <div className="recent-section">
        <div className="recent-card">
          <h3>Recent Members</h3>
          <ul className="recent-list">
            {(data.recentMembers || []).length > 0
              ? data.recentMembers.map(m => (
                  <li key={m.id}>
                    <a href="#" onClick={e => { e.preventDefault(); navigate('memberForm', m.id); }}>{m.name}</a>
                    <span className="recent-date">{(m.created_at || '').slice(0, 10)}</span>
                  </li>
                ))
              : <li>No members yet.</li>
            }
          </ul>
        </div>
        <div className="recent-card">
          <h3>Recent Projects</h3>
          <ul className="recent-list">
            {(data.recentProjects || []).length > 0
              ? data.recentProjects.map(p => (
                  <li key={p.id}>
                    <a href="#" onClick={e => { e.preventDefault(); navigate('projectForm', p.id); }}>{p.title}</a>
                    <span className="recent-date">{(p.created_at || '').slice(0, 10)}</span>
                  </li>
                ))
              : <li>No projects yet.</li>
            }
          </ul>
        </div>
      </div>
    </>
  );
}
