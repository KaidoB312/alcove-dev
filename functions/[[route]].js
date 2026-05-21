function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function verifyPassword(password, storedHash) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex === (storedHash || '').trim();
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

export async function onRequest(context) {
  try {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;
  const db = env.DB;

  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS members (id INTEGER PRIMARY KEY AUTOINCREMENT, slug TEXT UNIQUE NOT NULL, name TEXT NOT NULL, role TEXT, bio TEXT, email TEXT, discord TEXT, experience_years INTEGER DEFAULT NULL, profile_pic TEXT DEFAULT NULL, github TEXT DEFAULT NULL, twitter TEXT DEFAULT NULL, created_at TEXT DEFAULT (datetime('now')))`),
    db.prepare(`CREATE TABLE IF NOT EXISTS projects (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL UNIQUE, description TEXT, tags TEXT, duration TEXT, created_at TEXT DEFAULT (datetime('now')))`),
    db.prepare(`CREATE TABLE IF NOT EXISTS member_skills (id INTEGER PRIMARY KEY AUTOINCREMENT, member_id INTEGER NOT NULL, skill_name TEXT NOT NULL, percent INTEGER DEFAULT NULL, tags TEXT, UNIQUE(member_id, skill_name), FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE)`),
    db.prepare(`CREATE TABLE IF NOT EXISTS member_certifications (id INTEGER PRIMARY KEY AUTOINCREMENT, member_id INTEGER NOT NULL, cert_name TEXT NOT NULL, UNIQUE(member_id, cert_name), FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE)`),
    db.prepare(`CREATE TABLE IF NOT EXISTS member_offerings (id INTEGER PRIMARY KEY AUTOINCREMENT, member_id INTEGER NOT NULL, title TEXT NOT NULL, description TEXT, icon TEXT, FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE)`),
    db.prepare(`CREATE TABLE IF NOT EXISTS project_contributors (project_id INTEGER NOT NULL, member_id INTEGER NOT NULL, role_tag TEXT, PRIMARY KEY (project_id, member_id), FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE, FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE)`),
    db.prepare(`CREATE INDEX IF NOT EXISTS idx_member_skills_member_id ON member_skills(member_id)`),
    db.prepare(`CREATE INDEX IF NOT EXISTS idx_member_certs_member_id ON member_certifications(member_id)`),
    db.prepare(`CREATE INDEX IF NOT EXISTS idx_member_offerings_member_id ON member_offerings(member_id)`),
    db.prepare(`CREATE INDEX IF NOT EXISTS idx_project_contributors_project_id ON project_contributors(project_id)`),
    db.prepare(`CREATE INDEX IF NOT EXISTS idx_project_contributors_member_id ON project_contributors(member_id)`),
  ]);

  if (!path.startsWith('/api/')) {
    return json({ error: 'Not found' }, 404);
  }

  const apiPath = path.replace('/api/', '');

  async function requireAuth() {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) return null;
    return verifyToken(token, env.SESSION_SECRET);
  }

  // --- Auth ---
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

  // --- Public API ---
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

  // --- Admin API ---
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
  } catch (e) {
    return json({ error: 'Internal server error: ' + (e.message || 'unknown') }, 500);
  }
}
