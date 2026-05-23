import React, { useState, useEffect } from 'react';
import { Briefcase, Plus, Search, MapPin, ChevronRight, Check, Link as LinkIcon } from 'lucide-react';
import { fetchJobs, updateJob, deleteJob } from '../api';
import CreateJobModal from '../components/modals/CreateJobModal';
import { Trash2, Clock, Ban, AlertCircle } from 'lucide-react';

import { useNavigate } from 'react-router-dom';

const CopyLinkButton = ({ jobId, fullWidth }) => {
  const [copied, setCopied] = useState(false);
  const timeoutRef = React.useRef(null);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleCopy = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/careers/jobs/${jobId}`);
      setCopied(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };
  
  return (
    <button 
      onClick={handleCopy}
      className={`btn-secondary py-2 px-3 flex items-center justify-center gap-2 text-sm transition-all ${fullWidth ? 'w-full' : ''}`}
      title="Copy Link"
    >
      {copied ? <Check size={16} className="text-emerald-500 dark:text-emerald-400" /> : <LinkIcon size={16} />}
      {copied ? 'Copied!' : 'Copy Link'}
    </button>
  );
};

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const [user] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
      return null;
    }
  });

  const loadJobs = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const { data } = await fetchJobs();
      setJobs(data.data || []);
    } catch (err) {
      console.error('Failed to load jobs');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs(false);
    
    // Poll for updates every 5 seconds to instantly catch new applications
    const interval = setInterval(() => {
      loadJobs(true);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const lowerSearch = searchTerm.toLowerCase();
  const filteredJobs = jobs.filter(job => 
    (job.title || '').toLowerCase().includes(lowerSearch) ||
    (job.department || '').toLowerCase().includes(lowerSearch)
  );

  const handleDeleteJob = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"? All candidates and data for this job will be permanently removed.`)) {
      try {
        await deleteJob(id);
        loadJobs();
      } catch (err) {
        alert('Failed to delete job');
      }
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await updateJob(id, { status: newStatus });
      loadJobs();
    } catch (err) {
      alert('Failed to update job status');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-slide-up">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-text-primary dark:text-white">Job Pipelines</h1>
          <p className="text-text-secondary mt-2">Manage all your active recruitment pipelines.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="glass-card flex items-center gap-3 px-4 py-2 border-accent-secondary/30 bg-accent-secondary/5">
            <div className="text-left">
              <p className="text-[10px] text-accent-secondary font-black uppercase tracking-widest leading-none mb-1">Public Careers Page</p>
              <p className="text-xs text-text-tertiary font-mono">
                {user?._id || user?.id ? `${window.location.origin}/careers/${user._id || user.id}` : `${window.location.origin}/careers`}
              </p>
            </div>
            <button 
              onClick={() => {
                const careersUrl = user?._id || user?.id ? `${window.location.origin}/careers/${user._id || user.id}` : `${window.location.origin}/careers`;
                navigator.clipboard.writeText(careersUrl);
                alert('Careers page link copied!');
              }}
              className="p-2 hover:bg-accent-secondary/10 rounded-lg text-accent-secondary transition-colors"
              title="Copy Careers Link"
            >
              <LinkIcon size={18} />
            </button>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center gap-2 shadow-lg shadow-accent-primary/20 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus size={20} />
            Create New Job
          </button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
        <input 
          type="text" 
          placeholder="Search jobs by title or department..." 
          className="input-field w-full pl-12 py-3 text-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary"></div>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="glass-card p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-text-muted mb-4">
            <Briefcase size={32} />
          </div>
          <h3 className="text-xl font-bold text-text-primary dark:text-white mb-2">No jobs found</h3>
          <p className="text-text-secondary mb-6">Create a new job to start receiving candidates.</p>
          <button onClick={() => setShowCreateModal(true)} className="btn-primary">Create Job</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredJobs.map(job => (
            <div key={job._id} className="relative glass-card p-6 flex flex-col hover:-translate-y-1 transition-transform group border border-border dark:border-white/5 bg-white dark:bg-[#0f0f13] overflow-hidden">
              {/* Glowing left border on hover */}
              <div className="absolute top-0 left-0 bottom-0 w-1 bg-accent-secondary opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_0_20px_2px_rgba(16,185,129,0.5)]"></div>
              
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-accent-secondary/10 text-accent-secondary rounded-xl flex items-center justify-center font-bold text-xl uppercase">
                  {job.title?.charAt(0) || 'J'}
                </div>
                <div className="flex items-center gap-2">
                  <select 
                    value={job.status || 'active'}
                    onChange={(e) => handleUpdateStatus(job._id, e.target.value)}
                    className={`px-2 py-1 text-[10px] font-bold rounded uppercase tracking-wider outline-none cursor-pointer border border-transparent hover:border-border transition-all ${
                      job.status === 'closed' ? 'bg-accent-danger/10 text-accent-danger' : 
                      job.status === 'deactivated' ? 'bg-red-500/10 text-red-500' : 
                      job.status === 'expired' ? 'bg-amber-500/10 text-amber-500' : 
                      job.status === 'draft' ? 'bg-text-muted/10 text-text-muted' :
                      'bg-emerald-500/10 text-emerald-500'
                    }`}
                  >
                    <option value="active">Active</option>
                    <option value="closed">Closed</option>
                    <option value="deactivated">Deactivated</option>
                    <option value="expired">Expired</option>
                  </select>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteJob(job._id, job.title);
                    }}
                    className="p-1.5 text-text-muted hover:text-accent-danger hover:bg-accent-danger/10 rounded-lg transition-all"
                    title="Delete Job"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <h3 
                className="text-xl font-bold text-text-primary dark:text-white mb-1 group-hover:text-accent-secondary transition-colors cursor-pointer" 
                onClick={() => navigate(`/app/jobs/${job._id}`, { state: { from: '/app/jobs' } })}
              >
                {job.title || 'Untitled Job'}
              </h3>
              
              <div className="flex items-center gap-4 text-sm text-text-muted mb-6">
                <span className="flex items-center gap-1"><Briefcase size={14} /> {job.department || 'N/A'}</span>
                <span className="flex items-center gap-1"><MapPin size={14} /> {job.location || 'Remote'}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-background dark:bg-white/5 rounded-xl">
                <div>
                  <p className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Candidates</p>
                  <p className="text-lg font-black text-text-primary dark:text-white mt-1">{job.candidateCount ?? 0}</p>
                </div>
                <div>
                  <p className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Avg Score</p>
                  <p className="text-lg font-black text-accent-secondary mt-1">
                    {job.avgScore !== undefined ? `${job.avgScore}%` : '-'}
                  </p>
                </div>
              </div>
              
              <div className="mt-auto flex flex-col gap-2">
                <div className="flex gap-2">
                  <CopyLinkButton jobId={job._id} fullWidth={false} />
                  <button 
                    onClick={() => setEditingJob(job)}
                    className="btn-secondary flex-1 py-2 flex justify-center items-center gap-1 text-sm font-semibold transition-all hover:scale-105 active:scale-95"
                    title="Edit and Save as New Job"
                  >
                    Edit
                  </button>
                </div>
                <button onClick={() => navigate(`/app/jobs/${job._id}`, { state: { from: '/app/jobs' } })} className="btn-primary w-full py-2 flex justify-center items-center gap-1">
                  Open <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateJobModal 
          onClose={() => setShowCreateModal(false)} 
          onJobCreated={loadJobs}
        />
      )}

      {editingJob && (
        <CreateJobModal 
          initialData={editingJob}
          onClose={() => setEditingJob(null)} 
          onJobCreated={() => {
            setEditingJob(null);
            loadJobs();
          }}
        />
      )}
    </div>
  );
};

export default Jobs;
