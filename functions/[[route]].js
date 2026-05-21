function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function html(body, status = 200) {
  return new Response(body, {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

async function verifyPassword(password, storedHash) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex === storedHash;
}

async function createToken(payload, secret) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encoder = new TextEncoder();
  const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const payloadB64 = btoa(JSON.stringify({ ...payload, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 86400 }))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const signingInput = `${headerB64}.${payloadB64}`;
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(signingInput));
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${signingInput}.${sigB64}`;
}

async function verifyToken(token, secret) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [headerB64, payloadB64, sigB64] = parts;
    const signingInput = `${headerB64}.${payloadB64}`;
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
    const sigBytes = Uint8Array.from(atob(sigB64.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
    const valid = await crypto.subtle.verify('HMAC', key, sigBytes, encoder.encode(signingInput));
    if (!valid) return null;
    const payload = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

function safeParse(v) {
  if (!v) return v;
  if (typeof v === 'string') {
    try { return JSON.parse(v); } catch { return v; }
  }
  return v;
}

function parseForm(body) {
  const params = new URLSearchParams(body);
  const obj = {};
  for (const [k, v] of params) {
    if (obj[k] !== undefined) {
      if (!Array.isArray(obj[k])) obj[k] = [obj[k]];
      obj[k].push(v);
    } else {
      obj[k] = v;
    }
  }
  return obj;
}

const ADMIN_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Admin · Alcove</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
<link rel="stylesheet" href="/style.css">
<style>
.admin-container{max-width:1200px;margin:0 auto;padding:2rem}
.login-card{max-width:400px;margin:4rem auto;text-align:center}
.login-card input{width:100%;padding:.8rem;margin:1rem 0;border:1px solid #e0dbcf;border-radius:.8rem;background:#fefcf9;font-family:inherit}
.error{color:#c2a25b;margin-bottom:1rem}
.stats-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:1.5rem;margin:2rem 0}
.stat-card{background:white;border:1px solid #e0dbcf;border-radius:1rem;padding:1.5rem;text-align:center}
.stat-number{font-size:3rem;font-weight:700;font-family:'Space Mono',monospace;color:#c2a25b}
.admin-table{width:100%;border-collapse:collapse;background:white;border-radius:1rem;overflow:hidden;margin:1rem 0}
.admin-table th,.admin-table td{padding:1rem;text-align:left;border-bottom:1px solid #e0dbcf}
.admin-table th{background:#f0ede6;font-weight:600}
.form-container{max-width:800px;margin:2rem auto;background:white;border-radius:1rem;padding:2rem;border:1px solid #e0dbcf}
.form-container label{display:block;margin:1rem 0 .3rem;font-weight:500}
.form-container input,.form-container textarea,.form-container select{width:100%;padding:.6rem;border:1px solid #e0dbcf;border-radius:.5rem;font-family:inherit}
.action-buttons{display:flex;flex-wrap:wrap;gap:1rem;justify-content:center;margin:2rem 0}
.action-buttons a{min-width:180px}
.btn-sm{padding:.3rem .8rem;font-size:.8rem}
.admin-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:2rem}
.admin-nav{margin:0 0 2rem;text-align:right}
.dynamic-group{margin:1rem 0;padding:.5rem;border:1px solid #e0dbcf;border-radius:.5rem}
.dynamic-item{display:flex;gap:.5rem;align-items:flex-start;margin-bottom:.5rem}
.dynamic-item input,.dynamic-item textarea,.dynamic-item select{flex:1;margin:0}
.dynamic-item button{margin-top:0;padding:.3rem .6rem;background:#e67e22;color:white;border:none;border-radius:.3rem;cursor:pointer}
.add-btn{margin-top:.5rem;padding:.3rem .8rem;background:#2c5f2d;color:white;border:none;border-radius:.3rem;cursor:pointer}
.note{font-size:.8rem;color:#5f5d59;margin-top:.3rem}
.recent-section{display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;margin:2rem 0}
.recent-card{background:white;border:1px solid #e0dbcf;border-radius:1rem;padding:1rem}
.recent-list{list-style:none;padding:0}
.recent-list li{border-bottom:1px solid #e0dbcf;padding:.5rem 0;display:flex;justify-content:space-between;align-items:center}
.recent-list a{text-decoration:none;color:#2b2a28}
.recent-date{font-size:.7rem;color:#5f5d59}
.actions a{margin-right:.5rem}
.contributor-item{background:#f9f5ef;padding:.8rem;margin-bottom:.5rem;border-radius:.5rem;display:flex;gap:.5rem;align-items:center;flex-wrap:wrap}
.contributor-item select,.contributor-item input{flex:2;margin:0}
.contributor-item button{flex:0 0 auto}
.hidden{display:none}
</style>
</head>
<body>
<div class="container">
<div id="admin-app">
<div id="admin-login" class="login-card contact-card">
<h2>Admin Login</h2>
<p id="login-error" class="error hidden"></p>
<input type="password" id="admin-password" placeholder="Enter password">
<button class="btn primary" onclick="adminLogin()">Login</button>
</div>
<div id="admin-panel" class="hidden admin-container">
<div class="admin-nav">
<a href="#" onclick="adminLogout()" class="btn secondary btn-sm">Logout</a>
<a href="/" class="btn secondary btn-sm">View Site</a>
</div>
<div id="admin-content"></div>
</div>
</div>
</div>
<script src="/admin.js"></script>
</body>
</html>`;

const PAGE_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>The Alcove | quiet, intentional development</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
<link rel="stylesheet" href="/style.css">
</head>
<body>
<div class="container">
<nav class="navbar">
<div class="logo"><span class="mono">[</span> The Alcove <span class="mono">]</span></div>
<button class="menu-toggle" aria-label="Toggle navigation"><span></span><span></span><span></span></button>
<div class="nav-links">
<a href="/" class="nav-home">home</a>
<a href="/portfolio" class="nav-portfolio">portfolio</a>
<a href="/projects" class="nav-projects">projects</a>
<a href="/#contact">contact</a>
</div>
<button id="darkModeToggle" class="dark-mode-toggle" aria-label="Toggle dark mode"><i class="fas fa-moon"></i></button>
</nav>
<main id="page-content"></main>
<footer><p>© 2026 The Alcove – quiet, intentional development.</p></footer>
</div>
<a href="/admin" class="admin-badge"><i class="fas fa-lock"></i> admin</a>
<script src="/dark.js"></script>
<script src="/app.js"></script>
</body>
</html>`;

const MEMBER_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>MEMBER_NAME · Alcove</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
<link rel="stylesheet" href="/style.css">
<style>
.skill-item{margin-bottom:1rem}.skill-name{font-weight:600;display:block}.skill-bar{background:#e0dbcf;border-radius:2rem;height:.5rem;width:100%;overflow:hidden}.skill-progress{background:#c2a25b;height:100%;border-radius:2rem;width:0%}.contact-links{display:flex;gap:1.5rem;justify-content:center;flex-wrap:wrap;margin-top:1rem}.contact-links a{color:#2b2a28;text-decoration:none;border:1px solid #e0dbcf;padding:.5rem 1rem;border-radius:2rem;transition:all .2s}.contact-links a:hover{background:#c2a25b10;border-color:#c2a25b}.grid-2col{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1.5rem}hr{margin:2rem 0;border:0;height:1px;background:#e0dbcf}.skill-tags{display:flex;flex-wrap:wrap;gap:.3rem;margin-top:.5rem}.tag{background:#e8e2d4;padding:.2rem .6rem;border-radius:1rem;font-size:.7rem;color:#5f5d59}.projects-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1.5rem;margin:1rem 0}.project-card{background:white;border:1px solid #e0dbcf;border-radius:1rem;padding:1rem}.project-tag{display:inline-block;background:#e8e2d4;font-size:.7rem;padding:.2rem .6rem;border-radius:1rem;margin:.5rem 0}
</style>
</head>
<body>
<div class="container">
<nav class="navbar">
<div class="logo"><span class="mono">[</span> The Alcove <span class="mono">]</span></div>
<button class="menu-toggle" aria-label="Toggle navigation"><span></span><span></span><span></span></button>
<div class="nav-links">
<a href="/">home</a>
<a href="/portfolio">portfolio</a>
<a href="/projects">projects</a>
<a href="/#contact">contact</a>
</div>
<button id="darkModeToggle" class="dark-mode-toggle" aria-label="Toggle dark mode"><i class="fas fa-moon"></i></button>
</nav>
<div id="member-content"></div>
<footer><p>© 2026 The Alcove – quiet, intentional development.</p></footer>
</div>
<script>window.MEMBER_SLUG = "MEMBER_SLUG_PLACEHOLDER";</script>
<script src="/dark.js"></script>
<script src="/app.js"></script>
</body>
</html>`;

const NOT_FOUND_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Page Not Found · Alcove</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
<link rel="stylesheet" href="/style.css">
</head>
<body>
<div class="container">
<nav class="navbar">
<div class="logo"><span class="mono">[</span> The Alcove <span class="mono">]</span></div>
<button class="menu-toggle" aria-label="Toggle navigation"><span></span><span></span><span></span></button>
<div class="nav-links">
<a href="/">home</a><a href="/portfolio">portfolio</a><a href="/projects">projects</a><a href="/#contact">contact</a>
</div>
<button id="darkModeToggle" class="dark-mode-toggle" aria-label="Toggle dark mode"><i class="fas fa-moon"></i></button>
</nav>
<section class="hero" style="text-align:center;margin:4rem 0;">
<h1>404</h1><p>Page not found.</p><a href="/" class="btn primary">Go home →</a>
</section>
<footer><p>© 2026 The Alcove – quiet, intentional development.</p></footer>
</div>
<script src="/dark.js"></script>
</body>
</html>`;

async function getMemberDetails(db, memberId) {
  const member = await db.prepare('SELECT * FROM members WHERE id = ?').bind(memberId).first();
  if (!member) return null;
  const { results: skills } = await db.prepare('SELECT skill_name as name, percent, tags FROM member_skills WHERE member_id = ?').bind(memberId).all();
  member.skills = skills.map(s => ({ name: s.name, percent: s.percent, tags: safeParse(s.tags) || [] }));
  const { results: certs } = await db.prepare('SELECT cert_name as name FROM member_certifications WHERE member_id = ?').bind(memberId).all();
  member.certifications = certs.map(c => c.name);
  const { results: offerings } = await db.prepare('SELECT title, description, icon FROM member_offerings WHERE member_id = ?').bind(memberId).all();
  member.offerings = offerings.map(o => ({ title: o.title, desc: o.description, icon: o.icon }));
  return member;
}

async function getProjectsWithContributors(db) {
  const { results: projects } = await db.prepare('SELECT * FROM projects ORDER BY id DESC').all();
  const result = [];
  for (const proj of projects) {
    const tags = safeParse(proj.tags) || [];
    const duration = safeParse(proj.duration) || {};
    const { results: contributors } = await db.prepare(
      `SELECT pc.role_tag, m.slug as member_slug, m.name
       FROM project_contributors pc
       JOIN members m ON pc.member_id = m.id
       WHERE pc.project_id = ?`
    ).bind(proj.id).all();
    result.push({
      id: proj.id,
      title: proj.title,
      description: proj.description,
      tags,
      duration,
      contributors: contributors.map(c => ({ member_slug: c.member_slug, tag: c.role_tag })),
    });
  }
  return result;
}

function transformProject(project) {
  const contributors = project.contributors || [];
  const kaidoTags = contributors.filter(c => c.member_slug === 'kaido').map(c => c.tag);
  const camTags = contributors.filter(c => c.member_slug === 'cams').map(c => c.tag);
  return {
    name: project.title,
    description: project.description,
    contributors: contributors.map(c => c.member_slug),
    contributorDetails: contributors.map(c => ({ member_slug: c.member_slug, tag: c.tag })),
    kaidoTags,
    camTags,
    duration: project.duration || {},
    tags: project.tags || [],
    id: project.id,
  };
}

async function handleApi(path, method, request, env, db) {
  const apiPath = path.replace('/api/', '');

  if (apiPath === 'auth/login' && method === 'POST') {
    const body = await request.text();
    const { password } = parseForm(body);
    if (!password) return json({ error: 'Password required' }, 400);
    const valid = await verifyPassword(password, env.ADMIN_PASSWORD_HASH);
    if (!valid) return json({ error: 'Invalid password' }, 401);
    const token = await createToken({ isAdmin: true }, env.SESSION_SECRET);
    return json({ token }, 200);
  }

  if (apiPath === 'auth/verify' && method === 'GET') {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) return json({ valid: false }, 401);
    const payload = await verifyToken(token, env.SESSION_SECRET);
    return json({ valid: !!payload });
  }

  async function requireAuth() {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) return null;
    return verifyToken(token, env.SESSION_SECRET);
  }

  if (apiPath === 'members' && method === 'GET') {
    const { results } = await db.prepare('SELECT id, slug, name, role, bio, email, discord, experience_years, profile_pic, github, twitter, created_at FROM members ORDER BY id').all();
    return json(results);
  }

  if (apiPath === 'projects' && method === 'GET') {
    const projects = await getProjectsWithContributors(db);
    return json(projects.map(transformProject));
  }

  const memberMatch = apiPath.match(/^member\/(.+)$/);
  if (memberMatch && method === 'GET') {
    const slug = decodeURIComponent(memberMatch[1]);
    const memberRow = await db.prepare('SELECT id FROM members WHERE slug = ?').bind(slug).first();
    if (!memberRow) return json({ error: 'Member not found' }, 404);
    const member = await getMemberDetails(db, memberRow.id);
    const allProjects = await getProjectsWithContributors(db);
    const memberProjects = allProjects
      .filter(p => p.contributors.some(c => c.member_slug === slug))
      .map(transformProject);
    return json({ member, projects: memberProjects });
  }

  if (apiPath === 'admin/dashboard' && method === 'GET') {
    const auth = await requireAuth();
    if (!auth) return json({ error: 'Unauthorized' }, 401);
    const memberCount = await db.prepare('SELECT COUNT(*) as count FROM members').first();
    const projectCount = await db.prepare('SELECT COUNT(*) as count FROM projects').first();
    const { results: recentMembers } = await db.prepare('SELECT id, name, slug, created_at FROM members ORDER BY id DESC LIMIT 5').all();
    const { results: recentProjects } = await db.prepare('SELECT id, title, created_at FROM projects ORDER BY id DESC LIMIT 5').all();
    return json({ memberCount: memberCount.count, projectCount: projectCount.count, recentMembers, recentProjects });
  }

  if (apiPath === 'admin/members' && method === 'GET') {
    const auth = await requireAuth();
    if (!auth) return json({ error: 'Unauthorized' }, 401);
    const { results } = await db.prepare('SELECT id, slug, name, role FROM members ORDER BY id').all();
    return json(results);
  }

  const adminMemberIdMatch = apiPath.match(/^admin\/members\/(\d+)$/);
  if (adminMemberIdMatch) {
    const auth = await requireAuth();
    if (!auth) return json({ error: 'Unauthorized' }, 401);
    const memberId = parseInt(adminMemberIdMatch[1]);
    if (method === 'GET') {
      const member = await getMemberDetails(db, memberId);
      if (!member) return json({ error: 'Not found' }, 404);
      return json(member);
    }
    if (method === 'DELETE') {
      await db.prepare('DELETE FROM members WHERE id = ?').bind(memberId).run();
      return json({ success: true });
    }
  }

  if (apiPath === 'admin/members' && method === 'POST') {
    const auth = await requireAuth();
    if (!auth) return json({ error: 'Unauthorized' }, 401);
    const body = await request.text();
    const data = parseForm(body);
    let skills = [], certifications = [], offerings = [];
    try { skills = JSON.parse(data.skills || '[]'); } catch {}
    try { certifications = JSON.parse(data.certifications || '[]'); } catch {}
    try { offerings = JSON.parse(data.offerings || '[]'); } catch {}
    if (!data.slug || !data.name) return json({ error: 'Slug and Name are required' }, 400);

    let memberId;
    if (data.id) {
      memberId = parseInt(data.id);
      await db.prepare('UPDATE members SET slug=?, name=?, role=?, bio=?, email=?, discord=?, experience_years=? WHERE id=?')
        .bind(data.slug, data.name, data.role || '', data.bio || '', data.email || '', data.discord || '', parseInt(data.experience_years) || null, memberId).run();
    } else {
      const result = await db.prepare('INSERT INTO members (slug, name, role, bio, email, discord, experience_years) VALUES (?,?,?,?,?,?,?)')
        .bind(data.slug, data.name, data.role || '', data.bio || '', data.email || '', data.discord || '', parseInt(data.experience_years) || null).run();
      memberId = result.meta.last_row_id;
    }
    await db.prepare('DELETE FROM member_skills WHERE member_id = ?').bind(memberId).run();
    await db.prepare('DELETE FROM member_certifications WHERE member_id = ?').bind(memberId).run();
    await db.prepare('DELETE FROM member_offerings WHERE member_id = ?').bind(memberId).run();
    for (const s of skills) {
      if (s.name) await db.prepare('INSERT INTO member_skills (member_id, skill_name, percent, tags) VALUES (?,?,?,?)')
        .bind(memberId, s.name, s.percent || null, JSON.stringify(s.tags || [])).run();
    }
    for (const c of certifications) {
      if (c) await db.prepare('INSERT INTO member_certifications (member_id, cert_name) VALUES (?,?)').bind(memberId, c).run();
    }
    for (const o of offerings) {
      if (o.title) await db.prepare('INSERT INTO member_offerings (member_id, title, description, icon) VALUES (?,?,?,?)')
        .bind(memberId, o.title, o.desc || '', o.icon || '').run();
    }
    return json({ success: true, id: memberId });
  }

  if (apiPath === 'admin/projects' && method === 'GET') {
    const auth = await requireAuth();
    if (!auth) return json({ error: 'Unauthorized' }, 401);
    const { results } = await db.prepare('SELECT id, title, description FROM projects ORDER BY id DESC').all();
    return json(results);
  }

  const adminProjectIdMatch = apiPath.match(/^admin\/projects\/(\d+)$/);
  if (adminProjectIdMatch) {
    const auth = await requireAuth();
    if (!auth) return json({ error: 'Unauthorized' }, 401);
    const projectId = parseInt(adminProjectIdMatch[1]);
    if (method === 'GET') {
      const project = await db.prepare('SELECT * FROM projects WHERE id = ?').bind(projectId).first();
      if (!project) return json({ error: 'Not found' }, 404);
      project.tags = safeParse(project.tags) || [];
      project.duration = safeParse(project.duration) || {};
      const { results: contributors } = await db.prepare(
        'SELECT pc.member_id, pc.role_tag, m.name, m.slug FROM project_contributors pc JOIN members m ON pc.member_id = m.id WHERE pc.project_id = ?'
      ).bind(projectId).all();
      project.contributors = contributors.map(c => ({ member_id: c.member_id, role_tag: c.role_tag, name: c.name, slug: c.slug }));
      return json(project);
    }
    if (method === 'DELETE') {
      await db.prepare('DELETE FROM projects WHERE id = ?').bind(projectId).run();
      return json({ success: true });
    }
  }

  if (apiPath === 'admin/projects' && method === 'POST') {
    const auth = await requireAuth();
    if (!auth) return json({ error: 'Unauthorized' }, 401);
    const body = await request.text();
    const data = parseForm(body);
    let tags = [], duration = {}, contributors = [];
    try { tags = JSON.parse(data.tags || '[]'); } catch {}
    try { duration = JSON.parse(data.duration || '{}'); } catch {}
    try { contributors = JSON.parse(data.contributors || '[]'); } catch {}
    if (!data.title) return json({ error: 'Title is required' }, 400);

    let projectId;
    if (data.id) {
      projectId = parseInt(data.id);
      await db.prepare('UPDATE projects SET title=?, description=?, tags=?, duration=? WHERE id=?')
        .bind(data.title, data.description || '', JSON.stringify(tags), JSON.stringify(duration), projectId).run();
    } else {
      const result = await db.prepare('INSERT INTO projects (title, description, tags, duration) VALUES (?,?,?,?)')
        .bind(data.title, data.description || '', JSON.stringify(tags), JSON.stringify(duration)).run();
      projectId = result.meta.last_row_id;
    }
    await db.prepare('DELETE FROM project_contributors WHERE project_id = ?').bind(projectId).run();
    for (const c of contributors) {
      if (c.member_id && c.role_tag) {
        await db.prepare('INSERT INTO project_contributors (project_id, member_id, role_tag) VALUES (?,?,?)')
          .bind(projectId, c.member_id, c.role_tag).run();
      }
    }
    return json({ success: true, id: projectId });
  }

  return json({ error: 'Not found' }, 404);
}

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;
  const db = env.DB;

  if (/\.(css|js|ico|png|jpg|jpeg|svg|woff2?|ttf|eot|map)$/i.test(path)) {
    return new Response(null, { status: 404 });
  }

  if (path === '/' || path === '/portfolio' || path === '/projects') {
    return html(PAGE_HTML);
  }

  if (path === '/admin') {
    return html(ADMIN_HTML);
  }

  if (path.startsWith('/api/')) {
    return handleApi(path, method, request, env, db);
  }

  const slugMatch = path.match(/^\/([^\/]+)$/);
  if (slugMatch) {
    const slug = decodeURIComponent(slugMatch[1]);
    try {
      const memberRow = await db.prepare('SELECT name FROM members WHERE slug = ?').bind(slug).first();
      if (memberRow) {
        return html(MEMBER_HTML.replace(/MEMBER_NAME/g, memberRow.name).replace(/MEMBER_SLUG_PLACEHOLDER/g, slug));
      }
    } catch {}
    return html(NOT_FOUND_HTML, 404);
  }

  return html(NOT_FOUND_HTML, 404);
}
