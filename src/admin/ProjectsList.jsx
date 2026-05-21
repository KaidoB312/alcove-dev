import { useState, useEffect } from 'react';
import { api } from '../api';

export default function ProjectsList({ navigate }) {
  const [projects, setProjects] = useState(null);

  const load = () => api('/admin/projects').then(setProjects);

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    await api(`/admin/projects/${id}`, { method: 'DELETE' });
    load();
  };

  if (!projects) return <p>Loading...</p>;
  if (projects.error) return <p style={{ color: 'var(--accent)' }}>{projects.error} <button className="btn secondary btn-sm" onClick={() => { setProjects(null); load(); }}>Retry</button></p>;

  return (
    <>
      <div className="admin-header">
        <h1>Manage Projects</h1>
        <button className="btn primary" onClick={() => navigate('projectForm')}>+ Add New Project</button>
      </div>
      <button className="btn secondary btn-sm" onClick={() => navigate('dashboard')}>&larr; Back to Dashboard</button>
      <table className="admin-table">
        <thead><tr><th>ID</th><th>Title</th><th>Description</th><th>Actions</th></tr></thead>
        <tbody>
          {projects.length > 0 ? projects.map(p => (
            <tr key={p.id}>
              <td>{p.id}</td><td>{p.title}</td><td>{(p.description || '').substring(0, 100)}{(p.description || '').length > 100 ? '...' : ''}</td>
              <td className="actions">
                <button className="btn secondary btn-sm" onClick={() => navigate('projectForm', p.id)}>Edit</button>
                <button className="btn secondary btn-sm" onClick={() => handleDelete(p.id)}>Delete</button>
              </td>
            </tr>
          )) : <tr><td colSpan={4} style={{ textAlign: 'center' }}>No projects yet.</td></tr>}
        </tbody>
      </table>
    </>
  );
}
