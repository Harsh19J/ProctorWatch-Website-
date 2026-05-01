const express = require('express');
const { ObjectId } = require('mongodb');
const { getDB } = require('../db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();
function toId(id) { try { return new ObjectId(id); } catch { return id; } }

// ── GET /api/blacklist ─────────────────────────────────────────────────────────
router.get('/', requireAuth, async (req, res) => {
    try {
        const db = getDB();
        const items = await db.collection('blacklist')
            .find({}).sort({ created_at: -1 }).toArray();
        res.json(items.map(i => ({ ...i, id: i._id.toString() })));
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// ── POST /api/blacklist ────────────────────────────────────────────────────────
router.post('/', requireAuth, requireAdmin, async (req, res) => {
    try {
        const db = getDB();
        const { type, value, reason } = req.body;
        const doc = {
            type, value, reason,
            added_by: req.user.id,
            is_active: true,
            created_at: new Date(),
        };
        const result = await db.collection('blacklist').insertOne(doc);
        res.status(201).json({ id: result.insertedId.toString(), ...doc });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// ── DELETE /api/blacklist/:id ──────────────────────────────────────────────────
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
        const db = getDB();
        await db.collection('blacklist').deleteOne({ _id: toId(req.params.id) });
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// ── POST /api/override-codes ───────────────────────────────────────────────────
router.post('/override-codes', requireAuth, requireAdmin, async (req, res) => {
    try {
        const db = getDB();
        const { student_id, reason, code } = req.body;
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour TTL

        const doc = {
            code,
            student_id,
            reason: reason || '',
            created_by: req.user.id,
            used: false,
            expires_at: expiresAt,
            created_at: new Date(),
        };
        const result = await db.collection('override_codes').insertOne(doc);
        res.status(201).json({ id: result.insertedId.toString(), ...doc });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// ── GET /api/override-codes ────────────────────────────────────────────────────
router.get('/override-codes', requireAuth, requireAdmin, async (req, res) => {
    try {
        const db = getDB();
        const codes = await db.collection('override_codes')
            .find({ expires_at: { $gt: new Date() } })
            .sort({ created_at: -1 })
            .toArray();
        res.json(codes.map(c => ({ ...c, id: c._id.toString() })));
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
