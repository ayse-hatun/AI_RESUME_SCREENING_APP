import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchPublicJobById } from '../../api';
import { ArrowLeft, MapPin, Building2, Calendar, Briefcase, ChevronRight, Loader2, Info, CheckCircle } from 'lucide-react';

const CareersJobDetail = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    // Check if already applied via local storage
    const appliedJobs = JSON.parse(localStorage.getItem('appliedJobs') || '[]');
    if (appliedJobs.includes(jobId)) {
      setHasApplied(true);
    }

    const fetchJob = async () => {
      try {
        const response = await fetchPublicJobById(jobId);
        if (response.data.success) {
          setJob(response.data.data);
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Job not found or is no longer active.');
        console.error('Fetch job error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 text-accent-primary animate-spin" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="glass-card p-12 text-center max-w-lg border-red-500/20">
          <Info className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-text-primary mb-4">Oops!</h2>
          <p className="text-text-secondary mb-8">{error}</p>
          <button 
            onClick={() => navigate('/careers')}
            className="btn-primary w-full"
          >
            Return to Job Board
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background bg-indigo-glow bg-no-repeat bg-top py-16 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Navigation */}
        <Link 
          to="/careers" 
          className="inline-flex items-center gap-2 text-text-secondary hover:text-accent-primary transition-colors mb-12 group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to All Jobs</span>
        </Link>

        {/* Job Header */}
        <div className="glass-card p-10 mb-8 border-accent-primary/20">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="px-3 py-1 rounded-full bg-accent-primary/10 text-accent-primary text-xs font-bold uppercase tracking-wider">
              {job.department || 'General'}
            </span>
            <span className="px-3 py-1 rounded-full bg-border/50 text-text-secondary text-xs font-bold uppercase tracking-wider">
              Full-time
            </span>
          </div>
          
          <h1 className="text-4xl font-bold text-text-primary mb-6">{job.title}</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3 text-text-secondary">
              <div className="p-2.5 rounded-xl bg-white/5 border border-border">
                <MapPin size={20} className="text-accent-primary" />
              </div>
              <div>
                <p className="text-xs text-text-tertiary uppercase font-bold tracking-tighter">Location</p>
                <p className="font-medium">{job.location}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 text-text-secondary">
              <div className="p-2.5 rounded-xl bg-white/5 border border-border">
                <Calendar size={20} className="text-accent-primary" />
              </div>
              <div>
                <p className="text-xs text-text-tertiary uppercase font-bold tracking-tighter">Posted</p>
                <p className="font-medium">{new Date(job.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-text-secondary">
              <div className="p-2.5 rounded-xl bg-white/5 border border-border">
                <Building2 size={20} className="text-accent-primary" />
              </div>
              <div>
                <p className="text-xs text-text-tertiary uppercase font-bold tracking-tighter">Company</p>
                <p className="font-medium">SmartHire AI</p>
              </div>
            </div>
          </div>
        </div>

        {/* Job Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="glass-card p-10">
              <h2 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
                <Briefcase size={22} className="text-accent-primary" />
                Job Description
              </h2>
              <div className="prose prose-invert max-w-none text-text-secondary leading-relaxed whitespace-pre-line">
                {job.description}
              </div>
            </div>

            <div className="glass-card p-10">
              <h2 className="text-xl font-bold text-text-primary mb-6">Requirements</h2>
              <ul className="space-y-4">
                {job.requiredSkills && job.requiredSkills.map((skill, index) => (
                  <li key={index} className="flex gap-3 text-text-secondary">
                    <div className="mt-1.5 min-w-[6px] h-[6px] rounded-full bg-accent-primary" />
                    <span>{skill}</span>
                  </li>
                ))}
                {job.experienceYears > 0 && (
                  <li className="flex gap-3 text-text-secondary">
                    <div className="mt-1.5 min-w-[6px] h-[6px] rounded-full bg-accent-primary" />
                    <span>{job.experienceYears}+ years of professional experience in a related field.</span>
                  </li>
                )}
                {job.educationLevel && (
                  <li className="flex gap-3 text-text-secondary">
                    <div className="mt-1.5 min-w-[6px] h-[6px] rounded-full bg-accent-primary" />
                    <span>Education: {job.educationLevel}</span>
                  </li>
                )}
              </ul>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="glass-card p-8 sticky top-8">
              <h3 className="text-lg font-bold text-text-primary mb-2">Ready to apply?</h3>
              <p className="text-sm text-text-secondary mb-6 leading-relaxed">
                {hasApplied 
                  ? "You have already applied for this role. We are currently reviewing your application." 
                  : "Submit your application today. We typically review new candidates within 48 hours."}
              </p>
              
              {hasApplied ? (
                <div className="bg-accent-primary/10 border border-accent-primary/20 text-accent-primary w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold group">
                  <CheckCircle size={20} className="group-hover:scale-110 transition-transform" />
                  Application Submitted
                </div>
              ) : (
                <Link 
                  to={`/careers/jobs/${job._id}/apply`}
                  className="btn-primary w-full py-4 flex items-center justify-center gap-2 group"
                >
                  Apply Now
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
              
              <div className="mt-8 pt-8 border-t border-border">
                <p className="text-xs text-text-tertiary mb-4 font-bold uppercase tracking-widest text-center">Share this role</p>
                <div className="flex justify-center gap-4">
                  <button className="p-2 rounded-lg bg-white/5 border border-border hover:border-accent-primary transition-colors text-text-secondary">
                    <svg size={18} viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
                  </button>
                  <button className="p-2 rounded-lg bg-white/5 border border-border hover:border-accent-primary transition-colors text-text-secondary">
                    <svg size={18} viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareersJobDetail;
