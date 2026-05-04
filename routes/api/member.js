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

// GET /api/member/:slug
router.get('/member/:slug', async (req, res) => {
    const { slug } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM members WHERE slug = ?', [slug]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Member not found' });
        }
        const member = rows[0];
        // Parse JSON fields
        member.skills = safeParse(member.skills);
        member.certifications = safeParse(member.certifications);
        member.offerings = safeParse(member.offerings);
        res.json(member);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

module.exports = router;