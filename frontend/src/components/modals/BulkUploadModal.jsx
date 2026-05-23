import React, { useState, useCallback, useEffect, useRef } from 'react';
import { X, Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { bulkUploadResumes } from '../../api';

const BulkUploadModal = ({ jobId, onClose, onUploadSuccess }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState(null); // 'success' | 'error' | null
  const [validationError, setValidationError] = useState(null);

  const mountedRef = useRef(true);
  const timeoutIdRef = useRef(null);

  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      mountedRef.current = false;
      if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
      document.body.style.overflow = originalStyle;
    };
  }, []);

  const processFiles = (newFiles) => {
    setValidationError(null);
    const validFiles = [];
    const rejectedFiles = [];
    const maxSize = 5 * 1024 * 1024;

    newFiles.forEach(file => {
      const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');
      const isDocx = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.endsWith('.docx');
      
      if ((isPdf || isDocx) && file.size <= maxSize) {
        validFiles.push(file);
      } else {
        rejectedFiles.push(file.name);
      }
    });

    if (rejectedFiles.length > 0) {
      setValidationError(`Rejected ${rejectedFiles.length} file(s) (invalid format or >5MB): ${rejectedFiles.join(', ')}`);
    }

    setFiles(validFiles);
  };

  const handleFileChange = (e) => {
    processFiles(Array.from(e.target.files));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
      e.dataTransfer.clearData();
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    
    setUploading(true);
    setStatus(null);
    
    const formData = new FormData();
    files.forEach(file => {
      formData.append('resumes', file);
    });
    formData.append('jobId', jobId);

    try {
      await bulkUploadResumes(formData);
      if (mountedRef.current) {
        setStatus('success');
        timeoutIdRef.current = setTimeout(() => {
          if (mountedRef.current) {
            onUploadSuccess();
            onClose();
          }
        }, 2000);
      }
    } catch (err) {
      if (mountedRef.current) {
        setStatus('error');
      }
      console.error('Upload failed', err);
    } finally {
      if (mountedRef.current) {
        setUploading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-fade-in">
      <div className="glass-card w-full max-w-xl p-8 relative animate-slide-up">
        <button onClick={onClose} className="absolute right-6 top-6 text-text-muted hover:text-white transition-colors">
          <X size={24} />
        </button>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Bulk Upload Resumes</h2>
          <p className="text-text-secondary text-sm">Upload multiple PDF or DOCX files for AI screening.</p>
        </div>

        <div 
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 ${
            files.length > 0 ? 'border-accent-primary bg-accent-primary/5' : 'border-border hover:border-text-muted'
          }`}
        >
          <input
            type="file"
            multiple
            id="file-upload"
            className="hidden"
            onChange={handleFileChange}
            accept=".pdf,.docx"
          />
          <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-accent-primary mb-4 shadow-inner">
              <Upload size={32} />
            </div>
            <p className="text-white font-bold mb-1">Click to browse or drag and drop</p>
            <p className="text-text-muted text-xs">PDF or DOCX (Max 5MB per file)</p>
          </label>
        </div>

        {files.length > 0 && (
          <div className="mt-6 space-y-2 max-h-40 overflow-y-auto pr-2">
            {files.map((file, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  <FileText size={18} className="text-accent-primary" />
                  <span className="text-sm text-white font-medium truncate max-w-[250px]">{file.name}</span>
                </div>
                <span className="text-[10px] text-text-muted uppercase">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
            ))}
          </div>
        )}

        {status === 'success' && (
          <div className="mt-6 flex items-center justify-center gap-2 text-accent-secondary font-bold animate-fade-in">
            <CheckCircle size={20} /> Processing {files.length} Resumes...
          </div>
        )}

        {validationError && (
          <div className="mt-4 flex items-center justify-center gap-2 text-accent-danger text-sm animate-fade-in text-center px-4">
            <AlertCircle size={16} className="shrink-0" /> 
            <span className="truncate max-w-full" title={validationError}>{validationError}</span>
          </div>
        )}

        {status === 'error' && (
          <div className="mt-6 flex items-center justify-center gap-2 text-accent-danger font-bold animate-fade-in">
            <AlertCircle size={20} /> Upload Failed. Please try again.
          </div>
        )}

        <div className="mt-8 flex gap-4">
          <button onClick={onClose} className="btn-secondary flex-1 py-3">Cancel</button>
          <button 
            onClick={handleUpload}
            disabled={files.length === 0 || uploading}
            className="btn-primary flex-1 py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>{files.length > 3 ? 'Sending Files...' : 'Uploading...'}</span>
              </>
            ) : status === 'success' ? (
              <>
                <CheckCircle size={20} />
                <span>Uploaded!</span>
              </>
            ) : (
              'Start AI Screening'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkUploadModal;
