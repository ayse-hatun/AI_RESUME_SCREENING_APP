// Step 1: Generate a sample resume PDF
// Step 2: POST it to /api/screen-resume
// Step 3: Show the AI result + confirm email sent

const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const FormData = require('form-data');
const http = require('http');

// ─── 1. Generate Sample Resume PDF ────────────────────────────────────────────
function generateSampleResume() {
    return new Promise((resolve, reject) => {
        const outputPath = path.join(__dirname, 'test-resume.pdf');
        const doc = new PDFDocument({ margin: 50 });
        const stream = fs.createWriteStream(outputPath);
        doc.pipe(stream);

        // Header
        doc.fontSize(22).font('Helvetica-Bold').text('Sara Ahmed', { align: 'center' });
        doc.fontSize(11).font('Helvetica').fillColor('#555555')
            .text('sara.ahmed@email.com  |  +92-300-1234567  |  Karachi, Pakistan', { align: 'center' });
        doc.moveDown(0.5);
        doc.moveTo(50, doc.y).lineTo(562, doc.y).stroke('#cccccc');
        doc.moveDown(0.8);

        // Summary
        doc.fontSize(13).font('Helvetica-Bold').fillColor('#000000').text('PROFESSIONAL SUMMARY');
        doc.moveDown(0.3);
        doc.fontSize(10).font('Helvetica').fillColor('#333333')
            .text('Results-driven Full Stack Developer with 3+ years of experience building scalable web applications using Node.js, React, and MongoDB. Strong background in REST API design, cloud deployments, and agile development. Passionate about writing clean, maintainable code and delivering quality software products.');
        doc.moveDown(0.8);

        // Skills
        doc.fontSize(13).font('Helvetica-Bold').fillColor('#000000').text('TECHNICAL SKILLS');
        doc.moveDown(0.3);
        const skills = [
            'Languages:    JavaScript (ES6+), TypeScript, Python, HTML5, CSS3',
            'Frontend:     React.js, Next.js, Redux, Tailwind CSS',
            'Backend:      Node.js, Express.js, REST APIs, GraphQL',
            'Database:     MongoDB, MySQL, PostgreSQL, Redis',
            'DevOps:       Docker, AWS EC2/S3, GitHub Actions, Nginx',
            'Tools:        Git, Postman, VS Code, Jira, Figma'
        ];
        skills.forEach(s => {
            doc.fontSize(10).font('Helvetica').fillColor('#333333').text(s);
        });
        doc.moveDown(0.8);

        // Experience
        doc.fontSize(13).font('Helvetica-Bold').fillColor('#000000').text('WORK EXPERIENCE');
        doc.moveDown(0.3);

        doc.fontSize(11).font('Helvetica-Bold').text('Full Stack Developer — TechSolve Pvt. Ltd., Karachi');
        doc.fontSize(10).font('Helvetica').fillColor('#666666').text('Jan 2023 – Present');
        doc.fontSize(10).fillColor('#333333')
            .text('• Built RESTful APIs using Node.js/Express serving 10K+ daily users')
            .text('• Developed React dashboards with real-time data using WebSockets')
            .text('• Reduced page load time by 40% through lazy loading and caching strategies')
            .text('• Integrated payment gateways (Stripe, JazzCash) into e-commerce platform')
            .text('• Managed MongoDB Atlas clusters and wrote complex aggregation pipelines');
        doc.moveDown(0.5);

        doc.fontSize(11).font('Helvetica-Bold').fillColor('#000000').text('Junior Web Developer — Devify Agency, Karachi');
        doc.fontSize(10).font('Helvetica').fillColor('#666666').text('Jul 2021 – Dec 2022');
        doc.fontSize(10).fillColor('#333333')
            .text('• Developed 15+ client websites using React and vanilla JavaScript')
            .text('• Built Node.js microservices and integrated third-party APIs')
            .text('• Collaborated with UI/UX team, translating Figma designs into responsive code');
        doc.moveDown(0.8);

        // Education
        doc.fontSize(13).font('Helvetica-Bold').fillColor('#000000').text('EDUCATION');
        doc.moveDown(0.3);
        doc.fontSize(11).font('Helvetica-Bold').text('B.Sc. Computer Science — University of Karachi');
        doc.fontSize(10).font('Helvetica').fillColor('#666666').text('2017 – 2021  |  GPA: 3.6/4.0');
        doc.moveDown(0.8);

        // Certifications
        doc.fontSize(13).font('Helvetica-Bold').fillColor('#000000').text('CERTIFICATIONS');
        doc.moveDown(0.3);
        doc.fontSize(10).font('Helvetica').fillColor('#333333')
            .text('• AWS Certified Solutions Architect – Associate (2023)')
            .text('• Meta Full Stack Developer Certificate – Coursera (2022)')
            .text('• MongoDB University – M001 & M121 Certified');

        doc.end();
        stream.on('finish', () => resolve(outputPath));
        stream.on('error', reject);
    });
}

