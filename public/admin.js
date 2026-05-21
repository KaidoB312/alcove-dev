let token = null;

function api(path, opts = {}) {
  const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
  if (token) headers['Authorization'] = 'Bearer ' + token;
  return fetch('/api' + path, { headers, ...opts }).then(r => r.json());
}

function show(el) { document.getElementById(el).classList.remove('hidden'); }
function hide(el) { document.getElementById(el).classList.add('hidden'); }
function e(s) { if (!s) return ''; return s.replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[m]); }

async function adminLogin() {
  const pw = document.getElementById('admin-password').value;
  const err = document.getElementById('login-error');
  try {
    const res = await api('/auth/login', { method: 'POST', body: 'password=' + encodeURIComponent(pw) });
    if (res.error) { err.textContent = res.error; show('login-error'); return; }
    token = res.token;
    localStorage.setItem('admin_token', token);
    hide('admin-login');
    show('admin-panel');
    loadDashboard();
  } catch (ex) { err.textContent = 'Login failed'; show('login-error'); }
}

function adminLogout() {
  token = null;
  localStorage.removeItem('admin_token');
  hide('admin-panel');
  show('admin-login');
}

async function loadDashboard() {
  const data = await api('/admin/dashboard');
  document.getElementById('admin-content').innerHTML = `
<h1>Admin Dashboard</h1>
<div class="stats-grid">
  <div class="stat-card"><div class="stat-number">${data.memberCount||0}</div><div class="stat-label">Team Members</div></div>
  <div class="stat-card"><div class="stat-number">${data.projectCount||0}</div><div class="stat-label">Projects</div></div>
</div>
<div class="action-buttons">
  <a href="#" onclick="loadMembers()" class="btn primary">Manage Members</a>
  <a href="#" onclick="loadProjects()" class="btn primary">Manage Projects</a>
</div>
<div class="action-buttons">
  <a href="#" onclick="loadMemberForm()" class="btn secondary">+ Add New Member</a>
  <a href="#" onclick="loadProjectForm()" class="btn secondary">+ Add New Project</a>
</div>
<div class="recent-section">
  <div class="recent-card">
    <h3>Recent Members</h3>
    <ul class="recent-list">
      ${(data.recentMembers||[]).length ? data.recentMembers.map(m => `<li><a href="#" onclick="loadMemberForm(${m.id})">${e(m.name)}</a><span class="recent-date">${(m.created_at||'').slice(0,10)}</span></li>`).join('') : '<li>No members yet.</li>'}
    </ul>
  </div>
  <div class="recent-card">
    <h3>Recent Projects</h3>
    <ul class="recent-list">
      ${(data.recentProjects||[]).length ? data.recentProjects.map(p => `<li><a href="#" onclick="loadProjectForm(${p.id})">${e(p.title)}</a><span class="recent-date">${(p.created_at||'').slice(0,10)}</span></li>`).join('') : '<li>No projects yet.</li>'}
    </ul>
  </div>
</div>`;
}

async function loadMembers() {
  const data = await api('/admin/members');
  document.getElementById('admin-content').innerHTML = `
<div class="admin-header">
  <h1>Manage Members</h1>
  <a href="#" onclick="loadMemberForm()" class="btn primary">+ Add New Member</a>
</div>
<a href="#" onclick="loadDashboard()" class="btn secondary btn-sm">← Back to Dashboard</a>
<table class="admin-table"><thead><tr><th>ID</th><th>Slug</th><th>Name</th><th>Role</th><th>Actions</th></tr></thead><tbody>
  ${(data||[]).length ? data.map(m => `
    <tr>
      <td>${m.id}</td><td>${e(m.slug)}</td><td>${e(m.name)}</td><td>${e(m.role||'')}</td>
      <td class="actions">
        <a href="#" onclick="loadMemberForm(${m.id})" class="btn secondary btn-sm">Edit</a>
        <a href="#" onclick="deleteMember(${m.id})" class="btn secondary btn-sm">Delete</a>
      </td>
    </tr>`).join('') : '<tr><td colspan="5" style="text-align:center">No members yet.</td></tr>'}
</tbody></table>`;
}

