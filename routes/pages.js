const express = require('express');
const router = express.Router();
const pool = require('../db');

// Helper to safely parse JSON, returns array if valid
function safeParseTags(tags) {
    if (!tags) return [];
    if (Array.isArray(tags)) return tags;
    if (typeof tags === 'string') {
        try {
            const parsed = JSON.parse(tags);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            return [];
        }
    }
    return [];
}

// Helper to get member details from relational tables
async function getMemberDetails(memberId) {
    const [memberRows] = await pool.query('SELECT * FROM members WHERE id = ?', [memberId]);
    if (memberRows.length === 0) return null;
    const member = memberRows[0];

    // Skills – parse tags safely
    const [skills] = await pool.query('SELECT skill_name as name, percent, tags FROM member_skills WHERE member_id = ?', [memberId]);
    member.skills = skills.map(skill => ({
        name: skill.name,
        percent: skill.percent,
        tags: safeParseTags(skill.tags)
    }));

    // Certifications
    const [certs] = await pool.query('SELECT cert_name as name FROM member_certifications WHERE member_id = ?', [memberId]);
    member.certifications = certs.map(c => c.name);

    // Offerings
    const [offerings] = await pool.query('SELECT title, description, icon FROM member_offerings WHERE member_id = ?', [memberId]);
    member.offerings = offerings;

    return member;
}

// Helper to get projects with contributors
async function getProjectsWithContributors() {
    const [projects] = await pool.query('SELECT * FROM projects ORDER BY id DESC');
    const projectsWithContributors = [];
    for (const proj of projects) {
        const tags = proj.tags ? safeParseTags(proj.tags) : [];
        const duration = proj.duration ? (typeof proj.duration === 'string' ? JSON.parse(proj.duration) : proj.duration) : {};
        const [contributors] = await pool.query(
            `SELECT pc.role_tag, m.slug as member_slug, m.name
             FROM project_contributors pc
             JOIN members m ON pc.member_id = m.id
             WHERE pc.project_id = ?`,
            [proj.id]
        );
        projectsWithContributors.push({
            id: proj.id,
            title: proj.title,
            description: proj.description,
            tags,
            duration,
            contributors: contributors.map(c => ({ member_slug: c.member_slug, tag: c.role_tag })),
        });
    }
    return projectsWithContributors;
}

// Transform project for frontend
function transformProject(project) {
    const contributors = project.contributors || [];
    const contributorDetails = contributors.map(c => ({ member_slug: c.member_slug, tag: c.tag }));
    const kaidoTags = contributors.filter(c => c.member_slug === 'kaido').map(c => c.tag);
    const camTags = contributors.filter(c => c.member_slug === 'cams').map(c => c.tag);
    return {
        name: project.title,
        description: project.description,
        contributors: contributors.map(c => c.member_slug),
        contributorDetails,
        kaidoTags,
        camTags,
        duration: project.duration || {},
        tags: project.tags || [],
        id: project.id
    };
}

// Homepage
router.get('/', async (req, res) => {
    try {
        const projects = await getProjectsWithContributors();
        const transformed = projects.map(transformProject);
        res.render('index', { projects: transformed });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Portfolio (team listing)
router.get('/portfolio', async (req, res) => {
    try {
        const [members] = await pool.query('SELECT id, slug, name, role, bio FROM members ORDER BY id');
        res.render('portfolio', { members });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Projects page
router.get('/projects', async (req, res) => {
    try {
        const projects = await getProjectsWithContributors();
        const transformed = projects.map(transformProject);
        res.render('projects', { projects: transformed });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Dynamic member page
router.get('/:slug', async (req, res) => {
    const slug = req.params.slug;
    try {
        const [memberRows] = await pool.query('SELECT id FROM members WHERE slug = ?', [slug]);
        if (memberRows.length === 0) return res.status(404).render('404');
        const memberId = memberRows[0].id;

        const member = await getMemberDetails(memberId);
        if (!member) return res.status(404).render('404');

        const allProjects = await getProjectsWithContributors();
        const memberProjects = allProjects.filter(proj =>
            proj.contributors.some(c => c.member_slug === slug)
        ).map(transformProject);

        res.render('member', { member, projects: memberProjects });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

module.exports = router;