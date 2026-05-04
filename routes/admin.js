const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('../db');
const auth = require('../middleware/auth');
require('dotenv').config();

// Helper to save member relations
async function saveMemberRelations(memberId, skills, certifications, offerings) {
    await pool.query('DELETE FROM member_skills WHERE member_id = ?', [memberId]);
    await pool.query('DELETE FROM member_certifications WHERE member_id = ?', [memberId]);
    await pool.query('DELETE FROM member_offerings WHERE member_id = ?', [memberId]);

    for (const skill of skills) {
        if (skill.name) {
            await pool.query(
                'INSERT INTO member_skills (member_id, skill_name, percent, tags) VALUES (?, ?, ?, ?)',
                [memberId, skill.name, skill.percent || null, JSON.stringify(skill.tags || [])]
            );
        }
    }

    for (const cert of certifications) {
        if (cert) {
            await pool.query('INSERT INTO member_certifications (member_id, cert_name) VALUES (?, ?)', [memberId, cert]);
        }
    }

    for (const offering of offerings) {
        if (offering.title) {
            await pool.query(
                'INSERT INTO member_offerings (member_id, title, description, icon) VALUES (?, ?, ?, ?)',
                [memberId, offering.title, offering.desc || '', offering.icon || '']
            );
        }
    }
}

// Helper to save project contributors
async function saveProjectContributors(projectId, contributors) {
    await pool.query('DELETE FROM project_contributors WHERE project_id = ?', [projectId]);
    for (const contrib of contributors) {
        if (contrib.member_id && contrib.role_tag) {
            await pool.query(
                'INSERT INTO project_contributors (project_id, member_id, role_tag) VALUES (?, ?, ?)',
                [projectId, contrib.member_id, contrib.role_tag]
            );
        }
    }
}

// Admin login page
router.get('/login', (req, res) => {
    if (req.session.user) return res.redirect('/admin/dashboard');
    res.render('admin/login');
});

router.post('/login', async (req, res) => {
    const { password } = req.body;
    const valid = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);
    if (valid) {
        req.session.user = { isAdmin: true };
        res.redirect('/admin/dashboard');
    } else {
        res.render('admin/login', { error: 'Invalid password' });
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/admin/login');
});

// Dashboard
router.get('/dashboard', auth, async (req, res) => {
    const [memberCount] = await pool.query('SELECT COUNT(*) as count FROM members');
    const [projectCount] = await pool.query('SELECT COUNT(*) as count FROM projects');
    const [recentMembers] = await pool.query('SELECT id, name, slug, created_at FROM members ORDER BY id DESC LIMIT 5');
    const [recentProjects] = await pool.query('SELECT id, title, created_at FROM projects ORDER BY id DESC LIMIT 5');
    res.render('admin/dashboard', {
        memberCount: memberCount[0].count,
        projectCount: projectCount[0].count,
        recentMembers,
        recentProjects
    });
});

// Members
router.get('/members', auth, async (req, res) => {
    const [members] = await pool.query('SELECT id, slug, name, role FROM members ORDER BY id');
    res.render('admin/members', { members });
});

router.get('/members/add', auth, (req, res) => {
    res.render('admin/member-form', { member: null });
});

