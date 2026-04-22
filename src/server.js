require('dotenv').config();
const app = require('./app');
const conectDB = require('./DB/db');

const PORT = process.env.PORT || 3000;

async function startServer() {
    await conectDB();
    app.listen(PORT, () => {
        console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
}

startServer().catch(error => {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
});