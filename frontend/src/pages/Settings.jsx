import React, { useState, useEffect, useRef } from 'react';
import { Save, Bell, Shield, Key, Database, Loader2, Sliders } from 'lucide-react';
import { fetchSettings, updateSettings } from '../api';

const Settings = () => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);
  const timerRef = useRef(null);
  
  const [settings, setSettings] = useState({
    minimumScoreThreshold: 72,
    autoRejectLowMatches: false,
    notifyOnUpload: true,
    weeklySummary: true
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data } = await fetchSettings();
        if (data && data.data) {
          setSettings({
            minimumScoreThreshold: data.data.minimumScoreThreshold ?? 72,
            autoRejectLowMatches: data.data.autoRejectLowMatches ?? false,
            notifyOnUpload: data.data.notifyOnUpload ?? true,
            weeklySummary: data.data.weeklySummary ?? true
          });
        }
      } catch (error) {
        console.error('Failed to fetch settings', error);
        setError('Failed to load settings');
      } finally {
        setFetching(false);
      }
    };
    loadSettings();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    if (timerRef.current) clearTimeout(timerRef.current);

    const clampedThreshold = Math.max(40, Number(settings.minimumScoreThreshold) || 40);
    const updatedSettings = {
      ...settings,
      minimumScoreThreshold: clampedThreshold
    };

    try {
      await updateSettings(updatedSettings);
      setSettings(updatedSettings);
      setSaved(true);
      timerRef.current = setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save settings', error);
      setError('Failed to save settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="p-10 text-text-primary flex items-center justify-center min-h-[50vh]"><Loader2 className="animate-spin text-accent-primary" size={40} /></div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-slide-up">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">System Settings</h1>
        <p className="text-text-secondary mt-2">Manage your platform preferences and screening configurations.</p>
      </div>

      <div className="space-y-6">
        {/* AI & Security Section */}
        <div className="glass-card p-8 space-y-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 bg-accent-secondary/10 rounded-lg flex items-center justify-center text-accent-secondary">
              <Shield size={20} />
            </div>
            <h2 className="text-xl font-bold text-text-primary">AI & Security</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
              <div>
                <p className="text-sm font-bold text-text-primary">Gemini 1.5 Flash Integration</p>
                <p className="text-xs text-text-muted mt-1">Status: Active & Connected</p>
              </div>
              <div className="flex items-center gap-2 text-accent-secondary text-xs font-bold uppercase">
                <div className="w-2 h-2 rounded-full bg-accent-secondary animate-pulse" /> Connected
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
              <div>
                <p className="text-sm font-bold text-text-primary">Two-Factor Authentication</p>
                <p className="text-xs text-text-muted mt-1">Add an extra layer of security to your account.</p>
              </div>
              <button className="text-accent-primary text-sm font-bold hover:underline">Enable</button>
            </div>
          </div>
        </div>

        {/* AI Screening Preferences */}
        <div className="glass-card p-8 space-y-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-500">
              <Sliders size={20} />
            </div>
            <h2 className="text-xl font-bold text-text-primary">AI Screening Preferences</h2>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-text-secondary">Minimum Match Score Threshold (%)</label>
              <input 
                type="number" 
                className="input-field w-full md:w-1/3" 
                value={settings.minimumScoreThreshold}
                onChange={(e) => setSettings({...settings, minimumScoreThreshold: e.target.value === '' ? '' : Number(e.target.value)})}
                onBlur={() => {
                  const val = Math.max(40, Number(settings.minimumScoreThreshold) || 40);
                  setSettings({...settings, minimumScoreThreshold: val});
                }}
                min="40" max="100"
              />
              <p className="text-xs text-text-muted">Candidates scoring below this will be highlighted as low matches.</p>
            </div>
            
            <label className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={settings.autoRejectLowMatches}
                onChange={(e) => setSettings({...settings, autoRejectLowMatches: e.target.checked})}
                className="w-5 h-5 rounded border-border bg-card text-accent-primary focus:ring-accent-primary" 
              />
              <div>
                <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors block font-bold">Auto-Reject Low Matches</span>
                <span className="text-xs text-text-muted">Automatically move candidates below threshold to the Rejected pipeline.</span>
              </div>
            </label>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="glass-card p-8 space-y-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center text-amber-500">
              <Bell size={20} />
            </div>
            <h2 className="text-xl font-bold text-text-primary">Email Notifications</h2>
          </div>

          <div className="space-y-4">
            {error && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-sm">
                {error}
              </div>
            )}
            
            <label className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={settings.notifyOnUpload}
                onChange={(e) => setSettings({...settings, notifyOnUpload: e.target.checked})}
                className="w-5 h-5 rounded border-border bg-card text-accent-primary focus:ring-accent-primary" 
              />
              <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors font-bold">Notify me on new candidate uploads</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={settings.weeklySummary}
                onChange={(e) => setSettings({...settings, weeklySummary: e.target.checked})}
                className="w-5 h-5 rounded border-border bg-card text-accent-primary focus:ring-accent-primary" 
              />
              <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors font-bold">Send weekly recruitment summary</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button 
            onClick={handleSave}
            disabled={loading}
            className="btn-primary px-10 py-4 flex items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : saved ? 'Changes Saved!' : 'Save Settings'}
            {!loading && !saved && <Save size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
