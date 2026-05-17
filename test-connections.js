// Quick test to verify Gemini API + Gmail SMTP are connected
require('dotenv').config();

const { verifyEmailConnection } = require('./src/services/email.service');
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testConnections() {
    console.log('\n🔍 Testing Services...\n');

    // 1. Test Gemini AI
    console.log('\n--- 🤖 Gemini AI ---');
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Using gemini-1.5-flash as the standard model (fallback: gemini-pro)
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent('Say "Gemini connected!" in exactly 3 words.');
        console.log('✅ Gemini API:', result.response.text().trim());
    } catch (err) {
        console.error('❌ Gemini API Error:', err.message);
        console.log('💡 TIP: If you see 404, try changing the model name to "gemini-pro" in src/services/gemini.service.js or check your API key.');
    }

    // 2. Test MongoDB
    console.log('\n--- 🍃 MongoDB ---');
    try {
        const mongoose = require('mongoose');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB: Connected successfully!');
        await mongoose.connection.close();
    } catch (err) {
        console.error('❌ MongoDB Error:', err.message);
        if (err.message.includes('querySrv ECONNREFUSED')) {
            console.log('💡 TIP: Your network is blocking DNS SRV records. Please use the "Standard Connection String" (starts with mongodb:// instead of mongodb+srv://) from Atlas.');
        }
    }

    // 3. Test Gmail SMTP
    console.log('\n--- 📧 Gmail SMTP ---');
    await verifyEmailConnection();

    console.log('\n✨ Connection test complete!\n');
}

testConnections();
