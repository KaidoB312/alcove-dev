const express = require('express');
const router = express.Router();
const pool = require('../../db');

// Helper to safely parse JSON
function safeParse(jsonString) {
    try {
        return JSON.parse(jsonString);
    } catch (e) {
        return null;
    }
}

// GET /api/projects
router.get('/projects', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM projects ORDER BY id DESC');
        // Parse JSON fields for each project
        const projects = rows.map(p => ({
            ...p,
            tags: safeParse(p.tags),
            duration: safeParse(p.duration),
            contributors: safeParse(p.contributors)
        }));
        res.json(projects);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

module.exports = router;