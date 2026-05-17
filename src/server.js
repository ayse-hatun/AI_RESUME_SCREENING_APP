require('dotenv').config({ override: true });

// Verify critical environment variables
if (!process.env.JWT_SECRET) {
    console.error('❌ FATAL ERROR: JWT_SECRET is not defined in environment variables.');
    console.error('The application cannot start without a secure JWT secret.');
    process.exit(1);
}

const app = require('./app');
const connectDB = require('./DB/db');

const PORT = process.env.PORT || 3000;

async function startServer() {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
}

startServer().catch(error => {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
});

// Handle unhandled promise rejections globally
process.on('unhandledRejection', (err) => {
    console.error('🔥 UNHANDLED REJECTION! Shutting down...', err.name, err.message);
    process.exit(1);
});