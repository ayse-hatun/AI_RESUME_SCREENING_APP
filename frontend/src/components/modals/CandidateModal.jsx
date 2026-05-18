import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, Award, Calendar, MapPin, ExternalLink, Download, Loader2, FileText } from 'lucide-react';
import { updateResumeStage, fetchResumeById } from '../../api';

const CandidateModal = ({ resume, onClose, onUpdate }) => {
  const [updating, setUpdating] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [currentResume, setCurrentResume] = useState(resume);
  const [isProcessing, setIsProcessing] = useState(
    !resume.screeningResult?.matchScore || resume.status === 'processing'
  );

  // Poll for updates if the resume is still processing
  const resumeId = currentResume?._id;
  React.useEffect(() => {
    let interval;
    if (isProcessing && resumeId) {
      interval = setInterval(async () => {
        try {
          const { data } = await fetchResumeById(resumeId);
          const updatedResume = data.data;
          setCurrentResume(updatedResume);
          
          if ((updatedResume.screeningResult?.matchScore && updatedResume.status !== 'processing') || updatedResume.status === 'failed') {
            setIsProcessing(false);
            if (updatedResume.status === 'failed') {
               setErrorMessage(updatedResume.errorMessage || 'AI Processing Failed. Please try again.');
            }
            if (onUpdate) onUpdate(); // refresh parent list silently
            clearInterval(interval);
          }
        } catch (e) {
          console.error("Polling error", e);
        }
      }, 3000); // Poll every 3 seconds
    }
    return () => clearInterval(interval);
  }, [isProcessing, resumeId, onUpdate]);

  const handleStageUpdate = async (stage) => {
    try {
      setUpdating(true);
      setErrorMessage(null);
      await updateResumeStage(currentResume._id, { stage, sendEmail: true });
      if (onUpdate) onUpdate(currentResume._id, stage);
      onClose();
    } catch (error) {
      console.error('Failed to update stage:', error);
      setErrorMessage(error.response?.data?.error || error.message || 'Failed to update candidate stage. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const downloadResume = () => {
    // If resumeUrl exists, open it. Otherwise try to derive it from filename or show error
    const url = currentResume.resumeUrl || (currentResume.filename ? `/uploads/${currentResume.filename}` : null);
    if (url) {
      window.open(url, '_blank');
    } else {
      alert('Resume file not found');
    }
  };
  
  if (!currentResume) return null;

  const { screeningResult: ai } = currentResume;

  if (isProcessing) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
        <style>{`
          @keyframes scanLine {
            0% { top: 0; }
            50% { top: 100%; }
            100% { top: 0; }
          }
          .animate-scan-line { animation: scanLine 2s linear infinite; }
        `}</style>
        <div className="glass-card w-full max-w-lg overflow-hidden flex flex-col items-center justify-center p-12 shadow-2xl border-border dark:border-white/10 animate-slide-up text-center relative">
          
          <div className="relative w-28 h-36 mb-8 border-2 border-border dark:border-white/10 rounded-xl overflow-hidden bg-card shadow-inner">
            <div className="absolute inset-0 flex items-center justify-center text-text-muted opacity-50">
              <FileText size={48} />
            </div>
            {/* Animated Scanner Line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-accent-primary shadow-[0_0_15px_3px_rgba(99,102,241,0.6)] animate-scan-line"></div>
            {/* Scanning Overlay */}
            <div className="absolute inset-0 bg-accent-primary/5 animate-pulse"></div>
          </div>
          
          <h2 className="text-2xl font-black text-text-primary dark:text-white mb-2">Analyzing Resume...</h2>
          <p className="text-text-secondary text-sm">
            Our AI is currently matching the candidate's skills and background against the job description. Please wait...
          </p>
          
          <div className="mt-8 flex items-center gap-2 text-accent-primary font-bold bg-accent-primary/10 px-5 py-2.5 rounded-full text-sm tracking-wide">
            <Loader2 size={16} className="animate-spin" />
            PROCESSING DATA
          </div>

          <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-border rounded-lg text-text-muted hover:text-text-primary transition-colors">
            <X size={20} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="glass-card w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border-border dark:border-white/10 animate-slide-up bg-white dark:bg-[#0f0f13]">
        {/* Header */}
        <div className="p-6 border-b border-border flex justify-between items-center bg-card">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-accent-primary rounded-2xl flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-accent-primary/20">
              {currentResume.candidateName.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-text-primary dark:text-white">{currentResume.candidateName}</h2>
              <p className="text-text-secondary flex items-center gap-2 text-sm">
                <MapPin size={14} /> {currentResume.candidateProfile?.location || 'Location not specified'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={downloadResume}
              className="btn-secondary py-2 flex items-center gap-2 text-sm"
              disabled={!currentResume.resumeUrl && !currentResume.filename}
            >
              <Download size={16} /> Resume
            </button>
            <button onClick={onClose} className="p-2 hover:bg-border rounded-lg text-text-muted hover:text-text-primary dark:hover:text-white transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {/* AI Score Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-6 bg-accent-primary/5 border-border dark:border-accent-primary/20 text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-2">Match Score</p>
              <h3 className={`text-5xl font-black ${ai?.matchScore >= 90 ? 'text-accent-secondary' : 'text-text-primary dark:text-white'}`}>
                {ai?.matchScore !== undefined && ai?.matchScore !== null ? `${ai.matchScore}%` : '—'}
              </h3>
            </div>
            <div className="md:col-span-2 glass-card p-6 border-border dark:border-white/5 flex flex-col justify-center">
              <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-2">AI Verdict</p>
              <div className="flex items-center gap-3">
                <div className={`px-4 py-2 rounded-xl text-sm font-bold ${
                  ai?.verdict === 'Highly Recommended' ? 'bg-accent-secondary/10 text-accent-secondary' : 
                  ai?.verdict === 'Recommended' ? 'bg-accent-primary/10 text-accent-primary' : 'bg-amber-500/10 text-amber-500'
                }`}>
                  {ai?.verdict || 'Processing'}
                </div>
                <p className="text-text-secondary italic text-sm">
                  {ai?.summary ? `"${ai.summary}"` : 'No summary available'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Strengths & Weaknesses */}
            <div className="space-y-6">
              <div>
                <h4 className="flex items-center gap-2 font-bold text-text-primary dark:text-white mb-4">
                  <CheckCircle2 className="text-text-muted" size={20} /> Key Strengths
                </h4>
                <ul className="space-y-3">
                  {ai?.strengths?.map((s, i) => (
                    <li key={i} className="flex gap-3 text-sm text-text-secondary">
                      <div className="w-1.5 h-1.5 rounded-full bg-text-muted mt-1.5 shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="flex items-center gap-2 font-bold text-text-primary dark:text-white mb-4">
                  <AlertCircle className="text-accent-danger" size={20} /> Missing / Weak Areas
                </h4>
                <ul className="space-y-3">
                  {ai?.weaknesses?.map((w, i) => (
                    <li key={i} className="flex gap-3 text-sm text-text-secondary">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent-danger mt-1.5 shrink-0" />
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Skill Proficiency — data lives at resume.skillProficiency, NOT inside screeningResult */}
            <div>
              <h4 className="flex items-center gap-2 font-bold text-text-primary dark:text-white mb-6">
                <Award className="text-accent-primary" size={20} /> Skill Proficiency
              </h4>
              <div className="space-y-5">
                {(currentResume.skillProficiency?.length > 0 ? currentResume.skillProficiency : ai?.skillProficiency)?.map((skill, i) => {
                  const isTopSkill = skill.percentage >= 90;
                  return (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-text-primary dark:text-white">{skill.skill}</span>
                        <span className={`font-bold ${isTopSkill ? 'text-accent-secondary' : 'text-accent-primary'}`}>
                          {skill.level}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${isTopSkill ? 'bg-accent-secondary' : 'bg-accent-primary'}`} 
                          style={{ width: `${skill.percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                {!currentResume.skillProficiency?.length && !ai?.skillProficiency?.length && (
                  <p className="text-text-muted text-sm italic">No skill data extracted for this candidate.</p>
                )}
              </div>
            </div>
          </div>

          {/* Matched & Missing Skills */}
          {(ai?.skills?.matched?.length > 0 || ai?.skills?.missing?.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-border">
              {/* Matched Skills */}
              <div>
                <h4 className="flex items-center gap-2 font-bold text-text-primary dark:text-white mb-4">
                  <CheckCircle2 className="text-accent-secondary" size={18} /> Matched Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {ai?.skills?.matched?.map((skill, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-accent-secondary/10 text-accent-secondary border border-accent-secondary/20">
                      {skill}
                    </span>
                  ))}
                  {!ai?.skills?.matched?.length && (
                    <span className="text-text-muted text-sm italic">No matching skills found</span>
                  )}
                </div>
              </div>

              {/* Missing Skills */}
              <div>
                <h4 className="flex items-center gap-2 font-bold text-text-primary dark:text-white mb-4">
                  <AlertCircle className="text-accent-danger" size={18} /> Missing Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {ai?.skills?.missing?.map((skill, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-accent-danger/10 text-accent-danger border border-accent-danger/20">
                      {skill}
                    </span>
                  ))}
                  {!ai?.skills?.missing?.length && (
                    <span className="text-text-muted text-sm italic">No missing skills detected</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Additional Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-border">
            <div>
              <p className="text-[10px] font-bold uppercase text-text-muted tracking-widest mb-1">Experience</p>
              <p className="text-text-primary dark:text-white font-bold">{currentResume.candidateProfile?.totalExperienceYears || 0} Years</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-text-muted tracking-widest mb-1">Availability</p>
              <p className="text-text-primary dark:text-white font-bold">{currentResume.candidateProfile?.availability || 'Immediate'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-text-muted tracking-widest mb-1">Expected Salary</p>
              <p className="text-text-primary dark:text-white font-bold">{currentResume.candidateProfile?.expectedSalary || 'N/A'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-text-muted tracking-widest mb-1">Notice Period</p>
              <p className="text-text-primary dark:text-white font-bold">{currentResume.candidateProfile?.noticePeriod || 'Standard'}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        {errorMessage && (
          <div className="px-6 py-3 bg-accent-danger/10 border-t border-accent-danger/20 text-accent-danger flex items-center gap-2 text-sm font-medium animate-fade-in">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
        <div className="p-6 border-t border-border bg-card flex justify-between">
          <div className="flex items-center gap-2 text-xs text-text-muted font-medium">
            <Award size={14} className="text-accent-primary" />
            AI Verified Profile • Candidate ID: {currentResume._id.slice(-6)}
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => handleStageUpdate('rejected')}
              disabled={updating}
              className="btn-secondary py-2 text-sm text-accent-danger border-accent-danger/20 hover:bg-accent-danger/5 disabled:opacity-50 flex items-center gap-2"
            >
              {updating ? <Loader2 size={16} className="animate-spin" /> : null}
              Reject
            </button>
            <button 
              onClick={() => handleStageUpdate('shortlisted')}
              disabled={updating}
              className="btn-primary py-2 text-sm disabled:opacity-50 flex items-center gap-2"
            >
              {updating ? <Loader2 size={16} className="animate-spin" /> : null}
              Shortlist Candidate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateModal;
