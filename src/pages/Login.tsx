import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, UserRole } from '../context/AuthContext';
import { Mail, Lock, LogIn, Chrome, ShieldCheck } from 'lucide-react';
import { ThreeDAnimation } from '../components/ThreeDAnimation';
import toast from 'react-hot-toast';

export const Login: React.FC = () => {
  const { signInWithEmail, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleRole, setGoogleRole] = useState<UserRole>('STUDENT');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter email and password.');
      return;
    }
    
    try {
      setLoading(true);
      await signInWithEmail(email, password);
      navigate('/');
    } catch (err: any) {
      // Handled by auth context fallback, but if we get here we can redirect anyway
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await signInWithGoogle(googleRole);
      navigate('/');
    } catch (err) {
      // AuthContext fallback logic runs
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('admin123');
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50 dark:bg-slate-950 overflow-x-hidden">
      
      {/* 3D WebGL Canvas Branding Panel (Visible on ALL devices: Mobile, Tablet & Desktop) */}
      <div className="w-full h-80 sm:h-96 lg:h-auto lg:w-1/2 relative flex flex-col justify-between bg-indigo-950 p-6 sm:p-10 lg:p-12 text-white overflow-hidden select-none shrink-0">
        
        {/* Ambient Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-950 via-slate-950 to-violet-950 opacity-95" />
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-indigo-600/30 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-45 -left-40 h-96 w-96 rounded-full bg-violet-600/25 blur-3xl pointer-events-none" />

        {/* Interactive 3D Canvas Scene & Floating Depth Cards */}
        <ThreeDAnimation />

        {/* Top Brand Header */}
        <div className="relative z-20 pointer-events-none">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl sm:text-3xl filter drop-shadow-md">🎓</span>
            <span className="text-lg sm:text-xl font-extrabold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-violet-300">
              PlacementPortal
            </span>
          </div>
        </div>

        {/* Center Tagline */}
        <div className="relative z-20 space-y-2 sm:space-y-4 max-w-lg pointer-events-none my-auto">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-[10px] sm:text-xs font-semibold backdrop-blur-md">
            ✨ Interactive 3D WebGL Engine
          </div>
          <h1 className="text-2xl sm:text-4xl xl:text-5xl font-extrabold leading-tight tracking-tight drop-shadow-lg text-white">
            Elevate Your Campus Hiring Pipeline.
          </h1>
          <p className="hidden sm:block text-indigo-200/90 text-sm xl:text-base leading-relaxed">
            Empowering students, HR recruiters, and TPOs with automated CGPA eligibility rules, interactive placement analytics, and Vertex AI Gemini resume matching.
          </p>
        </div>

        {/* Footer info */}
        <div className="relative z-20 text-[10px] sm:text-xs text-indigo-300/80 pointer-events-none flex justify-between items-center">
          <span>© {new Date().getFullYear()} College Placement Portal</span>
          <span className="flex items-center gap-1 text-[10px] sm:text-[11px] font-medium text-indigo-200">
            <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-emerald-400 animate-pulse" />
            3D Mobile Ready
          </span>
        </div>
      </div>

      {/* Right side: Login Form Column */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 md:p-16 z-10 bg-white dark:bg-slate-950 flex-1">
        <div className="w-full max-w-md space-y-6 sm:space-y-8">
          
          <div className="space-y-1 sm:space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight dark:text-white">
              Welcome back
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
              Please sign in to access your placement dashboard.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <Mail size={18} />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@college.edu"
                  className="w-full pl-11 pr-4 py-2.5 sm:py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Password</label>
                <Link to="/forgot-password" className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <Lock size={18} />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-2.5 sm:py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loading ? 'Signing In...' : 'Sign In'}
              <LogIn size={16} />
            </button>
          </form>

          {/* Social Divider */}
          <div className="relative flex py-1 sm:py-2 items-center">
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
            <span className="flex-shrink mx-4 text-slate-400 text-xs font-medium uppercase tracking-wider">Or Login With</span>
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
          </div>

          {/* Google Login with Role Pre-selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Sign in as:</span>
              <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-800 p-0.5 bg-slate-100/50 dark:bg-slate-900">
                {(['STUDENT', 'COMPANY_HR', 'TPO_ADMIN'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setGoogleRole(r)}
                    className={`px-2 py-1 text-[10px] font-semibold rounded-md transition-all ${
                      googleRole === r 
                        ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600 dark:text-indigo-400' 
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {r.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGoogleLogin}
              type="button"
              className="w-full py-2.5 sm:py-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border border-slate-200 dark:border-slate-800 rounded-xl text-sm flex items-center justify-center gap-2 transition-all"
            >
              <Chrome size={18} className="text-indigo-600" />
              Sign in with Google
            </button>
          </div>

          {/* Register Link */}
          <div className="text-center text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
              Create an account
            </Link>
          </div>

          {/* Quick Demo Accounts Helper */}
          <div className="mt-6 sm:mt-8 p-3.5 sm:p-4 rounded-xl border border-amber-200 bg-amber-50/50 dark:border-amber-900/30 dark:bg-amber-950/10 space-y-2.5 sm:space-y-3">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 font-semibold text-[11px] sm:text-xs uppercase tracking-wider">
              <ShieldCheck size={16} />
              Quick Demo Accounts (Password: admin123)
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillDemo('student-demo@test.com')}
                className="px-2 py-2 text-[10px] sm:text-[11px] font-medium bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:hover:bg-indigo-950/60 dark:text-indigo-300 rounded-lg transition-all"
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => fillDemo('hr-demo@test.com')}
                className="px-2 py-2 text-[10px] sm:text-[11px] font-medium bg-cyan-50 hover:bg-cyan-100 text-cyan-700 dark:bg-cyan-950/40 dark:hover:bg-cyan-950/60 dark:text-cyan-300 rounded-lg transition-all"
              >
                HR Demo
              </button>
              <button
                type="button"
                onClick={() => fillDemo('tpo-demo@test.com')}
                className="px-2 py-2 text-[10px] sm:text-[11px] font-medium bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:hover:bg-rose-950/60 dark:text-rose-300 rounded-lg transition-all"
              >
                TPO Demo
              </button>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
