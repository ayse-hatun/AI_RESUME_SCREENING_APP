import React, { useState, useEffect } from 'react';
import { fetchResumes, deleteResume } from '../api';
import { Search, Filter, Mail, Download, UserCheck, ExternalLink, ArrowUpDown, Trash2 } from 'lucide-react';
import CandidateModal from '../components/modals/CandidateModal';

const Candidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [error, setError] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const timeAgo = (dateStr) => {
    if (!dateStr) return 'Recently';
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

  const handleUpdateCandidate = (id, newStage) => {
    setCandidates(prev => prev.map(c =>
      c._id === id ? { ...c, pipelineStage: newStage } : c
    ));
    if (selectedCandidate?._id === id) {
      setSelectedCandidate(prev => ({ ...prev, pipelineStage: newStage }));
    }
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await fetchResumes();
      setCandidates(data.data || []);
    } catch (err) {
      console.error('Failed to load candidates:', err);
      setError(err.message || 'Failed to connect to the recruitment service');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteCandidate = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await deleteResume(id);
        loadData();
      } catch (err) {
        alert('Failed to delete candidate');
      }
    }
  };

  const filteredCandidates = candidates.filter(c => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (c.candidateName || "").toLowerCase().includes(searchLower) ||
      (c.candidateEmail || "").toLowerCase().includes(searchLower) ||
      (c.jobTitle || "").toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-slide-up">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Global Talent Pool</h1>
          <p className="text-text-secondary mt-2">Search and filter through all processed candidates across all job roles.</p>
        </div>
        <div className="flex gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-primary transition-colors" size={20} />
            <input
              type="text"
              placeholder="Search by name, email, or role..."
              className="input-field pl-12 w-80"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            disabled 
            title="Advanced filters coming soon"
            className="btn-secondary flex items-center gap-2 opacity-50 cursor-not-allowed"
          >
            <Filter size={18} /> Filters
          </button>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-white/[0.02] border-b border-border">
              <th className="p-6 text-xs font-bold text-text-muted uppercase tracking-widest">Candidate</th>
              <th className="p-6 text-xs font-bold text-text-muted uppercase tracking-widest">Target Role</th>
              <th className="p-6 text-xs font-bold text-text-muted uppercase tracking-widest text-center">AI Score</th>
              <th className="p-6 text-xs font-bold text-text-muted uppercase tracking-widest">Status</th>
              <th className="p-6 text-xs font-bold text-text-muted uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr><td colSpan="5" className="p-10 text-center text-text-muted">Loading candidates...</td></tr>
            ) : error ? (
              <tr>
                <td colSpan="5" className="p-10 text-center">
                  <div className="text-accent-danger font-medium mb-2">{error}</div>
                  <button onClick={loadData} className="btn-secondary text-xs">Try Again</button>
                </td>
              </tr>
            ) : filteredCandidates.length === 0 ? (
              <tr><td colSpan="5" className="p-10 text-center text-text-muted">No candidates found.</td></tr>
            ) : (
              filteredCandidates.map((c) => (
                <tr key={c._id} className="hover:bg-white/[0.01] transition-colors group">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-accent-primary/10 rounded-xl flex items-center justify-center text-accent-primary font-bold">
                        {(c.candidateName || "C").charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-text-primary group-hover:text-accent-primary transition-colors">{c.candidateName || 'Unnamed Candidate'}</p>
                        <p className="text-xs text-text-muted mt-0.5">{c.candidateEmail || 'No Email Provided'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <p className="text-sm text-text-secondary font-medium">{c.jobTitle || 'Unassigned'}</p>
                    <p className="text-[10px] text-text-muted uppercase font-bold mt-1 tracking-tighter">
                      Applied {timeAgo(c.createdAt)}
                    </p>
                  </td>
                  <td className="p-6 text-center">
                    <div className={`inline-block px-3 py-1 rounded-lg text-xs font-black ${c.screeningResult?.matchScore >= 80 ? 'bg-accent-secondary/10 text-accent-secondary' :
                        c.screeningResult?.matchScore >= 50 ? 'bg-amber-500/10 text-amber-500' : 'bg-accent-danger/10 text-accent-danger'
                      }`}>
                      {c.screeningResult?.matchScore || 'N/A'}%
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${c.pipelineStage === 'shortlisted' ? 'bg-accent-secondary' :
                          c.pipelineStage === 'rejected' ? 'bg-accent-danger' : 'bg-accent-primary'
                        }`} />
                      <span className="text-xs font-bold text-text-primary capitalize">{c.pipelineStage || 'Applied'}</span>
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setSelectedCandidate(c)}
                        className="p-2 text-text-muted hover:text-accent-primary hover:bg-accent-primary/10 rounded-lg transition-all"
                      >
                        <ExternalLink size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteCandidate(c._id, c.candidateName)}
                        className="p-2 text-text-muted hover:text-accent-danger hover:bg-accent-danger/10 rounded-lg transition-all"
                        title="Delete Candidate"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedCandidate && (
        <CandidateModal
          resume={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          onUpdate={handleUpdateCandidate}
        />
      )}
    </div>
  );
};

export default Candidates;
