const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { getDB } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

/** SHA-256 hash — matches the client-side implementation */
function sha256(str) {
    return crypto.createHash('sha256').update(str).digest('hex');
}

/** Sign a JWT for the session */
function signToken(user) {
    return jwt.sign(
        { id: user._id.toString(), role: user.role, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '12h' }
    );
}

// ── POST /api/auth/login ───────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password)
            return res.status(400).json({ error: 'Username and password required' });

        const db = getDB();
        const passwordHash = sha256(password);

        const user = await db.collection('users').findOne({
            username,
            is_active: true,
        });

        if (!user || user.password_hash !== passwordHash)
            return res.status(401).json({ error: 'Invalid username or password' });

        const token = signToken(user);

        // Audit log
        await db.collection('audit_logs').insertOne({
            action: 'LOGIN',
            user_id: user._id.toString(),
            details: { username, role: user.role, source: 'web' },
            created_at: new Date(),
        });

        return res.json({
            token,
            user: {
                id: user._id.toString(),
                username: user.username,
                email: user.email,
                full_name: user.full_name,
                role: user.role,
                phone: user.phone,
                profile_photo_url: user.profile_photo_url,
                first_login: user.first_login,
            },
        });
    } catch (err) {
        console.error('[auth/login]', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ── POST /api/auth/logout ──────────────────────────────────────────────────────
router.post('/logout', requireAuth, async (req, res) => {
    try {
        const db = getDB();
        await db.collection('audit_logs').insertOne({
            action: 'LOGOUT',
            user_id: req.user.id,
            details: { username: req.user.username, source: 'web' },
            created_at: new Date(),
        });
        res.json({ ok: true });
    } catch (err) {
        console.error('[auth/logout]', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ── POST /api/auth/change-password ────────────────────────────────────────────
router.post('/change-password', requireAuth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const db = getDB();
        const { ObjectId } = require('mongodb');

        const user = await db.collection('users').findOne(
            { _id: new ObjectId(req.user.id) },
            { projection: { password_hash: 1 } }
        );

        if (!user || user.password_hash !== sha256(currentPassword))
            return res.status(401).json({ error: 'Current password is incorrect' });

        await db.collection('users').updateOne(
            { _id: new ObjectId(req.user.id) },
            { $set: { password_hash: sha256(newPassword), first_login: false, updated_at: new Date() } }
        );

        await db.collection('audit_logs').insertOne({
            action: 'PASSWORD_CHANGE',
            user_id: req.user.id,
            details: { first_login_change: true },
            created_at: new Date(),
        });

        res.json({ ok: true });
    } catch (err) {
        console.error('[auth/change-password]', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ── POST /api/auth/verify-admin ───────────────────────────────────────────────
// Used by AdminAuthDialog for re-authentication
router.post('/verify-admin', requireAuth, async (req, res) => {
    try {
        const { username, password } = req.body;
        const db = getDB();
        const passwordHash = sha256(password);

        const user = await db.collection('users').findOne({
            username,
            is_active: true,
            role: { $in: ['admin', 'technical'] },
        });

        if (!user || user.password_hash !== passwordHash)
            return res.status(401).json({ error: 'Verification failed' });

        res.json({ id: user._id.toString(), role: user.role });
    } catch (err) {
        console.error('[auth/verify-admin]', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
