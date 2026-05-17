import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Rocket, 
  Terminal, 
  Cpu, 
  Layout, 
  Database, 
  Globe, 
  ChevronRight, 
  CheckCircle2, 
  Sparkles,
  ShieldCheck,
  BookOpen,
  ArrowRight,
  Sun,
  Moon,
  ArrowLeft
} from 'lucide-react';

const sections = [
  { 
    id: 'overview', 
    title: 'Overview', 
    icon: Rocket,
    content: (
      <div className="space-y-6">
        <p className="text-xl text-text-secondary leading-relaxed">
          Stop reading resumes, start meeting talent. This platform leverages Google's Gemini AI to parse, analyze, and score resumes against job descriptions in seconds.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: 'Instant Analysis', desc: 'AI-driven scoring based on skills and experience.' },
            { title: 'Seamless Management', desc: 'Dynamic pipeline to track candidates effortlessly.' },
            { title: 'Actionable Insights', desc: 'Detailed summaries for every single applicant.' }
          ].map((item, i) => (
            <div key={i} className="p-4 bg-accent-primary/5 border border-accent-primary/10 rounded-2xl">
              <h4 className="font-bold text-text-primary mb-1">{item.title}</h4>
              <p className="text-xs text-text-muted">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    )
  },
  { 
    id: 'quick-start', 
    title: 'Quick Start', 
    icon: Terminal,
    content: (
      <div className="space-y-8">
        <div>
          <h4 className="text-sm font-black uppercase tracking-widest text-text-muted mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-accent-primary/10 flex items-center justify-center text-[10px] text-accent-primary">1</span>
            Clone & Install
          </h4>
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="bg-background/50 px-4 py-2 border-b border-border flex items-center justify-between">
              <span className="text-[10px] font-bold text-text-muted">Terminal</span>
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-accent-danger/20" />
                <div className="w-2.5 h-2.5 rounded-full bg-accent-secondary/20" />
                <div className="w-2.5 h-2.5 rounded-full bg-accent-primary/20" />
              </div>
            </div>
            <pre className="p-6 text-sm font-mono text-text-primary overflow-x-auto">
{`git clone https://github.com/ayse-hatun/AI_RESUME_SCREENING_APP.git
cd AI_RESUME_SCREENING_APP

# Install Backend dependencies
npm install

# Install Frontend dependencies
cd frontend
npm install`}
            </pre>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-black uppercase tracking-widest text-text-muted mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-accent-primary/10 flex items-center justify-center text-[10px] text-accent-primary">2</span>
            Configure Environment
          </h4>
          <div className="bg-card border border-border rounded-2xl p-6">
            <p className="text-sm text-text-secondary mb-4">Create a <code className="bg-background px-1.5 py-0.5 rounded border border-border text-accent-primary font-bold">.env</code> file in the root directory:</p>
            <pre className="text-sm font-mono text-text-primary">
{`PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
GEMINI_API_KEY=your_google_gemini_api_key`}
            </pre>
          </div>
        </div>
      </div>
    )
  },
  { 
    id: 'core-features', 
    title: 'Core Features', 
    icon: Cpu,
    content: (
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 glass-card p-6 rounded-2xl border-l-4 border-l-accent-primary">
            <h4 className="font-bold text-text-primary mb-3 flex items-center gap-2">
              <Sparkles size={18} className="text-accent-primary" />
              AI-Powered Screening
            </h4>
            <p className="text-sm text-text-secondary leading-relaxed mb-4">
              Our core engine uses Google's <strong>Gemini Pro</strong> to read resumes like a human would, but at machine speed.
            </p>
            <ul className="space-y-2">
              {['Multi-Format Support (PDF/DOCX)', 'Contextual Scoring', 'Instant Executive Summaries'].map((t, i) => (
                <li key={i} className="flex items-center gap-2 text-xs text-text-muted">
                  <CheckCircle2 size={14} className="text-accent-secondary" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex-1 glass-card p-6 rounded-2xl border-l-4 border-l-accent-secondary">
            <h4 className="font-bold text-text-primary mb-3 flex items-center gap-2">
              <Layout size={18} className="text-accent-secondary" />
              Dynamic Pipeline
            </h4>
            <div className="space-y-3">
              {['Applied', 'Screening', 'Shortlisted', 'Rejected'].map((stage, i) => (
                <div key={i} className="flex items-center justify-between text-xs p-2 bg-background/50 rounded-lg border border-border">
                  <span className="font-bold text-text-secondary">{stage}</span>
                  <ArrowRight size={12} className="text-text-muted" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  },
  { 
    id: 'tech-stack', 
    title: 'Tech Stack', 
    icon: Database,
    content: (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="text-xs font-black uppercase tracking-widest text-accent-primary">The Brain (Backend)</h4>
          <div className="space-y-2">
            {[
              { name: 'Node.js & Express', desc: 'High-performance runtime' },
              { name: 'MongoDB', desc: 'Scalable document storage' },
              { name: 'Google Gemini', desc: 'LLM Intelligence' }
            ].map((tech, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-card rounded-xl border border-border text-sm">
                <span className="font-bold text-text-primary">{tech.name}</span>
                <span className="text-[10px] text-text-muted">{tech.desc}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <h4 className="text-xs font-black uppercase tracking-widest text-accent-secondary">The Face (Frontend)</h4>
          <div className="space-y-2">
            {[
              { name: 'React 19 & Vite', desc: 'Modern reactive UI' },
              { name: 'Tailwind CSS', desc: 'Utility-first styling' },
              { name: 'Framer Motion', desc: 'Premium animations' }
            ].map((tech, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-card rounded-xl border border-border text-sm">
                <span className="font-bold text-text-primary">{tech.name}</span>
                <span className="text-[10px] text-text-muted">{tech.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  },
  { 
    id: 'api-reference', 
    title: 'API Reference', 
    icon: Globe,
    content: (
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-background/50 border-b border-border">
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Endpoint</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Method</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {[
              { path: '/api/auth/register', method: 'POST', desc: 'Recruiter signup' },
              { path: '/api/auth/login', method: 'POST', desc: 'Auth token generation' },
              { path: '/api/screen-resume', method: 'POST', desc: 'AI analysis upload' },
              { path: '/api/jobs', method: 'GET', desc: 'List active postings' }
            ].map((api, i) => (
              <tr key={i} className="hover:bg-accent-primary/5 transition-colors">
                <td className="px-6 py-4 text-xs font-mono text-accent-primary">{api.path}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black ${api.method === 'POST' ? 'bg-accent-secondary/20 text-accent-secondary' : 'bg-accent-primary/20 text-accent-primary'}`}>
                    {api.method}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-text-secondary">{api.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }
];

const Help = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleTheme = () => {
    const dark = document.documentElement.classList.contains('dark');
    if (dark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.5 }
    );

    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const isLoggedIn = !!localStorage.getItem('token');

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-full flex items-center justify-center bg-transparent group-hover:scale-105 group-hover:rotate-3 transition-transform duration-300 overflow-hidden">
              <img src="/logo.png" alt="SmartHire Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="text-lg font-black text-text-primary tracking-tight">SmartHire</span>
              <span className="text-[9px] text-accent-primary font-black uppercase tracking-widest block leading-none whitespace-nowrap">Documentation</span>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <button onClick={toggleTheme} className="p-2 text-text-muted hover:text-accent-primary rounded-lg transition-colors">
              {isDark ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <Link to={isLoggedIn ? "/app" : "/"} className="flex items-center gap-2 text-sm font-bold text-text-secondary hover:text-accent-primary transition-all">
              <ArrowLeft size={16} />
              {isLoggedIn ? "Back to Dashboard" : "Back to Home"}
            </Link>
          </div>
        </div>
      </nav>

      <div className="pt-32 pb-24 px-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <div className="inline-flex items-center gap-2 bg-accent-primary/10 border border-accent-primary/20 text-accent-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
              <BookOpen size={12} />
              Knowledge Base
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-text-primary tracking-tight mb-4">
              Master the Platform.
            </h1>
            <p className="text-text-secondary text-lg font-medium max-w-xl">
              Everything you need to know about setting up, scaling, and succeeding with AI-powered recruitment.
            </p>
          </div>
          <div className="hidden lg:flex items-center gap-2 text-text-muted text-sm font-medium">
            <ShieldCheck size={16} className="text-accent-primary" />
            SOC2 Compliant Architecture
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sticky Sidebar */}
          <aside className="lg:w-64 shrink-0">
            <div className="sticky top-32 space-y-8">
              <div className="glass-card p-6 rounded-[2rem]">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-6 px-2">Table of Contents</h3>
                <nav className="space-y-1">
                  {sections.map((s) => (
                    <a
                      key={s.id}
                      href={`#${s.id}`}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                        activeSection === s.id
                          ? 'bg-accent-primary text-white shadow-lg shadow-accent-primary/20'
                          : 'text-text-secondary hover:bg-accent-primary/5 hover:text-accent-primary'
                      }`}
                    >
                      <s.icon size={18} className={activeSection === s.id ? 'text-white' : 'text-text-muted group-hover:text-accent-primary'} />
                      <span className="text-sm font-bold">{s.title}</span>
                    </a>
                  ))}
                </nav>
              </div>

              <div className="p-6 bg-gradient-to-br from-[#08544A] to-accent-primary rounded-[2rem] text-white shadow-xl shadow-accent-primary/10">
                <h4 className="font-bold mb-2 text-sm">Need Help?</h4>
                <p className="text-[11px] text-white/70 leading-relaxed mb-4">Our support engineers are available 24/7 for enterprise customers.</p>
                <button className="w-full py-2.5 bg-white text-accent-primary rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/90 transition-colors">
                  Contact Support
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 space-y-32">
            {sections.map((s) => (
              <motion.section
                key={s.id}
                id={s.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="scroll-mt-32"
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-card border border-border rounded-2xl flex items-center justify-center text-accent-primary shadow-sm">
                    <s.icon size={24} />
                  </div>
                  <h2 className="text-3xl font-black text-text-primary tracking-tight">{s.title}</h2>
                </div>
                <div className="prose dark:prose-invert max-w-none">
                  {s.content}
                </div>
              </motion.section>
            ))}
            
            {/* Footer of Docs */}
            <footer className="pt-20 border-t border-border text-center">
              <p className="text-sm text-text-muted font-medium mb-6">
                Didn't find what you were looking for? Check out our <span className="text-accent-primary cursor-pointer hover:underline">API Documentation</span> or join our <span className="text-accent-primary cursor-pointer hover:underline">Community Slack</span>.
              </p>
              <div className="flex justify-center items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-text-muted">
                Built with <Sparkles size={14} className="text-accent-primary" /> for the future of hiring.
              </div>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Help;
