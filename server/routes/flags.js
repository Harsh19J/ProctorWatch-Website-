const express = require('express');
const { ObjectId } = require('mongodb');
const { getDB } = require('../db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();
function toId(id) { try { return new ObjectId(id); } catch { return id; } }

// ── GET /api/flags ─────────────────────────────────────────────────────────────
router.get('/', requireAuth, async (req, res) => {
    try {
        const db = getDB();
        const { user } = req;
        const { severity, reviewed, course_id, test_id, limit = 200 } = req.query;

        // Step 1: Resolve allowed session IDs for teachers
        let allowedSessionIds = null;

        if (user.role === 'teacher') {
            const courses = await db.collection('courses')
                .find({ teacher_id: user.id }, { projection: { _id: 1 } }).toArray();

            if (!courses.length) return res.json([]);

            const courseIds = courses.map(c => c._id.toString());
            const tests = await db.collection('tests')
                .find({ course_id: { $in: courseIds } }, { projection: { _id: 1 } }).toArray();

            if (!tests.length) return res.json([]);

            const testIds = tests.map(t => t._id.toString());
            const sessions = await db.collection('exam_sessions')
                .find({ test_id: { $in: testIds } }, { projection: { _id: 1 } }).toArray();

            allowedSessionIds = sessions.map(s => s._id.toString());
            if (!allowedSessionIds.length) return res.json([]);
        }

        // Step 2: Build flags query
        const query = {};
        if (allowedSessionIds) query.session_id = { $in: allowedSessionIds };

        // Course/test filter
        if (test_id && test_id !== 'all') {
            const sessions = await db.collection('exam_sessions')
                .find({ test_id }, { projection: { _id: 1 } }).toArray();
            const ids = sessions.map(s => s._id.toString());
            query.session_id = ids.length ? { $in: ids } : { $in: ['__none__'] };
        } else if (course_id && course_id !== 'all') {
            const courseTests = await db.collection('tests')
                .find({ course_id }, { projection: { _id: 1 } }).toArray();
            const testIds = courseTests.map(t => t._id.toString());
            const sessions = await db.collection('exam_sessions')
                .find({ test_id: { $in: testIds } }, { projection: { _id: 1 } }).toArray();
            const ids = sessions.map(s => s._id.toString());
            query.session_id = ids.length ? { $in: ids } : { $in: ['__none__'] };
        }

        // Severity filter
        if (severity === 'red') query.severity = { $in: ['high', 'RED'] };
        else if (severity === 'orange') query.severity = { $in: ['medium', 'ORANGE', 'YELLOW'] };
        else if (severity === 'escalated') query.review_action = 'escalate';
        else if (severity === 'unreviewed') query.reviewed = false;

        if (reviewed === 'true') query.reviewed = true;
        if (reviewed === 'false') query.reviewed = false;

        const flags = await db.collection('flags')
            .find(query)
            .sort({ timestamp: -1 })
            .limit(parseInt(limit))
            .toArray();

        // Denormalize session → test info
        const sessionIds = [...new Set(flags.map(f => f.session_id))];
        const sessions = await db.collection('exam_sessions')
            .find({ _id: { $in: sessionIds.map(id => toId(id)) } })
            .toArray();
        const sessionMap = Object.fromEntries(sessions.map(s => [s._id.toString(), s]));

        const testIds2 = [...new Set(sessions.map(s => s.test_id))];
        const tests = await db.collection('tests')
            .find({ _id: { $in: testIds2.map(id => toId(id)) } },
                { projection: { title: 1, course_id: 1 } })
            .toArray();
        const testMap = Object.fromEntries(tests.map(t => [t._id.toString(), t]));

        const enriched = flags.map(f => {
            const session = sessionMap[f.session_id] || {};
            const test = testMap[session.test_id] || {};
            return {
                ...f,
                id: f._id.toString(),
                // Matches existing frontend shape for FlagReview.jsx
                exam_sessions: {
                    student_id: session.student_id,
                    test_id: session.test_id,
                    tests: { title: test.title, course_id: test.course_id },
                },
            };
        });

        res.json(enriched);
    } catch (err) {
        console.error('[flags GET]', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ── PATCH /api/flags/:id ───────────────────────────────────────────────────────
router.patch('/:id', requireAuth, async (req, res) => {
    try {
        const db = getDB();
        const { reviewed, review_action, review_notes } = req.body;

        await db.collection('flags').updateOne(
            { _id: toId(req.params.id) },
            { $set: { reviewed, review_action, review_notes, reviewed_at: new Date(), reviewed_by: req.user.id } }
        );

        // Handle session invalidation
        if (review_action === 'invalidate' && req.user.role === 'admin') {
            const flag = await db.collection('flags').findOne({ _id: toId(req.params.id) });
            if (flag) {
                await db.collection('exam_sessions').updateOne(
                    { _id: toId(flag.session_id) },
                    { $set: { status: 'invalidated', score: 0, ended_at: new Date() } }
                );
                await db.collection('audit_logs').insertOne({
                    action: 'EXAM_INVALIDATED',
                    user_id: req.user.id,
                    details: { session_id: flag.session_id, reason: review_notes, flag_id: req.params.id },
                    created_at: new Date(),
                });
            }
        }

        res.json({ ok: true });
    } catch (err) {
        console.error('[flags PATCH]', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ── GET /api/flags/courses ─────────────────────────────────────────────────────
router.get('/filter/courses', requireAuth, async (req, res) => {
    try {
        const db = getDB();
        const { user } = req;
        let query = { is_active: true };
        if (user.role === 'teacher') query.teacher_id = user.id;
        const courses = await db.collection('courses')
            .find(query, { projection: { name: 1 } }).toArray();
        res.json(courses.map(c => ({ ...c, id: c._id.toString() })));
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
