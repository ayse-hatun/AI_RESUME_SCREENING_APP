import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api';
import { Shield, Lock, Mail, User, ArrowRight, ArrowLeft, Building, Briefcase } from 'lucide-react';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organization, setOrganization] = useState('');
  const [title, setTitle] = useState('');
  const [otp, setOtp] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await register({ name, email, password, organization, title });
      // Since backend is now auto-verifying, we can login immediately if token is returned
      // But register doesn't return token. So redirect to login.
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setVerifying(true);
    setError('');
    try {
      const { data } = await verifyEmail({ email, otp });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.data));
      navigate('/app');
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed. Invalid or expired code.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-6 bg-indigo-glow bg-no-repeat bg-center relative">
      <Link 
        to="/" 
        className="absolute top-8 left-8 flex items-center gap-2 text-text-muted hover:text-accent-primary transition-all group font-bold"
      >
        <div className="w-10 h-10 rounded-xl border border-border flex items-center justify-center group-hover:bg-accent-primary/5 group-hover:border-accent-primary/30 transition-all">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        </div>
        Back to Home
      </Link>
      <div className="glass-card w-full max-w-md p-10 animate-fade-in">
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-16 h-16 bg-accent-primary/20 rounded-2xl flex items-center justify-center text-accent-primary mb-6 shadow-xl shadow-accent-primary/10">
            <Shield size={32} />
          </div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">
            {showVerification ? 'Verify Email' : 'Create Account'}
          </h1>
          <p className="text-text-secondary mt-2">
            {showVerification 
              ? `We've sent a 6-digit code to ${email}`
              : 'Sign up to access the recruiter panel.'}
          </p>
        </div>

        {error && (
          <div role="alert" className="bg-accent-danger/10 border border-accent-danger/20 text-accent-danger p-4 rounded-xl text-sm mb-6 animate-slide-up">
            {error}
          </div>
        )}

        {success && showVerification && (
          <div className="bg-accent-primary/10 border border-accent-primary/20 text-accent-primary p-4 rounded-xl text-sm mb-6 animate-slide-up">
            {success}
          </div>
        )}

        {!showVerification ? (
          <form onSubmit={handleSignup} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-semibold text-text-secondary ml-1">Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-primary transition-colors" size={20} />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field w-full pl-12"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="organization" className="text-sm font-semibold text-text-secondary ml-1">Organization</label>
                <div className="relative group">
                  <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-primary transition-colors" size={18} />
                  <input
                    id="organization"
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    className="input-field w-full pl-12 text-sm"
                    placeholder="Meta / Google"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-semibold text-text-secondary ml-1">Professional Title</label>
                <div className="relative group">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-primary transition-colors" size={18} />
                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="input-field w-full pl-12 text-sm"
                    placeholder="HR Manager"
                    required
                  />
                </div>
              </div>
            </div>

            <p className="text-[10px] text-text-muted italic px-2">Note: Organization and Title are fixed upon signup and cannot be changed later.</p>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-semibold text-text-secondary ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-primary transition-colors" size={20} />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field w-full pl-12"
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-semibold text-text-secondary ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-primary transition-colors" size={20} />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field w-full pl-12"
                  placeholder="••••••••"
                  required
                  minLength="6"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 flex items-center justify-center gap-2 group"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
              {!loading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-text-secondary ml-1 text-center block">6-Digit Code</label>
              <input
                type="text"
                maxLength="6"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="input-field w-full text-center text-2xl tracking-[1em] font-black"
                placeholder="000000"
                required
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={verifying}
              className="btn-primary w-full py-4 flex items-center justify-center gap-2 group"
            >
              {verifying ? 'Verifying...' : 'Complete Verification'}
              {!verifying && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
            </button>

            <button
              type="button"
              onClick={() => setShowVerification(false)}
              className="w-full text-sm text-text-muted hover:text-text-primary transition-colors font-medium"
            >
              Back to Signup
            </button>
          </form>
        )}

        <p className="text-center text-text-muted text-sm mt-8">
          Already have an account? <Link to="/login" className="text-accent-primary hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
