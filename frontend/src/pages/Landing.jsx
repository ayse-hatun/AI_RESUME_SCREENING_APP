import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, Brain, Zap, Users, BarChart3, CheckCircle2,
  ArrowRight, Star, ChevronRight, Globe, Mail, Phone, Sun, Moon, Menu, X, Sparkles,
  TrendingUp, Clock, Target, Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LandingNav = ({ isDark, toggleTheme }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', damping: 20, stiffness: 100 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/80 dark:bg-[#0a0f19]/80 backdrop-blur-xl border-b border-black/[0.04] dark:border-white/[0.04] shadow-[0_4px_30px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.2)]' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-transparent group-hover:scale-105 group-hover:rotate-3 transition-transform duration-300 overflow-hidden">
            <img src="/logo.png" alt="SmartHire Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="text-lg font-black text-text-primary tracking-tight">SmartHire</span>
            <span className="text-[9px] text-accent-primary font-black uppercase tracking-widest block leading-none whitespace-nowrap">AI Platform</span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {['Features', 'How It Works', 'Pricing', 'About'].map(item => (
            <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`}
              className="text-sm font-semibold text-text-secondary hover:text-accent-primary transition-all duration-300 relative py-2 group">
              {item}
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-accent-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </a>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <button onClick={toggleTheme}
            className="p-2 text-text-muted hover:text-accent-primary hover:scale-110 active:scale-95 rounded-lg transition-all">
            {isDark ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <Link to="/login"
            className="text-sm font-bold text-text-secondary hover:text-text-primary px-4 py-2.5 rounded-xl hover:bg-border/30 hover:scale-105 active:scale-95 transition-all">
            Sign In
          </Link>
          <Link to="/signup"
            className="text-sm font-bold bg-accent-primary hover:bg-accent-primary/95 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-accent-primary/20 hover:shadow-accent-primary/35 hover:-translate-y-0.5 active:translate-y-0 active:scale-98">
            Book My Free Demo
          </Link>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden flex items-center gap-2">
          <button onClick={toggleTheme} className="p-2 text-text-muted rounded-lg hover:scale-110 transition-all">
            {isDark ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-text-secondary hover:scale-115 transition-all">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white/95 dark:bg-[#0a0f19]/95 backdrop-blur-xl border-b border-border/40 px-6 py-6 space-y-4">
          {['Features', 'How It Works', 'Pricing', 'About'].map(item => (
            <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`}
              onClick={() => setMobileOpen(false)}
              className="block text-base font-bold text-text-secondary py-2 hover:text-accent-primary transition-all duration-300 hover:translate-x-2">
              {item}
            </a>
          ))}
          <div className="flex gap-3 pt-4 border-t border-border/30">
            <Link to="/login" onClick={() => setMobileOpen(false)}
              className="flex-1 text-center text-sm font-semibold border border-border/50 text-text-primary py-2.5 rounded-xl">
              Sign In
            </Link>
            <Link to="/signup" onClick={() => setMobileOpen(false)}
              className="flex-1 text-center text-sm font-bold bg-accent-primary text-white py-2.5 rounded-xl">
              Book Demo
            </Link>
          </div>
        </div>
      )}
    </motion.nav>
  );
};

const FeatureCard = ({ icon: Icon, color, title, desc }) => (
  <div className="bg-white dark:bg-[#0f172a]/80 backdrop-blur-md p-8 rounded-2.5xl border border-black/[0.04] dark:border-white/[0.05] shadow-[0_15px_35px_-5px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_45px_-10px_rgba(0,0,0,0.3)] hover:shadow-[0_25px_50px_-15px_rgba(50,187,50,0.12)] dark:hover:shadow-[0_25px_50px_-15px_rgba(50,187,50,0.18)] group hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${color} shadow-[0_10px_20px_rgba(0,0,0,0.06)]`}>
      <Icon size={22} className="text-white" />
    </div>
    <h3 className="text-lg font-bold text-text-primary mb-2 group-hover:text-accent-primary transition-colors">{title}</h3>
    <p className="text-text-secondary text-sm leading-relaxed font-medium">{desc}</p>
  </div>
);

const StatItem = ({ value, label }) => (
  <div className="text-center">
    <div className="text-4xl font-black text-accent-primary mb-1">{value}</div>
    <div className="text-sm text-text-secondary font-medium">{label}</div>
  </div>
);

const StepCard = ({ num, title, desc }) => (
  <div className="flex gap-5 items-start p-4 hover:bg-white/50 dark:hover:bg-white/[0.02] rounded-2xl transition-all duration-300 group">
    <div className="w-10 h-10 min-w-[40px] rounded-2xl bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center text-accent-primary font-black text-sm group-hover:scale-110 transition-transform duration-300">
      {num}
    </div>
    <div>
      <h4 className="font-bold text-text-primary mb-1 group-hover:text-accent-primary transition-colors">{title}</h4>
      <p className="text-text-secondary text-sm leading-relaxed font-medium">{desc}</p>
    </div>
  </div>
);

