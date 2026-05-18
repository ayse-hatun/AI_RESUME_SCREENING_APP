// Email Service
// Sends screening result emails via Gmail SMTP using Nodemailer

require('dotenv').config();
const nodemailer = require('nodemailer');

// Helper to escape HTML to prevent XSS in emails
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Create reusable transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS      // Gmail App Password (16 chars)
    }
});

/**
 * Sends a resume screening result email to the candidate
 * @param {string} toEmail - Candidate's email address
 * @param {string} candidateName - Candidate's name
 * @param {string} jobTitle - Job they applied for
 * @param {Object} screeningResult - The AI-generated screening result object
 */
async function sendScreeningResultEmail(toEmail, candidateName, jobTitle, screeningResult) {
    // Only send a neutral acknowledgement — AI scores and analysis stay internal.
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f1f5f9; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #1e293b, #334155); padding: 36px 32px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; }
    .header p { color: #94a3b8; margin: 8px 0 0; font-size: 14px; }
    .body { padding: 36px 32px; }
    .body p { color: #475569; font-size: 15px; line-height: 1.7; margin: 0 0 16px; }
    .highlight { font-weight: 600; color: #1e293b; }
    .divider { border: none; border-top: 1px solid #e2e8f0; margin: 24px 0; }
    .note { background: #f8fafc; border-left: 4px solid #6366f1; border-radius: 4px; padding: 14px 16px; }
    .note p { color: #64748b; font-size: 13px; margin: 0; }
    .footer { text-align: center; padding: 20px; background: #f8fafc; color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Application Received</h1>
      <p>${escapeHtml(jobTitle)}</p>
    </div>
    <div class="body">
      <p>Hi <span class="highlight">${escapeHtml(candidateName)}</span>,</p>
      <p>Thank you for applying for the <span class="highlight">${escapeHtml(jobTitle)}</span> position. We have successfully received your application and resume.</p>
      <p>Our team is currently reviewing all applications and will be in touch with you regarding the next steps.</p>
      <hr class="divider">
      <div class="note">
        <p>💡 Please keep an eye on your inbox — we will notify you as soon as there is an update on your application status.</p>
      </div>
      <p style="margin-top: 24px;">Best regards,<br><span class="highlight">The Hiring Team</span></p>
    </div>
    <div class="footer">
      This is an automated confirmation. Please do not reply to this email.
    </div>
  </div>
</body>
</html>
`;

    const mailOptions = {
        from: process.env.EMAIL_FROM || `"AI Resume Screener" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: `Application Received – ${escapeHtml(jobTitle)}`,
        html: htmlContent
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Acknowledgement email sent to ${toEmail} | Message ID: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error(`❌ Failed to send acknowledgement email to ${toEmail}:`, error.message, error.stack);
        throw new Error(`Failed to send acknowledgement email: ${error.message}`);
    }
}

/**
 * Verify the email transporter is working
 */
async function verifyEmailConnection() {
    try {
        await transporter.verify();
        console.log('✅ Gmail SMTP connection verified');
        return true;
    } catch (error) {
        console.error('❌ Gmail SMTP verification failed:', error.message);
        return false;
    }
}

/**
 * Sends a status update email (e.g., shortlisted, rejected)
 */
async function sendStatusUpdateEmail(toEmail, candidateName, jobTitle, stage) {
    let subject = '';
    let message = '';
    let headerColor = '';

    if (stage === 'shortlisted') {
        subject = `Congratulations! You've been Shortlisted for ${escapeHtml(jobTitle)}`;
        headerColor = '#22c55e'; // Green
        message = `<p>Dear ${escapeHtml(candidateName)},</p>
                   <p>We have great news! Your application for the <strong>${escapeHtml(jobTitle)}</strong> position has been reviewed, and we are pleased to inform you that you have been shortlisted for the next round.</p>
                   <p>Our recruitment team will contact you shortly with the next steps.</p>`;
    } else if (stage === 'rejected') {
        subject = `Update on your application for ${escapeHtml(jobTitle)}`;
        headerColor = '#ef4444'; // Red
        message = `<p>Dear ${escapeHtml(candidateName)},</p>
                   <p>Thank you for applying for the <strong>${escapeHtml(jobTitle)}</strong> position. After careful consideration, we regret to inform you that we will not be moving forward with your application at this time.</p>
                   <p>We appreciate your interest and wish you the best in your job search.</p>`;
    } else if (stage === 'applied') {
        subject = `Application Received: ${escapeHtml(jobTitle)}`;
        headerColor = '#3b82f6'; // Blue
        message = `<p>Dear ${escapeHtml(candidateName)},</p>
                   <p>This is to confirm that we have successfully received your application for the <strong>${escapeHtml(jobTitle)}</strong> position.</p>
                   <p>Our team will review your profile and get back to you soon.</p>`;
    } else {
        console.warn(`⚠️ Unknown email stage: ${stage}`);
        throw new Error(`Unknown email stage: ${stage}`);
    }

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f1f5f9; margin: 0; padding: 20px; }
    .container { max-width: 620px; margin: auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: ${headerColor}; padding: 32px; text-align: center; color: white; }
    .header h1 { margin: 0; font-size: 22px; }
    .body { padding: 28px 32px; color: #475569; font-size: 15px; line-height: 1.6; }
    .footer { text-align: center; padding: 20px; background: #f8fafc; color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Application Update</h1>
    </div>
    <div class="body">
      ${message}
      <p>Best regards,<br>The Hiring Team</p>
    </div>
    <div class="footer">
      This is an automated message from AI Resume Screener.
    </div>
  </div>
</body>
</html>
`;

    const mailOptions = {
        from: process.env.EMAIL_FROM || `"AI Resume Screener" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: subject,
        html: htmlContent
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Status email (${stage}) sent to ${toEmail} | Message ID: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error(`❌ Failed to send status update email (${stage}) to ${toEmail}:`, error.message, error.stack);
        throw new Error(`Failed to send status update email: ${error.message}`);
    }
}

/**
 * Sends an email verification OTP
 */
async function sendVerificationEmail(toEmail, name, otpCode, verifyUrl) {
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f1f5f9; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #08544A, #32BB32); padding: 36px 32px; text-align: center; color: white; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 700; }
    .body { padding: 36px 32px; color: #475569; font-size: 15px; line-height: 1.6; text-align: center; }
    .otp-box { background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 8px; padding: 20px; margin: 24px 0; font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #32BB32; }
    .btn { display: inline-block; background: #32BB32; color: white; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: bold; margin: 24px 0; }
    .footer { text-align: center; padding: 20px; background: #f8fafc; color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Verify Your Email</h1>
    </div>
    <div class="body">
      <p>Hi <strong>${escapeHtml(name)}</strong>,</p>
      <p>Thanks for signing up for SmartHire. Please click the button below or use the 6-digit code to verify your email address. This code will expire in 15 minutes.</p>
      
      <a href="${verifyUrl}" class="btn">Verify Email Address</a>
      
      <div class="divider" style="margin: 20px 0; border-top: 1px solid #e2e8f0;"></div>
      
      <p>Or enter this verification code on the login page:</p>
      <div class="otp-box">${escapeHtml(otpCode)}</div>
      
      <p>If you didn't create an account, you can safely ignore this email.</p>
    </div>
    <div class="footer">
      © SmartHire Recruitment Platform
    </div>
  </div>
</body>
</html>
`;

    const mailOptions = {
        from: process.env.EMAIL_FROM || `"AI Resume Screener" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: `Verify your email - ${escapeHtml(otpCode)}`,
        html: htmlContent
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Verification email sent to ${toEmail}`);
        return info;
    } catch (error) {
        console.error(`❌ Failed to send verification email to ${toEmail}:`, error.message, error.stack);
        throw new Error(`Failed to send verification email: ${error.message}`);
    }
}

/**
 * Sends a password reset link
 */
async function sendPasswordResetEmail(toEmail, name, resetUrl) {
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f1f5f9; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #08544A, #32BB32); padding: 36px 32px; text-align: center; color: white; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 700; }
    .body { padding: 36px 32px; color: #475569; font-size: 15px; line-height: 1.6; text-align: center; }
    .btn { display: inline-block; background: #32BB32; color: white; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: bold; margin: 24px 0; }
    .footer { text-align: center; padding: 20px; background: #f8fafc; color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Reset Your Password</h1>
    </div>
    <div class="body">
      <p>Hi <strong>${escapeHtml(name)}</strong>,</p>
      <p>We received a request to reset your password. Click the button below to choose a new one. This link will expire in 30 minutes.</p>
      <a href="${resetUrl}" class="btn">Reset Password</a>
      <p style="font-size: 13px; color: #94a3b8; margin-top: 20px;">If you didn't request a password reset, you can safely ignore this email.</p>
    </div>
    <div class="footer">
      © SmartHire Recruitment Platform
    </div>
  </div>
</body>
</html>
`;

    const mailOptions = {
        from: process.env.EMAIL_FROM || `"AI Resume Screener" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: `Reset Your Password`,
        html: htmlContent
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Password reset email sent to ${toEmail}`);
        return info;
    } catch (error) {
        console.error(`❌ Failed to send password reset email to ${toEmail}:`, error.message, error.stack);
        throw new Error(`Failed to send password reset email: ${error.message}`);
    }
}

module.exports = { 
    sendScreeningResultEmail, 
    verifyEmailConnection, 
    sendStatusUpdateEmail,
    sendVerificationEmail,
    sendPasswordResetEmail
};

