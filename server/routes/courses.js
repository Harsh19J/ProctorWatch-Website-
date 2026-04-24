const express = require('express');
const { ObjectId } = require('mongodb');
const { getDB } = require('../db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

function toId(id) { try { return new ObjectId(id); } catch { return id; } }

// ── GET /api/courses ───────────────────────────────────────────────────────────
router.get('/', requireAuth, async (req, res) => {
    try {
        const db = getDB();
        const { user } = req;
        let matchQuery = {};

        if (user.role === 'teacher') matchQuery.teacher_id = user.id;
        else if (user.role === 'student') {
            const enrollments = await db.collection('enrollments')
                .find({ student_id: user.id }, { projection: { course_id: 1 } })
                .toArray();
            const ids = enrollments.map(e => e.course_id);
            matchQuery._id = { $in: ids.map(id => toId(id)) };
        }

        if (req.query.active === 'true') matchQuery.is_active = true;

        const courses = await db.collection('courses').aggregate([
            { $match: matchQuery },
            { $sort: { created_at: -1 } },
            // Lookup teacher details
            {
                $lookup: {
                    from: 'users',
                    let: { tId: { $toObjectId: '$teacher_id' } },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$_id', '$$tId'] } } },
                        { $project: { username: 1, full_name: 1, email: 1 } }
                    ],
                    as: 'users'
                }
            },
            { $unwind: { path: '$users', preserveNullAndEmptyArrays: true } },
            // Lookup enrollment count
            {
                $lookup: {
                    from: 'enrollments',
                    let: { cId: { $toString: '$_id' } },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$course_id', '$$cId'] } } },
                        { $count: 'count' }
                    ],
                    as: 'enrollments'
                }
            }
        ]).toArray();

        res.json(courses.map(c => ({ ...c, id: c._id.toString() })));
    } catch (err) {
        console.error('[courses GET]', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ── POST /api/courses ──────────────────────────────────────────────────────────
router.post('/', requireAuth, requireAdmin, async (req, res) => {
    try {
        const db = getDB();
        const { name, code, description, teacher_id } = req.body;
        const doc = {
            name, code, description,
            teacher_id: teacher_id || null,
            is_active: true,
            created_at: new Date(),
            updated_at: new Date(),
        };
        const result = await db.collection('courses').insertOne(doc);
        res.status(201).json({ id: result.insertedId.toString(), ...doc });
    } catch (err) {
        console.error('[courses POST]', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ── PATCH /api/courses/:id ─────────────────────────────────────────────────────
router.patch('/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
        const db = getDB();
        const updates = { ...req.body, updated_at: new Date() };
        delete updates._id;
        await db.collection('courses').updateOne(
            { _id: toId(req.params.id) },
            { $set: updates }
        );
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// ── DELETE /api/courses/:id ────────────────────────────────────────────────────
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
        const db = getDB();
        await db.collection('courses').updateOne(
            { _id: toId(req.params.id) },
            { $set: { is_active: false, updated_at: new Date() } }
        );
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// ── GET /api/courses/:id/enrollments ──────────────────────────────────────────
router.get('/:id/enrollments', requireAuth, async (req, res) => {
    try {
        const db = getDB();
        const enrollments = await db.collection('enrollments')
            .find({ course_id: req.params.id })
            .toArray();
        res.json(enrollments);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// ── POST /api/courses/:id/enroll ──────────────────────────────────────────────
router.post('/:id/enroll', requireAuth, requireAdmin, async (req, res) => {
    try {
        const db = getDB();
        const { student_id } = req.body;
        await db.collection('enrollments').updateOne(
            { student_id, course_id: req.params.id },
            { $setOnInsert: { student_id, course_id: req.params.id, enrolled_at: new Date() } },
            { upsert: true }
        );
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// ── DELETE /api/courses/:id/enroll/:studentId ──────────────────────────────────
router.delete('/:id/enroll/:studentId', requireAuth, requireAdmin, async (req, res) => {
    try {
        const db = getDB();
        await db.collection('enrollments').deleteOne({
            student_id: req.params.studentId,
            course_id: req.params.id,
        });
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
