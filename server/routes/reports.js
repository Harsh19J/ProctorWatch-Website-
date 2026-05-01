const express = require('express');
const { getDB } = require('../db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// ── GET /api/reports/overview ──────────────────────────────────────────────────
router.get('/overview', requireAuth, requireAdmin, async (req, res) => {
    try {
        const db = getDB();
        const [
            totalUsers, totalStudents, totalTeachers,
            totalCourses, totalTests,
            totalSessions, completedSessions,
            totalFlags, unreviewedFlags,
        ] = await Promise.all([
            db.collection('users').countDocuments({}),
            db.collection('users').countDocuments({ role: 'student' }),
            db.collection('users').countDocuments({ role: 'teacher' }),
            db.collection('courses').countDocuments({ is_active: true }),
            db.collection('tests').countDocuments({}),
            db.collection('exam_sessions').countDocuments({}),
            db.collection('exam_sessions').countDocuments({ status: 'completed' }),
            db.collection('flags').countDocuments({}),
            db.collection('flags').countDocuments({ reviewed: false }),
        ]);

        res.json({
            totalUsers, totalStudents, totalTeachers,
            totalCourses, totalTests,
            totalSessions, completedSessions,
            totalFlags, unreviewedFlags,
        });
    } catch (err) {
        console.error('[reports/overview]', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ── GET /api/reports/performance ──────────────────────────────────────────────
router.get('/performance', requireAuth, async (req, res) => {
    try {
        const db = getDB();
        const { user } = req;
        let matchStage = {};

        if (user.role === 'student') {
            matchStage = { student_id: user.id, status: 'completed' };
        } else if (user.role === 'teacher') {
            const courses = await db.collection('courses')
                .find({ teacher_id: user.id }, { projection: { _id: 1 } }).toArray();
            const courseIds = courses.map(c => c._id.toString());
            const tests = await db.collection('tests')
                .find({ course_id: { $in: courseIds } }, { projection: { _id: 1 } }).toArray();
            matchStage = { test_id: { $in: tests.map(t => t._id.toString()) }, status: 'completed' };
        }

        const sessions = await db.collection('exam_sessions')
            .find(matchStage)
            .sort({ started_at: -1 })
            .limit(200)
            .toArray();

        res.json(sessions.map(s => ({ ...s, id: s._id.toString() })));
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// ── GET /api/reports/flags-summary ────────────────────────────────────────────
router.get('/flags-summary', requireAuth, async (req, res) => {
    try {
        const db = getDB();
        const summary = await db.collection('flags').aggregate([
            { $group: { _id: '$severity', count: { $sum: 1 } } },
        ]).toArray();
        res.json(summary);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// ── GET /api/reports/audit-logs ───────────────────────────────────────────────
router.get('/audit-logs', requireAuth, requireAdmin, async (req, res) => {
    try {
        const db = getDB();
        const logs = await db.collection('audit_logs')
            .find({})
            .sort({ created_at: -1 })
            .limit(500)
            .toArray();
        res.json(logs.map(l => ({ ...l, id: l._id.toString() })));
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
