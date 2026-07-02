import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Home, User, Briefcase, FileText, Cpu, Bell, LogOut, 
  Menu, X, Sun, Moon, PlusSquare, Users, Building, BarChart2, ShieldAlert
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { userProfile, logout, isMock } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getNavItems = () => {
    if (!userProfile) return [];

    switch (userProfile.role) {
      case 'STUDENT':
        return [
          { name: 'Dashboard', path: '/student/dashboard', icon: Home },
          { name: 'My Profile', path: '/student/profile', icon: User },
          { name: 'Job Openings', path: '/jobs', icon: Briefcase },
          { name: 'My Applications', path: '/student/applications', icon: FileText },
          { name: 'AI Resume Analysis', path: '/ai-analysis', icon: Cpu },
          { name: 'Notifications', path: '/notifications', icon: Bell },
        ];
      case 'COMPANY_HR':
        return [
          { name: 'Dashboard', path: '/company/dashboard', icon: Home },
          { name: 'Company Profile', path: '/company/profile', icon: Building },
          { name: 'Post Openings', path: '/jobs/new', icon: PlusSquare },
          { name: 'Manage Applicants', path: '/company/applicants', icon: Users },
          { name: 'Job Listings', path: '/jobs', icon: Briefcase },
        ];
      case 'TPO_ADMIN':
        return [
          { name: 'Overview Dashboard', path: '/tpo/dashboard', icon: Home },
          { name: 'Manage Students', path: '/tpo/students', icon: Users },
          { name: 'Manage Companies', path: '/tpo/companies', icon: Building },
          { name: 'Manage Jobs', path: '/jobs', icon: Briefcase },
          { name: 'Placement Analytics', path: '/tpo/analytics', icon: BarChart2 },
          { name: 'Notifications', path: '/notifications', icon: Bell },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'TPO_ADMIN': return 'bg-rose-500 text-white';
      case 'COMPANY_HR': return 'bg-cyan-500 text-white';
      case 'STUDENT': return 'bg-indigo-500 text-white';
      default: return 'bg-slate-500 text-white';
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-sans overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Component */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🎓</span>
            <span className="text-lg font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-500 dark:from-indigo-400 dark:to-violet-300">
              PlacementPortal
            </span>
          </Link>
          <button 
            onClick={() => setSidebarOpen(false)} 
            className="rounded-md p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden text-slate-500"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 space-y-1.5 px-4 py-6 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          {userProfile && (
            <div className="mb-4 flex items-center gap-3 px-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-semibold text-base shadow-sm">
                {userProfile.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate dark:text-slate-200">{userProfile.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase ${getRoleColor(userProfile.role)}`}>
                    {userProfile.role.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          {isMock && (
            <div className="mb-3 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 flex items-center gap-2">
              <ShieldAlert size={14} className="text-amber-500 shrink-0" />
              <span className="text-[10px] font-medium text-amber-700 dark:text-amber-400 leading-tight">Operating in Local Demo Mode</span>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all"
          >
            <LogOut size={18} />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main body area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        
        {/* Header/Navbar */}
        <header className="flex h-16 items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-md p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 lg:hidden"
          >
            <Menu size={20} />
          </button>
          
          <div className="hidden sm:block text-sm text-slate-500 dark:text-slate-400">
            Welcome, <span className="font-semibold text-slate-800 dark:text-slate-200">{userProfile?.name}</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Dark Mode toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="rounded-xl p-2.5 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all border border-slate-100 dark:border-slate-800"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Profile Initials/Avatar */}
            <div className="relative group cursor-pointer">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-semibold border border-slate-200 dark:border-slate-750">
                {userProfile?.name.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Content container */}
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950/60 p-6 md:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>

    </div>
  );
};
