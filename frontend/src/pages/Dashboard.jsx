import React, { useState, useEffect } from 'react';
import { Users, Briefcase, CheckCircle2, TrendingUp, Plus, Link as LinkIcon, Check, ChevronRight } from 'lucide-react';
import { fetchJobs, fetchResumes } from '../api';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ title, value, icon: Icon, color, bgColor, borderColor, shadowColor }) => (
  <div className="relative glass-card p-5 flex flex-col justify-center animate-fade-in border border-border dark:border-white/5 bg-white dark:bg-[#0f0f13] hover:-translate-y-1 transition-transform overflow-hidden group">
    {/* Glowing left border */}
    <div 
      className={`absolute top-0 left-0 bottom-0 w-1 ${borderColor} ${shadowColor} opacity-70 group-hover:opacity-100 transition-opacity`}
      style={{ boxShadow: "0 0 20px 2px var(--tw-shadow-color)" }}
    ></div>
    
    <div className="flex items-center gap-4 pl-2">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${bgColor}`}>
        <Icon size={20} className={color} />
      </div>
      <div>
        <p className="text-text-muted text-[11px] font-bold uppercase tracking-wider mb-1">{title}</p>
        <h3 className="text-2xl font-black text-text-primary dark:text-white leading-none tracking-tight">{value}</h3>
      </div>
    </div>
  </div>
);

const CopyLinkButton = ({ jobId }) => {
  const [copied, setCopied] = useState(false);
  const timerRef = React.useRef(null);

  React.useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleCopy = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/apply/${jobId}`);
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };
  return (
    <button 
      onClick={handleCopy}
      className="btn-secondary py-2 px-3 flex items-center gap-2 text-sm transition-all"
      title="Copy Public Apply Link"
    >
      {copied ? <Check size={16} className="text-emerald-500" /> : <LinkIcon size={16} />}
      {copied ? 'Copied!' : 'Copy Link'}
    </button>
  );
};

import CreateJobModal from '../components/modals/CreateJobModal';

const Dashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const navigate = useNavigate();

  const loadJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const [jobsRes, resumesRes] = await Promise.all([fetchJobs(), fetchResumes()]);
      setJobs(jobsRes.data.data || []);
      setResumes(resumesRes.data.data || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Failed to load dashboard data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const getApplicantCount = (job) =>
    resumes.filter(r => 
      r.jobId === job._id || 
      (r.jobTitle && r.jobTitle.trim().toLowerCase() === job.title?.trim().toLowerCase())
    ).length;

  const getAvgScore = (job) => {
    const scored = resumes.filter(
      r => (r.jobId === job._id || (r.jobTitle && r.jobTitle.trim().toLowerCase() === job.title?.trim().toLowerCase())) && r.screeningResult?.matchScore
    );
    if (!scored.length) return null;
    return Math.round(scored.reduce((acc, r) => acc + r.screeningResult.matchScore, 0) / scored.length);
  };

  const totalCandidates = resumes.length;
  const now = new Date();
  const shortlistedThisMonth = resumes.filter(r => {
    // Prefer shortlistedAt for accuracy if it exists, otherwise fallback to updatedAt or createdAt
    const d = new Date((r.pipelineStage === 'shortlisted' && r.shortlistedAt) ? r.shortlistedAt : (r.updatedAt || r.createdAt));
    return r.pipelineStage === 'shortlisted' &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear();
  }).length;
  const scoredAll = resumes.filter(r => r.screeningResult?.matchScore);
  const avgMatch = scoredAll.length
    ? Math.round(scoredAll.reduce((acc, r) => acc + r.screeningResult.matchScore, 0) / scoredAll.length)
    : 0;

  useEffect(() => {
    loadJobs();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-slide-up">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-text-primary">Recruitment Overview</h1>
          <p className="text-text-secondary mt-2">Welcome back. Here's what's happening with your pipelines.</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center gap-2 shadow-lg shadow-accent-primary/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus size={20} />
          Create New Job
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Candidates" value={totalCandidates} icon={Users} color="text-indigo-400" bgColor="bg-indigo-500/10" borderColor="bg-indigo-500" shadowColor="shadow-indigo-500/50" />
        <StatCard title="Active Jobs" value={jobs.length} icon={Briefcase} color="text-emerald-400" bgColor="bg-emerald-500/10" borderColor="bg-emerald-500" shadowColor="shadow-emerald-500/50" />
        <StatCard title="Shortlisted This Month" value={shortlistedThisMonth} icon={CheckCircle2} color="text-orange-500" bgColor="bg-orange-500/10" borderColor="bg-orange-500" shadowColor="shadow-orange-500/50" />
        <StatCard title="Average Match" value={avgMatch ? `${avgMatch}%` : '—'} icon={TrendingUp} color="text-violet-400" bgColor="bg-violet-500/10" borderColor="bg-violet-500" shadowColor="shadow-violet-500/50" />
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-border flex justify-between items-center bg-white/[0.02]">
          <h2 className="text-xl font-bold text-text-primary">Active Job Pipelines</h2>
          <button onClick={() => navigate('/app/jobs')} className="text-accent-primary font-medium hover:underline text-sm transition-all">View all jobs</button>
        </div>
        <div className="divide-y divide-border">
          {error ? (
            <div className="p-10 text-center flex flex-col items-center gap-4">
              <div className="text-accent-danger font-medium">{error}</div>
              <button onClick={loadJobs} className="btn-secondary text-xs">Try Again</button>
            </div>
          ) : loading ? (
            <div className="p-10 text-center text-text-muted">Loading pipelines...</div>
          ) : jobs.length === 0 ? (
            <div className="p-10 text-center text-text-muted">No active jobs found. Start by creating one!</div>
          ) : (
            jobs.map((job) => (
              <div 
                key={job._id} 
                onClick={() => navigate(`/app/jobs/${job._id}`, { state: { from: '/app' } })}
                className="p-6 hover:bg-white/[0.02] transition-colors flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-border rounded-xl flex items-center justify-center font-bold text-text-secondary group-hover:bg-accent-primary/10 group-hover:text-accent-primary transition-all">
                    {job.title?.charAt(0) || 'J'}
                  </div>
                  <div>
                    <h4 
                      className="font-bold text-text-primary group-hover:text-accent-primary transition-colors"
                      onClick={() => navigate(`/app/jobs/${job._id}`, { state: { from: '/app/jobs' } })}
                    >
                      {job.title || 'Untitled Job'}
                    </h4>
                    <p className="text-sm text-text-muted mt-1">{job.department} • {job.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-12">
                  <div className="text-right">
                    <p className="text-xs text-text-muted uppercase tracking-wider font-bold">Applicants</p>
                    <p className="font-bold mt-1 text-text-primary">{getApplicantCount(job)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-text-muted uppercase tracking-wider font-bold">Avg. Score</p>
                    <p className="font-bold mt-1 text-accent-secondary">{getAvgScore(job) !== null ? `${getAvgScore(job)}%` : '—'}</p>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <CopyLinkButton jobId={job._id} />
                    <button onClick={() => navigate(`/app/jobs/${job._id}`, { state: { from: '/app/jobs' } })} className="btn-primary flex items-center gap-1 py-2 px-4 text-sm shadow-lg shadow-accent-primary/20">
                      Open <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showCreateModal && (
        <CreateJobModal 
          onClose={() => setShowCreateModal(false)} 
          onJobCreated={loadJobs}
        />
      )}
    </div>
  );
};

export default Dashboard;