router.get('/members/edit/:id', auth, async (req, res) => {
    const [rows] = await pool.query('SELECT * FROM members WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.redirect('/admin/members');
    const member = rows[0];

    const [skills] = await pool.query('SELECT skill_name as name, percent, tags FROM member_skills WHERE member_id = ?', [member.id]);
    member.skills = skills.map(s => ({
        name: s.name,
        percent: s.percent,
        tags: s.tags ? JSON.parse(s.tags) : []
    }));

    const [certs] = await pool.query('SELECT cert_name as name FROM member_certifications WHERE member_id = ?', [member.id]);
    member.certifications = certs.map(c => c.name);

    const [offerings] = await pool.query('SELECT title, description, icon FROM member_offerings WHERE member_id = ?', [member.id]);
    member.offerings = offerings.map(o => ({
        title: o.title,
        desc: o.description,
        icon: o.icon
    }));

    res.render('admin/member-form', { member });
});

router.post('/members/save', auth, async (req, res) => {
    const { id, slug, name, role, bio, email, discord, experience_years, skills, certifications, offerings } = req.body;
    let parsedSkills = [], parsedCerts = [], parsedOfferings = [];
    try {
        parsedSkills = JSON.parse(skills || '[]');
        parsedCerts = JSON.parse(certifications || '[]');
        parsedOfferings = JSON.parse(offerings || '[]');
    } catch (e) {
        return res.render('admin/member-form', { member: req.body, error: 'Invalid JSON in one of the fields.' });
    }
    if (!slug || !name) {
        return res.render('admin/member-form', { member: req.body, error: 'Slug and Name are required.' });
    }
    let memberId;
    if (id) {
        await pool.query(
            `UPDATE members SET slug=?, name=?, role=?, bio=?, email=?, discord=?, experience_years=? WHERE id=?`,
            [slug, name, role, bio, email, discord, experience_years || null, id]
        );
        memberId = id;
    } else {
        const [result] = await pool.query(
            `INSERT INTO members (slug, name, role, bio, email, discord, experience_years) VALUES (?,?,?,?,?,?,?)`,
            [slug, name, role, bio, email, discord, experience_years || null]
        );
        memberId = result.insertId;
    }
    await saveMemberRelations(memberId, parsedSkills, parsedCerts, parsedOfferings);
    res.redirect('/admin/dashboard');
});

router.get('/members/delete/:id', auth, async (req, res) => {
    await pool.query('DELETE FROM members WHERE id = ?', [req.params.id]);
    res.redirect('/admin/dashboard');
});

// Projects
router.get('/projects', auth, async (req, res) => {
    const [projects] = await pool.query('SELECT id, title, description FROM projects ORDER BY id DESC');
    res.render('admin/projects', { projects });
});

router.get('/projects/add', auth, async (req, res) => {
    const [members] = await pool.query('SELECT id, name, slug FROM members ORDER BY name');
    res.render('admin/project-form', { project: null, members, contributors: [] });
});

router.get('/projects/edit/:id', auth, async (req, res) => {
    const [rows] = await pool.query('SELECT * FROM projects WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.redirect('/admin/projects');
    const project = rows[0];
    project.tags = project.tags ? JSON.parse(project.tags) : [];
    project.duration = project.duration ? JSON.parse(project.duration) : {};

    const [contributors] = await pool.query(
        `SELECT pc.member_id, pc.role_tag, m.name, m.slug
         FROM project_contributors pc
         JOIN members m ON pc.member_id = m.id
         WHERE pc.project_id = ?`,
        [project.id]
    );
    const projectContributors = contributors.map(c => ({
        member_id: c.member_id,
        role_tag: c.role_tag,
        name: c.name,
        slug: c.slug
    }));

    const [members] = await pool.query('SELECT id, name, slug FROM members ORDER BY name');
    res.render('admin/project-form', { project, members, contributors: projectContributors });
});

router.post('/projects/save', auth, async (req, res) => {
    const { id, title, description, tags, duration, contributors } = req.body;
    if (!title) {
        const [members] = await pool.query('SELECT id, name, slug FROM members ORDER BY name');
        return res.render('admin/project-form', {
            project: req.body,
            members,
            contributors: [], // no contributors on error for new project
            error: 'Title is required.'
        });
    }
    let parsedTags = [], parsedDuration = {}, parsedContributors = [];
    try {
        parsedTags = JSON.parse(tags || '[]');
        parsedDuration = JSON.parse(duration || '{}');
        parsedContributors = JSON.parse(contributors || '[]');
    } catch (e) {
        const [members] = await pool.query('SELECT id, name, slug FROM members ORDER BY name');
        return res.render('admin/project-form', {
            project: req.body,
            members,
            contributors: parsedContributors, // preserve entered contributors
            error: 'Invalid JSON in one of the fields.'
        });
    }
    let projectId;
    if (id) {
        await pool.query(
            `UPDATE projects SET title=?, description=?, tags=?, duration=? WHERE id=?`,
            [title, description, JSON.stringify(parsedTags), JSON.stringify(parsedDuration), id]
        );
        projectId = id;
    } else {
        const [result] = await pool.query(
            `INSERT INTO projects (title, description, tags, duration) VALUES (?,?,?,?)`,
            [title, description, JSON.stringify(parsedTags), JSON.stringify(parsedDuration)]
        );
        projectId = result.insertId;
    }
    await saveProjectContributors(projectId, parsedContributors);
    res.redirect('/admin/dashboard');
});

router.get('/projects/delete/:id', auth, async (req, res) => {
    await pool.query('DELETE FROM projects WHERE id = ?', [req.params.id]);
    res.redirect('/admin/dashboard');
});

module.exports = router;