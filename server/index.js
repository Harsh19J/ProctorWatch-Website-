require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./db');

// Route modules
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const courseRoutes = require('./routes/courses');
const testRoutes = require('./routes/tests');
const questionRoutes = require('./routes/questions');
const sessionRoutes = require('./routes/sessions');
const flagRoutes = require('./routes/flags');
const reportRoutes = require('./routes/reports');
const blacklistRoutes = require('./routes/blacklist');
const overrideCodeRoutes = require('./routes/overrideCodes');

const app = express();
const PORT = process.env.PORT || 4000;

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({
    origin: [
        process.env.CLIENT_ORIGIN || 'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'http://localhost:5176',
    ],
    credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logger (dev)
app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// ── Health check ────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'ok', ts: new Date() }));

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/flags', flagRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/blacklist', blacklistRoutes);
app.use('/api/override-codes', overrideCodeRoutes);

// ── Global error handler ────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
    console.error('[UNHANDLED]', err);
    res.status(500).json({ error: 'Internal server error' });
});

// ── Bootstrap ───────────────────────────────────────────────────────────────
async function bootstrap() {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`\n🚀 ProctorWatch API running on http://localhost:${PORT}`);
            console.log(`   Health: http://localhost:${PORT}/api/health\n`);
        });
    } catch (err) {
        console.error('❌ Failed to start server:', err.message);
        process.exit(1);
    }
}

bootstrap();
