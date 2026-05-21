// Script to reset or create an admin account
// Run with: node reset-admin.js

require('dotenv').config({ override: true });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/user.model');

async function resetAdmin() {
    console.log('🔄 Connecting to MongoDB...');
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai_resume_screening', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Connected to DB');

        const email = 'aysehatun986@gmail.com';
        const rawPassword = 'password123';
        
        let user = await User.findOne({ email: email.toLowerCase() });

        if (user) {
            console.log(`👤 User found: ${email}. Resetting password...`);
            user.password = rawPassword; // The pre-save hook will hash it
            await user.save();
            console.log(`✅ Password successfully reset to: ${rawPassword}`);
        } else {
            console.log(`❌ User not found: ${email}. Creating new admin account...`);
            user = await User.create({
                name: 'Ayse Hatun',
                email: email.toLowerCase(),
                password: rawPassword,
                role: 'admin',
                organization: 'SmartHire',
                isVerified: true
            });
            console.log(`✅ Account created successfully with password: ${rawPassword}`);
        }

        console.log('\n======================================');
        console.log(`Email:    ${email}`);
        console.log(`Password: ${rawPassword}`);
        console.log('======================================\n');
        
    } catch (err) {
        console.error('🔥 Error:', err);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

resetAdmin();
