import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  Settings as SettingsIcon, 
  HelpCircle, 
  LogOut,
  ShieldCheck,
  PieChart,
  Sun,
  Moon,
  Globe
} from 'lucide-react';

const NavItem = ({ to, icon: Icon, label }) => {
  const isDashboard = to === '/app';
  return (
    <NavLink 
      to={to} 
      end={isDashboard}
      className={({ isActive }) => 
        `relative overflow-hidden flex items-center gap-3 px-5 py-3 rounded-xl transition-all duration-300 group ${
          isActive 
            ? 'bg-white/10 text-white shadow-lg shadow-white/5' 
            : 'text-white/70 hover:bg-white/5 hover:text-white'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {/* Glowing left border */}
          <div className={`absolute top-0 left-0 bottom-0 w-1 bg-accent-secondary shadow-[0_0_20px_2px] shadow-accent-secondary/60 transition-opacity duration-300 ${
            isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'
          }`}></div>
          
          <Icon size={20} className="group-hover:scale-110 transition-transform z-10 relative" />
          <span className="font-medium z-10 relative">{label}</span>
        </>
      )}
    </NavLink>
  );
};

const Navbar = ({ isOpen = true, onMouseEnter, onMouseLeave }) => {
  const navigate = useNavigate();
  const [user] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : { name: "Admin", role: "admin" };
    } catch (e) {
      console.warn('Failed to parse user from localStorage, using default.', e);
      return { name: "Admin", role: "admin" };
    }
  });
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    setIsDarkMode(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.contains('dark');
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <nav 
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`w-64 bg-[#08544A] h-screen fixed left-0 top-0 flex flex-col p-6 z-40 transition-transform duration-500 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
    >
      {/* Brand */}
      <div className="flex items-center justify-between px-2 mb-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent-primary rounded-xl flex items-center justify-center text-white shadow-xl shadow-accent-primary/20">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">SmartHire</h1>
            <p className="text-[10px] text-accent-secondary font-black uppercase tracking-widest whitespace-nowrap">AI Platform</p>
          </div>
        </div>
        
        <button 
          onClick={toggleTheme}
          className="p-2 ml-4 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors shrink-0"
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      {/* Main Nav */}
      <div className="space-y-2 flex-1">
        <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest px-4 mb-2">Main Menu</p>
        <NavItem to="/app" icon={LayoutDashboard} label="Dashboard" />
        <NavItem to="/app/jobs" icon={Briefcase} label="Job Pipelines" />
        <NavItem to="/app/candidates" icon={Users} label="Candidates" />
        <NavItem to="/app/analytics" icon={PieChart} label="Analytics" />
        
        <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest px-4 mt-10 mb-2">System</p>
        <NavItem to="/app/settings" icon={SettingsIcon} label="Settings" />
        <NavItem to="/documentation" icon={HelpCircle} label="Documentation" />
        
        <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest px-4 mt-10 mb-2">Public Info</p>
        <a 
          href="/careers" 
          target="_blank" 
          rel="noopener noreferrer"
          className="relative overflow-hidden flex items-center gap-3 px-5 py-3 rounded-xl transition-all duration-300 group text-white/70 hover:bg-white/5 hover:text-white"
        >
          <div className="absolute top-0 left-0 bottom-0 w-1 bg-accent-secondary opacity-0 group-hover:opacity-40 transition-opacity duration-300"></div>
          <Globe size={20} className="group-hover:scale-110 transition-transform z-10 relative" />
          <span className="font-medium z-10 relative">Careers Page</span>
        </a>
      </div>

      <div className="mt-auto pt-4 border-t border-white/10">
        <NavLink 
          to="/app/profile"
          className={({ isActive }) => 
            `flex items-center gap-3 px-2 mb-2 py-2 rounded-xl transition-all group ${
              isActive ? 'bg-white/10 text-white' : 'hover:bg-white/5'
            }`
          }
        >
          <div className="w-10 h-10 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg group-hover:scale-105 transition-transform shrink-0">
            {user.name.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-white truncate group-hover:text-accent-secondary transition-colors">{user.name}</p>
            <p className="text-[10px] text-white/50 uppercase font-bold tracking-tighter">{user.role}</p>
          </div>
        </NavLink>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:text-accent-danger hover:bg-white/5 transition-all group"
        >
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold text-sm">Sign Out</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
