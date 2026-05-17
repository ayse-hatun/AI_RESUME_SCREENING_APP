import React, { useState, useEffect, useRef } from 'react';
import { X, Briefcase, MapPin, Target, ShieldCheck, Loader2, Plus, GraduationCap, Sparkles, CheckCircle2, Link as LinkIcon, Check, AlertCircle } from 'lucide-react';
import { createJob } from '../../api';

const CopyLinkButton = ({ jobId, fullWidth }) => {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleCopy = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/apply/${jobId}`);
      setCopied(true);
      timeoutRef.current = setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link', err);
    }
  };
  return (
    <button 
      onClick={handleCopy}
      className={`btn-primary py-3 flex items-center justify-center gap-2 text-sm transition-all shadow-lg shadow-accent-primary/20 ${fullWidth ? 'w-full' : ''}`}
    >
      {copied ? <Check size={18} className="text-emerald-400" /> : <LinkIcon size={18} />}
      {copied ? 'Link Copied!' : 'Copy Public Apply Link'}
    </button>
  );
};

const CreateJobModal = ({ onClose, onJobCreated }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdJobId, setCreatedJobId] = useState(null);
  const [skillInput, setSkillInput] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    description: '',
    requiredSkills: [],
    educationLevel: "Bachelor's Degree",
    autoRejectionEnabled: true,
    autoRejectionThreshold: 60
  });

  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.requiredSkills.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        requiredSkills: [...formData.requiredSkills, skillInput.trim()]
      });
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      requiredSkills: formData.requiredSkills.filter(s => s !== skillToRemove)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.requiredSkills.length === 0) {
      setError('Please add at least one required skill.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await createJob(formData);
      const newJobId = response.data?.data?._id || response.data?._id;
      setCreatedJobId(newJobId);
      onJobCreated();
      setIsSuccess(true);
    } catch (err) {
      console.error('Failed to create job', err);
      setError(err.response?.data?.error || err.message || 'Failed to create job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-fade-in">
        <div className="glass-card w-full max-w-md p-8 relative animate-slide-up flex flex-col items-center text-center">
          <button onClick={onClose} className="absolute right-6 top-6 text-text-muted hover:text-white transition-colors">
            <X size={24} />
          </button>
          
          <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 mb-6 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <CheckCircle2 size={32} />
          </div>
          
          <h2 className="text-2xl font-black text-text-primary dark:text-white tracking-tight mb-2">Job Created Successfully!</h2>
          <p className="text-text-secondary mb-8 text-sm font-medium">Your new AI screening pipeline is live.</p>
          
          <div className="w-full bg-white dark:bg-[#0f0f13] border border-border dark:border-white/5 rounded-xl p-5 mb-8 text-left relative overflow-hidden">
             <div className="absolute top-0 left-0 bottom-0 w-1 bg-accent-primary shadow-[0_0_20px_2px_rgba(99,102,241,0.5)]"></div>
            <h3 className="font-bold text-text-primary dark:text-white mb-1 pl-2">{formData.title}</h3>
            <p className="text-xs text-text-muted mb-4 pl-2 font-bold tracking-wider uppercase">{formData.department} • {formData.location}</p>
            
            <div className="flex flex-wrap gap-2 pl-2">
              {formData.requiredSkills.slice(0, 4).map((skill, i) => (
                <span key={i} className="px-2 py-1 bg-accent-primary/10 text-accent-primary text-xs rounded-md font-bold">
                  {skill}
                </span>
              ))}
              {formData.requiredSkills.length > 4 && (
                <span className="px-2 py-1 bg-white/5 text-text-muted text-xs rounded-md font-bold">
                  +{formData.requiredSkills.length - 4} more
                </span>
              )}
            </div>
          </div>
          
          <div className="w-full space-y-3">
             {createdJobId && <CopyLinkButton jobId={createdJobId} fullWidth />}
             <button onClick={onClose} className="btn-secondary w-full py-3 font-bold">
               Go to Dashboard
             </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-fade-in">
      <div className="glass-card w-full max-w-2xl p-8 relative animate-slide-up max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute right-6 top-6 text-text-muted hover:text-white transition-colors">
          <X size={24} />
        </button>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-accent-primary/20 rounded-xl flex items-center justify-center text-accent-primary">
            <Sparkles size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Create New Role</h2>
            <p className="text-text-secondary text-sm">Gemini will use these specific requirements for screening.</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-accent-danger/10 border border-accent-danger/20 rounded-xl flex items-center gap-3 text-accent-danger text-sm font-medium animate-fade-in">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dummy hidden input to trap browser autofill */}
          <input type="text" style={{ display: 'none' }} />
          
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-text-secondary">Job Title</label>
              <input
                type="text"
                className="input-field w-full"
                placeholder="e.g. Senior Full Stack Engineer"
                value={formData.title}
                autoComplete="new-password"
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-text-secondary">Department</label>
              <select 
                className="input-field w-full"
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
              >
                <option>Engineering</option>
                <option>Design</option>
                <option>Product</option>
                <option>Marketing</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-text-secondary">Location</label>
              <input
                type="text"
                className="input-field w-full"
                placeholder="e.g. Remote / New York"
                value={formData.location}
                autoComplete="new-password"
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-text-secondary flex items-center gap-2">
                <GraduationCap size={16} className="text-accent-primary" /> Minimum Education
              </label>
              <select 
                className="input-field w-full"
                value={formData.educationLevel}
                onChange={(e) => setFormData({...formData, educationLevel: e.target.value})}
              >
                <option>High School</option>
                <option>Associate Degree</option>
                <option>Bachelor's Degree</option>
                <option>Master's Degree</option>
                <option>PhD / Doctorate</option>
                <option>Any / No Preference</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-text-secondary">Job Type</label>
              <select 
                className="input-field w-full"
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
              >
                <option>Full-time</option>
                <option>Contract</option>
                <option>Remote</option>
              </select>
            </div>
          </div>

          {/* Skills Section */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-text-secondary flex items-center gap-2">
              <Target size={16} className="text-accent-primary" /> Required Skills
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                className="input-field flex-1"
                placeholder="Type one skill & press + (e.g. React.js)"
                value={skillInput}
                autoComplete="new-password"
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
              />
              <button 
                type="button" 
                onClick={handleAddSkill}
                title="Add skill"
                className="flex items-center justify-center px-4 py-3 rounded-xl bg-transparent border-2 border-accent-primary text-accent-primary hover:text-white hover:bg-accent-primary/10 hover:shadow-lg hover:shadow-accent-primary/30 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <Plus size={24} strokeWidth={2.8} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              {formData.requiredSkills.map((skill, index) => (
                <span key={index} className="badge-indigo flex items-center gap-2 pr-1 py-1 pl-3">
                  {skill}
                  <button 
                    type="button" 
                    onClick={() => removeSkill(skill)}
                    className="hover:bg-accent-primary/20 rounded-md p-0.5 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
              {formData.requiredSkills.length === 0 && (
                <p className="text-[10px] text-text-muted italic">Add specific skills to improve screening accuracy.</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-text-secondary">Comprehensive Job Description</label>
            <textarea
              className="input-field w-full min-h-[100px] resize-none"
              placeholder="Paste full responsibilities and details here..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              required
            />
          </div>

          <div className={`p-4 rounded-2xl flex items-center justify-between transition-all ${formData.autoRejectionEnabled ? 'bg-accent-primary/5 border border-accent-primary/20' : 'bg-white/5 border border-white/10 opacity-60'}`}>
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${formData.autoRejectionEnabled ? 'bg-accent-primary/10 text-accent-primary' : 'bg-white/10 text-text-muted'}`}>
                <ShieldCheck size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-white">AI Auto-Rejection</p>
                  <input 
                    type="checkbox" 
                    checked={formData.autoRejectionEnabled}
                    onChange={(e) => setFormData({...formData, autoRejectionEnabled: e.target.checked})}
                    className="w-4 h-4 rounded border-border text-accent-primary focus:ring-accent-primary bg-background cursor-pointer"
                  />
                </div>
                <p className="text-[10px] text-text-secondary uppercase tracking-wider font-bold">
                  {formData.autoRejectionEnabled ? `Reject below ${formData.autoRejectionThreshold}% match` : 'Automatically reject low matches (Disabled)'}
                </p>
              </div>
            </div>
            <input 
              type="range" 
              min="0" 
              max="100" 
              disabled={!formData.autoRejectionEnabled}
              value={formData.autoRejectionThreshold}
              onChange={(e) => setFormData({...formData, autoRejectionThreshold: parseInt(e.target.value)})}
              className={`accent-accent-primary w-32 h-1 bg-border rounded-full appearance-none cursor-pointer ${!formData.autoRejectionEnabled ? 'cursor-not-allowed opacity-50' : ''}`}
            />
          </div>

          <div className="flex gap-4 pt-4 pb-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 py-3">Cancel</button>
            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary flex-1 py-3 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Create AI Pipeline'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateJobModal;
