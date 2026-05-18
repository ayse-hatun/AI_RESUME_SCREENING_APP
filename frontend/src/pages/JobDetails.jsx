import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { fetchJobById, fetchResumes, updateResumeStage, deleteResume, retryResume } from '../api';
import { MoreHorizontal, Plus, Search, Filter, Mail, Star, Ban, ChevronRight, Link, ArrowLeft, Trash2, AlertTriangle, Loader2, RefreshCw, CheckCircle2 } from 'lucide-react';
import CandidateModal from '../components/modals/CandidateModal';
import BulkUploadModal from '../components/modals/BulkUploadModal';

const timeAgo = (dateStr) => {
  if (!dateStr) return 'Just now';
  const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
};

const getDisplayDate = (resume) => {
  if (resume.pipelineStage === 'shortlisted' && resume.shortlistedAt) {
    return resume.shortlistedAt;
  }
  return resume.updatedAt || resume.createdAt;
};

const PipelineColumn = ({ title, resumes, color, onCardClick, onDelete, onRetry, onAddClick, onUpdateStage }) => (
  <div className="flex-1 min-w-[300px] bg-card/30 rounded-2xl border border-border/50 p-4 flex flex-col h-[calc(100vh-200px)]">
    <div className="flex items-center justify-between mb-4 px-2">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${color}`}></div>
        <h3 className="font-bold text-text-primary uppercase tracking-wider text-xs">{title}</h3>
        <span className="bg-border px-2 py-0.5 rounded-full text-[10px] text-text-muted font-bold">{resumes.length}</span>
      </div>
      <button className="text-text-muted hover:text-text-primary"><MoreHorizontal size={16} /></button>
    </div>

    <div className="space-y-3 overflow-y-auto pr-1 flex-1">
      {resumes.map((resume) => (
        <div 
          key={resume._id} 
          onClick={() => resume.status === 'completed' && onCardClick(resume)}
          className={`glass-card p-4 transition-all relative group ${
            resume.status === 'completed' ? 'hover:border-accent-primary/50 cursor-pointer active:scale-[0.98]' : 'opacity-80 cursor-wait'
          }`}
        >
          {/* Processing Overlay */}
          {resume.status !== 'completed' && resume.status !== 'failed' && (
            <div className="absolute inset-0 bg-background/40 backdrop-blur-[1px] rounded-2xl flex items-center justify-center z-10">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-5 h-5 text-accent-primary animate-spin" />
                <span className="text-[10px] font-bold text-accent-primary uppercase tracking-widest animate-pulse">
                  {resume.status === 'processing' ? 'AI Analyzing...' : 'In Queue'}
                </span>
              </div>
            </div>
          )}

          <div className="flex justify-between items-start mb-3">
            <div className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest ${
              resume.status === 'completed' 
                ? (resume.screeningResult?.matchScore >= 80 ? 'bg-accent-secondary/10 text-accent-secondary' :
                   resume.screeningResult?.matchScore >= 50 ? 'bg-amber-500/10 text-amber-500' : 'bg-accent-danger/10 text-accent-danger')
                : resume.status === 'failed' ? 'bg-accent-danger/10 text-accent-danger'
                : 'bg-white/5 text-text-muted'
            }`}>
              {resume.status === 'completed' ? `AI Score: ${resume.screeningResult?.matchScore}%` 
                : resume.status === 'failed' ? '✕ Failed' 
                : 'Screening...'}
            </div>
            <div className="flex items-center gap-2">
              <Star size={14} className="text-text-muted hover:text-yellow-500" />
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(resume._id, resume.candidateName);
                }}
                className="text-text-muted hover:text-accent-danger transition-colors p-1"
                title="Delete Candidate"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
          <h4 className="font-bold text-text-primary group-hover:text-accent-primary transition-colors">{resume.candidateName}</h4>
          <p className="text-xs text-text-muted mt-1 truncate">{resume.candidateEmail}</p>
          
          {/* Error Message + Retry if failed */}
          {resume.status === 'failed' && (
            <div className="mt-2 space-y-2">
              <div className="flex items-center gap-1 text-[10px] text-accent-danger font-medium bg-accent-danger/5 p-1.5 rounded-lg border border-accent-danger/10">
                <AlertTriangle size={12} className="shrink-0" />
                <span className="truncate" title={resume.errorMessage}>
                  {resume.errorMessage?.includes('quota') || resume.errorMessage?.includes('429') 
                    ? 'API quota exceeded. Please retry.' 
                    : resume.errorMessage?.includes('404') || resume.errorMessage?.includes('not found')
                    ? 'AI model unavailable. Please retry.'
                    : resume.errorMessage?.includes('parse') || resume.errorMessage?.includes('PDF')
                    ? 'Could not read this file.'
                    : 'AI screening failed. Please retry.'}
                </span>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onRetry(resume._id, resume.candidateName);
                }}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-bold text-accent-primary bg-accent-primary/10 hover:bg-accent-primary/20 rounded-lg border border-accent-primary/20 transition-all"
              >
                <RefreshCw size={12} />
                Retry AI Screening
              </button>
            </div>
          )}
          
          <div className="flex items-center justify-between mt-4">
            <div className="flex -space-x-2">
              <div className="w-6 h-6 rounded-full bg-border border-2 border-card flex items-center justify-center text-[8px] font-bold">JD</div>
            </div>
            <div className="text-[10px] text-text-muted font-medium">{timeAgo(getDisplayDate(resume))}</div>
          </div>
          
          {/* Quick Actions */}
          {resume.status === 'completed' && !['rejected', 'hired', 'shortlisted'].includes(resume.pipelineStage) && (
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border/50">
              <button
                onClick={(e) => { e.stopPropagation(); onUpdateStage(resume._id, 'rejected'); }}
                className="flex-1 py-1.5 text-[10px] font-bold uppercase tracking-widest text-accent-danger hover:bg-accent-danger/10 border border-accent-danger/20 rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                <Ban size={12} /> Reject
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onUpdateStage(resume._id, 'shortlisted'); }}
                className="flex-1 py-1.5 text-[10px] font-bold uppercase tracking-widest text-text-primary dark:text-gray-900 bg-accent-secondary hover:bg-accent-secondary/90 rounded-lg transition-colors flex items-center justify-center gap-1 shadow-sm"
              >
                <CheckCircle2 size={12} /> Shortlist
              </button>
            </div>
          )}
        </div>
      ))}
      
      <button 
        onClick={onAddClick}
        className="w-full py-3 border-2 border-dashed border-border rounded-xl text-text-muted hover:text-text-primary hover:border-text-muted transition-all text-xs font-bold flex items-center justify-center gap-2"
      >
        <Plus size={14} /> Add Candidate
      </button>
    </div>
  </div>
);



