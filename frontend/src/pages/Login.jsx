import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api';
import { Shield, Lock, Mail, ArrowRight, ArrowLeft } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await login({ email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.data));
      navigate('/app');
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
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
            {showVerification ? 'Verify Account' : 'Executive Login'}
          </h1>
          <p className="text-text-secondary mt-2">
            {showVerification 
              ? `Enter the 6-digit code sent to ${email}`
              : 'Enter your credentials to access the recruiter panel.'}
          </p>
        </div>

        {error && (
          <div className={`${showVerification && !verifying ? 'bg-accent-primary/10 border-accent-primary/20 text-accent-primary' : 'bg-accent-danger/10 border-accent-danger/20 text-accent-danger'} border p-4 rounded-xl text-sm mb-6 animate-slide-up`}>
            {error}
          </div>
        )}

        {!showVerification ? (
          <form onSubmit={handleLogin} className="space-y-6">
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
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 flex items-center justify-center gap-2 group"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
              {!loading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="otp" className="text-sm font-semibold text-text-secondary ml-1 text-center block">6-Digit Code</label>
              <input
                id="otp"
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
              Back to Login
            </button>
          </form>
        )}

        <p className="text-center text-text-muted text-sm mt-8">
          Don't have an account? <Link to="/signup" className="text-accent-primary hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
