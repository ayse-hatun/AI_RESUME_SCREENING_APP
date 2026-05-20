import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchPublicJobById, applyPublic } from '../../api';
import { ArrowLeft, User, Mail, Phone, Upload, FileText, CheckCircle, Loader2, AlertCircle, X } from 'lucide-react';

const CareersApply = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);
  const [hasApplied, setHasApplied] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    // Check if already applied via local storage
    const appliedJobs = JSON.parse(localStorage.getItem('appliedJobs') || '[]');
    if (appliedJobs.includes(jobId)) {
      setHasApplied(true);
      setLoading(false);
      return;
    }

    const fetchJob = async () => {
      try {
        const response = await fetchPublicJobById(jobId);
        if (response.data.success) {
          setJob(response.data.data);
        }
      } catch (err) {
        setError('Job not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [jobId]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Please upload a PDF or DOCX file only.');
        setFile(null);
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size exceeds 5MB limit.');
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please upload your resume.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const data = new FormData();
    data.append('fullName', formData.fullName);
    data.append('email', formData.email);
    data.append('phone', formData.phone);
    data.append('jobId', jobId);
    data.append('resume', file);

    try {
      const response = await applyPublic(data);

      if (response.data.success) {
        // Save to localStorage to remember they applied
        const appliedJobs = JSON.parse(localStorage.getItem('appliedJobs') || '[]');
        if (!appliedJobs.includes(jobId)) {
          appliedJobs.push(jobId);
          localStorage.setItem('appliedJobs', JSON.stringify(appliedJobs));
        }
        navigate('/careers/success', { state: { name: formData.fullName, recruiterId: job?.createdBy } });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-12 h-12 text-accent-primary animate-spin" />
    </div>
  );

  if (hasApplied) return (
    <div className="min-h-screen bg-background bg-indigo-glow bg-no-repeat bg-top py-16 px-6">
      <div className="max-w-2xl mx-auto text-center mt-20 glass-card p-12">
        <CheckCircle size={64} className="mx-auto text-accent-primary mb-6" />
        <h1 className="text-3xl font-bold text-text-primary mb-4">Application Submitted</h1>
        <p className="text-text-secondary mb-8">
          You have already successfully applied for this position. We are reviewing your application and will be in touch!
        </p>
        <Link to={job?.createdBy ? `/careers/${job.createdBy}` : "/careers"} className="btn-primary inline-flex items-center gap-2">
          <ArrowLeft size={18} /> Back to Job Board
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background bg-indigo-glow bg-no-repeat bg-top py-16 px-6">
      <div className="max-w-2xl mx-auto">
        <Link to={`/careers/jobs/${jobId}`} className="inline-flex items-center gap-2 text-text-secondary hover:text-accent-primary mb-8 transition-colors">
          <ArrowLeft size={18} />
          <span>Back to Job Details</span>
        </Link>

        <div className="glass-card p-10 border-accent-primary/20">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Apply for this Position</h1>
          <p className="text-text-secondary mb-10 pb-6 border-b border-border">
            {job?.title} • {job?.location}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400 text-sm animate-shake">
                <AlertCircle size={20} className="shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-text-primary mb-2">Full Name <span className="text-red-500">*</span></label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 text-text-tertiary" size={18} />
                  <input
                    required
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    className="w-full bg-white/5 border border-border rounded-xl py-3 pl-12 pr-4 focus:border-accent-primary focus:ring-1 focus:ring-accent-primary outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-text-primary mb-2">Email Address <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 text-text-tertiary" size={18} />
                  <input
                    required
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="john@example.com"
                    className="w-full bg-white/5 border border-border rounded-xl py-3 pl-12 pr-4 focus:border-accent-primary focus:ring-1 focus:ring-accent-primary outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-text-primary mb-2">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-3.5 text-text-tertiary" size={18} />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-white/5 border border-border rounded-xl py-3 pl-12 pr-4 focus:border-accent-primary focus:ring-1 focus:ring-accent-primary outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-text-primary mb-2">Resume / CV <span className="text-red-500">*</span></label>
                {!file ? (
                  <div className="relative group">
                    <input
                      required
                      type="file"
                      accept=".pdf,.docx"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="border-2 border-dashed border-border group-hover:border-accent-primary transition-colors rounded-2xl p-10 text-center bg-white/5">
                      <div className="w-16 h-16 bg-accent-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <Upload size={28} className="text-accent-primary" />
                      </div>
                      <p className="text-text-primary font-bold mb-1">Click to upload or drag and drop</p>
                      <p className="text-text-tertiary text-xs uppercase font-bold tracking-widest">PDF or DOCX (Max 5MB)</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-accent-primary/10 border border-accent-primary/30 rounded-xl flex items-center justify-between animate-fade-in">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-accent-primary rounded-lg">
                        <FileText size={20} className="text-white" />
                      </div>
                      <div className="truncate max-w-[200px] md:max-w-[300px]">
                        <p className="text-text-primary font-bold text-sm truncate">{file.name}</p>
                        <p className="text-text-tertiary text-xs">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setFile(null)}
                      className="p-2 hover:bg-white/10 rounded-full text-text-tertiary hover:text-red-400 transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-6">
              <button
                disabled={submitting}
                type="submit"
                className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-3"
              >
                {submitting ? (
                  <>
                    <Loader2 size={24} className="animate-spin" />
                    <span>Submitting Application...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={24} />
                    <span>Submit Application</span>
                  </>
                )}
              </button>
              <p className="text-center text-text-tertiary text-xs mt-6">
                By submitting, you agree to our privacy policy and data processing terms.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CareersApply;
