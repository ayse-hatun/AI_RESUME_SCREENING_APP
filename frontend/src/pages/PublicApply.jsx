import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchPublicJobById, applyPublic } from '../api';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, Briefcase, MapPin, Building } from 'lucide-react';

const PublicApply = () => {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null); // 'success' | 'error' | null
  const [fileError, setFileError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  
  const [formData, setFormData] = useState({
    candidateName: '',
    candidateEmail: '',
    resume: null
  });

  useEffect(() => {
    const loadJob = async () => {
      try {
        const { data } = await fetchPublicJobById(jobId);
        setJob(data.data);
      } catch (err) {
        console.error('Failed to load job');
        setStatus('error-job-not-found');
      } finally {
        setLoading(false);
      }
    };
    loadJob();
  }, [jobId]);

  const validateAndSetFile = (file) => {
    setFileError('');
    if (file.size > 5 * 1024 * 1024) {
      setFileError('File size exceeds 5MB limit');
      setFormData({ ...formData, resume: null });
      return;
    }
    setFormData({ ...formData, resume: file });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.resume || !formData.candidateName || !formData.candidateEmail) return;

    setSubmitting(true);
    setStatus(null);

    const submitData = new FormData();
    submitData.append('candidateName', formData.candidateName);
    submitData.append('candidateEmail', formData.candidateEmail);
    submitData.append('jobId', jobId);
    submitData.append('resume', formData.resume);

    try {
      await applyPublic(submitData);
      setStatus('success');
    } catch (err) {
      setStatus('error');
      console.error('Application failed', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-accent-primary" size={40} />
      </div>
    );
  }

  if (status === 'error-job-not-found') {
    return (
      <div className="min-h-screen w-full bg-background flex items-center justify-center p-4 text-center">
        <div className="glass-card p-10 max-w-md w-full">
          <AlertCircle className="text-accent-danger mx-auto mb-4" size={48} />
          <h1 className="text-2xl font-bold text-text-primary mb-2">Job Not Found</h1>
          <p className="text-text-secondary">This job posting may have been removed or is no longer accepting applications.</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen w-full bg-background flex items-center justify-center p-4 text-center bg-indigo-glow bg-no-repeat bg-top">
        <div className="glass-card p-10 max-w-md w-full animate-slide-up">
          <CheckCircle className="text-accent-secondary mx-auto mb-6" size={64} />
          <h1 className="text-3xl font-bold text-text-primary mb-4">Application Sent!</h1>
          <p className="text-text-secondary mb-8">
            Thank you for applying for the <strong>{job?.title}</strong> role. We have received your resume and our AI is currently processing it.
          </p>
          <p className="text-sm text-text-muted">You will receive an email shortly with the results of your screening.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background text-text-primary p-4 md:p-8 flex justify-center bg-indigo-glow bg-no-repeat bg-top">
      <div className="max-w-3xl w-full animate-slide-up space-y-8 mt-10">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent-primary/20 text-accent-primary mb-2 shadow-[0_0_30px_rgba(99,102,241,0.3)]">
            <Building size={32} />
          </div>
          <h1 className="text-4xl font-black text-text-primary tracking-tight">{job?.title}</h1>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm font-medium text-text-secondary">
            <span className="flex items-center gap-1.5"><Briefcase size={16} className="text-accent-primary"/> {job?.department}</span>
            <span className="flex items-center gap-1.5"><MapPin size={16} className="text-accent-primary"/> {job?.location}</span>
            <span className="px-2.5 py-1 bg-white/5 rounded-full border border-white/10">{job?.type}</span>
          </div>
        </div>

        <div className="glass-card overflow-hidden">
          {/* Job Description (Summarized) */}
          <div className="p-8 border-b border-white/5 bg-white/[0.02]">
            <h3 className="text-sm font-bold text-text-muted uppercase tracking-widest mb-4">About The Role</h3>
            <p className="text-text-secondary whitespace-pre-wrap leading-relaxed">{job?.description}</p>
            
            <div className="mt-6 flex flex-wrap gap-2">
              {job?.requiredSkills?.map((skill, i) => (
                <span key={i} className="badge-indigo">{skill}</span>
              ))}
            </div>
          </div>

          {/* Application Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <h3 className="text-xl font-bold text-text-primary mb-6">Submit Your Application</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="candidateName" className="text-sm font-semibold text-text-secondary">Full Name</label>
                <input
                  id="candidateName"
                  type="text"
                  className="input-field w-full"
                  placeholder="Jane Doe"
                  value={formData.candidateName}
                  onChange={(e) => setFormData({...formData, candidateName: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="candidateEmail" className="text-sm font-semibold text-text-secondary">Email Address</label>
                <input
                  id="candidateEmail"
                  type="email"
                  className="input-field w-full"
                  placeholder="jane@example.com"
                  value={formData.candidateEmail}
                  onChange={(e) => setFormData({...formData, candidateEmail: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-text-secondary">Resume Upload</label>
              <div 
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
                  isDragging ? 'border-accent-primary bg-accent-primary/10 scale-[1.02]' :
                  formData.resume ? 'border-accent-primary bg-accent-primary/5' : 'border-border hover:border-text-muted'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  id="resume-upload"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf,.docx"
                  required
                />
                <label htmlFor="resume-upload" className="cursor-pointer flex flex-col items-center">
                  <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-accent-primary mb-4 shadow-inner">
                    {formData.resume ? <FileText size={28} /> : <Upload size={28} />}
                  </div>
                  <p className="text-text-primary font-bold mb-1">
                    {formData.resume ? formData.resume.name : 'Click to browse or drag and drop'}
                  </p>
                  <p className={`text-xs ${fileError ? 'text-accent-danger font-bold' : 'text-text-muted'}`}>
                    {fileError || 'PDF or DOCX (Max 5MB)'}
                  </p>
                </label>
              </div>
            </div>

            {status === 'error' && (
              <div className="p-4 bg-accent-danger/10 border border-accent-danger/20 rounded-xl flex items-center gap-3 text-accent-danger text-sm font-bold animate-fade-in">
                <AlertCircle size={20} /> Application failed to send. Please try again.
              </div>
            )}

            <button 
              type="submit" 
              disabled={submitting || !formData.resume}
              className="btn-primary w-full py-4 text-lg mt-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <><Loader2 className="animate-spin" size={24} /> Submitting Application...</>
              ) : (
                'Submit Application'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PublicApply;
