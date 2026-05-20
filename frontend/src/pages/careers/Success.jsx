import React from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Building2, Star } from 'lucide-react';
const CareersSuccess = () => {
  const location = useLocation();
  const name = location.state?.name || 'Candidate';

  const recruiterId = location.state?.recruiterId;

  if (!location.state) {
    return <Navigate to="/careers" replace />;
  }

  return (
    <div className="min-h-screen bg-background bg-indigo-glow bg-no-repeat bg-top flex items-center justify-center p-6">
      <div className="max-w-xl w-full text-center">
        <div className="relative inline-block mb-10">
          <div className="absolute inset-0 bg-accent-primary blur-[100px] opacity-20" />
          <div className="relative z-10 p-6 bg-accent-primary/10 rounded-full border border-accent-primary/20 animate-bounce-slow">
            <CheckCircle2 size={80} className="text-accent-primary" />
          </div>
          <div className="absolute -top-2 -right-2 p-2 bg-yellow-500 rounded-full shadow-lg border-4 border-background animate-pulse">
            <Star size={20} className="text-white fill-current" />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-text-primary mb-6 animate-fade-in">
          Thank you, {name}!
        </h1>
        
        <div className="glass-card p-10 mb-12 animate-slide-up">
          <p className="text-xl text-text-secondary mb-8 leading-relaxed">
            Your application was submitted successfully. Our hiring team is currently reviewing your profile.
          </p>
          
          <div className="space-y-4 text-left">
            <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-border">
              <div className="mt-1 p-1 bg-accent-primary/20 rounded-md">
                <CheckCircle2 size={16} className="text-accent-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-text-primary">Application Received</p>
                <p className="text-xs text-text-tertiary">Our system has securely stored your CV and details.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-border">
              <div className="mt-1 p-1 bg-accent-primary/20 rounded-md">
                <CheckCircle2 size={16} className="text-accent-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-text-primary">Initial Screening</p>
                <p className="text-xs text-text-tertiary">Your experience is being matched against the job requirements.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-border">
              <div className="mt-1 p-1 bg-accent-primary/20 rounded-md">
                <CheckCircle2 size={16} className="text-accent-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-text-primary">Human Review</p>
                <p className="text-xs text-text-tertiary">If there's a match, our recruiter will reach out directly.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to={recruiterId ? `/careers/${recruiterId}` : "/careers"} className="btn-secondary w-full sm:w-auto px-8 py-4 flex items-center justify-center gap-2">
            Return to Careers
          </Link>
          <a 
            href="https://smarthire.ai" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-8 py-4 flex items-center justify-center gap-2 text-text-tertiary hover:text-text-primary transition-colors text-sm font-bold"
          >
            <Building2 size={18} />
            Visit Company Website
          </a>
        </div>
        
        <p className="mt-12 text-text-tertiary text-xs">
          SmartHire | Careers Portal
        </p>
      </div>
    </div>
  );
};

export default CareersSuccess;
