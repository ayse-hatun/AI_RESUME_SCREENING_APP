import React, { useEffect, useState, useRef, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyEmail from './pages/VerifyEmail';
import ResetPassword from './pages/ResetPassword';
import { Menu } from 'lucide-react';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const JobDetails = lazy(() => import('./pages/JobDetails'));
const Settings = lazy(() => import('./pages/Settings'));
const Candidates = lazy(() => import('./pages/Candidates'));
const Analytics = lazy(() => import('./pages/Analytics'));
const PublicApply = lazy(() => import('./pages/PublicApply'));
const Jobs = lazy(() => import('./pages/Jobs'));
const Help = lazy(() => import('./pages/Help'));
const Profile = lazy(() => import('./pages/Profile'));
const InfoPage = lazy(() => import('./pages/InfoPage'));
const CareersLanding = lazy(() => import('./pages/careers/Landing'));
const CareersJobDetail = lazy(() => import('./pages/careers/JobDetail'));
const CareersApply = lazy(() => import('./pages/careers/ApplyForm'));
const CareersSuccess = lazy(() => import('./pages/careers/Success'));


const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    let theme = localStorage.getItem('theme');
    
    // Normalize theme value, treating invalid/missing values as 'dark'
    if (theme !== 'dark' && theme !== 'light') {
      theme = 'dark';
    }

    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    localStorage.setItem('theme', theme);
  }, []);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const sidebarTimeoutRef = useRef(null);

  const handleSidebarEnter = () => {
    if (sidebarTimeoutRef.current) clearTimeout(sidebarTimeoutRef.current);
    setIsSidebarOpen(true);
  };

  const handleSidebarLeave = () => {
    sidebarTimeoutRef.current = setTimeout(() => {
      setIsSidebarOpen(false);
    }, 10000); // 10 seconds
  };

  useEffect(() => {
    return () => {
      if (sidebarTimeoutRef.current) clearTimeout(sidebarTimeoutRef.current);
    };
  }, []);

  // Open sidebar automatically when changing pages inside the app
  useEffect(() => {
    if (location.pathname.startsWith('/app')) {
      handleSidebarEnter();
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><div className="w-12 h-12 border-4 border-accent-primary border-t-transparent rounded-full animate-spin"></div></div>}>
        <Routes>
          <Route path="/" element={<Landing />} />
        <Route path="/info" element={<InfoPage />} />
        <Route path="/documentation" element={<Help />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/apply/:jobId" element={<PublicApply />} />
        
        {/* Candidate / Careers Routes */}
        <Route path="/careers" element={<CareersLanding />} />
        <Route path="/careers/:recruiterId" element={<CareersLanding />} />
        <Route path="/careers/jobs/:jobId" element={<CareersJobDetail />} />
        <Route path="/careers/jobs/:jobId/apply" element={<CareersApply />} />
        <Route path="/careers/success" element={<CareersSuccess />} />
        <Route
          path="/app/*"
          element={
            <ProtectedRoute>
              <div className="flex w-full relative">
                {/* Invisible hover zone on the left edge to reopen sidebar */}
                {!isSidebarOpen && (
                  <div 
                    className="fixed top-0 left-0 w-20 h-screen z-40 bg-transparent"
                    onMouseEnter={handleSidebarEnter}
                  />
                )}
                
                {!isSidebarOpen && (
                  <div className="fixed top-6 left-6 z-50 flex flex-col gap-3 animate-fade-in">
                    <button
                      onClick={() => setIsSidebarOpen(true)}
                      className="p-2.5 bg-card border border-border rounded-xl shadow-lg text-text-secondary hover:text-accent-primary hover:bg-accent-primary/10 transition-all"
                      title="Open Menu"
                      aria-label="Open sidebar menu"
                    >
                      <Menu size={24} />
                    </button>
                    <button
                      onClick={() => {
                        if (location.state?.from) {
                          navigate(-1);
                        } else {
                          navigate('/');
                        }
                      }}
                      className="p-2.5 bg-card border border-border rounded-xl shadow-lg text-text-secondary hover:text-accent-primary hover:bg-accent-primary/10 transition-all"
                      title="Go Back"
                      aria-label="Go back to previous page"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
                    </button>
                  </div>
                )}
                <Navbar
                  isOpen={isSidebarOpen}
                  onMouseEnter={handleSidebarEnter}
                  onMouseLeave={handleSidebarLeave}
                />
                <main className={`flex-1 bg-indigo-glow bg-no-repeat bg-top transition-all duration-200 ease-in-out ${isSidebarOpen ? 'ml-64' : 'ml-0 pl-20 md:pl-24'}`}>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="jobs" element={<Jobs />} />
                    <Route path="jobs/:id" element={<JobDetails />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="candidates" element={<Candidates />} />
                    <Route path="analytics" element={<Analytics />} />
                    <Route path="profile" element={<Profile />} />
                  </Routes>
                </main>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
      </Suspense>
    </div>
  );
}

export default App;
