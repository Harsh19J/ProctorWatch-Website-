const jwt = require('jsonwebtoken');

/**
 * Verifies the JWT from Authorization: Bearer <token>
 * Attaches decoded payload to req.user
 */
function requireAuth(req, res, next) {
    const header = req.headers['authorization'] || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) return res.status(401).json({ error: 'No token provided' });

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}

/** Only admin or technical roles */
function requireAdmin(req, res, next) {
    if (!['admin', 'technical'].includes(req.user?.role)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
}

/** Only admin role strictly */
function requireStrictAdmin(req, res, next) {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Admin only' });
    }
    next();
}

module.exports = { requireAuth, requireAdmin, requireStrictAdmin };