const TestimonialCard = ({ name, role, company, text }) => (
  <div className="bg-white dark:bg-[#0f172a]/80 backdrop-blur-md p-8 rounded-2.5xl border border-black/[0.04] dark:border-white/[0.05] shadow-[0_15px_35px_-5px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_45px_-10px_rgba(0,0,0,0.3)] hover:-translate-y-1.5 transition-all duration-300">
    <div className="flex gap-1 mb-4">
      {[...Array(5)].map((_, i) => (
        <Star key={i} size={14} className="text-yellow-500 fill-yellow-500" />
      ))}
    </div>
    <p className="text-text-secondary text-base leading-relaxed mb-6 font-medium">"{text}"</p>
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-full bg-accent-primary/10 flex items-center justify-center text-accent-primary font-bold text-sm">
        {name.charAt(0)}
      </div>
      <div>
        <p className="text-sm font-bold text-text-primary">{name}</p>
        <p className="text-xs text-text-muted font-medium">{role} @ {company}</p>
      </div>
    </div>
  </div>
);

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-border py-6">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left group"
      >
        <span className="text-lg font-bold text-text-primary group-hover:text-accent-primary transition-colors">{question}</span>
        <ChevronRight size={20} className={`text-text-muted transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} />
      </button>
      {isOpen && (
        <div className="mt-4 text-text-secondary leading-relaxed animate-fade-in">
          {answer}
        </div>
      )}
    </div>
  );
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 90,
      damping: 18
    }
  }
};

const Landing = () => {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
  const heroRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    heroRef.current.style.setProperty('--mouse-x', `${x}px`);
    heroRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

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

  const features = [
    { icon: Brain, color: 'bg-accent-primary', title: 'AI-Powered Screening', desc: 'Gemini AI reads every resume and scores candidates against your job requirements with 95%+ accuracy — in seconds, not hours.' },
    { icon: Zap, color: 'bg-accent-secondary', title: 'Instant Ranking', desc: 'Candidates are automatically ranked and routed through your pipeline. No more spreadsheets. No more back-and-forth.' },
    { icon: BarChart3, color: 'bg-[#08544A]', title: 'Deep Analytics', desc: 'Track hiring funnels, match score distributions, and team performance from a single beautiful dashboard.' },
    { icon: Target, color: 'bg-accent-primary/80', title: 'Smart Match Scoring', desc: 'Every resume gets a precise match score based on skills, experience, and role requirements — fully configurable.' },
    { icon: Users, color: 'bg-accent-secondary/80', title: 'Kanban Pipeline', desc: 'Drag-and-drop candidates across Applied, Shortlisted, Interviewed, and Hired stages with one click.' },
    { icon: TrendingUp, color: 'bg-text-secondary', title: 'Bulk Upload', desc: 'Upload dozens of resumes at once. Our AI processes them all simultaneously and delivers ranked results instantly.' },
  ];

  const steps = [
    { num: '01', title: 'Create a Job Role', desc: 'Define the role with a description and requirements. Our AI learns what you\'re looking for.' },
    { num: '02', title: 'Upload Resumes in Bulk', desc: 'Drop in a folder of PDFs or Word docs — our engine processes them all in parallel.' },
    { num: '03', title: 'AI Scores & Ranks', desc: 'Each resume is scored against your criteria. Top candidates float to the top instantly.' },
    { num: '04', title: 'Hire the Best', desc: 'Move candidates through your pipeline, collaborate with your team, and make faster decisions.' },
  ];

  const testimonials = [
    { name: 'Sarah Chen', role: 'Head of Talent', company: 'Vercel', rating: 5, text: 'SmartHire cut our time-to-hire by 70%. The AI scoring is shockingly accurate — it surfaces candidates we would have missed.' },
    { name: 'Marcus Webb', role: 'Engineering Manager', company: 'Stripe', rating: 5, text: 'We reviewed 400 resumes for a senior role in under 2 hours. The ranked list was exactly what we needed. Game changer.' },
    { name: 'Priya Nair', role: 'HR Director', company: 'Notion', rating: 5, text: 'The Kanban pipeline alone is worth it. Our entire recruiting team now lives in SmartHire. Incredible product.' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <LandingNav isDark={isDark} toggleTheme={toggleTheme} />

      {/* HERO */}
      <section 
        id="hero"
        ref={heroRef}
        onMouseMove={handleMouseMove}
        className="relative pt-32 pb-32 px-6 overflow-hidden min-h-[95vh] flex items-center group/hero"
        style={{
          background: isDark 
            ? 'linear-gradient(180deg, #090b11 0%, #061011 50%, #090e1a 100%)' 
            : 'linear-gradient(180deg, #f8fafc 0%, #f0fdf4 50%, #eff6ff 100%)'
        }}
      >
        {/* Subtle Base Grid Pattern Overlay */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, ${isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'} 1px, transparent 1px),
              linear-gradient(to bottom, ${isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'} 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />

        {/* Dynamic Glowing Hover Grid Pattern Layer (Responsive to Mouse position and shifts dynamically) */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-0 group-hover/hero:opacity-100 transition-opacity duration-700"
          style={{
            backgroundImage: `
              linear-gradient(to right, ${isDark ? 'rgba(16,185,129,0.22)' : 'rgba(16,185,129,0.18)'} 1.5px, transparent 1.5px),
              linear-gradient(to bottom, ${isDark ? 'rgba(16,185,129,0.22)' : 'rgba(16,185,129,0.18)'} 1.5px, transparent 1.5px)
            `,
            backgroundSize: '50px 50px',
            transform: 'scale(1.002) translate(calc(var(--mouse-x, 0px) * 0.003), calc(var(--mouse-y, 0px) * 0.003))',
            transition: 'transform 0.15s cubic-bezier(0.1, 0.8, 0.25, 1), opacity 0.5s ease',
            maskImage: 'radial-gradient(circle 180px at var(--mouse-x, 0px) var(--mouse-y, 0px), black 20%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(circle 180px at var(--mouse-x, 0px) var(--mouse-y, 0px), black 20%, transparent 100%)',
          }}
        />

        {/* Aurora Gradient Blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Green Blurred Blob */}
          <motion.div
            animate={{
              x: [0, 30, 0],
              y: [0, -20, 0],
              scale: [1, 1.08, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-1/4 left-1/4 w-[350px] h-[350px] rounded-full bg-emerald-500/15 blur-[120px]"
          />
          {/* Blue Blurred Blob */}
          <motion.div
            animate={{
              x: [0, -40, 0],
              y: [0, 30, 0],
              scale: [1, 1.12, 1],
            }}
            transition={{
              duration: 24,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-1/3 right-1/4 w-[450px] h-[450px] rounded-full bg-blue-500/15 blur-[120px]"
          />
        </div>

        {/* Main Composition Wrapper */}
        <div className="relative max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center z-10 px-4">
          
          {/* Left Column - Content */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-7 flex flex-col items-start text-left relative"
          >
            {/* Aurora Glow Behind Text (Green & Blue) */}
            <div className="absolute -inset-10 pointer-events-none -z-10 overflow-hidden select-none opacity-40 dark:opacity-35">
              <div className="absolute top-12 left-10 w-80 h-80 rounded-full bg-emerald-500/20 dark:bg-emerald-500/15 blur-[100px] animate-pulse" />
              <div className="absolute bottom-12 right-20 w-80 h-80 rounded-full bg-blue-500/20 dark:bg-blue-500/15 blur-[100px] animate-pulse" style={{ animationDelay: '3s' }} />
            </div>

            {/* Badge */}
            <motion.div 
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              className="inline-flex items-center gap-2 bg-white/5 dark:bg-accent-primary/10 border border-accent-primary/20 text-accent-primary px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6 shadow-2xl shadow-accent-primary/5 cursor-default"
            >
              <Sparkles size={13} className="animate-pulse" />
              Next-Gen AI Recruitment
            </motion.div>

            {/* Headline */}
            <motion.h1 
              variants={itemVariants}
              className="text-5xl md:text-6xl font-black text-text-primary leading-[1.1] tracking-tight mb-6 max-w-2xl"
            >
              Hire the Best Talent<br />
              <motion.span 
                animate={{ 
                  color: ['#6366F1', '#10B981', '#6366F1'],
                }}
                transition={{ duration: 8, repeat: Infinity }}
                className="text-accent-primary inline-block mt-1"
              >
                Without the Manual Grind.
              </motion.span>
            </motion.h1>

            {/* Paragraph */}
            <motion.p 
              variants={itemVariants}
              className="text-lg md:text-xl text-text-secondary max-w-xl leading-relaxed mb-8 font-medium"
            >
              SmartHire uses <span className="text-text-primary font-bold">Gemini AI</span> to rank resumes with 95% accuracy, so you can stop filtering and start hiring your dream team in minutes.
            </motion.p>

            {/* Direct signup inline form or simple premium CTA button group */}
            <motion.div 
              variants={itemVariants}
              className="w-full max-w-lg mb-8 z-20"
            >
              <form 
                className="flex flex-col sm:flex-row gap-3 w-full bg-white dark:bg-[#0f172a]/90 p-2.5 sm:p-3 rounded-2.5xl border border-border/50 shadow-[0_20px_50px_rgba(50,187,50,0.08)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.45)] focus-within:ring-4 focus-within:ring-accent-primary/15 focus-within:border-accent-primary/50 transition-all duration-300"
                onSubmit={(e) => { e.preventDefault(); window.location.href = '/signup'; }}
              >
                <input 
                  type="email" 
                  required
                  placeholder="Enter your work email" 
                  className="flex-1 bg-transparent px-5 py-3.5 outline-none font-semibold text-text-primary text-sm placeholder:text-text-muted/50"
                />
                <motion.button 
                  whileHover={{ y: -2, scale: 1.02, boxShadow: '0 12px 25px -4px rgba(50, 187, 50, 0.4)' }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="bg-accent-primary hover:bg-accent-primary/95 text-white px-7 py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                >
                  Get Started <ArrowRight size={16} />
                </motion.button>
              </form>
            </motion.div>

            {/* Trust indicators */}
            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-4 border-t border-border/50 w-full max-w-md"
            >
              <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <div 
                    key={i} 
                    className="w-8 h-8 rounded-full border-2 border-card bg-accent-primary/10 flex items-center justify-center text-[10px] font-bold text-accent-primary overflow-hidden shadow-md"
                  >
                    <img src={`https://i.pravatar.cc/100?u=user${i+25}`} alt="User" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-0.5 mb-0.5">
                  {[1,2,3,4,5].map(i => <Star key={i} size={11} className="text-yellow-500 fill-yellow-500" />)}
                </div>
                <p className="text-[11px] text-text-muted font-bold uppercase tracking-widest">
                  Trusted by <span className="text-text-primary">2,500+ Hiring Managers</span>
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column - Premium Floating SaaS Dashboard Card */}
          <div className="lg:col-span-5 flex justify-center relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                y: [0, -8, 0]
              }}
              transition={{
                y: {
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut"
                },
                opacity: { duration: 0.8, delay: 0.5 },
                scale: { type: "spring", stiffness: 80, damping: 18, delay: 0.5 }
              }}
              className="w-full max-w-sm bg-white dark:bg-[#0f172a]/95 backdrop-blur-md rounded-[2.5rem] shadow-[0_30px_70px_rgba(0,0,0,0.08)] dark:shadow-[0_35px_80px_rgba(0,0,0,0.55)] border border-black/5 dark:border-white/10 p-6 space-y-6 relative overflow-hidden z-20"
            >
              {/* Single card-wide active Red Screening Scanner Laser (Sweeps exactly 50% height of card) */}
              <div 
                className="absolute inset-x-0 h-[5px] bg-gradient-to-r from-red-500 via-rose-500 to-red-500 shadow-[0_0_12px_rgba(239,68,68,0.9)] z-30 pointer-events-none" 
                style={{
                  animation: 'scan-half 4s ease-in-out infinite alternate',
                }}
              />

              {/* Header section of dashboard */}
              <div className="flex items-center justify-between pb-3 border-b border-border/60">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-primary/60 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent-primary"></span>
                  </span>
                  <span className="text-xs font-bold text-text-primary uppercase tracking-widest">Smart AI Reviewer</span>
                </div>
                <span className="text-[10px] font-bold text-accent-primary bg-accent-primary/10 px-2 py-0.5 rounded-full">Candidate Feed</span>
              </div>

              {/* Candidate Section */}
              <div className="relative space-y-3 p-1">
                {/* Candidate Item 1 */}
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-white/[0.02] border border-border/60 dark:border-white/[0.05] rounded-xl">
                  <div className="w-9 h-9 rounded-full overflow-hidden border border-border/60 shadow-sm flex-shrink-0">
                    <img 
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80" 
                      alt="Sophia Vance Professional Profile" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-text-primary text-xs truncate">Sophia Vance</p>
                      <span className="text-[9px] font-extrabold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">96% MATCH</span>
                    </div>
                    <p className="text-[10px] text-text-muted mt-0.5 truncate">Senior Backend Engineer</p>
                  </div>
                </div>

                {/* Candidate Item 2 */}
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-white/[0.02] border border-border/60 dark:border-white/[0.05] rounded-xl">
                  <div className="w-9 h-9 rounded-full overflow-hidden border border-border/60 shadow-sm flex-shrink-0">
                    <img 
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80" 
                      alt="Marcus Chen Professional Profile" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-text-primary text-xs truncate">Marcus Chen</p>
                      <span className="text-[9px] font-extrabold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">89% MATCH</span>
                    </div>
                    <p className="text-[10px] text-text-muted mt-0.5 truncate">Full Stack Developer</p>
                  </div>
                </div>
              </div>

              {/* Skills Analysis breakdown */}
              <div className="space-y-3 pt-2">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">AI Skill Match Breakdown</p>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-[10px] font-medium text-text-secondary mb-1">
                      <span>System Architecture</span>
                      <span className="font-bold text-text-primary">94%</span>
                    </div>
                    <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                      <div className="h-full bg-accent-primary rounded-full" style={{ width: '94%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] font-medium text-text-secondary mb-1">
                      <span>Node.js / Express</span>
                      <span className="font-bold text-text-primary">90%</span>
                    </div>
                    <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                      <div className="h-full bg-accent-secondary rounded-full" style={{ width: '90%' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Mini Decision Verdict widget */}
              <div className="p-3 bg-accent-primary/5 dark:bg-accent-primary/10 border border-accent-primary/10 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-accent-primary/20 flex items-center justify-center">
                    <Sparkles size={11} className="text-accent-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-extrabold text-text-primary">AI Verdict</p>
                    <p className="text-[9px] text-text-secondary">Recommendation: Shortlist</p>
                  </div>
                </div>
                <span className="text-[9px] font-extrabold text-white bg-accent-primary px-2.5 py-1 rounded-lg shadow-sm shadow-accent-primary/30">
                  Highly Recommended
                </span>
              </div>

            </motion.div>
          </div>

        </div>
      </section>

      {/* STATS */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="py-20 px-6 bg-[#08544A] text-white"
      >
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12">
          <div className="text-center">
            <div className="text-5xl font-black mb-2">10×</div>
            <div className="text-white/70 text-xs font-bold uppercase tracking-widest">Faster Screening</div>
          </div>
          <div className="text-center">
            <div className="text-5xl font-black mb-2">95%</div>
            <div className="text-white/70 text-xs font-bold uppercase tracking-widest">AI Accuracy</div>
          </div>
          <div className="text-center">
            <div className="text-5xl font-black mb-2">40k+</div>
            <div className="text-white/70 text-xs font-bold uppercase tracking-widest">Resumes Scored</div>
          </div>
          <div className="text-center">
            <div className="text-5xl font-black mb-2">500+</div>
            <div className="text-white/70 text-xs font-bold uppercase tracking-widest">Global Teams</div>
          </div>
        </div>
      </motion.section>

      {/* FEATURES */}
      <motion.section 
        id="features" 
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="py-24 px-6"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block text-xs font-bold uppercase tracking-widest text-accent-primary bg-accent-primary/10 px-3 py-1 rounded-full mb-4">Features</div>
            <h2 className="text-4xl font-black text-text-primary mb-4">Everything you need to hire better</h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">From resume parsing to pipeline management — SmartHire handles the entire hiring workflow so your team doesn't have to.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => <FeatureCard key={i} {...f} />)}
          </div>
        </div>
      </motion.section>

      {/* HOW IT WORKS */}
      <motion.section 
        id="how-it-works" 
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="py-24 px-6 bg-card/20 border-y border-border"
      >
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-block text-xs font-bold uppercase tracking-widest text-accent-secondary bg-accent-secondary/10 px-3 py-1 rounded-full mb-6">How It Works</div>
            <h2 className="text-4xl font-black text-text-primary mb-4">From job post to hired in days, not months.</h2>
            <p className="text-text-secondary mb-10 leading-relaxed">SmartHire automates the heaviest part of recruiting — the initial screening — and hands you a prioritized shortlist before your morning coffee.</p>
            <div className="space-y-7">
              {steps.map((s, i) => <StepCard key={i} {...s} />)}
            </div>
          </div>
          <div className="glass-card p-8 space-y-5">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-text-primary">Live AI Scoring</h4>
              <span className="badge-emerald">Active</span>
            </div>
            {[
              { name: 'Alex Mercer', score: 94, stage: 'Shortlisted', color: 'bg-accent-secondary' },
              { name: 'Diana Reyes', score: 88, stage: 'Reviewing', color: 'bg-accent-primary' },
              { name: 'Tom Nakamura', score: 76, stage: 'Applied', color: 'bg-text-secondary' },
              { name: 'Sara Okonkwo', score: 62, stage: 'Applied', color: 'bg-text-muted' },
            ].map((c, i) => {
              const colorMap = {
                'bg-accent-secondary': 'var(--color-accent-secondary, #10B981)',
                'bg-accent-primary': 'var(--color-accent-primary, #6366F1)',
                'bg-text-secondary': 'var(--color-text-secondary, #64748b)',
                'bg-text-muted': 'var(--color-text-muted, #94a3b8)',
                default: 'inherit'
              };
              return (
                <div key={i} className="flex items-center gap-4 p-4 bg-background/60 rounded-xl border border-border">
                  <div className="w-9 h-9 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-full flex items-center justify-center text-white font-bold text-xs">
                    {c.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-text-primary text-sm">{c.name}</p>
                    <div className="w-full h-1.5 bg-border rounded-full mt-1.5">
                      <div className={`h-full rounded-full ${c.color}`} style={{ width: `${c.score}%` }} />
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-text-primary text-lg">{c.score}%</span>
                    <p className={`text-[10px] font-bold uppercase`} style={{ color: colorMap[c.color] || colorMap.default }}>{c.stage}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* PRICING */}
      <motion.section 
        id="pricing" 
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="py-24 px-6"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-slide-up">
            <div className="inline-block text-xs font-bold uppercase tracking-widest text-accent-primary bg-accent-primary/10 px-3 py-1 rounded-full mb-4">Pricing</div>
            <h2 className="text-4xl font-black text-text-primary mb-4">Simple, transparent pricing</h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">Start for free. Upgrade when your team grows.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 max-w-6xl mx-auto gap-8">
            {/* Plan 1: Free */}
            <div className="bg-white dark:bg-[#0f172a]/80 backdrop-blur-md p-10 rounded-2.5xl border border-black/[0.04] dark:border-white/[0.05] shadow-[0_15px_35px_-5px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_45px_-10px_rgba(0,0,0,0.3)] hover:-translate-y-2 transition-all duration-300">
              <h3 className="text-2xl font-bold text-text-primary mb-2">Starter</h3>
              <p className="text-text-secondary mb-6 font-medium">Perfect for small teams and startups.</p>
              <div className="text-5xl font-black text-text-primary mb-8">$0<span className="text-lg text-text-muted font-medium">/mo</span></div>
              <ul className="space-y-4 mb-10">
                <li className="flex items-center gap-3 text-text-secondary font-medium"><CheckCircle2 size={18} className="text-accent-secondary" /> Up to 3 active jobs</li>
                <li className="flex items-center gap-3 text-text-secondary font-medium"><CheckCircle2 size={18} className="text-accent-secondary" /> 50 AI resume screenings/mo</li>
                <li className="flex items-center gap-3 text-text-secondary font-medium"><CheckCircle2 size={18} className="text-accent-secondary" /> Basic Kanban board</li>
              </ul>
              <Link to="/signup" className="btn-secondary w-full py-3 flex justify-center text-sm font-bold rounded-xl">Get Started Free</Link>
            </div>

            {/* Plan 2: Medium */}
            <div className="bg-white dark:bg-[#0f172a]/95 backdrop-blur-md p-10 border border-accent-primary/30 dark:border-accent-primary/20 relative rounded-2.5xl shadow-[0_30px_60px_-10px_rgba(50,187,50,0.15)] dark:shadow-[0_35px_70px_rgba(0,0,0,0.45)] transition-all duration-300 transform hover:-translate-y-2 md:hover:-translate-y-4">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-accent-primary text-white text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg shadow-accent-primary/20">Most Popular</div>
              <h3 className="text-2xl font-bold text-text-primary mb-2">Growth</h3>
              <p className="text-text-secondary mb-6 font-medium">For scaling teams handling more hiring.</p>
              <div className="text-5xl font-black text-text-primary mb-8">$49<span className="text-lg text-text-muted font-medium">/mo</span></div>
              <ul className="space-y-4 mb-10">
                <li className="flex items-center gap-3 text-text-secondary font-medium"><CheckCircle2 size={18} className="text-accent-secondary" /> Up to 15 active jobs</li>
                <li className="flex items-center gap-3 text-text-secondary font-medium"><CheckCircle2 size={18} className="text-accent-secondary" /> 500 AI resume screenings/mo</li>
                <li className="flex items-center gap-3 text-text-secondary font-medium"><CheckCircle2 size={18} className="text-accent-secondary" /> Bulk resume upload</li>
                <li className="flex items-center gap-3 text-text-secondary font-medium"><CheckCircle2 size={18} className="text-accent-secondary" /> Team collaboration (5 users)</li>
              </ul>
              <Link to="/signup" className="btn-primary w-full py-3 flex justify-center text-sm font-bold rounded-xl shadow-lg shadow-accent-primary/20">Upgrade to Growth</Link>
            </div>

            {/* Plan 3: Unlimited */}
            <div className="bg-white dark:bg-[#0f172a]/80 backdrop-blur-md p-10 rounded-2.5xl border border-black/[0.04] dark:border-white/[0.05] shadow-[0_15px_35px_-5px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_45px_-10px_rgba(0,0,0,0.3)] hover:-translate-y-2 transition-all duration-300">
              <h3 className="text-2xl font-bold text-text-primary mb-2">Enterprise</h3>
              <p className="text-text-secondary mb-6 font-medium">For large organizations without limits.</p>
              <div className="text-5xl font-black text-text-primary mb-8">$199<span className="text-lg text-text-muted font-medium">/mo</span></div>
              <ul className="space-y-4 mb-10">
                <li className="flex items-center gap-3 text-text-secondary font-medium"><CheckCircle2 size={18} className="text-accent-secondary" /> Unlimited active jobs</li>
                <li className="flex items-center gap-3 text-text-secondary font-medium"><CheckCircle2 size={18} className="text-accent-secondary" /> Unlimited AI screenings</li>
                <li className="flex items-center gap-3 text-text-secondary font-medium"><CheckCircle2 size={18} className="text-accent-secondary" /> Advanced analytics & reporting</li>
                <li className="flex items-center gap-3 text-text-secondary font-medium"><CheckCircle2 size={18} className="text-accent-secondary" /> API Access & Integrations</li>
              </ul>
              <Link to="/signup" className="btn-secondary w-full py-3 flex justify-center text-sm font-bold rounded-xl">Contact Sales</Link>
            </div>

          </div>
        </div>
      </motion.section>

      {/* ABOUT */}
      <motion.section 
        id="about" 
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="py-24 px-6 bg-card/20 border-t border-border"
      >
        <div className="max-w-4xl mx-auto text-center animate-slide-up">
          <div className="inline-block text-xs font-bold uppercase tracking-widest text-accent-secondary bg-accent-secondary/10 px-3 py-1 rounded-full mb-6">About Us</div>
          <h2 className="text-3xl md:text-5xl font-black text-text-primary mb-8 leading-tight">Built by recruiters,<br/>powered by AI.</h2>
          <p className="text-lg text-text-secondary leading-relaxed mb-8">
            SmartHire was founded in 2026 with a simple mission: to eliminate the soul-crushing work of reading thousands of unqualified resumes, so recruiters can get back to what matters — talking to great people.
          </p>
          <p className="text-lg text-text-secondary leading-relaxed mb-12">
            By leveraging the cutting-edge reasoning capabilities of Google Gemini, we've built a system that understands context, skills, and potential just like a human recruiter does — but infinitely faster.
          </p>
          <div className="flex justify-center">
            <div className="w-16 h-1 bg-accent-primary/20 rounded-full"></div>
          </div>
        </div>
      </motion.section>

      {/* TESTIMONIALS */}
      <motion.section 
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="py-24 px-6 bg-background"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-block text-xs font-bold uppercase tracking-widest text-accent-primary bg-accent-primary/10 px-3 py-1 rounded-full mb-4">Success Stories</div>
            <h2 className="text-4xl font-black text-text-primary mb-4">Trusted by the world's best hiring teams</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => <TestimonialCard key={i} {...t} />)}
          </div>
        </div>
      </motion.section>

      {/* FAQs */}
      <motion.section 
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="py-24 px-6 bg-card/30 border-y border-border"
      >
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-text-primary mb-4">Frequently Asked Questions</h2>
            <p className="text-text-secondary font-medium">Everything you need to know about SmartHire AI.</p>
          </div>
          <div className="space-y-2">
            <FAQItem 
              question="How accurate is the AI scoring?" 
              answer="Our AI engine is powered by Google Gemini and achieves over 95% accuracy in matching candidate skills and experience against job requirements. It performs exactly like a human recruiter but in a fraction of the time."
            />
            <FAQItem 
              question="Can I upload resumes in different formats?" 
              answer="Yes! SmartHire supports PDF, DOCX, and even text files. You can upload them one by one or in bulk folders."
            />
            <FAQItem 
              question="Is my data secure?" 
              answer="Absolutely. We use enterprise-grade encryption for all data at rest and in transit. Your resumes are processed securely and are never used to train public models."
            />
            <FAQItem 
              question="Can I invite my entire recruitment team?" 
              answer="Yes, our Growth and Enterprise plans allow you to invite team members, share notes on candidates, and collaborate on the hiring pipeline."
            />
          </div>
        </div>
      </motion.section>

      {/* FINAL CTA */}
      <motion.section 
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="py-24 px-6"
      >
        <div className="max-w-4xl mx-auto relative">
          <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/20 via-accent-secondary/10 to-accent-secondary/20 rounded-3xl blur-xl" />
          <div className="relative glass-card p-16 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 bg-white shadow-2xl shadow-accent-primary/30 overflow-hidden">
              <img src="/logo.png" alt="SmartHire Logo" className="w-full h-full object-cover" />
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-text-primary mb-4">
              Ready to hire smarter?
            </h2>
            <p className="text-text-secondary text-lg mb-10 max-w-xl mx-auto">
              Join hundreds of teams already saving 10+ hours per hire with SmartHire AI. No credit card needed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup"
                className="group inline-flex items-center gap-2 bg-accent-primary hover:bg-accent-primary/90 text-white px-10 py-4 rounded-2xl font-bold text-lg transition-all shadow-2xl shadow-accent-primary/30 hover:shadow-accent-primary/50 hover:scale-105 active:scale-95">
                Book My Free Demo
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/login"
                className="inline-flex items-center gap-2 border border-border hover:border-accent-primary/40 text-text-primary px-10 py-4 rounded-2xl font-semibold text-lg transition-all hover:bg-accent-primary/5">
                Sign In to Dashboard
                <ChevronRight size={18} />
              </Link>
            </div>
            <p className="text-text-muted text-sm mt-6 flex items-center justify-center gap-4">
              <span className="flex items-center gap-1.5"><Clock size={13} /> 5-min setup</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-accent-secondary" /> No credit card</span>
              <span className="flex items-center gap-1.5"><Users size={13} /> Team-friendly</span>
            </p>
          </div>
        </div>
      </motion.section>

      {/* FOOTER */}
      <footer className="border-t border-border bg-card/40">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white overflow-hidden">
                  <img src="/logo.png" alt="SmartHire Logo" className="w-full h-full object-cover" />
                </div>
                <div>
                  <span className="text-lg font-black text-text-primary">SmartHire</span>
                  <span className="text-[9px] text-accent-primary font-black uppercase tracking-widest block leading-none">AI Platform</span>
                </div>
              </div>
              <p className="text-text-muted text-sm leading-relaxed max-w-xs">
                The AI-powered recruitment platform that helps teams hire the right people, faster.
              </p>
              <div className="flex gap-3">
                {[Globe].map((Icon, i) => (
                  <a key={i} href="#"
                    className="w-9 h-9 rounded-xl border border-border flex items-center justify-center text-text-muted hover:text-accent-primary hover:border-accent-primary/30 transition-all hover:bg-accent-primary/5">
                    <Icon size={15} />
                  </a>
                ))}
              </div>
            </div>

            {/* Product */}
            <div className="space-y-4">
              <h5 className="text-xs font-black uppercase tracking-widest text-text-muted">Product</h5>
              <ul className="space-y-2.5">
                {[
                  { name: 'Features', link: '/#features' },
                  { name: 'Pricing', link: '/#pricing' },
                  { name: 'Changelog', link: '/info#changelog' },
                  { name: 'Roadmap', link: '/info#roadmap' },
                  { name: 'API Docs', link: '/documentation#api-reference' }
                ].map(l => (
                  <li key={l.name}><Link to={l.link} className="text-sm text-text-secondary hover:text-accent-primary transition-colors">{l.name}</Link></li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div className="space-y-4">
              <h5 className="text-xs font-black uppercase tracking-widest text-text-muted">Company</h5>
              <ul className="space-y-2.5">
                {[
                  { name: 'About Us', link: '/#about' },
                  { name: 'Blog', link: '/info#blog' },
                  { name: 'Careers', link: '/info#careers' },
                  { name: 'Press Kit', link: '/info#press-kit' },
                  { name: 'Contact', link: '/info#contact' }
                ].map(l => (
                  <li key={l.name}><Link to={l.link} className="text-sm text-text-secondary hover:text-accent-primary transition-colors">{l.name}</Link></li>
                ))}
              </ul>
            </div>

            {/* Legal & Contact */}
            <div className="space-y-4">
              <h5 className="text-xs font-black uppercase tracking-widest text-text-muted">Legal</h5>
              <ul className="space-y-2.5">
                {[
                  { name: 'Privacy Policy', link: '/info#privacy-policy' },
                  { name: 'Terms of Service', link: '/info#terms-of-service' },
                  { name: 'Cookie Policy', link: '/info#cookie-policy' },
                  { name: 'GDPR', link: '/info#gdpr' },
                  { name: 'Security', link: '/info#security' }
                ].map(l => (
                  <li key={l.name}><Link to={l.link} className="text-sm text-text-secondary hover:text-accent-primary transition-colors">{l.name}</Link></li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-xs text-text-muted font-medium text-center md:text-left">
              &copy; {new Date().getFullYear()} SmartHire AI. All rights reserved.
            </div>
            <div className="flex flex-col items-center md:items-end gap-4">
              <Link to="/signup" className="btn-primary flex items-center gap-2 px-8 py-3 shadow-xl shadow-accent-primary/20">
                Book My Free Demo <ArrowRight size={18} />
              </Link>
              <div className="flex flex-wrap items-center justify-center md:justify-end gap-4 text-xs text-text-muted">
                <a href="mailto:hello@smarthire.ai" className="flex items-center gap-1.5 hover:text-accent-primary transition-colors">
                  <Mail size={12} /> hello@smarthire.ai
                </a>
                <span className="flex items-center gap-1.5">
                  <Phone size={12} /> +1 (555) 000-0000
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