const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [job, setJob] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showUpload, setShowUpload] = useState(false);

  const loadData = async () => {
    try {
      const [jobRes, resumesRes] = await Promise.all([
        fetchJobById(id),
        fetchResumes()
      ]);
      setJob(jobRes.data.data);
      const jobData = jobRes.data.data;
      setResumes(resumesRes.data.data.filter(r => 
        r.jobId === id || 
        (r.jobTitle && r.jobTitle.trim().toLowerCase() === jobData.title?.trim().toLowerCase())
      ));
    } catch (err) {
      console.error('Error fetching job details');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/apply/${id}`;
    
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
        alert('Application link copied to clipboard!');
      } else {
        throw new Error('Clipboard API not available');
      }
    } catch (err) {
      console.warn('Clipboard API failed, trying fallback:', err);
      try {
        const textArea = document.createElement('textarea');
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textArea);
        if (success) {
          alert('Application link copied to clipboard!');
        } else {
          throw new Error('Fallback copy failed');
        }
      } catch (fallbackErr) {
        console.error('Failed to copy link:', fallbackErr);
        alert('Failed to copy link. Please copy it manually: ' + url);
      }
    }
  };

  const handleAddCandidate = () => {
    setShowUpload(true);
  };

  const handleDeleteCandidate = async (resumeId, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}? This will remove all AI analysis and files permanently.`)) {
      try {
        await deleteResume(resumeId);
        loadData(); // Refresh list
      } catch (err) {
        console.error('Delete failed:', err);
        alert('Failed to delete candidate.');
      }
    }
  };

  const handleRetryResume = async (resumeId, name) => {
    try {
      await retryResume(resumeId);
      loadData(); // Refresh to show the pending status
    } catch (err) {
      console.error('Retry failed:', err);
      alert(`Failed to retry ${name}. Please try again.`);
    }
  };

  const handleUpdateStage = async (resumeId, stage) => {
    try {
      await updateResumeStage(resumeId, { stage, sendEmail: true });
      loadData();
    } catch (err) {
      console.error('Failed to update stage:', err);
      alert('Failed to update candidate stage.');
    }
  };

  useEffect(() => {
    loadData();
    // Poll for updates every 4 seconds if there are pending/processing resumes
    const pollInterval = setInterval(() => {
      const hasPending = resumes.some(r => r.status === 'pending' || r.status === 'processing');
      if (hasPending) {
        loadData();
      }
    }, 4000);

    return () => clearInterval(pollInterval);
  }, [id, resumes.length]);

  if (loading) return <div className="p-10 text-text-primary">Loading pipeline...</div>;

  const columns = [
    { title: 'Applied', stage: 'applied', color: 'bg-text-muted' },
    { title: 'Screened', stage: 'completed', color: 'bg-accent-primary' },
    { title: 'Shortlisted', stage: 'shortlisted', color: 'bg-accent-secondary' },
    { title: 'Rejected', stage: 'rejected', color: 'bg-accent-danger' },
  ];

  return (
    <div className="p-8 h-screen flex flex-col">
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <button 
              onClick={() => navigate(location.state?.from || '/app/jobs')}
              className="btn-secondary py-1.5 px-3 flex items-center gap-2 shadow-sm"
            >
              <ArrowLeft size={16} />
              <span>Back {location.state?.from === '/app' ? 'to Dashboard' : 'to Pipelines'}</span>
            </button>
          </div>
          <h1 className="text-3xl font-bold text-text-primary">{job?.title} <span className="text-text-muted font-normal text-xl ml-2">#{id.slice(-4)}</span></h1>
          <p className="text-text-secondary mt-1">{job?.department} • {job?.location} • {job?.type}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleCopyLink} className="btn-secondary flex items-center gap-2"><Link size={18} /> Copy Link</button>
          <button className="btn-secondary flex items-center gap-2"><Filter size={18} /> Filter</button>
          <button onClick={() => setShowUpload(true)} className="btn-primary flex items-center gap-2"><Plus size={18} /> Bulk Upload</button>
        </div>
      </div>

      {/* Processing Progress Banner */}
      {resumes.some(r => r.status === 'pending' || r.status === 'processing') && (
        <div className="mb-4 glass-card p-4 flex items-center gap-4 border-accent-primary/30 animate-fade-in">
          <Loader2 className="w-5 h-5 text-accent-primary animate-spin shrink-0" />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-bold text-text-primary">
                AI Screening in Progress
              </span>
              <span className="text-xs text-text-muted font-mono">
                {resumes.filter(r => r.status === 'completed' || r.status === 'failed').length} / {resumes.length} complete
              </span>
            </div>
            <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-accent-primary to-accent-secondary rounded-full transition-all duration-500"
                style={{ width: `${Math.round((resumes.filter(r => r.status === 'completed' || r.status === 'failed').length / resumes.length) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-6 overflow-x-auto pb-4 flex-1">
        {columns.map(col => (
          <PipelineColumn 
            key={col.stage}
            title={col.title}
            color={col.color}
            resumes={resumes.filter(r => 
              r.pipelineStage === col.stage || 
              (col.stage === 'applied' && (r.status === 'pending' || r.status === 'processing' || r.status === 'failed')) ||
              (col.stage === 'completed' && r.status === 'completed' && (!r.pipelineStage || r.pipelineStage === 'applied'))
            )}
            onCardClick={(res) => setSelectedCandidate(res)}
            onDelete={handleDeleteCandidate}
            onRetry={handleRetryResume}
            onAddClick={handleAddCandidate}
            onUpdateStage={handleUpdateStage}
          />
        ))}
      </div>

      {selectedCandidate && (
        <CandidateModal 
          resume={selectedCandidate} 
          onClose={() => setSelectedCandidate(null)} 
          onUpdate={loadData}
        />
      )}

      {showUpload && (
        <BulkUploadModal 
          jobId={id} 
          onClose={() => setShowUpload(false)} 
          onUploadSuccess={loadData}
        />
      )}
    </div>
  );
};

export default JobDetails;
