const express = require('express');
const crypto = require('crypto');
const { ObjectId } = require('mongodb');
const { getDB } = require('../db');
const { requireAuth, requireAdmin, requireStrictAdmin } = require('../middleware/auth');

const router = express.Router();

function sha256(str) {
    return crypto.createHash('sha256').update(str).digest('hex');
}

// ── GET /api/users ─────────────────────────────────────────────────────────────
router.get('/', requireAuth, requireAdmin, async (req, res) => {
    try {
        const db = getDB();
        const users = await db.collection('users')
            .find({}, { projection: { password_hash: 0 } })
            .sort({ created_at: -1 })
            .toArray();
        res.json(users.map(u => ({ ...u, id: u._id.toString() })));
    } catch (err) {
        console.error('[users GET]', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ── GET /api/users/me ─────────────────────────────────────────────────────────
router.get('/me', requireAuth, async (req, res) => {
    try {
        const db = getDB();
        const user = await db.collection('users').findOne(
            { _id: new ObjectId(req.user.id) },
            { projection: { password_hash: 0 } }
        );
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ ...user, id: user._id.toString() });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// ── POST /api/users ────────────────────────────────────────────────────────────
router.post('/', requireAuth, requireAdmin, async (req, res) => {
    try {
        const db = getDB();
        const { username, email, full_name, role, phone, password } = req.body;

        const existing = await db.collection('users').findOne({ username });
        if (existing) return res.status(409).json({ error: 'Username already exists' });

        const doc = {
            username,
            email: email || null,
            full_name: full_name || null,
            role,
            phone: phone || null,
            password_hash: sha256(password || username), // default pw = username
            is_active: true,
            first_login: true,
            profile_photo_url: null,
            created_at: new Date(),
            updated_at: new Date(),
        };

        const result = await db.collection('users').insertOne(doc);
        res.status(201).json({ id: result.insertedId.toString(), ...doc });
    } catch (err) {
        console.error('[users POST]', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ── POST /api/users/bulk ───────────────────────────────────────────────────────
router.post('/bulk', requireAuth, requireAdmin, async (req, res) => {
    try {
        const db = getDB();
        const { users } = req.body; // array of user objects from CSV
        const results = { inserted: 0, skipped: 0, errors: [] };

        for (const u of users) {
            try {
                const existing = await db.collection('users').findOne({ username: u.username });
                if (existing) { results.skipped++; continue; }

                await db.collection('users').insertOne({
                    ...u,
                    password_hash: sha256(u.password || u.username),
                    is_active: true,
                    first_login: true,
                    profile_photo_url: null,
                    created_at: new Date(),
                    updated_at: new Date(),
                });
                results.inserted++;
            } catch (e) {
                results.errors.push({ username: u.username, error: e.message });
            }
        }

        await db.collection('audit_logs').insertOne({
            action: 'BULK_USER_IMPORT',
            user_id: req.user.id,
            details: results,
            created_at: new Date(),
        });

        res.json(results);
    } catch (err) {
        console.error('[users/bulk POST]', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ── PATCH /api/users/:id ───────────────────────────────────────────────────────
router.patch('/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
        const db = getDB();
        const { id } = req.params;
        const updates = { ...req.body, updated_at: new Date() };
        delete updates._id;
        if (updates.password) {
            updates.password_hash = sha256(updates.password);
            delete updates.password;
        }

        await db.collection('users').updateOne(
            { _id: new ObjectId(id) },
            { $set: updates }
        );
        res.json({ ok: true });
    } catch (err) {
        console.error('[users PATCH]', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ── PATCH /api/users/:id/profile ──────────────────────────────────────────────
router.patch('/:id/profile', requireAuth, async (req, res) => {
    try {
        // Users can only update their own profile
        if (req.user.id !== req.params.id && req.user.role !== 'admin')
            return res.status(403).json({ error: 'Forbidden' });

        const db = getDB();
        const updates = {};
        
        if (req.body.full_name !== undefined) updates.full_name = req.body.full_name;
        if (req.body.phone !== undefined) updates.phone = req.body.phone;
        if (req.body.profile_photo_url !== undefined) updates.profile_photo_url = req.body.profile_photo_url;
        if (req.body.first_login !== undefined) updates.first_login = req.body.first_login;
        if (req.body.password) updates.password_hash = sha256(req.body.password);

        if (Object.keys(updates).length > 0) {
            updates.updated_at = new Date();
            await db.collection('users').updateOne(
                { _id: new ObjectId(req.params.id) },
                { $set: updates }
            );
            
            // Log password change if applicable
            if (req.body.password) {
                 await db.collection('audit_logs').insertOne({
                     action: 'PASSWORD_CHANGE',
                     user_id: req.user.id,
                     details: { first_login_change: true },
                     created_at: new Date(),
                 });
            }
        }
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// ── POST /api/users/parent-student ────────────────────────────────────────────
router.post('/parent-student', requireAuth, requireAdmin, async (req, res) => {
    try {
        const db = getDB();
        const { parent_id, student_id } = req.body;
        // Store as embedded children array on parent doc
        await db.collection('users').updateOne(
            { _id: new ObjectId(parent_id) },
            { $addToSet: { children: student_id } }
        );
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// ── DELETE /api/users/:id/face ─────────────────────────────────────────────────
// Remove face registration data for a user (admin override / face reset)
router.delete('/:id/face', requireAuth, requireAdmin, async (req, res) => {
    try {
        const db = getDB();
        const { id } = req.params;
        await db.collection('face_registrations').deleteMany({ user_id: id });
        await db.collection('audit_logs').insertOne({
            action: 'FACE_ID_RESET',
            user_id: req.user.id,
            target_type: 'user',
            target_id: id,
            details: { via: 'admin_panel' },
            created_at: new Date(),
        });
        res.json({ ok: true });
    } catch (err) {
        console.error('[users/face DELETE]', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
