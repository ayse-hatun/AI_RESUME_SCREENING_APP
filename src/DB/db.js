require('dotenv').config();
const mongoose = require('mongoose');

async function conectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 15000,   // 15s to find server
            connectTimeoutMS: 20000,           // 20s to connect
            socketTimeoutMS: 45000,            // 45s socket timeout
            family: 4                          // Force IPv4
        });
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ Error connecting to MongoDB:', error.message);
        process.exit(1);
    }
}

module.exports = conectDB;