import { useState, useEffect } from 'react';
import { api } from '../api';

export default function MembersList({ navigate }) {
  const [members, setMembers] = useState([]);

  useEffect(() => { api('/admin/members').then(setMembers); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this member?')) return;
    await api(`/admin/members/${id}`, { method: 'DELETE' });
    setMembers(members.filter(m => m.id !== id));
  };

  return (
    <>
      <div className="admin-header">
        <h1>Manage Members</h1>
        <button className="btn primary" onClick={() => navigate('memberForm')}>+ Add New Member</button>
      </div>
      <button className="btn secondary btn-sm" onClick={() => navigate('dashboard')}>&larr; Back to Dashboard</button>
      <table className="admin-table">
        <thead><tr><th>ID</th><th>Slug</th><th>Name</th><th>Role</th><th>Actions</th></tr></thead>
        <tbody>
          {members.length > 0 ? members.map(m => (
            <tr key={m.id}>
              <td>{m.id}</td><td>{m.slug}</td><td>{m.name}</td><td>{m.role}</td>
              <td className="actions">
                <button className="btn secondary btn-sm" onClick={() => navigate('memberForm', m.id)}>Edit</button>
                <button className="btn secondary btn-sm" onClick={() => handleDelete(m.id)}>Delete</button>
              </td>
            </tr>
          )) : <tr><td colSpan={5} style={{ textAlign: 'center' }}>No members yet.</td></tr>}
        </tbody>
      </table>
    </>
  );
}
