// Script to reset or create an admin account
// Run with: node reset-admin.js
// Required env vars: ADMIN_EMAIL, ADMIN_PASSWORD (min 8 chars)

require('dotenv').config({ override: true });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/user.model');

async function resetAdmin() {
    // --- Validate credentials from environment ---
    const email = process.env.ADMIN_EMAIL;
    const rawPassword = process.env.ADMIN_PASSWORD;

    if (!email || !email.includes('@')) {
        console.error('❌ ADMIN_EMAIL env var is missing or invalid. Aborting.');
        process.exit(1);
    }
    if (!rawPassword || rawPassword.length < 8) {
        console.error('❌ ADMIN_PASSWORD env var is missing or too short (min 8 chars). Aborting.');
        process.exit(1);
    }

    const maskedPassword = '*'.repeat(rawPassword.length);
    let exitCode = 0;

    console.log('🔄 Connecting to MongoDB...');
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai_resume_screening');
        console.log('✅ Connected to DB');

        let user = await User.findOne({ email: email.toLowerCase() });

        if (user) {
            console.log(`👤 User found: ${email}. Resetting password...`);
            user.password = rawPassword; // The pre-save hook will hash it
            await user.save();
            console.log('✅ Password successfully reset.');
        } else {
            console.log(`❌ User not found: ${email}. Creating new admin account...`);
            user = await User.create({
                name: 'Admin',
                email: email.toLowerCase(),
                password: rawPassword,
                role: 'admin',
                organization: 'SmartHire',
                isVerified: true
            });
            console.log('✅ Account created successfully.');
        }

        console.log('\n======================================');
        console.log(`Email:    ${email}`);
        console.log(`Password: ${maskedPassword}`);
        console.log('======================================\n');

    } catch (err) {
        console.error('🔥 Error:', err);
        exitCode = 1;
    } finally {
        await mongoose.disconnect();
        process.exit(exitCode);
    }
}

resetAdmin();
