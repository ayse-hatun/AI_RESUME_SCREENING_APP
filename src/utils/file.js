const fs = require('fs');
const path = require('path');

/**
 * Moves an uploaded file from temp storage to a secure user/recruiter folder:
 * uploads/<userId>/resumes/<filename>
 * 
 * @param {string} tempPath - Current temporary path of the file
 * @param {string} userId - Recruiter's user ID
 * @returns {string} - The new relative path of the file
 */
function moveFileToUserFolder(tempPath, userId) {
    if (!tempPath || !userId) return tempPath;
    try {
        const userUploadDir = path.join(__dirname, '../../uploads', userId.toString(), 'resumes');
        if (!fs.existsSync(userUploadDir)) {
            fs.mkdirSync(userUploadDir, { recursive: true });
        }
        
        const fileName = path.basename(tempPath);
        const destinationPath = path.join(userUploadDir, fileName);
        
        // Move the file
        fs.renameSync(tempPath, destinationPath);
        
        // Return relative path matching how other file paths are stored
        const relativePath = path.relative(process.cwd(), destinationPath);
        return relativePath;
    } catch (error) {
        console.error('❌ Error moving file to isolated user folder:', error);
        return tempPath; // Fallback to temp path on failure
    }
}

module.exports = {
    moveFileToUserFolder
};
