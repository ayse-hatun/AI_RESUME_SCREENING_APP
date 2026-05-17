import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { TrendingUp, Users, Briefcase, Award, Filter, Calendar, Download } from 'lucide-react';
import { fetchResumes, fetchJobs } from '../api';

const Analytics = () => {
  const [data, setData] = useState({
    funnel: [],
    departments: [],
    scores: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [resumesRes, jobsRes] = await Promise.all([fetchResumes(), fetchJobs()]);
        const resumes = resumesRes.data.data || [];
        const jobs = jobsRes.data.data || [];

        // 1. Process Funnel Data
        const funnel = [
          { name: 'Applied', count: resumes.length },
          { name: 'Screened', count: resumes.filter(r => r.status === 'completed').length },
          { name: 'Shortlisted', count: resumes.filter(r => r.pipelineStage === 'shortlisted').length },
          { name: 'Hired', count: resumes.filter(r => r.pipelineStage === 'hired').length }
        ];

        // 2. Process Department Data
        const deptMap = {};
        jobs.forEach(job => {
          const dept = job.department?.trim() || 'Unassigned';
          deptMap[dept] = (deptMap[dept] || 0) + 1;
        });
        const departments = Object.keys(deptMap).map(name => ({ name, value: deptMap[name] }));

        // 3. Process Score Distribution
        const scoreGroups = [
          { range: '0-20', count: 0 },
          { range: '21-40', count: 0 },
          { range: '41-60', count: 0 },
          { range: '61-80', count: 0 },
          { range: '81-100', count: 0 }
        ];
        resumes.forEach(r => {
          const score = r.screeningResult?.matchScore || 0;
          if (score <= 20) scoreGroups[0].count++;
          else if (score <= 40) scoreGroups[1].count++;
          else if (score <= 60) scoreGroups[2].count++;
          else if (score <= 80) scoreGroups[3].count++;
          else scoreGroups[4].count++;
        });

        setData({ funnel, departments, scores: scoreGroups });
      } catch (err) {
        console.error('Failed to load analytics:', err);
        setError(err.message || 'Failed to load recruitment metrics. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  if (loading) return <div className="p-10 text-text-primary flex items-center justify-center min-h-[50vh] animate-pulse font-bold uppercase tracking-widest text-accent-primary">Analyzing Recruitment Data...</div>;

  if (error) {
    return (
      <div className="p-10 flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="text-accent-danger font-bold text-lg">{error}</div>
        <button onClick={() => window.location.reload()} className="btn-secondary px-6">Retry Analysis</button>
      </div>
    );
  }

  const conversionRate = data.funnel.length > 0 && data.funnel[0].count > 0
    ? Math.round((data.funnel[data.funnel.length - 1].count / data.funnel[0].count) * 100)
    : 0;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-slide-up">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Recruitment Analytics</h1>
          <p className="text-text-secondary mt-2">Data-driven insights into your hiring performance and candidate quality.</p>
        </div>
        <div className="flex gap-3">
          <button 
            disabled 
            title="Date range filtering coming soon"
            className="btn-secondary flex items-center gap-2 opacity-50 cursor-not-allowed"
          >
            <Calendar size={18} /> Last 30 Days
          </button>
          <button 
            disabled 
            title="Export utility coming soon"
            className="btn-primary flex items-center gap-2 opacity-50 cursor-not-allowed shadow-none"
          >
            <Download size={18} /> Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Hiring Funnel */}
        <div className="glass-card p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-bold text-text-primary">Hiring Funnel</h3>
            <span className="text-[10px] font-bold text-accent-primary bg-accent-primary/10 px-2 py-1 rounded uppercase">Conversion: {conversionRate}%</span>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.funnel}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f1f23" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111114', border: '1px solid #1f1f23', borderRadius: '12px' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Score Distribution */}
        <div className="glass-card p-8">
          <h3 className="text-lg font-bold text-text-primary mb-8">Match Score Distribution</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.scores}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f1f23" vertical={false} />
                <XAxis dataKey="range" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111114', border: '1px solid #1f1f23', borderRadius: '12px' }}
                />
                <Area type="monotone" dataKey="count" stroke="#10b981" fillOpacity={1} fill="url(#colorScore)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Breakdown */}
        <div className="glass-card p-8">
          <h3 className="text-lg font-bold text-text-primary mb-8">Hiring by Department</h3>
          <div className="h-[300px] w-full flex">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.departments}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.departments.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111114', border: '1px solid #1f1f23', borderRadius: '12px' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Growth Stats (Demo Data Markers) */}
        <div className="grid grid-cols-2 gap-6">
          <div className="glass-card p-6 flex flex-col justify-center border-l-4 border-accent-primary relative overflow-hidden">
            <div className="absolute top-2 right-2 text-[8px] font-bold bg-white/5 text-text-muted px-1.5 py-0.5 rounded tracking-tighter uppercase">Demo</div>
            <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Growth Rate</p>
            <div className="flex items-center gap-2">
              <h4 className="text-3xl font-black text-text-primary">+24%</h4>
              <TrendingUp size={20} className="text-accent-secondary" />
            </div>
            <p className="text-[10px] text-text-muted mt-2">vs previous 30 days</p>
          </div>
          <div className="glass-card p-6 flex flex-col justify-center border-l-4 border-accent-secondary relative overflow-hidden">
            <div className="absolute top-2 right-2 text-[8px] font-bold bg-white/5 text-text-muted px-1.5 py-0.5 rounded tracking-tighter uppercase">Demo</div>
            <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-2">AI Efficiency</p>
            <div className="flex items-center gap-2">
              <h4 className="text-3xl font-black text-text-primary">8.4x</h4>
              <Award size={20} className="text-accent-primary" />
            </div>
            <p className="text-[10px] text-text-muted mt-2">Faster than manual screening</p>
          </div>
          <div className="glass-card p-6 flex flex-col justify-center border-l-4 border-amber-500 relative overflow-hidden">
            <div className="absolute top-2 right-2 text-[8px] font-bold bg-white/5 text-text-muted px-1.5 py-0.5 rounded tracking-tighter uppercase">Demo</div>
            <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Top Source</p>
            <h4 className="text-xl font-bold text-text-primary">Direct Referrals</h4>
            <p className="text-[10px] text-text-muted mt-2">42% of high-score candidates</p>
          </div>
          <div className="glass-card p-6 flex flex-col justify-center border-l-4 border-indigo-500 relative overflow-hidden">
            <div className="absolute top-2 right-2 text-[8px] font-bold bg-white/5 text-text-muted px-1.5 py-0.5 rounded tracking-tighter uppercase">Demo</div>
            <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Time to Hire</p>
            <h4 className="text-3xl font-black text-text-primary">12d</h4>
            <p className="text-[10px] text-text-muted mt-2">Company average: 45 days</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
