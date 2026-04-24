const express = require('express');
const { ObjectId } = require('mongodb');
const { getDB } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// ── GET /api/questions ─────────────────────────────────────────────────────────
// Returns all questions visible to the requesting user (for question bank modal)
router.get('/', requireAuth, async (req, res) => {
    try {
        const db = getDB();
        const { q, tags, test_id } = req.query;
        const filter = {};

        if (q) filter.text = { $regex: q, $options: 'i' };
        if (tags) filter.bank_tags = { $in: tags.split(',') };
        if (test_id) {
            // Get question IDs for this test via junction table
            const testQs = await db.collection('test_questions')
                .find({ test_id }).toArray();
            const qIds = testQs.map(tq => new ObjectId(tq.question_id));
            filter._id = { $in: qIds };
        }

        const questions = await db.collection('questions')
            .find(filter)
            .sort({ created_at: -1 })
            .limit(500)
            .toArray();

        res.json(questions.map(q => ({ ...q, id: q._id.toString() })));
    } catch (err) {
        console.error('[questions GET]', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