// ─── 2. POST Resume to API ─────────────────────────────────────────────────────
function sendResumeToAPI(pdfPath) {
    return new Promise((resolve, reject) => {
        const form = new FormData();
        form.append('resume', fs.createReadStream(pdfPath), {
            filename: 'sara_ahmed_resume.pdf',
            contentType: 'application/pdf'
        });
        form.append('candidateName', 'Sara Ahmed');
        form.append('candidateEmail', 'aysehatun986@gmail.com');   // Send result to this email
        form.append('jobTitle', 'Senior Full Stack Developer');
        form.append('jobDescription', `
            We are looking for a Senior Full Stack Developer to join our growing team.

            Requirements:
            - 3+ years of experience with Node.js and React.js
            - Strong knowledge of MongoDB and SQL databases
            - Experience with REST API design and development
            - Familiarity with AWS or other cloud platforms
            - Understanding of Docker and CI/CD pipelines
            - TypeScript experience is a plus
            - Strong problem-solving skills and attention to detail
            - Good communication skills and ability to work in agile teams

            Responsibilities:
            - Design and develop scalable backend services
            - Build responsive React frontends
            - Collaborate with cross-functional teams
            - Participate in code reviews
        `);

        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/api/screen-resume',
            method: 'POST',
            headers: form.getHeaders()
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(data) }));
        });

        req.on('error', reject);
        form.pipe(req);
    });
}

// ─── 3. Run Full Test ──────────────────────────────────────────────────────────
async function runFullTest() {
    console.log('\n' + '═'.repeat(55));
    console.log('  🧪  AI RESUME SCREENING — FULL END-TO-END TEST');
    console.log('═'.repeat(55) + '\n');

    // Step 1: Generate PDF
    console.log('📄 Step 1: Generating sample resume PDF...');
    const pdfPath = await generateSampleResume();
    const stats = fs.statSync(pdfPath);
    console.log(`   ✅ PDF created: test-resume.pdf (${(stats.size / 1024).toFixed(1)} KB)\n`);

    // Step 2: Send to API
    console.log('🚀 Step 2: POSTing resume to /api/screen-resume...');
    console.log('   🤖 Waiting for Gemini AI to screen the resume...\n');
    const response = await sendResumeToAPI(pdfPath);

    // Step 3: Show results
    if (response.status === 200 && response.body.success) {
        const r = response.body.data.screeningResult;
        const score = r.matchScore;
        const bar = '█'.repeat(Math.floor(score / 5)) + '░'.repeat(20 - Math.floor(score / 5));

        console.log('═'.repeat(55));
        console.log('  ✅  SCREENING COMPLETE');
        console.log('═'.repeat(55));
        console.log(`\n  Candidate : ${response.body.data.candidateName}`);
        console.log(`  Job       : ${response.body.data.jobTitle}`);
        console.log(`  Resume ID : ${response.body.data.resumeId}`);
        console.log('\n' + '─'.repeat(55));
        console.log(`  Match Score : ${score}/100`);
        console.log(`  Progress    : [${bar}] ${score}%`);
        console.log(`  Verdict     : ${r.verdict}`);
        console.log(`  Exp Match   : ${r.experienceMatch}`);
        console.log('\n  📋 Summary:');
        console.log(`  ${r.summary}`);
        console.log('\n  💪 Strengths:');
        r.strengths?.forEach(s => console.log(`    ✅ ${s}`));
        console.log('\n  ⚠️  Weaknesses:');
        r.weaknesses?.forEach(w => console.log(`    ❌ ${w}`));
        console.log('\n  🛠️  Skills Matched : ' + (r.skills?.matched?.join(', ') || 'N/A'));
        console.log('  🛠️  Skills Missing : ' + (r.skills?.missing?.join(', ') || 'N/A'));
        console.log('\n  🎯 Recommendation:');
        console.log(`  ${r.recommendation}`);
        console.log('\n' + '─'.repeat(55));
        console.log(`  📧 Email Sent : ${response.body.data.emailSent ? '✅ Yes → aysehatun986@gmail.com' : '⚠️ No'}`);
        console.log(`  💾 Saved to   : MongoDB Atlas`);
        console.log('═'.repeat(55) + '\n');
    } else {
        console.error('❌ Test failed!');
        console.error('Status:', response.status);
        console.error('Response:', JSON.stringify(response.body, null, 2));
    }
}

runFullTest().catch(err => {
    console.error('\n❌ Test error:', err.message);
    process.exit(1);
});
