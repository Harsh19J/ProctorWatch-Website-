const express = require('express');
const { ObjectId } = require('mongodb');
const { getDB } = require('../db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// ── POST /api/override-codes ───────────────────────────────────────────────────
// Generate a new override code (admin only)
router.post('/', requireAuth, requireAdmin, async (req, res) => {
    try {
        const db = getDB();
        const { code, purpose, expires_at } = req.body;

        if (!code || !purpose) {
            return res.status(400).json({ error: 'code and purpose are required' });
        }

        const doc = {
            code: code.toUpperCase(),
            purpose,
            created_by: req.user.id,
            expires_at: expires_at ? new Date(expires_at) : new Date(Date.now() + 5 * 60 * 1000),
            used: false,
            used_at: null,
            used_by: null,
            created_at: new Date(),
        };

        const result = await db.collection('override_codes').insertOne(doc);
        res.status(201).json({ id: result.insertedId.toString(), ...doc });
    } catch (err) {
        console.error('[override-codes POST]', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ── POST /api/override-codes/verify ───────────────────────────────────────────
// Verify and consume an override code
router.post('/verify', requireAuth, async (req, res) => {
    try {
        const db = getDB();
        const { code, purpose } = req.body;

        if (!code) return res.status(400).json({ error: 'code is required' });

        const codeRow = await db.collection('override_codes').findOne({
            code: code.toUpperCase(),
            used: false,
            expires_at: { $gt: new Date() },
            ...(purpose ? { purpose } : {}),
        });

        if (!codeRow) {
            return res.status(400).json({ error: 'Invalid, expired, or already-used code' });
        }

        // Mark as used atomically
        await db.collection('override_codes').updateOne(
            { _id: codeRow._id },
            { $set: { used: true, used_at: new Date(), used_by: req.user.id } }
        );

        // Audit log
        await db.collection('audit_logs').insertOne({
            action: 'OVERRIDE_CODE_VERIFIED',
            user_id: req.user.id,
            details: { code_id: codeRow._id.toString(), purpose: codeRow.purpose },
            created_at: new Date(),
        });

        res.json({ ok: true, purpose: codeRow.purpose });
    } catch (err) {
        console.error('[override-codes/verify POST]', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
