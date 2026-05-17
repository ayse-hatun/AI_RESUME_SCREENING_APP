# 🚀 AI Resume Screening Platform
### *Transforming Recruitment with Generative AI Intelligence.*

---

| 📑 Table of Contents | 🌐 Overview |
| :--- | :--- |
| 1. [Overview](#-overview) | **Stop reading resumes, start meeting talent.** |
| 2. [Quick Start](#-quick-start) | This platform leverages Google's Gemini AI to parse, analyze, and score resumes against job descriptions in seconds. |
| 3. [Core Features](#-core-features) | Built for high-performance recruitment teams who value speed, precision, and a premium user experience. |
| 4. [Tech Stack](#-tech-stack) | |
| 5. [API Reference](#-api-reference) | |
| 6. [Design System](#-design-system) | |

---

## 🌟 Overview
The **AI Resume Screening Platform** is an enterprise-grade solution designed to eliminate the bottleneck of manual resume review. By combining advanced natural language processing with a sleek, responsive interface, we provide recruiters with:

*   **Instant Analysis**: AI-driven scoring based on skills, experience, and cultural fit.
*   **Seamless Management**: A dynamic pipeline to track candidates from application to hire.
*   **Actionable Insights**: Detailed summaries of why a candidate is (or isn't) a match.

---

## ⚡ Quick Start
Get the platform up and running in under 90 seconds.

### 1. Clone & Install
```bash
# Clone the repository
git clone https://github.com/ayse-hatun/AI_RESUME_SCREENING_APP.git
cd AI_RESUME_SCREENING_APP

# Install Backend dependencies
npm install

# Install Frontend dependencies
cd frontend
npm install
```

### 2. Configure Environment
Create a `.env` file in the root directory:
```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
GEMINI_API_KEY=your_google_gemini_api_key
TEST_TOKEN=your_test_jwt_token  # Required for running test scripts
ADMIN_NAME=Admin User
ADMIN_EMAIL=admin@smarthire.ai
ADMIN_PASSWORD=password123
```

### 3. Frontend Environment (Optional)
Create a `.env` file in the `frontend` directory:
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### 4. Launch the Platform
```bash
# Start Backend (from root)
npm run dev

# Start Frontend (from /frontend)
npm run dev
```

---

## 💎 Core Features

### 🧠 AI-Powered Screening
Our core engine uses Google's **Gemini Pro** to read resumes like a human would, but at machine speed.
*   **Multi-Format Support**: Parse `.pdf` and `.docx` files effortlessly.
*   **Contextual Scoring**: Candidates aren't just ranked by keywords; they're analyzed for the *depth* and *relevance* of their experience.
*   **Instant Summaries**: Get a 2-sentence executive summary for every applicant.

### 🏗️ Dynamic Recruitment Pipeline
Manage your talent pool with a drag-and-drop style pipeline.
1.  **Applied**: Initial entry point for all resumes.
2.  **Screening**: AI currently analyzing the profile.
3.  **Shortlisted**: Top talent identified by the system.
4.  **Rejected**: Profiles that didn't meet the criteria (stored for future roles).

### 🎨 Premium User Experience
*   **Glassmorphism Design**: A sleek, modern interface that feels light and professional.
*   **Dual Theme Support**: Seamless switching between Enterprise White and Deep Navy dark modes.
*   **Responsive Layout**: Fully functional on desktop, tablet, and mobile.

---

## 🛠️ Tech Stack

### Backend (The Brain)
*   **Runtime**: Node.js & Express
*   **Database**: MongoDB with Mongoose ODM
*   **Intelligence**: Google Generative AI (Gemini SDK)
*   **Security**: JWT Authentication, Helmet, Rate Limiting

### Frontend (The Face)
*   **Framework**: React 19 (Vite)
*   **Styling**: Tailwind CSS (Native Properties Implementation)
*   **Animations**: Framer Motion for buttery-smooth transitions
*   **Icons**: Lucide React for a consistent visual language

---

## 📡 API Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/auth/register` | `POST` | Create a new recruiter account |
| `/api/auth/login` | `POST` | Authenticate and get a JWT token |
| `/api/screen-resume` | `POST` | Upload and analyze a resume file |
| `/api/jobs` | `GET/POST` | Manage job postings |
| `/api/public/apply` | `POST` | Candidate-facing application portal |

---

## 🎨 Design System
The application follows a strict **Enterprise Design Language** focused on clarity and authority.

### Colors (Tokens)
*   **Primary Green**: `#32BB32` (Actionable & Trustworthy)
*   **Authority Navy**: `#08544A` (Stability & Professionalism)
*   **Surface White**: `#F8FAFC` (Clean & Readable)

### Typography
Uses **Inter**, a typeface optimized for screen readability and professional data presentation.

---

> **Built with ❤️ for the future of hiring.**