async function loadMemberForm(id) {
  let member = null;
  if (id) { try { member = await api('/admin/members/' + id); } catch {} }
  document.getElementById('admin-content').innerHTML = `
<div class="form-container">
  <h1>${member?'Edit':'Add New'} Member</h1>
  <form id="memberForm" onsubmit="saveMember(event,${member?member.id:0})">
    ${member?'<input type="hidden" name="id" value="'+member.id+'">':''}
    <label>Slug (unique) *</label><input type="text" name="slug" value="${e(member&&member.slug||'')}" required>
    <div class="note">Used in URL: /:slug</div>
    <label>Name *</label><input type="text" name="name" value="${e(member&&member.name||'')}" required>
    <label>Role</label><input type="text" name="role" value="${e(member&&member.role||'')}">
    <label>Experience Years</label><input type="number" name="experience_years" value="${member&&member.experience_years||''}">
    <label>Bio</label><textarea name="bio">${e(member&&member.bio||'')}</textarea>
    <label>Email</label><input type="email" name="email" value="${e(member&&member.email||'')}">
    <label>Discord</label><input type="text" name="discord" value="${e(member&&member.discord||'')}">
    <hr>
    <div class="dynamic-group">
      <label>Skills</label>
      <div id="skillsContainer">
        ${(member&&member.skills||[]).length ? member.skills.map((s,i)=>`
          <div class="dynamic-item">
            <input type="text" placeholder="Skill name" class="skill-name" value="${e(s.name)}">
            <input type="number" placeholder="Percent" class="skill-percent" value="${s.percent||''}">
            <input type="text" placeholder="Tags (comma separated)" class="skill-tags" value="${(s.tags||[]).join(', ')}">
            <button type="button" class="remove-btn" onclick="this.closest('.dynamic-item').remove()">✕</button>
          </div>`).join('') : `
          <div class="dynamic-item">
            <input type="text" placeholder="Skill name" class="skill-name">
            <input type="number" placeholder="Percent" class="skill-percent">
            <input type="text" placeholder="Tags (comma separated)" class="skill-tags">
            <button type="button" class="remove-btn" onclick="this.closest('.dynamic-item').remove()">✕</button>
          </div>`}
      </div>
      <button type="button" class="add-btn" onclick="addDynamicItem('skillsContainer','skill')">+ Add Skill</button>
    </div>
    <div class="dynamic-group">
      <label>Certifications</label>
      <div id="certsContainer">
        ${(member&&member.certifications||[]).length ? member.certifications.map(c=>`
          <div class="dynamic-item">
            <input type="text" placeholder="Certification name" class="cert-name" value="${e(c)}">
            <button type="button" class="remove-btn" onclick="this.closest('.dynamic-item').remove()">✕</button>
          </div>`).join('') : `
          <div class="dynamic-item">
            <input type="text" placeholder="Certification name" class="cert-name">
            <button type="button" class="remove-btn" onclick="this.closest('.dynamic-item').remove()">✕</button>
          </div>`}
      </div>
      <button type="button" class="add-btn" onclick="addDynamicItem('certsContainer','cert')">+ Add Certification</button>
    </div>
    <div class="dynamic-group">
      <label>Offerings</label>
      <div id="offeringsContainer">
        ${(member&&member.offerings||[]).length ? member.offerings.map(o=>`
          <div class="dynamic-item">
            <input type="text" placeholder="Title" class="offering-title" value="${e(o.title||o.title||'')}">
            <textarea placeholder="Description" class="offering-desc" rows="2">${e(o.desc||o.description||'')}</textarea>
            <input type="text" placeholder="Icon (e.g., server)" class="offering-icon" value="${e(o.icon||'')}">
            <button type="button" class="remove-btn" onclick="this.closest('.dynamic-item').remove()">✕</button>
          </div>`).join('') : `
          <div class="dynamic-item">
            <input type="text" placeholder="Title" class="offering-title">
            <textarea placeholder="Description" class="offering-desc" rows="2"></textarea>
            <input type="text" placeholder="Icon (e.g., server)" class="offering-icon">
            <button type="button" class="remove-btn" onclick="this.closest('.dynamic-item').remove()">✕</button>
          </div>`}
      </div>
      <button type="button" class="add-btn" onclick="addDynamicItem('offeringsContainer','offering')">+ Add Offering</button>
    </div>
    <hr>
    <button type="submit" class="btn primary">Save Member</button>
    <a href="#" onclick="loadMembers()" class="btn secondary">Cancel</a>
  </form>
</div>`;
}

