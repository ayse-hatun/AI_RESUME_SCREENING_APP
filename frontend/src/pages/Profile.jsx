import React, { useState, useEffect } from 'react';
import { User, Mail, Building, Phone, MapPin, Save, Loader2, Camera, ShieldCheck, Sparkles, ArrowUpRight } from 'lucide-react';
import { fetchMe, updateProfile } from '../api';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        bio: '',
        company: '',
        title: '',
        phone: '',
        location: '',
        organization: ''
    });
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const { data } = await fetchMe();
                setUser(data.data);
                setFormData({
                    name: data.data.name || '',
                    bio: data.data.bio || '',
                    company: data.data.company || '',
                    title: data.data.title || '',
                    phone: data.data.phone || '',
                    location: data.data.location || '',
                    organization: data.data.organization || ''
                });
            } catch (err) {
                console.error('Failed to load profile');
                setMessage({ type: 'error', text: 'Failed to load profile details.' });
            } finally {
                setLoading(false);
            }
        };
        loadProfile();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });
        try {
            const { data } = await updateProfile(formData);
            const updatedUser = data.data;
            setUser(updatedUser);
            
            // Sync with localStorage so Navbar and other components update on next load/refresh
            const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
            localStorage.setItem('user', JSON.stringify({ ...storedUser, name: updatedUser.name }));
            
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            // Clear message after 3 seconds
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (err) {
            console.error('Failed to update profile');
            setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to update profile.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-12 h-12 text-accent-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-8 max-w-4xl mx-auto animate-slide-up">
            <div className="mb-8">
                <h1 className="text-3xl font-black tracking-tight text-text-primary dark:text-white">Recruiter Profile</h1>
                <p className="text-text-secondary mt-2">Manage your professional information and public details.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass-card p-6 text-center space-y-4">
                        <div className="relative inline-block">
                            <div className="w-32 h-32 bg-accent-primary rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-xl mx-auto">
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                            <button className="absolute bottom-0 right-0 p-2 bg-card border border-border rounded-full shadow-lg text-text-secondary hover:text-accent-primary transition-colors">
                                <Camera size={18} />
                            </button>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-text-primary dark:text-white">{user?.name}</h2>
                            <p className="text-sm text-accent-primary font-bold uppercase tracking-wider">{user?.role}</p>
                        </div>
                        <div className="pt-4 border-t border-border flex flex-col gap-3 text-left">
                            <div className="flex items-center gap-3 text-sm text-text-secondary">
                                <Mail size={16} className="text-text-muted" />
                                <span className="truncate">{user?.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-text-secondary">
                                <Building size={16} className="text-text-muted" />
                                <span>{user?.organization}</span>
                            </div>
                            {user?.location && (
                                <div className="flex items-center gap-3 text-sm text-text-secondary">
                                    <MapPin size={16} className="text-text-muted" />
                                    <span>{user.location}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="glass-card p-6">
                        <h3 className="font-bold text-text-primary mb-3">Quick Actions</h3>
                        <div className="space-y-2">
                            <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-accent-primary/10 text-text-secondary hover:text-accent-primary transition-all text-sm font-medium">Change Password</button>
                            <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-accent-primary/10 text-text-secondary hover:text-accent-primary transition-all text-sm font-medium">Notification Settings</button>
                            <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-accent-danger/10 text-text-secondary hover:text-accent-danger transition-all text-sm font-medium">Sign Out</button>
                        </div>
                    </div>

                    <div className="glass-card p-6 bg-gradient-to-br from-indigo-900/10 to-purple-900/10 border-accent-primary/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-3 text-accent-primary/30">
                            <Sparkles size={24} />
                        </div>
                        <h3 className="font-bold text-text-primary mb-2">Your Career Portal</h3>
                        <p className="text-xs text-text-secondary mb-4 leading-relaxed">
                            Share this link with candidates to let them view and apply to your active job openings instantly.
                        </p>
                        
                        <div className="space-y-3">
                            <div className="p-3 bg-black/20 rounded-xl border border-border text-xs text-text-secondary font-mono truncate select-all">
                                {`${window.location.origin}/careers/${user?._id}`}
                            </div>
                            
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(`${window.location.origin}/careers/${user?._id}`);
                                        alert('Careers link copied to clipboard!');
                                    }}
                                    className="btn-primary w-full py-2.5 text-xs font-bold"
                                >
                                    Copy Link
                                </button>
                                <a
                                    href={`/careers/${user?._id}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-2.5 rounded-xl border border-border hover:border-accent-primary transition-colors text-text-secondary hover:text-accent-primary bg-white/5 flex items-center justify-center"
                                    title="Open careers portal"
                                >
                                    <ArrowUpRight size={18} />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Edit Form */}
                <div className="lg:col-span-2">
                    <div className="glass-card p-8">
                        {message.text && (
                            <div className={`mb-6 p-4 rounded-xl text-sm font-medium ${
                                message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-accent-danger/10 text-accent-danger border border-accent-danger/20'
                            }`}>
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-text-secondary uppercase tracking-wider">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                                        <input 
                                            type="text" 
                                            name="name"
                                            value={formData.name}
                                            readOnly
                                            className="input-field w-full pl-12 bg-black/5 dark:bg-white/5 opacity-70 cursor-not-allowed"
                                            placeholder="Enter your name"
                                            required
                                        />
                                    </div>
                                    <p className="text-[10px] text-text-muted px-1">Fixed at signup</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-text-secondary uppercase tracking-wider">Professional Title</label>
                                    <div className="relative">
                                        <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                                        <input 
                                            type="text" 
                                            name="title"
                                            value={formData.title}
                                            readOnly
                                            className="input-field w-full pl-12 bg-black/5 dark:bg-white/5 opacity-70 cursor-not-allowed"
                                            placeholder="Senior Talent Acquisition"
                                        />
                                    </div>
                                    <p className="text-[10px] text-text-muted px-1">Fixed at signup</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-text-secondary uppercase tracking-wider">Main Company</label>
                                    <div className="relative">
                                        <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                                        <input 
                                            type="text" 
                                            name="organization"
                                            value={formData.organization}
                                            readOnly
                                            className="input-field w-full pl-12 bg-black/5 dark:bg-white/5 opacity-70 cursor-not-allowed"
                                            placeholder="Your Organization"
                                        />
                                    </div>
                                    <p className="text-[10px] text-text-muted px-1">Fixed at signup</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-text-secondary uppercase tracking-wider">Bio</label>
                                <textarea 
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    className="input-field w-full min-h-[120px] py-4 resize-none"
                                    placeholder="Tell us a bit about your professional background..."
                                ></textarea>
                                <p className="text-[10px] text-text-muted text-right">{formData.bio.length}/500 characters</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-text-secondary uppercase tracking-wider">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                                        <input 
                                            type="tel" 
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="input-field w-full pl-12"
                                            placeholder="+1 (555) 000-0000"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-text-secondary uppercase tracking-wider">Location</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                                        <input 
                                            type="text" 
                                            name="location"
                                            value={formData.location}
                                            onChange={handleChange}
                                            className="input-field w-full pl-12"
                                            placeholder="San Francisco, CA"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <button 
                                    type="submit" 
                                    disabled={saving}
                                    className="btn-primary flex items-center gap-2 shadow-xl shadow-accent-primary/20 disabled:opacity-50"
                                >
                                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save size={20} />}
                                    Save Profile Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
