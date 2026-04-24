const { MongoClient } = require('mongodb');
require('dotenv').config();

let _db = null;
let _client = null;

async function connectDB() {
    if (_db) return _db;

    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error('[db] MONGO_URI is not set in server/.env');

    _client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 20000,
        connectTimeoutMS: 20000,
        socketTimeoutMS: 30000,
        tls: true,
        tlsAllowInvalidCertificates: false,
        retryWrites: true,
    });

    await _client.connect();
    _db = _client.db(); // uses the DB name from URI ("proctorwatch")
    console.log('[db] ✅ Connected to MongoDB Atlas');

    // ── Indexes ────────────────────────────────────────────────────────────────
    await _db.collection('users').createIndexes([
        { key: { username: 1 }, unique: true },
        { key: { email: 1 }, unique: true, sparse: true },
        { key: { role: 1 } },
        { key: { is_active: 1 } },
    ]);
    await _db.collection('courses').createIndexes([
        { key: { teacher_id: 1 } },
        { key: { code: 1 }, unique: true, sparse: true },
    ]);
    await _db.collection('enrollments').createIndexes([
        { key: { student_id: 1 } },
        { key: { course_id: 1 } },
        { key: { student_id: 1, course_id: 1 }, unique: true },
    ]);
    await _db.collection('tests').createIndexes([
        { key: { course_id: 1 } },
        { key: { start_time: -1 } },
    ]);
    await _db.collection('exam_sessions').createIndexes([
        { key: { test_id: 1 } },
        { key: { student_id: 1 } },
        { key: { status: 1 } },
    ]);
    await _db.collection('flags').createIndexes([
        { key: { session_id: 1 } },
        { key: { reviewed: 1 } },
        { key: { severity: 1 } },
        { key: { timestamp: -1 } },
    ]);
    await _db.collection('audit_logs').createIndexes([
        { key: { user_id: 1 } },
        { key: { action: 1 } },
        { key: { created_at: -1 } },
    ]);
    await _db.collection('override_codes').createIndex(
        { expires_at: 1 }, { expireAfterSeconds: 0 } // TTL index
    );

    console.log('[db] ✅ Indexes ensured');
    return _db;
}

function getDB() {
    if (!_db) throw new Error('[db] Call connectDB() before getDB()');
    return _db;
}

module.exports = { connectDB, getDB };