function addDynamicItem(containerId, type) {
  const container = document.getElementById(containerId);
  const div = document.createElement('div');
  div.className = 'dynamic-item';
  if (type === 'skill') {
    div.innerHTML = '<input type="text" placeholder="Skill name" class="skill-name"><input type="number" placeholder="Percent" class="skill-percent"><input type="text" placeholder="Tags (comma separated)" class="skill-tags"><button type="button" class="remove-btn" onclick="this.closest(\'.dynamic-item\').remove()">✕</button>';
  } else if (type === 'cert') {
    div.innerHTML = '<input type="text" placeholder="Certification name" class="cert-name"><button type="button" class="remove-btn" onclick="this.closest(\'.dynamic-item\').remove()">✕</button>';
  } else {
    div.innerHTML = '<input type="text" placeholder="Title" class="offering-title"><textarea placeholder="Description" class="offering-desc" rows="2"></textarea><input type="text" placeholder="Icon (e.g., server)" class="offering-icon"><button type="button" class="remove-btn" onclick="this.closest(\'.dynamic-item\').remove()">✕</button>';
  }
  container.appendChild(div);
}

async function saveMember(event, id) {
  event.preventDefault();
  const form = event.target;
  const fd = new FormData(form);
  const skills = [];
  document.querySelectorAll('#skillsContainer .dynamic-item').forEach(item => {
    const name = (item.querySelector('.skill-name')?.value || '').trim();
    if (name) {
      const percent = parseInt(item.querySelector('.skill-percent')?.value);
      const tags = (item.querySelector('.skill-tags')?.value || '').split(',').map(t => t.trim()).filter(t => t);
      skills.push({ name, percent: isNaN(percent) ? null : percent, tags });
    }
  });
  const certifications = [];
  document.querySelectorAll('#certsContainer .dynamic-item').forEach(item => {
    const name = (item.querySelector('.cert-name')?.value || '').trim();
    if (name) certifications.push(name);
  });
  const offerings = [];
  document.querySelectorAll('#offeringsContainer .dynamic-item').forEach(item => {
    const title = (item.querySelector('.offering-title')?.value || '').trim();
    if (title) {
      offerings.push({
        title,
        desc: (item.querySelector('.offering-desc')?.value || '').trim(),
        icon: (item.querySelector('.offering-icon')?.value || '').trim()
      });
    }
  });

  const body = new URLSearchParams();
  for (const [k, v] of fd.entries()) body.append(k, v);
  body.set('skills', JSON.stringify(skills));
  body.set('certifications', JSON.stringify(certifications));
  body.set('offerings', JSON.stringify(offerings));
  if (id) body.set('id', id);

  const r = await api('/admin/members', { method: 'POST', body: body.toString() });
  if (r.error) { alert(r.error); return; }
  loadMembers();
}

async function deleteMember(id) {
  if (!confirm('Delete this member?')) return;
  await api('/admin/members/' + id, { method: 'DELETE' });
  loadMembers();
}

async function loadProjects() {
  const data = await api('/admin/projects');
  document.getElementById('admin-content').innerHTML = `
<div class="admin-header">
  <h1>Manage Projects</h1>
  <a href="#" onclick="loadProjectForm()" class="btn primary">+ Add New Project</a>
</div>
<a href="#" onclick="loadDashboard()" class="btn secondary btn-sm">← Back to Dashboard</a>
<table class="admin-table"><thead><tr><th>ID</th><th>Title</th><th>Description</th><th>Actions</th></tr></thead><tbody>
  ${(data||[]).length ? data.map(p => `
    <tr>
      <td>${p.id}</td><td>${e(p.title)}</td><td>${e((p.description||'').substring(0,100))}${(p.description||'').length>100?'...':''}</td>
      <td class="actions">
        <a href="#" onclick="loadProjectForm(${p.id})" class="btn secondary btn-sm">Edit</a>
        <a href="#" onclick="deleteProject(${p.id})" class="btn secondary btn-sm">Delete</a>
      </td>
    </tr>`).join('') : '<tr><td colspan="4" style="text-align:center">No projects yet.</td></tr>'}
</tbody></table>`;
}

