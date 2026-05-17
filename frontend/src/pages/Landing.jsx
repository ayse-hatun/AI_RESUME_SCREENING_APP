import React, { useState, useEffect } from 'react';
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
      scrolled ? 'bg-card/80 backdrop-blur-xl border-b border-border shadow-lg' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 bg-accent-primary rounded-xl flex items-center justify-center shadow-lg shadow-accent-primary/30 group-hover:scale-110 transition-transform">
            <ShieldCheck size={18} className="text-white" />
          </div>
          <div>
            <span className="text-lg font-black text-text-primary tracking-tight">SmartHire</span>
            <span className="text-[9px] text-accent-primary font-black uppercase tracking-widest block leading-none whitespace-nowrap">AI Platform</span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {['Features', 'How It Works', 'Pricing', 'About'].map(item => (
            <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`}
              className="text-sm font-medium text-text-secondary hover:text-accent-primary transition-all duration-300 hover:scale-110 inline-block px-2 py-1 rounded-lg hover:bg-accent-primary/5">
              {item}
            </a>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <button onClick={toggleTheme}
            className="p-2 text-text-muted hover:text-accent-primary rounded-lg transition-colors">
            {isDark ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <Link to="/login"
            className="text-sm font-semibold text-text-secondary hover:text-text-primary px-4 py-2 rounded-xl hover:bg-border transition-all">
            Sign In
          </Link>
          <Link to="/signup"
            className="text-sm font-bold bg-accent-primary hover:bg-accent-primary/90 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-accent-primary/25 hover:shadow-accent-primary/40 hover:scale-105 active:scale-95">
            Book My Free Demo
          </Link>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden flex items-center gap-2">
          <button onClick={toggleTheme} className="p-2 text-text-muted rounded-lg">
            {isDark ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-text-secondary">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-card border-b border-border px-6 py-4 space-y-3">
          {['Features', 'How It Works', 'Pricing', 'About'].map(item => (
            <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`}
              onClick={() => setMobileOpen(false)}
              className="block text-sm font-medium text-text-secondary py-2 hover:text-accent-primary transition-all duration-300 hover:scale-105 origin-left">
              {item}
            </a>
          ))}
          <div className="flex gap-3 pt-2">
            <Link to="/login" onClick={() => setMobileOpen(false)}
              className="flex-1 text-center text-sm font-semibold border border-border text-text-primary py-2.5 rounded-xl">
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
  <div className="glass-card p-8 group hover:-translate-y-1 transition-all duration-300 hover:shadow-xl">
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${color} shadow-lg`}>
      <Icon size={22} className="text-white" />
    </div>
    <h3 className="text-lg font-bold text-text-primary mb-2">{title}</h3>
    <p className="text-text-secondary text-sm leading-relaxed">{desc}</p>
  </div>
);

const StatItem = ({ value, label }) => (
  <div className="text-center">
    <div className="text-4xl font-black text-accent-primary mb-1">{value}</div>
    <div className="text-sm text-text-secondary font-medium">{label}</div>
  </div>
);

const StepCard = ({ num, title, desc }) => (
  <div className="flex gap-5 items-start">
    <div className="w-10 h-10 min-w-[40px] rounded-2xl bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center text-accent-primary font-black text-sm">
      {num}
    </div>
    <div>
      <h4 className="font-bold text-text-primary mb-1">{title}</h4>
      <p className="text-text-secondary text-sm leading-relaxed">{desc}</p>
    </div>
  </div>
);

const TestimonialCard = ({ name, role, company, text }) => (
  <div className="bg-white dark:bg-white/5 p-8 rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex gap-1 mb-4">
      {[...Array(5)].map((_, i) => (
        <Star key={i} size={14} className="text-accent-primary fill-accent-primary" />
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

const Landing = () => {
  const [isDark, setIsDark] = useState(true);

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
      <section className="relative pt-32 pb-32 px-6 overflow-hidden min-h-[90vh] flex items-center">
        {/* Background Glows with Motion */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3],
              x: [0, 20, 0],
              y: [0, -20, 0]
            }}
            transition={{ 
              duration: 10, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-accent-primary/20 rounded-full blur-[150px]" 
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1],
              x: [0, -30, 0],
              y: [0, 30, 0]
            }}
            transition={{ 
              duration: 15, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute -top-24 left-1/4 w-[500px] h-[400px] bg-accent-secondary/10 rounded-full blur-[100px]" 
          />
        </div>
 
        <div className="relative max-w-6xl mx-auto text-center flex flex-col items-center">
          {/* Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center gap-2 bg-white/5 dark:bg-accent-primary/10 border border-accent-primary/20 text-accent-primary px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-10 shadow-2xl shadow-accent-primary/5 cursor-default"
          >
            <Sparkles size={14} className="animate-pulse" />
            Next-Gen AI Recruitment
          </motion.div>
 
          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="text-6xl md:text-8xl font-black text-text-primary leading-[1] tracking-tight mb-8 max-w-5xl">
              Hire the Best Talent<br />
              <motion.span 
                animate={{ 
                  color: ['#6366F1', '#10B981', '#6366F1'],
                }}
                transition={{ duration: 8, repeat: Infinity }}
                className="text-accent-primary inline-block mt-2"
              >
                Without the Manual Grind.
              </motion.span>
            </h1>
          </motion.div>
 
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-text-secondary max-w-3xl leading-relaxed mb-12 font-medium"
          >
            SmartHire uses <span className="text-text-primary font-bold">Gemini AI</span> to rank resumes with 95% accuracy, so you can stop filtering and start hiring your dream team in minutes.
          </motion.p>
 
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-8 text-sm text-text-muted font-bold mb-20"
          >
            {[
              { text: "No credit card required", icon: CheckCircle2 },
              { text: "Setup in 5 minutes", icon: CheckCircle2 },
              { text: "Enterprise Grade", icon: CheckCircle2 }
            ].map((item, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -2, color: 'var(--color-accent-primary)' }}
                className="flex items-center gap-2 transition-colors cursor-default"
              >
                <item.icon size={18} className="text-accent-primary" /> {item.text}
              </motion.div>
            ))}
          </motion.div>
   
          {/* Demo/Sign-up Form Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ 
              type: "spring",
              damping: 20,
              stiffness: 100,
              delay: 0.8 
            }}
            className="w-full max-w-3xl relative"
          >
            {/* Decorative background for card */}
            <div className="absolute -inset-4 bg-gradient-to-r from-accent-primary/20 via-accent-secondary/20 to-accent-primary/20 rounded-[3rem] blur-2xl opacity-50 -z-10 animate-pulse" />
            
            <div className="bg-white dark:bg-[#0f172a] p-10 md:p-14 rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] dark:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] border border-white/20 dark:border-white/5 relative overflow-hidden group">
              {/* Animated Top border */}
              <motion.div 
                animate={{ 
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-accent-primary via-accent-secondary to-accent-primary bg-[length:200%_auto]" 
              />
              
              <div className="relative z-10">
                <motion.h3 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.1 }}
                  className="text-4xl font-black text-text-primary mb-4"
                >
                  Experience the Future
                </motion.h3>
                <p className="text-text-secondary text-lg mb-10 font-medium">Join 500+ forward-thinking teams using AI to scale.</p>
                
                <form className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left" onSubmit={(e) => { e.preventDefault(); window.location.href = '/signup'; }}>
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.2 }}
                    className="space-y-2"
                  >
                    <label className="text-[11px] font-black uppercase tracking-widest text-text-muted ml-2 flex items-center gap-2">
                      <Mail size={12} /> Work Email
                    </label>
                    <input 
                      type="email" 
                      required
                      placeholder="name@company.com" 
                      className="w-full bg-background/50 border border-border px-6 py-5 rounded-2xl outline-none focus:ring-4 focus:ring-accent-primary/10 focus:border-accent-primary transition-all font-semibold placeholder:text-text-muted/50"
                    />
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.2 }}
                    className="space-y-2"
                  >
                    <label className="text-[11px] font-black uppercase tracking-widest text-text-muted ml-2 flex items-center gap-2">
                      <Briefcase size={12} /> Company Name
                    </label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Acme Corp" 
                      className="w-full bg-background/50 border border-border px-6 py-5 rounded-2xl outline-none focus:ring-4 focus:ring-accent-primary/10 focus:border-accent-primary transition-all font-semibold placeholder:text-text-muted/50"
                    />
                  </motion.div>
                  <motion.button 
                    whileHover={{ scale: 1.02, boxShadow: '0 20px 40px -10px rgba(99, 102, 241, 0.4)' }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="md:col-span-2 w-full bg-accent-primary text-white py-6 rounded-2xl font-black text-2xl transition-all shadow-2xl shadow-accent-primary/30 mt-4 flex items-center justify-center gap-4 group overflow-hidden relative"
                  >
                    <motion.div 
                      className="absolute inset-0 bg-white/20 translate-x-[-100%]"
                      whileHover={{ x: '100%' }}
                      transition={{ duration: 0.6 }}
                    />
                    <span className="relative z-10">Claim My Free Demo</span>
                    <ArrowRight size={28} className="group-hover:translate-x-2 transition-transform relative z-10" />
                  </motion.button>
                </form>
                
                <div className="flex flex-col md:flex-row items-center justify-center gap-8 mt-12 pt-10 border-t border-border/50">
                  <div className="flex -space-x-4">
                    {[1,2,3,4,5].map(i => (
                      <motion.div 
                        key={i} 
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.5 + (i * 0.1) }}
                        whileHover={{ y: -5, zIndex: 50 }}
                        className="w-12 h-12 rounded-full border-4 border-card bg-accent-primary/10 flex items-center justify-center text-[10px] font-bold text-accent-primary overflow-hidden shadow-xl"
                      >
                        <img src={`https://i.pravatar.cc/150?u=user${i+20}`} alt="User" className="w-full h-full object-cover" />
                      </motion.div>
                    ))}
                  </div>
                  <div className="text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-1 mb-1">
                      {[1,2,3,4,5].map(i => <Star key={i} size={14} className="text-yellow-500 fill-yellow-500" />)}
                    </div>
                    <p className="text-xs text-text-muted font-bold uppercase tracking-widest">
                      Trusted by <span className="text-text-primary">2,500+ Hiring Managers</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-20 px-6 bg-[#08544A] text-white">
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
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24 px-6">
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
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-24 px-6 bg-card/20 border-y border-border">
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
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-slide-up">
            <div className="inline-block text-xs font-bold uppercase tracking-widest text-accent-primary bg-accent-primary/10 px-3 py-1 rounded-full mb-4">Pricing</div>
            <h2 className="text-4xl font-black text-text-primary mb-4">Simple, transparent pricing</h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">Start for free. Upgrade when your team grows.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 max-w-6xl mx-auto gap-8">
            
            {/* Plan 1: Free */}
            <div className="glass-card p-10 hover:-translate-y-2 transition-all duration-300">
              <h3 className="text-2xl font-bold text-text-primary mb-2">Starter</h3>
              <p className="text-text-secondary mb-6">Perfect for small teams and startups.</p>
              <div className="text-5xl font-black text-text-primary mb-8">$0<span className="text-lg text-text-muted font-medium">/mo</span></div>
              <ul className="space-y-4 mb-10">
                <li className="flex items-center gap-3 text-text-secondary"><CheckCircle2 size={18} className="text-accent-secondary" /> Up to 3 active jobs</li>
                <li className="flex items-center gap-3 text-text-secondary"><CheckCircle2 size={18} className="text-accent-secondary" /> 50 AI resume screenings/mo</li>
                <li className="flex items-center gap-3 text-text-secondary"><CheckCircle2 size={18} className="text-accent-secondary" /> Basic Kanban board</li>
              </ul>
              <Link to="/signup" className="btn-secondary w-full py-3 flex justify-center text-sm font-bold">Get Started Free</Link>
            </div>

            {/* Plan 2: Medium */}
            <div className="glass-card p-10 border-accent-primary/30 relative transition-all duration-300 transform hover:-translate-y-2 md:hover:-translate-y-4 shadow-xl">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-accent-primary text-white text-xs font-bold uppercase tracking-widest px-4 py-1 rounded-full shadow-lg">Most Popular</div>
              <h3 className="text-2xl font-bold text-text-primary mb-2">Growth</h3>
              <p className="text-text-secondary mb-6">For scaling teams handling more hiring.</p>
              <div className="text-5xl font-black text-text-primary mb-8">$49<span className="text-lg text-text-muted font-medium">/mo</span></div>
              <ul className="space-y-4 mb-10">
                <li className="flex items-center gap-3 text-text-secondary"><CheckCircle2 size={18} className="text-accent-secondary" /> Up to 15 active jobs</li>
                <li className="flex items-center gap-3 text-text-secondary"><CheckCircle2 size={18} className="text-accent-secondary" /> 500 AI resume screenings/mo</li>
                <li className="flex items-center gap-3 text-text-secondary"><CheckCircle2 size={18} className="text-accent-secondary" /> Bulk resume upload</li>
                <li className="flex items-center gap-3 text-text-secondary"><CheckCircle2 size={18} className="text-accent-secondary" /> Team collaboration (5 users)</li>
              </ul>
              <Link to="/signup" className="btn-primary w-full py-3 flex justify-center text-sm font-bold shadow-lg shadow-accent-primary/20">Upgrade to Growth</Link>
            </div>

            {/* Plan 3: Unlimited */}
            <div className="glass-card p-10 hover:-translate-y-2 transition-all duration-300">
              <h3 className="text-2xl font-bold text-text-primary mb-2">Enterprise</h3>
              <p className="text-text-secondary mb-6">For large organizations without limits.</p>
              <div className="text-5xl font-black text-text-primary mb-8">$199<span className="text-lg text-text-muted font-medium">/mo</span></div>
              <ul className="space-y-4 mb-10">
                <li className="flex items-center gap-3 text-text-secondary"><CheckCircle2 size={18} className="text-accent-secondary" /> Unlimited active jobs</li>
                <li className="flex items-center gap-3 text-text-secondary"><CheckCircle2 size={18} className="text-accent-secondary" /> Unlimited AI screenings</li>
                <li className="flex items-center gap-3 text-text-secondary"><CheckCircle2 size={18} className="text-accent-secondary" /> Advanced analytics & reporting</li>
                <li className="flex items-center gap-3 text-text-secondary"><CheckCircle2 size={18} className="text-accent-secondary" /> API Access & Integrations</li>
              </ul>
              <Link to="/signup" className="btn-secondary w-full py-3 flex justify-center text-sm font-bold">Contact Sales</Link>
            </div>

          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="py-24 px-6 bg-card/20 border-t border-border">
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
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-block text-xs font-bold uppercase tracking-widest text-accent-primary bg-accent-primary/10 px-3 py-1 rounded-full mb-4">Success Stories</div>
            <h2 className="text-4xl font-black text-text-primary mb-4">Trusted by the world's best hiring teams</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => <TestimonialCard key={i} {...t} />)}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-24 px-6 bg-card/30 border-y border-border">
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
      </section>

      {/* FINAL CTA */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto relative">
          <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/20 via-accent-secondary/10 to-accent-secondary/20 rounded-3xl blur-xl" />
          <div className="relative glass-card p-16 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-accent-primary/30">
              <ShieldCheck size={32} className="text-white" />
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
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border bg-card/40">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-accent-primary rounded-xl flex items-center justify-center">
                  <ShieldCheck size={18} className="text-white" />
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
          <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col items-center md:items-end gap-6">
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
