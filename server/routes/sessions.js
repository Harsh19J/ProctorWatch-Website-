const express = require('express');
const { ObjectId } = require('mongodb');
const { getDB } = require('../db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();
function toId(id) { try { return new ObjectId(id); } catch { return id; } }

// ── GET /api/sessions ──────────────────────────────────────────────────────────
router.get('/', requireAuth, async (req, res) => {
    try {
        const db = getDB();
        const { test_id, student_id, status } = req.query;
        const query = {};

        if (test_id) query.test_id = test_id;
        if (student_id) query.student_id = student_id;
        if (status) query.status = status;

        // Students can only see their own sessions
        if (req.user.role === 'student') query.student_id = req.user.id;

        const sessions = await db.collection('exam_sessions')
            .find(query).sort({ started_at: -1 }).toArray();

        res.json(sessions.map(s => ({ ...s, id: s._id.toString() })));
    } catch (err) {
        console.error('[sessions GET]', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ── GET /api/sessions/by-test/:testId ─────────────────────────────────────────
// For TestResults page — all sessions for a test with denormalized user info
// MUST come before /:id so Express doesn't treat "by-test" as an id param
router.get('/by-test/:testId', requireAuth, async (req, res) => {
    try {
        const db = getDB();
        const testId = req.params.testId;

        const [test, sessions] = await Promise.all([
            db.collection('tests').findOne({ _id: toId(testId) }),
            db.collection('exam_sessions').find({ test_id: testId }).toArray(),
        ]);

        if (!test) return res.status(404).json({ error: 'Test not found' });

        // Attach student name
        const studentIds = [...new Set(sessions.map(s => s.student_id))];
        const students = await db.collection('users')
            .find({ _id: { $in: studentIds.map(id => toId(id)) } }, { projection: { username: 1, full_name: 1 } })
            .toArray();
        const stuMap = Object.fromEntries(students.map(u => [u._id.toString(), u]));

        // Test questions for count
        const questions = await db.collection('test_questions')
            .find({ test_id: testId }).toArray();

        // Enrollments for the course
        const enrollments = await db.collection('enrollments')
            .find({ course_id: test.course_id }).toArray();

        // Answers for all sessions
        const sessionIds = sessions.map(s => s._id.toString());
        const answers = await db.collection('answers')
            .find({ session_id: { $in: sessionIds } }).toArray();
        const answersBySession = {};
        for (const a of answers) {
            if (!answersBySession[a.session_id]) answersBySession[a.session_id] = [];
            answersBySession[a.session_id].push(a);
        }

        res.json({
            test: { ...test, id: test._id.toString() },
            sessions: sessions.map(s => ({
                ...s,
                id: s._id.toString(),
                student: stuMap[s.student_id] || null,
                answers: answersBySession[s._id.toString()] || [],
            })),
            questions,
            enrollments,
        });
    } catch (err) {
        console.error('[sessions/by-test GET]', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ── GET /api/sessions/:id ──────────────────────────────────────────────────────
router.get('/:id', requireAuth, async (req, res) => {
    try {
        const db = getDB();
        const session = await db.collection('exam_sessions').findOne({ _id: toId(req.params.id) });
        if (!session) return res.status(404).json({ error: 'Session not found' });

        // Fetch test info
        const test = await db.collection('tests').findOne(
            { _id: toId(session.test_id) },
            { projection: { title: 1, course_id: 1, duration_minutes: 1, negative_marking: 1 } }
        );

        // Fetch answers
        const answers = await db.collection('answers')
            .find({ session_id: req.params.id })
            .toArray();

        // Fetch flags
        const flags = await db.collection('flags')
            .find({ session_id: req.params.id })
            .sort({ timestamp: 1 })
            .toArray();

        res.json({
            ...session,
            id: session._id.toString(),
            test,
            answers,
            flags,
        });
    } catch (err) {
        console.error('[sessions/:id GET]', err);
        res.status(500).json({ error: 'Server error' });
    }
});





// ── POST /api/sessions/override ───────────────────────────────────────────────
// Admin module override — disable proctoring modules for a live session
router.post('/override', requireAuth, requireAdmin, async (req, res) => {
    try {
        const db = getDB();
        const { session_id, disabled_modules, reason, via } = req.body;

        // Store the override record
        await db.collection('module_overrides').insertOne({
            session_id,
            admin_id: req.user.id,
            disabled_modules: disabled_modules || [],
            reason: reason || '',
            via: via || 'admin_credentials',
            created_at: new Date(),
        });

        // Audit log
        await db.collection('audit_logs').insertOne({
            action: 'ADMIN_OVERRIDE_APPLIED',
            user_id: req.user.id,
            target_type: 'exam_session',
            target_id: session_id,
            details: { disabled_modules, reason, via },
            created_at: new Date(),
        });

        res.json({ ok: true });
    } catch (err) {
        console.error('[sessions/override POST]', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ── PATCH /api/sessions/:id ────────────────────────────────────────────────────
router.patch('/:id', requireAuth, async (req, res) => {
    try {
        const db = getDB();
        const updates = { ...req.body, updated_at: new Date() };
        delete updates._id;

        // Convert date strings if present
        if (updates.ended_at) updates.ended_at = new Date(updates.ended_at);

        await db.collection('exam_sessions').updateOne(
            { _id: toId(req.params.id) },
            { $set: updates }
        );
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
