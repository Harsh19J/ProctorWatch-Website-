const express = require('express');
const { getDB } = require('../db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// ── GET /api/blacklist ─────────────────────────────────────────────────────────
// Returns all blacklist entries with the schema the frontend expects.
router.get('/', requireAuth, async (req, res) => {
    try {
        const db = getDB();
        const items = await db.collection('blacklist')
            .find({})
            .sort({ created_at: -1 })
            .toArray();

        // Map _id → id for the frontend, keep all other fields as-is
        res.json(items.map(item => ({
            ...item,
            id: item._id.toString(),
            _id: undefined,
        })));
    } catch (err) {
        console.error('[blacklist GET]', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ── POST /api/blacklist ────────────────────────────────────────────────────────
// Add a new custom app to the blacklist.
// Body: { process_name, display_name, category, is_default, is_whitelisted }
router.post('/', requireAuth, requireAdmin, async (req, res) => {
    try {
        const db = getDB();
        const { process_name, display_name, category, is_default, is_whitelisted } = req.body;

        if (!process_name) {
            return res.status(400).json({ error: 'process_name is required' });
        }

        // Prevent duplicates
        const existing = await db.collection('blacklist').findOne({ process_name });
        if (existing) {
            return res.status(409).json({ error: `${process_name} is already in the blacklist` });
        }

        const doc = {
            process_name,
            display_name:   display_name || process_name,
            category:       category || 'custom',
            is_default:     is_default ?? false,
            is_whitelisted: is_whitelisted ?? false,
            added_by:       req.user.id,
            created_at:     new Date(),
        };

        const result = await db.collection('blacklist').insertOne(doc);
        res.status(201).json({ ...doc, id: result.insertedId.toString(), _id: undefined });
    } catch (err) {
        console.error('[blacklist POST]', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ── PATCH /api/blacklist/:process_name ────────────────────────────────────────
// Toggle is_whitelisted for an existing entry.
// Body: { is_whitelisted: boolean }
router.patch('/:process_name', requireAuth, requireAdmin, async (req, res) => {
    try {
        const db = getDB();
        const { process_name } = req.params;
        const { is_whitelisted } = req.body;

        if (is_whitelisted === undefined) {
            return res.status(400).json({ error: 'is_whitelisted field is required' });
        }

        const result = await db.collection('blacklist').findOneAndUpdate(
            { process_name: decodeURIComponent(process_name) },
            { $set: { is_whitelisted: Boolean(is_whitelisted), updated_at: new Date() } },
            { returnDocument: 'after' }
        );

        if (!result) {
            return res.status(404).json({ error: `No entry found for process: ${process_name}` });
        }

        res.json({ ...result, id: result._id.toString(), _id: undefined });
    } catch (err) {
        console.error('[blacklist PATCH]', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ── DELETE /api/blacklist/:process_name ───────────────────────────────────────
// Remove a custom (non-default) app from the blacklist.
router.delete('/:process_name', requireAuth, requireAdmin, async (req, res) => {
    try {
        const db = getDB();
        const { process_name } = req.params;

        const entry = await db.collection('blacklist').findOne({
            process_name: decodeURIComponent(process_name),
        });

        if (!entry) {
            return res.status(404).json({ error: `No entry found for process: ${process_name}` });
        }
        if (entry.is_default) {
            return res.status(403).json({ error: 'Default entries cannot be removed' });
        }

        await db.collection('blacklist').deleteOne({ process_name: decodeURIComponent(process_name) });
        res.json({ ok: true });
    } catch (err) {
        console.error('[blacklist DELETE]', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
