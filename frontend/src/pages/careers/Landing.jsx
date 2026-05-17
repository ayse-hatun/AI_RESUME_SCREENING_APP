import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchPublicJobs } from '../../api';
import { Briefcase, MapPin, Building2, ChevronRight, Loader2 } from 'lucide-react';

const CareersLanding = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetchPublicJobs();
        if (response.data.success) {
          setJobs(response.data.data);
        }
      } catch (err) {
        setError('Unable to load job openings. Please try again later.');
        console.error('Fetch jobs error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  return (
    <div className="min-h-screen bg-background bg-indigo-glow bg-no-repeat bg-top py-20 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-primary/10 border border-accent-primary/20 text-accent-primary text-sm font-medium mb-6">
            <Building2 size={16} />
            <span>Join Our Team</span>
          </div>
          <h1 className="text-5xl font-bold text-text-primary mb-6 tracking-tight">
            Build the Future <span className="text-gradient">With Us</span>
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
            We're looking for passionate individuals to help us redefine what's possible. 
            Explore our open positions and find your next challenge.
          </p>
        </div>

        {/* Jobs List Section */}
        <div className="space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-accent-primary animate-spin mb-4" />
              <p className="text-text-secondary font-medium">Fetching opportunities...</p>
            </div>
          ) : error ? (
            <div className="glass-card p-12 text-center border-red-500/20 bg-red-500/5">
              <p className="text-red-400 font-medium">{error}</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="glass-card p-12 text-center border-dashed border-border">
              <p className="text-text-secondary text-lg">
                No active job openings at the moment. Please check back later!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {jobs.map((job) => (
                <Link
                  key={job._id}
                  to={`/careers/jobs/${job._id}`}
                  className="glass-card p-8 group hover:border-accent-primary/50 transition-all duration-300 hover:translate-y-[-4px] relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight className="text-accent-primary" />
                  </div>
                  
                  <div className="flex flex-col h-full">
                    <div className="mb-6">
                      <span className="text-xs font-bold uppercase tracking-wider text-accent-primary px-3 py-1 bg-accent-primary/10 rounded-full">
                        {job.department || 'General'}
                      </span>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-text-primary mb-3 group-hover:text-accent-primary transition-colors">
                      {job.title}
                    </h3>
                    
                    <div className="flex items-center gap-4 text-text-secondary mt-auto">
                      <div className="flex items-center gap-1.5 text-sm">
                        <MapPin size={16} />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm border-l border-border pl-4">
                        <Briefcase size={16} />
                        <span>Full-time</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-20 text-center text-text-tertiary text-sm">
          <p>© {new Date().getFullYear()} SmartHire AI. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default CareersLanding;
