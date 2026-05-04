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

// GET /api/members
router.get('/members', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM members ORDER BY id');
        // Parse JSON fields for each member (if needed)
        const members = rows.map(m => ({
            ...m,
            skills: safeParse(m.skills),
            certifications: safeParse(m.certifications),
            offerings: safeParse(m.offerings)
        }));
        res.json(members);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

module.exports = router;