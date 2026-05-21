import { useState, useEffect } from 'react';
import { api } from '../api';

export default function MemberForm({ id, onSaved, onCancel }) {
  const [form, setForm] = useState({ slug: '', name: '', role: '', experience_years: '', bio: '', email: '', discord: '' });
  const [skills, setSkills] = useState([{ name: '', percent: '', tags: '' }]);
  const [certs, setCerts] = useState(['']);
  const [offerings, setOfferings] = useState([{ title: '', desc: '', icon: '' }]);

  useEffect(() => {
    if (!id) return;
    api(`/admin/members/${id}`).then(m => {
      setForm({ slug: m.slug, name: m.name, role: m.role || '', experience_years: m.experience_years || '', bio: m.bio || '', email: m.email || '', discord: m.discord || '' });
      if (m.skills?.length) setSkills(m.skills.map(s => ({ name: s.name, percent: s.percent || '', tags: (s.tags || []).join(', ') })));
      if (m.certifications?.length) setCerts(m.certifications);
      if (m.offerings?.length) setOfferings(m.offerings.map(o => ({ title: o.title || o.title, desc: o.desc || o.description || '', icon: o.icon || '' })));
    });
  }, [id]);

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.slug || !form.name) return alert('Slug and Name are required.');
    const body = new URLSearchParams(form);
    body.set('skills', JSON.stringify(skills.filter(s => s.name).map(s => ({ name: s.name, percent: parseInt(s.percent) || null, tags: s.tags.split(',').map(t => t.trim()).filter(t => t) }))));
    body.set('certifications', JSON.stringify(certs.filter(c => c)));
    body.set('offerings', JSON.stringify(offerings.filter(o => o.title).map(o => ({ title: o.title, desc: o.desc, icon: o.icon }))));
    if (id) body.set('id', id.toString());
    const res = await api('/admin/members', { method: 'POST', body: body.toString() });
    if (res.error) return alert(res.error);
    onSaved();
  };

  return (
    <div className="form-container">
      <h1>{id ? 'Edit' : 'Add New'} Member</h1>
      <form onSubmit={submit}>
        {id && <input type="hidden" name="id" value={id} />}
        <label>Slug (unique) *</label><input name="slug" value={form.slug} onChange={update} required /><div className="note">Used in URL: /:slug</div>
        <label>Name *</label><input name="name" value={form.name} onChange={update} required />
        <label>Role</label><input name="role" value={form.role} onChange={update} />
        <label>Experience Years</label><input type="number" name="experience_years" value={form.experience_years} onChange={update} />
        <label>Bio</label><textarea name="bio" value={form.bio} onChange={update} />
        <label>Email</label><input type="email" name="email" value={form.email} onChange={update} />
        <label>Discord</label><input name="discord" value={form.discord} onChange={update} />
        <hr />
        <DynamicSection label="Skills" items={skills} setItems={setSkills} fields={[{ key: 'name', placeholder: 'Skill name' }, { key: 'percent', placeholder: 'Percent', type: 'number' }, { key: 'tags', placeholder: 'Tags (comma separated)' }]} />
        <DynamicSection label="Certifications" items={certs} setItems={setCerts} fields={[{ key: '', placeholder: 'Certification name' }]} />
        <DynamicSection label="Offerings" items={offerings} setItems={setOfferings} fields={[{ key: 'title', placeholder: 'Title' }, { key: 'desc', placeholder: 'Description', textarea: true }, { key: 'icon', placeholder: 'Icon' }]} />
        <hr />
        <button type="submit" className="btn primary">Save Member</button>
        <button type="button" className="btn secondary" onClick={onCancel} style={{ marginLeft: '1rem' }}>Cancel</button>
      </form>
    </div>
  );
}

function DynamicSection({ label, items, setItems, fields }) {
  const add = () => {
    const empty = {};
    fields.forEach(f => { empty[f.key || ''] = ''; });
    setItems([...items, empty]);
  };
  const remove = (i) => setItems(items.filter((_, j) => j !== i));
  const change = (i, key, val) => {
    const next = [...items];
    next[i] = { ...next[i], [key]: val };
    setItems(next);
  };

  return (
    <div className="dynamic-group">
      <label>{label}</label>
      {items.map((item, i) => (
        <div className="dynamic-item" key={i}>
          {fields.map(f => f.textarea
            ? <textarea key={f.key || f.placeholder} placeholder={f.placeholder} value={item[f.key || ''] || ''} onChange={e => change(i, f.key || '', e.target.value)} rows={2} style={{ flex: 1, margin: 0 }} />
            : <input key={f.key || f.placeholder} type={f.type || 'text'} placeholder={f.placeholder} value={item[f.key || ''] || ''} onChange={e => change(i, f.key || '', e.target.value)} style={{ flex: 1, margin: 0 }} />
          )}
          <button type="button" className="remove-btn" onClick={() => remove(i)} style={{ background: '#e67e22', color: 'white', border: 'none', borderRadius: '0.3rem', cursor: 'pointer', padding: '0.3rem 0.6rem' }}>&#10005;</button>
        </div>
      ))}
      <button type="button" className="add-btn" onClick={add}>+ Add {label.slice(0, -1)}</button>
    </div>
  );
}
