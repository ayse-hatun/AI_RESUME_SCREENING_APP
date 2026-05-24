import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { fetchPublicJobs } from '../../api';
import { Briefcase, MapPin, Building2, ChevronRight, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';

const CareersLanding = () => {
  const { recruiterId } = useParams();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [recruiter, setRecruiter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If no recruiterId in URL, redirect logged in user to their specific career portal
    if (!recruiterId) {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          const userId = parsed._id || parsed.id;
          if (userId) {
            navigate(`/careers/${userId}`, { replace: true });
            return;
          }
        }
      } catch (e) {
        console.warn('Failed to parse logged in user for career redirect', e);
      }
    }
  }, [recruiterId, navigate]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetchPublicJobs(recruiterId);
        if (response.data.success) {
          setJobs(response.data.data);
          if (response.data.recruiter) {
            setRecruiter(response.data.recruiter);
          }
        }
      } catch (err) {
        setError('Unable to load job openings. Please try again later.');
        console.error('Fetch jobs error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [recruiterId]);

  return (
    <div className="min-h-screen bg-background bg-indigo-glow bg-no-repeat bg-top py-20 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-primary/10 border border-accent-primary/20 text-accent-primary text-sm font-medium mb-6">
            <Building2 size={16} />
            <span>Join {recruiter?.company || 'Our Team'}</span>
          </div>
          <h1 className="text-5xl font-bold text-text-primary mb-6 tracking-tight">
            Build the Future <span className="text-gradient">With {recruiter?.company || 'Us'}</span>
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
            We're looking for passionate individuals to help us redefine what's possible at {recruiter?.company || 'our company'}. 
            Explore our open positions and find your next challenge.
          </p>
        </div>

        {/* Jobs List Section */}
        <div className="space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-accent-primary animate-spin mb-4" />
              <p className="text-text-secondary font-medium">Fetching opportunities...</p>
            </div>
          ) : error ? (
            <div className="glass-card p-12 text-center border-red-500/20 bg-red-500/5">
              <p className="text-red-400 font-medium">{error}</p>
            </div>
          ) : jobs.length === 0 ? (
            // 🌟 AESTHETIC HIGH-CONVERSION COMPANY BRANDING & GENERAL APPLICATION STATE 🌟
            <div className="glass-card p-12 text-center border-accent-primary/20 max-w-3xl mx-auto relative overflow-hidden bg-gradient-to-br from-indigo-950/20 via-purple-950/10 to-indigo-950/20 backdrop-blur-xl animate-fade-in">
              {/* Decorative glows */}
              <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-accent-primary/15 blur-3xl" />
              <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-purple-500/15 blur-3xl" />
              
              <div className="inline-flex p-4 rounded-2xl bg-accent-primary/10 border border-accent-primary/20 text-accent-primary mb-6">
                <Sparkles size={36} className="animate-pulse" />
              </div>
              
              <h2 className="text-3xl font-extrabold text-text-primary mb-4 tracking-tight">
                Apply Easily, <span className="text-gradient">Hire Fast</span>
              </h2>
              
              <p className="text-lg text-text-secondary mb-10 leading-relaxed max-w-xl mx-auto">
                At {recruiter?.company || 'our organization'}, we respect your time and value your talent. We've eliminated long forms and endless queues to deliver a modern, zero-friction candidate experience.
              </p>

              {/* Recruitment steps flow */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left mb-12">
                <div className="p-6 rounded-2xl bg-white/5 border border-border/40 hover:border-accent-primary/30 transition-all duration-300 group hover:translate-y-[-2px]">
                  <div className="w-10 h-10 rounded-xl bg-accent-primary/10 flex items-center justify-center text-accent-primary font-bold mb-4 group-hover:scale-110 transition-transform">
                    1
                  </div>
                  <h4 className="text-text-primary font-bold mb-2">Upload Resume</h4>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    No painful forms. Drop your PDF or DOCX file, and our system automatically extracts your profile.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-white/5 border border-border/40 hover:border-accent-primary/30 transition-all duration-300 group hover:translate-y-[-2px]">
                  <div className="w-10 h-10 rounded-xl bg-accent-primary/10 flex items-center justify-center text-accent-primary font-bold mb-4 group-hover:scale-110 transition-transform">
                    2
                  </div>
                  <h4 className="text-text-primary font-bold mb-2">Instant Review</h4>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Our system instantly reviews your skills and experience against our requirements.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-white/5 border border-border/40 hover:border-accent-primary/30 transition-all duration-300 group hover:translate-y-[-2px]">
                  <div className="w-10 h-10 rounded-xl bg-accent-primary/10 flex items-center justify-center text-accent-primary font-bold mb-4 group-hover:scale-110 transition-transform">
                    3
                  </div>
                  <h4 className="text-text-primary font-bold mb-2">Direct Contact</h4>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Recruiters see your application instantly, ensuring prompt review and fast scheduling.
                  </p>
                </div>
              </div>

              <div className="inline-flex items-center gap-2 text-xs font-semibold text-text-tertiary tracking-wider bg-white/5 px-4 py-2 rounded-full border border-border/50">
                <CheckCircle2 size={14} className="text-accent-primary" />
                No active openings at the moment. Keep an eye out!
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {jobs.map((job) => (
                <Link
                  key={job._id}
                  to={`/careers/jobs/${job._id}`}
                  className="glass-card p-8 group hover:border-accent-primary/50 transition-all duration-300 hover:translate-y-[-4px] relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight className="text-accent-primary" />
                  </div>
                  
                  <div className="flex flex-col h-full">
                    <div className="mb-6">
                      <span className="text-xs font-bold uppercase tracking-wider text-accent-primary px-3 py-1 bg-accent-primary/10 rounded-full">
                        {job.department || 'General'}
                      </span>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-text-primary mb-3 group-hover:text-accent-primary transition-colors">
                      {job.title}
                    </h3>
                    
                    <div className="flex items-center gap-4 text-text-secondary mt-auto flex-wrap sm:flex-nowrap gap-y-2">
                      <div className="flex items-center gap-1.5 text-sm">
                        <MapPin size={16} />
                        <span>{job.location || 'Lahore, Pakistan'} ({job.workType === 'in-office' ? 'On-site' : job.workType === 'hybrid' ? 'Hybrid' : 'Remote'})</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm border-l border-border pl-4">
                        <Briefcase size={16} />
                        <span>{job.type || 'Full-time'}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-20 text-center text-text-tertiary text-sm">
          <p>© {new Date().getFullYear()} {recruiter?.company || 'SmartHire AI'}. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default CareersLanding;
