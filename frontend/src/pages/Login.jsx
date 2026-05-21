import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login, forgotPassword } from '../api';
import { Shield, Lock, Mail, ArrowRight, ArrowLeft, KeyRound, CheckCircle2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot password state
  const [view, setView] = useState('login'); // 'login' | 'forgot' | 'forgot-sent'
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');

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

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotError('');
    try {
      await forgotPassword({ email: forgotEmail });
      setView('forgot-sent');
    } catch (err) {
      setForgotError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setForgotLoading(false);
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

        {/* ── LOGIN VIEW ── */}
        {view === 'login' && (
          <>
            <div className="flex flex-col items-center text-center mb-10">
              <div className="w-16 h-16 bg-accent-primary/20 rounded-2xl flex items-center justify-center text-accent-primary mb-6 shadow-xl shadow-accent-primary/10">
                <Shield size={32} />
              </div>
              <h1 className="text-3xl font-bold text-text-primary tracking-tight">Executive Login</h1>
              <p className="text-text-secondary mt-2">Enter your credentials to access the recruiter panel.</p>
            </div>

            {error && (
              <div className="bg-accent-danger/10 border border-accent-danger/20 text-accent-danger p-4 rounded-xl text-sm mb-6 animate-slide-up">
                {error}
              </div>
            )}

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
                <div className="flex items-center justify-between ml-1">
                  <label htmlFor="password" className="text-sm font-semibold text-text-secondary">Password</label>
                  <button
                    type="button"
                    onClick={() => { setForgotEmail(email); setView('forgot'); setError(''); }}
                    className="text-xs font-semibold text-accent-primary hover:underline transition-all"
                  >
                    Forgot password?
                  </button>
                </div>
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

            <p className="text-center text-text-muted text-sm mt-8">
              Don't have an account? <Link to="/signup" className="text-accent-primary hover:underline">Sign up</Link>
            </p>
          </>
        )}

        {/* ── FORGOT PASSWORD VIEW ── */}
        {view === 'forgot' && (
          <>
            <div className="flex flex-col items-center text-center mb-10">
              <div className="w-16 h-16 bg-accent-primary/20 rounded-2xl flex items-center justify-center text-accent-primary mb-6 shadow-xl shadow-accent-primary/10">
                <KeyRound size={32} />
              </div>
              <h1 className="text-3xl font-bold text-text-primary tracking-tight">Reset Password</h1>
              <p className="text-text-secondary mt-2">Enter your email and we'll send you a reset link.</p>
            </div>

            {forgotError && (
              <div className="bg-accent-danger/10 border border-accent-danger/20 text-accent-danger p-4 rounded-xl text-sm mb-6 animate-slide-up">
                {forgotError}
              </div>
            )}

            <form onSubmit={handleForgotPassword} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="forgot-email" className="text-sm font-semibold text-text-secondary ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-primary transition-colors" size={20} />
                  <input
                    id="forgot-email"
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="input-field w-full pl-12"
                    placeholder="name@company.com"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={forgotLoading}
                className="btn-primary w-full py-4 flex items-center justify-center gap-2 group"
              >
                {forgotLoading ? 'Sending...' : 'Send Reset Link'}
                {!forgotLoading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
              </button>

              <button
                type="button"
                onClick={() => { setView('login'); setForgotError(''); }}
                className="w-full text-sm text-text-muted hover:text-text-primary transition-colors font-medium"
              >
                ← Back to Login
              </button>
            </form>
          </>
        )}

        {/* ── EMAIL SENT CONFIRMATION VIEW ── */}
        {view === 'forgot-sent' && (
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-accent-secondary/20 rounded-2xl flex items-center justify-center text-accent-secondary mb-6 shadow-xl shadow-accent-secondary/10">
              <CheckCircle2 size={32} />
            </div>
            <h1 className="text-3xl font-bold text-text-primary tracking-tight mb-3">Check Your Email</h1>
            <p className="text-text-secondary leading-relaxed mb-2">
              If an account exists for <span className="font-bold text-text-primary">{forgotEmail}</span>, a password reset link has been sent.
            </p>
            <p className="text-text-muted text-sm mb-10">The link expires in 30 minutes.</p>
            <button
              onClick={() => { setView('login'); setForgotError(''); setForgotEmail(''); }}
              className="btn-secondary w-full py-3 flex items-center justify-center gap-2"
            >
              <ArrowLeft size={18} /> Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
