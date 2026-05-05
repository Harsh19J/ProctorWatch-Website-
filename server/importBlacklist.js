const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { connectDB, getDB } = require('./db');

async function importBlacklist() {
    console.log('🚀 Starting blacklist import...');
    
    try {
        await connectDB();
        const db = getDB();
        const collection = db.collection('blacklist');

        const csvPath = path.join(__dirname, '..', 'app_blacklist_rows.csv');
        if (!fs.existsSync(csvPath)) {
            console.error('❌ CSV file not found at:', csvPath);
            process.exit(1);
        }

        const content = fs.readFileSync(csvPath, 'utf8');
        const lines = content.split(/\r?\n/).filter(line => line.trim());
        
        // Skip header
        const dataLines = lines.slice(1);
        console.log(`📝 Found ${dataLines.length} entries to process.`);

        let inserted = 0;
        let updated = 0;
        let skipped = 0;

        for (const line of dataLines) {
            // Simple CSV parser (assuming no commas in values since it's app list)
            const [id, process_name, display_name, category, is_default, is_whitelisted] = line.split(',');

            if (!process_name || !category) {
                skipped++;
                continue;
            }

            const normalizedProcessName = process_name.trim().toLowerCase();
            const normalizedDisplayName = display_name?.trim() || normalizedProcessName;
            const normalizedCategory = category.trim().toLowerCase();
            const defaultFlag = is_default === 'true';
            const whitelistedFlag = is_whitelisted === 'true';

            // Validation: Ensure process name is clean
            if (normalizedProcessName === 'process_name' || normalizedProcessName === '') {
                skipped++;
                continue;
            }

            const doc = {
                process_name: normalizedProcessName,
                display_name: normalizedDisplayName,
                category: normalizedCategory,
                is_default: defaultFlag,
                is_whitelisted: whitelistedFlag,
                updated_at: new Date()
            };

            // Use upsert to avoid duplicates and not "mess up" existing data while filling missing gaps
            const result = await collection.updateOne(
                { process_name: normalizedProcessName },
                { 
                    $set: doc,
                    $setOnInsert: { created_at: new Date() }
                },
                { upsert: true }
            );

            if (result.upsertedCount > 0) {
                inserted++;
            } else if (result.modifiedCount > 0) {
                updated++;
            } else {
                skipped++;
            }
        }

        console.log(`\n✅ Import Complete!`);
        console.log(`   Created: ${inserted}`);
        console.log(`   Updated: ${updated}`);
        console.log(`   Skipped: ${skipped}`);
        
    } catch (err) {
        console.error('❌ Import failed:', err);
    } finally {
        process.exit(0);
    }
}

importBlacklist();
