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

async function seedData(db) {
  const J = JSON.stringify;

  await db.prepare(`INSERT OR IGNORE INTO members (id, slug, name, role, bio, email, discord, experience_years) VALUES (1,'kaido','Kaido / Jay','Web Developer & General Manager','I''m a Web Developer and General Manager from the US. With almost 5 years of experience, I specialize in Web Design, Project Management, and Human Resources. My goal is to ensure all projects run as well as possible for my business and yours.','kaidob312@gmail.com','https://discord.gg/mSASEN8gmk',5)`).run();
  await db.prepare(`INSERT OR IGNORE INTO members (id, slug, name, role, bio, email, discord, experience_years) VALUES (2,'cams','Cam M','Systems Administrator & General Manager','I''m a Systems Administrator and General Manager from the US, passionate about my work. With over 5 years of experience in IT, I specialize in network administration, server management, and technical support. My goal is to ensure all systems run smoothly so your business can focus on what it does best.','cam@camyzed.dev','https://discord.com/users/cammyze',5)`).run();

  const kaidoSkills = [{name:'Systems Administration',percent:50,tags:['Linux','Windows','Networking']},{name:'Adobe Creative Suite',percent:90,tags:['Photoshop','Illustrator','Premiere Pro']},{name:'Web Development',percent:85,tags:['HTML/CSS','JavaScript','Responsive']},{name:'Node.js',percent:65,tags:['Discord.js','Express']}];
  const kaidoCerts = ['Adobe Certified Content Creation and Marketing Using Adobe Express','Adobe Certified Graphic Design and Illustration using Adobe Illustrator','Adobe Certified Professional in Marketing Design','Adobe Certified Professional in Web Design','Adobe Certified Visual Design using Adobe Photoshop','Adobe Certified Web Authoring using Adobe Dreamweaver'];
  const kaidoOfferings = [{title:'Creative Design',desc:'Logos, branding, video production, and presentations that tell your story.',icon:'palette'},{title:'Web Development',desc:'Responsive, accessible websites built with modern HTML/CSS and JavaScript.',icon:'code'},{title:'Project Management',desc:'Keep projects on track, teams aligned, and goals achieved.',icon:'chalkboard-user'}];
  const camSkills = [{name:'Systems Administration',percent:79,tags:['Linux','Windows','Networking','Security','Automation']},{name:'Pterodactyl Framework',percent:90,tags:['Wings','Node Balancing','Custom Addons']},{name:'NodeJS',percent:82,tags:['Discord.js','Express','Socket.io']},{name:'Human Resources',percent:64,tags:['Hiring','Training','Team Management']},{name:'Customer Service',percent:60,tags:['Communication','Problem Solving','Empathy']}];
  const camOfferings = [{title:'IT Management',desc:'Systems administration, monitoring, and automation for reliable infrastructure.',icon:'server'},{title:'Minecraft Hosting',desc:'Pterodactyl setup, custom Wings, node balancing, and plugin development.',icon:'cubes'},{title:'Team Leadership',desc:'Hiring, training, conflict resolution, and performance management.',icon:'users'}];

  for (const s of kaidoSkills) await db.prepare(`INSERT OR IGNORE INTO member_skills (member_id, skill_name, percent, tags) VALUES (1,?,?,?)`).bind(s.name, s.percent, J(s.tags)).run();
  for (const c of kaidoCerts) await db.prepare(`INSERT OR IGNORE INTO member_certifications (member_id, cert_name) VALUES (1,?)`).bind(c).run();
  for (const o of kaidoOfferings) await db.prepare(`INSERT OR IGNORE INTO member_offerings (member_id, title, description, icon) VALUES (1,?,?,?)`).bind(o.title, o.desc, o.icon).run();
  for (const s of camSkills) await db.prepare(`INSERT OR IGNORE INTO member_skills (member_id, skill_name, percent, tags) VALUES (2,?,?,?)`).bind(s.name, s.percent, J(s.tags)).run();
  for (const o of camOfferings) await db.prepare(`INSERT OR IGNORE INTO member_offerings (member_id, title, description, icon) VALUES (2,?,?,?)`).bind(o.title, o.desc, o.icon).run();

  const projects = [
    {id:1,t:'CreateNow',d:'Hosting and development company where we collaborated on customer support, marketing, and infrastructure.',g:['Marketing','Support','Systems Admin'],dur:{kaido:'Dec 2023 – May 2024',cams:'Dec 2023 – May 2024'},con:[{s:'kaido',r:'Marketing & Support'},{s:'cams',r:'Systems Admin'}]},
    {id:2,t:'CloudyNodes',d:'Node hosting platform – combined efforts in system reliability and user assistance.',g:['Customer Support','Systems Admin'],dur:{kaido:'Nov 2024 – Jan 2025',cams:'Sep 2024 – Jan 2025'},con:[{s:'kaido',r:'Customer Support'},{s:'cams',r:'Systems Admin'}]},
    {id:3,t:'MineStudio',d:'Minecraft hosting and services – managing teams, marketing campaigns, and technical development.',g:['Marketing','Management','Development'],dur:{kaido:'Jan 2025 – Mar 2025',cams:'Dec 2024 – June 2025'},con:[{s:'kaido',r:'Marketing'},{s:'cams',r:'General Manager & Dev'}]},
    {id:4,t:'The Void Bot',d:'A multi‑purpose Discord bot used by thousands of servers – built and maintained together.',g:['Discord.js','Node.js'],dur:{kaido:'Finished',cams:'Finished'},con:[{s:'kaido',r:'Discord.js Developer'},{s:'cams',r:'Developer'}]},
    {id:5,t:'Discord Mail',d:'Ticket system for Discord communities, with seamless support workflows.',g:['Discord.js','Node.js','Support'],dur:{kaido:'Finished',cams:'Finished'},con:[{s:'kaido',r:'Developer'},{s:'cams',r:'Systems Integration'}]},
    {id:6,t:'Alcove.dev',d:'This very site – crafted with a lofi aesthetic and powered by clean code.',g:['Web Design','Frontend'],dur:{kaido:'Ongoing'},con:[{s:'kaido',r:'Design & Frontend'}]},
    {id:7,t:'Magazine Covers & Logos',d:'Designed professional magazine covers and brand logos for various clients using Photoshop and Illustrator.',g:['Graphic Design','Branding'],dur:{kaido:'Ongoing'},con:[{s:'kaido',r:'Graphic Design & Branding'}]},
    {id:8,t:'Video Production',d:'Edited and produced promotional videos, tutorials, and short films with Premiere Pro.',g:['Video Editing','Premiere Pro'],dur:{kaido:'Ongoing'},con:[{s:'kaido',r:'Video Production'}]},
    {id:9,t:'Website Development (Freelance)',d:'Built responsive websites using Adobe Dreamweaver and custom HTML/CSS for various clients.',g:['Web Design','HTML/CSS','Dreamweaver'],dur:{kaido:'2022–Present'},con:[{s:'kaido',r:'Web Development'}]},
    {id:10,t:'Presentations & Content',d:'Created visually engaging presentations and slide decks for business and educational use.',g:['Presentation Design','Google Slides','PowerPoint'],dur:{kaido:'2022–Present'},con:[{s:'kaido',r:'Presentation Design'}]},
    {id:11,t:'Datapad (Discord Bot)',d:'Utility bot with data management and automation features for Discord communities.',g:['Discord.js','Automation'],dur:{kaido:'2025'},con:[{s:'kaido',r:'Discord Bot Developer'}]},
    {id:12,t:'Penguin Licensing',d:'License management bot for Discord communities.',g:['Discord Bot','License System'],dur:{cams:'2025'},con:[{s:'cams',r:'Discord Bot Developer'}]},
    {id:13,t:'Atzin License System',d:'Advanced license verification and management bot.',g:['Discord Bot','License System'],dur:{cams:'2025'},con:[{s:'cams',r:'Discord Bot Developer'}]},
    {id:14,t:'Cloud Licensing System',d:'Cloud-based license handling with automated checks.',g:['Discord Bot','License System'],dur:{cams:'2025'},con:[{s:'cams',r:'Discord Bot Developer'}]},
    {id:15,t:'Discord Wemix Verification',d:'Custom verification system for Discord communities.',g:['Discord Bot','Verification'],dur:{cams:'2025'},con:[{s:'cams',r:'Discord Bot Developer'}]},
    {id:16,t:'System Automation (Pterodactyl)',d:'Automated node balancing and Wings optimization for Pterodactyl panels.',g:['Pterodactyl','Automation'],dur:{cams:'2024–Present'},con:[{s:'cams',r:'Pterodactyl Automation'}]},
    {id:17,t:'Minestom GUI API',d:'GUI framework for Minestom servers.',g:['Minestom','API Development'],dur:{cams:'2024'},con:[{s:'cams',r:'Minestom Developer'}]},
    {id:18,t:'Minestom Tubes / CraftingStore Hook',d:'Integration with CraftingStore for Minestom servers.',g:['Minestom','Integration'],dur:{cams:'2024'},con:[{s:'cams',r:'Minestom Developer'}]},
    {id:19,t:'Control Center',d:'Minecraft plugin with extensive administration controls.',g:['Minecraft Plugin','Administration'],dur:{cams:'2023–2024'},con:[{s:'cams',r:'Plugin Developer'}]},
  ];

  const slugToId = { kaido: 1, cams: 2 };
  for (const p of projects) {
    await db.prepare(`INSERT OR IGNORE INTO projects (id, title, description, tags, duration) VALUES (?,?,?,?,?)`).bind(p.id, p.t, p.d, J(p.g), J(p.dur)).run();
    for (const c of p.con) {
      const mid = slugToId[c.s];
      if (mid) await db.prepare(`INSERT OR IGNORE INTO project_contributors (project_id, member_id, role_tag) VALUES (?,?,?)`).bind(p.id, mid, c.r).run();
    }
  }
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

  const count = await db.prepare('SELECT COUNT(*) as c FROM members').first();
  if (count && count.c === 0) {
    await seedData(db);
  }

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
