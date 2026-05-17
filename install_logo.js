const fs = require('fs');
const path = require('path');

const logoSource = "C:\\Users\\AKUWAT\\.gemini\\antigravity\\brain\\3f8106ed-7577-4588-b099-88aacf75463c\\smarthire_logo_1779010504206.png";
const logoDest = path.join(__dirname, 'frontend', 'public', 'logo.png');
const faviconDest = path.join(__dirname, 'frontend', 'public', 'favicon.png');

try {
    if (fs.existsSync(logoSource)) {
        // Create destination directory if it doesn't exist
        const publicDir = path.dirname(logoDest);
        if (!fs.existsSync(publicDir)) {
            fs.mkdirSync(publicDir, { recursive: true });
        }

        // Copy files
        fs.copyFileSync(logoSource, logoDest);
        fs.copyFileSync(logoSource, faviconDest);
        console.log("✅ Logo and Favicon copied successfully to frontend/public/!");
    } else {
        console.error("❌ Source logo file not found in brain directory.");
    }
} catch (error) {
    console.error("❌ Error copying logo:", error.message);
}
