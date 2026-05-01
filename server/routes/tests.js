const express = require('express');
const { ObjectId } = require('mongodb');
const { getDB } = require('../db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();
function toId(id) { try { return new ObjectId(id); } catch { return id; } }

// ── GET /api/tests ─────────────────────────────────────────────────────────────
router.get('/', requireAuth, async (req, res) => {
    try {
        const db = getDB();
        const { user } = req;
        let query = {};

        if (user.role === 'teacher') {
            // Only tests in courses the teacher owns
            const courses = await db.collection('courses')
                .find({ teacher_id: user.id }, { projection: { _id: 1 } }).toArray();
            const courseIds = courses.map(c => c._id.toString());
            query.course_id = { $in: courseIds };
        } else if (user.role === 'student') {
            const enrollments = await db.collection('enrollments')
                .find({ student_id: user.id }, { projection: { course_id: 1 } }).toArray();
            const courseIds = enrollments.map(e => e.course_id);
            query.course_id = { $in: courseIds };
        }

        const tests = await db.collection('tests')
            .find(query)
            .sort({ start_time: -1 })
            .toArray();

        // Attach course name
        const courseIds = [...new Set(tests.map(t => t.course_id))];
        const courses = await db.collection('courses')
            .find({ _id: { $in: courseIds.map(id => toId(id)) } }, { projection: { name: 1, code: 1 } })
            .toArray();
        const courseMap = Object.fromEntries(courses.map(c => [c._id.toString(), c]));

        res.json(tests.map(t => ({
            ...t,
            id: t._id.toString(),
            courses: courseMap[t.course_id] || null,
        })));
    } catch (err) {
        console.error('[tests GET]', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ── GET /api/tests/:id ─────────────────────────────────────────────────────────
router.get('/:id', requireAuth, async (req, res) => {
    try {
        const db = getDB();
        const test = await db.collection('tests').findOne({ _id: toId(req.params.id) });
        if (!test) return res.status(404).json({ error: 'Test not found' });
        res.json({ ...test, id: test._id.toString() });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// ── GET /api/tests/:id/questions ───────────────────────────────────────────────
router.get('/:id/questions', requireAuth, async (req, res) => {
    try {
        const db = getDB();
        // Questions are stored in the test_questions junction collection
        const testQuestions = await db.collection('test_questions')
            .find({ test_id: req.params.id })
            .sort({ order: 1 })
            .toArray();

        const qIds = testQuestions.map(tq => toId(tq.question_id));
        const questions = await db.collection('questions')
            .find({ _id: { $in: qIds } })
            .toArray();

        const qMap = Object.fromEntries(questions.map(q => [q._id.toString(), q]));
        const result = testQuestions.map(tq => ({
            ...tq,
            ...qMap[tq.question_id],
            id: tq.question_id,
        }));
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// ── POST /api/tests ────────────────────────────────────────────────────────────
router.post('/', requireAuth, async (req, res) => {
    try {
        const db = getDB();
        const {
            title, course_id, duration_minutes, start_time, end_time,
            instructions, negative_marking, randomize_questions,
            total_marks, passing_marks,
        } = req.body;

        const doc = {
            title, course_id, duration_minutes,
            start_time: start_time ? new Date(start_time) : null,
            end_time: end_time ? new Date(end_time) : null,
            instructions: instructions || '',
            negative_marking: negative_marking || 0,
            randomize_questions: randomize_questions || false,
            total_marks: total_marks || 0,
            passing_marks: passing_marks || 0,
            created_by: req.user.id,
            created_at: new Date(),
            updated_at: new Date(),
        };

        const result = await db.collection('tests').insertOne(doc);
        res.status(201).json({ id: result.insertedId.toString(), ...doc });
    } catch (err) {
        console.error('[tests POST]', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ── POST /api/tests/:id/questions ─────────────────────────────────────────────
// Accepts array of question objects, inserts into questions + test_questions
router.post('/:id/questions', requireAuth, async (req, res) => {
    try {
        const db = getDB();
        const testId = req.params.id;
        const { questions } = req.body; // array

        const insertedIds = [];
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            const qDoc = {
                text: q.text,
                options: q.options,
                correct_option: q.correct_option,
                explanation: q.explanation || '',
                marks: q.marks || 1,
                bank_tags: q.bank_tags || [],
                created_by: req.user.id,
                created_at: new Date(),
            };
            const qRes = await db.collection('questions').insertOne(qDoc);
            await db.collection('test_questions').insertOne({
                test_id: testId,
                question_id: qRes.insertedId.toString(),
                order: i,
                marks: q.marks || 1,
            });
            insertedIds.push(qRes.insertedId.toString());
        }

        res.status(201).json({ inserted: insertedIds.length, ids: insertedIds });
    } catch (err) {
        console.error('[tests/questions POST]', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ── DELETE /api/tests/:id ──────────────────────────────────────────────────────
router.delete('/:id', requireAuth, async (req, res) => {
    try {
        const db = getDB();
        const testId = req.params.id;
        // Cascade delete
        await db.collection('test_questions').deleteMany({ test_id: testId });
        await db.collection('exam_sessions').deleteMany({ test_id: testId });
        await db.collection('tests').deleteOne({ _id: toId(testId) });
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// ── GET /api/tests/questions/bank ─────────────────────────────────────────────
router.get('/questions/bank', requireAuth, async (req, res) => {
    try {
        const db = getDB();
        const { tags, q } = req.query;
        const filter = {};
        if (tags) filter.bank_tags = { $in: tags.split(',') };
        if (q) filter.text = { $regex: q, $options: 'i' };

        const questions = await db.collection('questions')
            .find(filter).limit(100).toArray();
        res.json(questions.map(q => ({ ...q, id: q._id.toString() })));
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
