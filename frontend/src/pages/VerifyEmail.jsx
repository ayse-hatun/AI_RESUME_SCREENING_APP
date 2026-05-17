import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { verifyEmail } from '../api';
import { ShieldCheck, ShieldAlert, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const email = searchParams.get('email');
  const otp = searchParams.get('otp');

  useEffect(() => {
    const performVerification = async () => {
      if (!email || !otp) {
        setStatus('error');
        setMessage('Missing verification parameters. Please check your link.');
        return;
      }

      try {
        const { data } = await verifyEmail({ email, otp });
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.data));
        setStatus('success');
        setMessage('Your email has been successfully verified.');
        
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          navigate('/app');
        }, 3000);
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.error || 'Verification link is invalid or has expired.');
      }
    };

    performVerification();
  }, [email, otp, navigate]);

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
      <div className="glass-card w-full max-w-md p-10 animate-fade-in text-center">
        {status === 'verifying' && (
          <div className="flex flex-col items-center">
            <Loader2 size={64} className="text-accent-primary animate-spin mb-6" />
            <h1 className="text-2xl font-bold text-text-primary">Verifying your account...</h1>
            <p className="text-text-secondary mt-2">Please wait while we secure your profile.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-accent-primary/20 rounded-2xl flex items-center justify-center text-accent-primary mb-6 shadow-xl shadow-accent-primary/10">
              <ShieldCheck size={32} />
            </div>
            <h1 className="text-2xl font-bold text-text-primary">Success!</h1>
            <p className="text-text-secondary mt-2 mb-8">{message}</p>
            <p className="text-sm text-text-muted mb-6">Redirecting you to the dashboard...</p>
            <Link to="/app" className="btn-primary w-full py-4 flex items-center justify-center gap-2">
              Go to Dashboard <ArrowRight size={20} />
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-accent-danger/20 rounded-2xl flex items-center justify-center text-accent-danger mb-6 shadow-xl shadow-accent-danger/10">
              <ShieldAlert size={32} />
            </div>
            <h1 className="text-2xl font-bold text-text-primary">Verification Failed</h1>
            <p className="text-text-secondary mt-2 mb-8">{message}</p>
            <div className="space-y-3 w-full">
              <Link to="/login" className="btn-primary w-full py-4 block">
                Back to Login
              </Link>
              <Link to="/signup" className="w-full py-3 block text-text-muted hover:text-text-primary font-medium">
                Create new account
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
