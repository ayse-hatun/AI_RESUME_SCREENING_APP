// Email Service
// Sends screening result emails via Gmail SMTP using Nodemailer

require('dotenv').config();
const nodemailer = require('nodemailer');
const dns = require('dns');

// Force Node.js to prefer IPv4 DNS resolution over IPv6 to prevent ENETUNREACH in IPv4-only networks (like Railway)
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}

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

// Helper to get a valid, safe FROM address
function getFromAddress() {
    if (process.env.EMAIL_FROM && process.env.EMAIL_FROM.trim()) {
        return process.env.EMAIL_FROM.trim();
    }
    if (process.env.EMAIL_USER && process.env.EMAIL_USER.trim()) {
        return `"AI Resume Screener" <${process.env.EMAIL_USER.trim()}>`;
    }
    return '"AI Resume Screener" <noreply@smarthire.ai>';
}

// Create reusable transporter using Gmail SMTP with connection pooling for production stability
const transporter = nodemailer.createTransport({
    service: 'gmail',
    pool: true,             // Enable connection pooling
    maxConnections: 5,      // Keep up to 5 connections open
    maxMessages: 100,       // Max messages per connection
    rateDelta: 1000,
    rateLimit: 5,           // Max 5 messages per second
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS      // Gmail App Password (16 chars)
    },
    // Force Node.js socket resolver to use IPv4 family
    lookup: (hostname, options, callback) => {
        dns.lookup(hostname, { family: 4 }, callback);
    },
    connectionTimeout: 10000, // 10s timeout to avoid hangs
    greetingTimeout: 10000,
    socketTimeout: 15000
});

/**
 * Sends a resume screening result email to the candidate
 * @param {string} toEmail - Candidate's email address
 * @param {string} candidateName - Candidate's name
 * @param {string} jobTitle - Job they applied for
 * @param {Object} screeningResult - The AI-generated screening result object
 */
async function sendScreeningResultEmail(toEmail, candidateName, jobTitle, screeningResult) {
    // Validate recipient and skip if empty or a placeholder
    if (!toEmail || toEmail.trim() === '' || toEmail === 'bulk-upload@pending.ai' || toEmail.includes('pending.ai')) {
        console.log(`ℹ️ [Email Service] Skipping acknowledgement email: "${toEmail}" is empty, missing, or a placeholder.`);
        return { skipped: true, reason: 'placeholder_or_empty_email' };
    }

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
        from: getFromAddress(),
        to: toEmail,
        subject: `Application Received – ${jobTitle}`, // Plain text subject line
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

async function sendStatusUpdateEmail(toEmail, candidateName, jobTitle, stage, _shortReason = '') {
    // Validate recipient and skip if empty or a placeholder
    if (!toEmail || toEmail.trim() === '' || toEmail === 'bulk-upload@pending.ai' || toEmail.includes('pending.ai')) {
        console.log(`ℹ️ [Email Service] Skipping status update email (${stage}): "${toEmail}" is empty, missing, or a placeholder.`);
        return { skipped: true, reason: 'placeholder_or_empty_email' };
    }

    console.log(`✉️ [Email Service] Initiating status email (${stage}) for ${candidateName} (${toEmail}) | Job: ${jobTitle}`);

    let subject = '';
    let message = '';
    let headerColor = '';
    let headerText = '';

    if (stage === 'shortlisted') {
        subject = `Congratulations! You've been Shortlisted for ${jobTitle}`;
        headerColor = 'linear-gradient(135deg, #08544A, #32BB32)'; // Brand Green Gradient
        headerText = 'Great News!';
        message = `<p>Hi <span class="highlight">${escapeHtml(candidateName)}</span>,</p>
                   <p>Thank you so much for taking the time to apply for the <strong>${escapeHtml(jobTitle)}</strong> position.</p>
                   <p>We are delighted to inform you that your profile stood out to us, and you have been <strong>shortlisted</strong> for the next round! Our recruitment team is very excited about your potential and will be reaching out to you shortly with details regarding the next steps.</p>
                   <p>We appreciate your patience and look forward to connecting with you soon.</p>`;
    } else if (stage === 'rejected') {
        subject = `Update on your application for ${jobTitle}`;
        headerColor = 'linear-gradient(135deg, #475569, #1e293b)'; // Slate Gray Gradient
        headerText = 'Application Update';
        message = `<p>Hi <span class="highlight">${escapeHtml(candidateName)}</span>,</p>
                   <p>Thank you very much for applying for the <strong>${escapeHtml(jobTitle)}</strong> position and for your interest in joining our team.</p>
                   <p>While we were impressed by your background, we regret to inform you that we will not be moving forward with your application at this time. We receive many strong applications, and making these decisions is never easy.</p>
                   <p>We sincerely appreciate the time and effort you put into your application, and we wish you absolute best in your future career endeavors.</p>`;
    } else if (stage === 'applied') {
        subject = `Application Received: ${jobTitle}`;
        headerColor = 'linear-gradient(135deg, #3b82f6, #2563eb)'; // Blue Gradient
        headerText = 'Application Received';
        message = `<p>Hi <span class="highlight">${escapeHtml(candidateName)}</span>,</p>
                   <p>This is to confirm that we have successfully received your application for the <strong>${escapeHtml(jobTitle)}</strong> position.</p>
                   <p>Our team is currently reviewing your profile and will get back to you as soon as possible.</p>`;
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
    body { font-family: 'Inter', 'Segoe UI', Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 40px 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
    .header { background: ${headerColor}; padding: 40px 32px; text-align: center; color: white; }
    .header h1 { margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.5px; }
    .body { padding: 40px 36px; color: #334155; font-size: 16px; line-height: 1.7; }
    .body p { margin-top: 0; margin-bottom: 20px; }
    .highlight { font-weight: 600; color: #0f172a; }
    .divider { height: 1px; background-color: #e2e8f0; margin: 30px 0; border: none; }
    .footer { text-align: center; padding: 24px; background: #f8fafc; color: #64748b; font-size: 13px; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${headerText}</h1>
    </div>
    <div class="body">
      ${message}
      <hr class="divider">
      <p style="margin-bottom: 0;">Warm regards,<br><span class="highlight">The Hiring Team</span></p>
    </div>
    <div class="footer">
      This is an automated notification. Please do not reply directly to this email.
    </div>
  </div>
</body>
</html>
`;

    const mailOptions = {
        from: getFromAddress(),
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
        from: getFromAddress(),
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
        from: getFromAddress(),
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

