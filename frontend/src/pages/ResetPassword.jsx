import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { resetPassword } from '../api';
import { KeyRound, Lock, ArrowRight, ArrowLeft, CheckCircle2, Eye, EyeOff } from 'lucide-react';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }
    if (password !== confirm) {
      return setError('Passwords do not match.');
    }
    setLoading(true);
    try {
      await resetPassword(token, { password });
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.error || 'This reset link is invalid or has expired. Please request a new one.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-6 bg-indigo-glow bg-no-repeat bg-center relative">
      <Link
        to="/login"
        className="absolute top-8 left-8 flex items-center gap-2 text-text-muted hover:text-accent-primary transition-all group font-bold"
      >
        <div className="w-10 h-10 rounded-xl border border-border flex items-center justify-center group-hover:bg-accent-primary/5 group-hover:border-accent-primary/30 transition-all">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        </div>
        Back to Login
      </Link>

      <div className="glass-card w-full max-w-md p-10 animate-fade-in">

        {!done ? (
          <>
            <div className="flex flex-col items-center text-center mb-10">
              <div className="w-16 h-16 bg-accent-primary/20 rounded-2xl flex items-center justify-center text-accent-primary mb-6 shadow-xl shadow-accent-primary/10">
                <KeyRound size={32} />
              </div>
              <h1 className="text-3xl font-bold text-text-primary tracking-tight">Set New Password</h1>
              <p className="text-text-secondary mt-2">Choose a strong password for your account.</p>
            </div>

            {error && (
              <div className="bg-accent-danger/10 border border-accent-danger/20 text-accent-danger p-4 rounded-xl text-sm mb-6 animate-slide-up">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="new-password" className="text-sm font-semibold text-text-secondary ml-1">New Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-primary transition-colors" size={20} />
                  <input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field w-full pl-12 pr-12"
                    placeholder="Min. 6 characters"
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-accent-primary transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="confirm-password" className="text-sm font-semibold text-text-secondary ml-1">Confirm Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-primary transition-colors" size={20} />
                  <input
                    id="confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="input-field w-full pl-12"
                    placeholder="Repeat password"
                    required
                  />
                </div>
              </div>

              {/* Strength hint */}
              {password.length > 0 && (
                <div className="flex items-center gap-2">
                  {[4, 6, 8, 10].map((n, i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                        password.length >= n
                          ? i < 1 ? 'bg-accent-danger' : i < 2 ? 'bg-amber-500' : i < 3 ? 'bg-yellow-400' : 'bg-accent-secondary'
                          : 'bg-border'
                      }`}
                    />
                  ))}
                  <span className="text-[10px] text-text-muted font-bold w-12 text-right">
                    {password.length < 4 ? 'Weak' : password.length < 6 ? 'Fair' : password.length < 8 ? 'Good' : 'Strong'}
                  </span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-4 flex items-center justify-center gap-2 group mt-2"
              >
                {loading ? 'Saving...' : 'Reset Password'}
                {!loading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
              </button>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-accent-secondary/20 rounded-2xl flex items-center justify-center text-accent-secondary mb-6 shadow-xl shadow-accent-secondary/10">
              <CheckCircle2 size={32} />
            </div>
            <h1 className="text-3xl font-bold text-text-primary tracking-tight mb-3">Password Updated!</h1>
            <p className="text-text-secondary leading-relaxed mb-10">
              Your password has been reset successfully. You can now sign in with your new password.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="btn-primary w-full py-4 flex items-center justify-center gap-2 group"
            >
              Go to Login <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
