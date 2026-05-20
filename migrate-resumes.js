require('dotenv').config();
const mongoose = require('mongoose');
const Resume = require('./src/models/resume.model');
const Job = require('./src/models/job.model');
const User = require('./src/models/user.model');

async function migrate() {
    try {
        const dbUri = process.env.MONGO_URI || process.env.MONGODB_URI;
        if (!dbUri) {
            console.error('❌ MONGODB_URI or MONGO_URI is missing in .env file!');
            process.exit(1);
        }

        console.log('⏳ Connecting to Database...');
        await mongoose.connect(dbUri);
        console.log('✅ Connected to MongoDB.');

        // 1. Get first user in DB as fallback
        const defaultUser = await User.findOne({});
        if (!defaultUser) {
            console.log('⚠️ No users found in the database. Please create a user first.');
            await mongoose.disconnect();
            return;
        }
        console.log(`👤 Fallback User: ${defaultUser.name} (${defaultUser.email} / ${defaultUser._id})`);

        // 2. Find resumes without `createdBy`
        const resumesToMigrate = await Resume.find({ createdBy: { $exists: false } });
        console.log(`📋 Found ${resumesToMigrate.length} resumes to migrate.`);

        let migratedCount = 0;

        for (const resume of resumesToMigrate) {
            let creatorId = defaultUser._id;

            if (resume.jobId) {
                const job = await Job.findById(resume.jobId);
                if (job && job.createdBy) {
                    creatorId = job.createdBy;
                }
            }

            resume.createdBy = creatorId;
            await resume.save();
            migratedCount++;
            console.log(`✅ Migrated resume: "${resume.candidateName}" -> Owner ID: ${creatorId}`);
        }

        console.log(`\n🎉 Migration Complete! Successfully updated ${migratedCount} resumes.`);
    } catch (error) {
        console.error('❌ Migration Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB.');
    }
}

migrate();