async function loadProjectForm(id) {
  let project = null, allMembers = [];
  try { allMembers = await api('/admin/members'); } catch {}
  if (id) { try { project = await api('/admin/projects/' + id); } catch {} }
  const proj = project || {};
  const tags = (proj.tags || []).join(', ');
  const duration = (proj.duration || {}).project || '';
  document.getElementById('admin-content').innerHTML = `
<div class="form-container">
  <h1>${proj.id?'Edit':'Add New'} Project</h1>
  <form id="projectForm" onsubmit="saveProject(event,${proj.id||0})">
    ${proj.id?'<input type="hidden" name="id" value="'+proj.id+'">':''}
    <label>Title *</label><input type="text" name="title" value="${e(proj.title||'')}" required>
    <label>Description</label><textarea name="description">${e(proj.description||'')}</textarea>
    <label>Tags (comma-separated)</label><input type="text" id="tagsInput" value="${e(tags)}">
    <label>Duration</label><input type="text" id="durationInput" value="${e(duration)}">
    <label>Contributors</label>
    <div id="contributorsContainer">
      ${(proj.contributors||[]).length ? proj.contributors.map(c=>`
        <div class="contributor-item">
          <select class="contributor-select">${allMembers.map(m=>'<option value="'+m.id+'"'+(m.id==c.member_id?' selected':'')+'>'+e(m.name)+'</option>').join('')}</select>
          <input type="text" placeholder="Role tag" class="contributor-tag" value="${e(c.role_tag)}">
          <button type="button" onclick="this.closest('.contributor-item').remove()">✕</button>
        </div>`).join('') : `
        <div class="contributor-item">
          <select class="contributor-select">${allMembers.map(m=>'<option value="'+m.id+'">'+e(m.name)+'</option>').join('')}</select>
          <input type="text" placeholder="Role tag" class="contributor-tag">
          <button type="button" onclick="this.closest('.contributor-item').remove()">✕</button>
        </div>`}
    </div>
    <button type="button" class="add-btn" onclick="addContributor()">+ Add Contributor</button>
    <hr>
    <button type="submit" class="btn primary">Save Project</button>
    <a href="#" onclick="loadProjects()" class="btn secondary">Cancel</a>
  </form>
</div>`;
  window._allMembers = allMembers;
}

function addContributor() {
  const container = document.getElementById('contributorsContainer');
  const div = document.createElement('div');
  div.className = 'contributor-item';
  div.innerHTML = '<select class="contributor-select">' + (window._allMembers||[]).map(m => '<option value="' + m.id + '">' + e(m.name) + '</option>').join('') + '</select><input type="text" placeholder="Role tag" class="contributor-tag"><button type="button" onclick="this.closest(\'.contributor-item\').remove()">✕</button>';
  container.appendChild(div);
}

async function saveProject(event, id) {
  event.preventDefault();
  const form = event.target;
  const fd = new FormData(form);
  const tags = (document.getElementById('tagsInput').value || '').split(',').map(t => t.trim()).filter(t => t);
  const duration = { project: (document.getElementById('durationInput').value || '').trim() };
  const contributors = [];
  document.querySelectorAll('.contributor-item').forEach(item => {
    const mid = parseInt(item.querySelector('.contributor-select').value);
    const tag = (item.querySelector('.contributor-tag').value || '').trim();
    if (mid && tag) contributors.push({ member_id: mid, role_tag: tag });
  });

  const body = new URLSearchParams();
  for (const [k, v] of fd.entries()) body.append(k, v);
  body.set('tags', JSON.stringify(tags));
  body.set('duration', JSON.stringify(duration));
  body.set('contributors', JSON.stringify(contributors));
  if (id) body.set('id', id);

  const r = await api('/admin/projects', { method: 'POST', body: body.toString() });
  if (r.error) { alert(r.error); return; }
  loadProjects();
}

async function deleteProject(id) {
  if (!confirm('Delete this project?')) return;
  await api('/admin/projects/' + id, { method: 'DELETE' });
  loadProjects();
}

(function init() {
  const saved = localStorage.getItem('admin_token');
  if (saved) {
    token = saved;
    api('/auth/verify').then(r => {
      if (r.valid) { hide('admin-login'); show('admin-panel'); loadDashboard(); }
      else { token = null; localStorage.removeItem('admin_token'); }
    });
  }
})();
