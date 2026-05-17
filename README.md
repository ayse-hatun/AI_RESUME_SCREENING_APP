<div align="center">

# 🚀 AI Resume Screening Platform

**Transforming Recruitment with Generative AI Intelligence**

[![Built with Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![Powered by Gemini](https://img.shields.io/badge/AI-Google_Gemini-orange.svg)](https://deepmind.google/technologies/gemini/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

</div>

---

## 🌟 Overview

**Stop reading resumes, start meeting talent.**

The **AI Resume Screening Platform** is an enterprise-grade solution designed to eliminate the bottleneck of manual resume review. By combining advanced natural language processing with a sleek, responsive interface, we provide recruiters with:

- ⚡ **Instant Analysis**: AI-driven scoring based on skills, experience, and cultural fit.
- 🎯 **Contextual Matching**: Deep semantic understanding of candidate qualifications against job descriptions.
- 📊 **Actionable Insights**: Detailed executive summaries explaining exactly *why* a candidate is or isn't a match.

## ✨ Core Features

- 🧠 **AI-Powered Screening Engine**: Utilizes Google's Gemini Pro to evaluate `.pdf` and `.docx` resumes intelligently.
- 🏗️ **Dynamic Candidate Pipeline**: Drag-and-drop Kanban board to seamlessly transition candidates from "Applied" to "Hired".
- 🚀 **Bulk Processing**: Upload and screen dozens of resumes simultaneously with real-time progress indicators.
- 🎨 **Premium UI/UX**: State-of-the-art Glassmorphism design with Framer Motion animations and dual theme support (Light/Dark mode).
- 🔒 **Enterprise Security**: Role-based access control, robust JWT authentication, rate limiting, and input sanitization built-in.

## 🛠️ Tech Stack

### Backend
- **Framework**: Node.js & Express.js
- **Database**: MongoDB & Mongoose
- **AI Integration**: `@google/genai` (Gemini 2.5 Flash / Pro)
- **Security**: JWT, Helmet, Express Rate Limit, Express Validator

### Frontend
- **Framework**: React 19 (Vite)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React

## 🚀 Quick Start

Get the platform up and running locally in under 2 minutes.

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Instance (Local or Atlas)
- Google Gemini API Key

### 1. Clone the Repository
```bash
git clone https://github.com/ayse-hatun/AI_RESUME_SCREENING_APP.git
cd AI_RESUME_SCREENING_APP
```

### 2. Install Dependencies
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 3. Environment Configuration
Create a `.env` file in the root directory (never commit this file!):
```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
GEMINI_API_KEY=your_google_gemini_api_key
```

### 4. Launch the Application
```bash
# Run the backend server (from the root directory)
npm run dev

# In a new terminal, run the frontend app
cd frontend
npm run dev
```

Visit `http://localhost:5173` to view the application!

## 📖 Documentation

For detailed architecture, API references, and deployment guides, please check our [Comprehensive Documentation](./DOCUMENTATION.md).

## 🤝 Contributing

We welcome contributions! Please follow standard GitHub flow:
1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🛡️ License

Distributed under the MIT License. See `LICENSE` for more information.

---
<div align="center">
Built with ❤️ for the future of hiring.
</div>
