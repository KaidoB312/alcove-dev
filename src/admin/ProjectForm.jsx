import { useState, useEffect } from 'react';
import { api } from '../api';

export default function ProjectForm({ id, onSaved, onCancel }) {
  const [form, setForm] = useState({ title: '', description: '' });
  const [tags, setTags] = useState('');
  const [duration, setDuration] = useState('');
  const [contributors, setContributors] = useState([{ member_id: '', role_tag: '' }]);
  const [allMembers, setAllMembers] = useState([]);

  useEffect(() => { api('/admin/members').then(setAllMembers); }, []);

  useEffect(() => {
    if (!id) return;
    api(`/admin/projects/${id}`).then(p => {
      setForm({ title: p.title, description: p.description || '' });
      setTags((p.tags || []).join(', '));
      setDuration((p.duration || {}).project || '');
      if (p.contributors?.length) setContributors(p.contributors.map(c => ({ member_id: c.member_id.toString(), role_tag: c.role_tag })));
    });
  }, [id]);

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const addContributor = () => setContributors([...contributors, { member_id: '', role_tag: '' }]);
  const removeContributor = (i) => setContributors(contributors.filter((_, j) => j !== i));
  const updateContributor = (i, key, val) => {
    const next = [...contributors];
    next[i] = { ...next[i], [key]: val };
    setContributors(next);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title) return alert('Title is required.');
    const body = new URLSearchParams(form);
    body.set('tags', JSON.stringify(tags.split(',').map(t => t.trim()).filter(t => t)));
    body.set('duration', JSON.stringify({ project: duration.trim() }));
    body.set('contributors', JSON.stringify(contributors.filter(c => c.member_id && c.role_tag).map(c => ({ member_id: parseInt(c.member_id), role_tag: c.role_tag }))));
    if (id) body.set('id', id.toString());
    const res = await api('/admin/projects', { method: 'POST', body: body.toString() });
    if (res.error) return alert(res.error);
    onSaved();
  };

  return (
    <div className="form-container">
      <h1>{id ? 'Edit' : 'Add New'} Project</h1>
      <form onSubmit={submit}>
        {id && <input type="hidden" name="id" value={id} />}
        <label>Title *</label><input name="title" value={form.title} onChange={update} required />
        <label>Description</label><textarea name="description" value={form.description} onChange={update} />
        <label>Tags (comma-separated)</label><input value={tags} onChange={e => setTags(e.target.value)} />
        <label>Duration</label><input value={duration} onChange={e => setDuration(e.target.value)} />
        <div className="note">Stored as JSON with key "project".</div>
        <label>Contributors</label>
        {contributors.map((c, i) => (
          <div className="contributor-item" key={i}>
            <select value={c.member_id} onChange={e => updateContributor(i, 'member_id', e.target.value)} className="contributor-select" style={{ flex: 2, margin: 0 }}>
              <option value="">-- Select --</option>
              {allMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <input value={c.role_tag} onChange={e => updateContributor(i, 'role_tag', e.target.value)} placeholder='Role tag (e.g., "Developer")' className="contributor-tag" style={{ flex: 2, margin: 0 }} />
            <button type="button" onClick={() => removeContributor(i)} style={{ background: '#e67e22', color: 'white', border: 'none', borderRadius: '0.3rem', cursor: 'pointer', padding: '0.3rem 0.6rem' }}>&#10005;</button>
          </div>
        ))}
        <button type="button" className="add-btn" onClick={addContributor}>+ Add Contributor</button>
        <hr />
        <button type="submit" className="btn primary">Save Project</button>
        <button type="button" className="btn secondary" onClick={onCancel} style={{ marginLeft: '1rem' }}>Cancel</button>
      </form>
    </div>
  );
}
