require('dotenv').config();
const { MongoClient } = require('mongodb');
const crypto = require('crypto');

const uri = process.env.MONGO_URI;

function sha256(str) {
    return crypto.createHash('sha256').update(str).digest('hex');
}

async function initDb() {
    console.log('Connecting to MongoDB...');
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db(); // will connect to default database in URI

        console.log('Connected to Database:', db.databaseName);

        // 1. Create collections (explicitly to ensure they exist)
        const collections = [
            'users', 'courses', 'enrollments', 'tests', 'test_questions', 
            'questions', 'exam_sessions', 'answers', 'flags', 
            'override_codes', 'module_overrides', 'audit_logs', 
            'face_registrations', 'consents'
        ];

        const existingCollections = await db.listCollections().toArray();
        const existingNames = existingCollections.map(c => c.name);

        for (const collName of collections) {
            if (!existingNames.includes(collName)) {
                await db.createCollection(collName);
                console.log(`Created collection: ${collName}`);
            }
        }

        // 2. Setup Indexes
        console.log('Setting up indexes...');
        
        async function buildIndex(collection, spec, options = {}) {
            try {
                await db.collection(collection).createIndex(spec, options);
            } catch (ignored) { } // Ignore if already built differently to avoid crashing
        }

        await buildIndex('users', { username: 1 }, { unique: true });
        await buildIndex('users', { email: 1 }, { unique: true, sparse: true });
        await buildIndex('courses', { code: 1 }, { unique: true });
        await buildIndex('exam_sessions', { student_id: 1, test_id: 1 });
        await buildIndex('flags', { session_id: 1 });
        await buildIndex('flags', { timestamp: -1 });

        // 3. Create Default Admin User
        const adminUsername = 'admin';
        const existingAdmin = await db.collection('users').findOne({ username: adminUsername });

        if (!existingAdmin) {
            console.log('Creating default Admin user (admin / admin)...');
            await db.collection('users').insertOne({
                username: adminUsername,
                email: 'admin@proctorwatch.local',
                full_name: 'System Administrator',
                role: 'admin',
                password_hash: sha256('admin'), // Default password 'admin'
                is_active: true,
                first_login: true,
                created_at: new Date(),
                updated_at: new Date()
            });
            console.log('Default Admin user created successfully.');
        } else {
            console.log('Admin user already exists. Skipping creation.');
            // Enforce admin password as standard test admin if needed, 
            // but we'll leave it in case the user changed it.
        }

        console.log('== Database schema and indexes initialized successfully ==');

    } catch (err) {
        console.error('Error initializing database:', err);
    } finally {
        await client.close();
        console.log('Connection closed.');
    }
}

initDb();
