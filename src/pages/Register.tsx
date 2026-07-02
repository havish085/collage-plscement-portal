import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, UserRole } from '../context/AuthContext';
import { User, Mail, Lock, Building, ArrowRight, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

export const Register: React.FC = () => {
  const { signUpWithEmail } = useAuth();
  const navigate = useNavigate();
  
  const [role, setRole] = useState<UserRole>('STUDENT');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error('Please fill in all fields.');
      return;
    }
    if (role === 'COMPANY_HR' && !companyName) {
      toast.error('Please enter your Company Name.');
      return;
    }

    try {
      setLoading(true);
      const extraData = role === 'COMPANY_HR' ? { companyName } : {};
      await signUpWithEmail(email, password, name, role, extraData);
      navigate('/');
    } catch (err) {
      // Handled by auth provider fallback
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      
      {/* Left side: Premium Branding Column */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between bg-indigo-950 p-12 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900 via-indigo-950 to-violet-900 opacity-90" />
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="absolute -bottom-45 -left-40 h-90 w-90 rounded-full bg-indigo-500/20 blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-2.5">
            <span className="text-3xl">🎓</span>
            <span className="text-xl font-bold tracking-wider">PlacementPortal</span>
          </div>
        </div>

        <div className="relative z-10 space-y-4">
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight">
            Create Your Account Today.
          </h1>
          <p className="text-indigo-200 text-lg max-w-md">
            Join thousands of students and recruiters matching skills and requirements in real-time. Choose your role to get started.
          </p>
        </div>

        <div className="relative z-10 text-xs text-indigo-300">
          © {new Date().getFullYear()} College Placement Portal. All rights reserved.
        </div>
      </div>

      {/* Right side: Register Form Column */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 md:p-16">
        <div className="w-full max-w-md space-y-6">
          
          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold tracking-tight dark:text-white">
              Create an account
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Please enter your details to sign up.
            </p>
          </div>

          {/* Role selector tab */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Select Account Type</label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => setRole('STUDENT')}
                className={`py-2.5 text-xs font-bold rounded-lg transition-all ${
                  role === 'STUDENT'
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                🎓 Student Account
              </button>
              <button
                type="button"
                onClick={() => setRole('COMPANY_HR')}
                className={`py-2.5 text-xs font-bold rounded-lg transition-all ${
                  role === 'COMPANY_HR'
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                💼 HR Recruiter
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <User size={18} />
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
                  required
                />
              </div>
            </div>

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
                  placeholder="john@example.com"
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
                  required
                />
              </div>
            </div>

            {role === 'COMPANY_HR' && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Company Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                    <Building size={18} />
                  </span>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Acme Corp"
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <Lock size={18} />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Register'}
              <UserPlus size={16} />
            </button>
          </form>

          {/* Login Link */}
          <div className="text-center text-sm text-slate-600 dark:text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
              Sign in
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
};
