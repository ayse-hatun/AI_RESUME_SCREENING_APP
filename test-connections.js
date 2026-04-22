// Quick test to verify Gemini API + Gmail SMTP are connected
require('dotenv').config();

const { verifyEmailConnection } = require('./src/services/email.service');
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testConnections() {
    console.log('\n🔍 Testing Services...\n');

    // 1. Test Gemini API
    console.log('--- Gemini AI ---');
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const result = await model.generateContent('Say "Gemini connected!" in exactly 3 words.');
        console.log('✅ Gemini API:', result.response.text().trim());
    } catch (err) {
        console.error('❌ Gemini API Error:', err.message);
    }

    // 2. Test Gmail SMTP
    console.log('\n--- Gmail SMTP ---');
    await verifyEmailConnection();

    console.log('\n✅ Connection test complete!\n');
}

testConnections();
