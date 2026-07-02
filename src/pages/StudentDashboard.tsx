import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dbMock, JobOpening, JobApplication, NotificationItem } from '../firebase/dbMock';
import { Briefcase, CheckCircle2, XCircle, Clock, Calendar, ArrowRight, Bell, Award, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

export const StudentDashboard: React.FC = () => {
  const { userProfile } = useAuth();
  
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activeJobs, setActiveJobs] = useState<JobOpening[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!userProfile) return;
      try {
        setLoading(true);
        // Load Apps
        const apps = await dbMock.getApplications();
        const studentApps = apps.filter(a => a.studentId === userProfile.uid);
        setApplications(studentApps);

        // Load Notifications
        const notifs = await dbMock.getNotifications(userProfile.uid);
        setNotifications(notifs.slice(0, 4)); // top 4

        // Load active jobs
        const jobs = await dbMock.getJobs();
        setActiveJobs(jobs.slice(0, 3)); // first 3 recommended
      } catch (err) {
        toast.error('Error fetching dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [userProfile]);

  const getStatusColor = (status: JobApplication['status']) => {
    switch (status) {
      case 'Applied': return 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-450';
      case 'Under Review': return 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-450';
      case 'Shortlisted': return 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400';
      case 'Interview Scheduled': return 'bg-purple-50 text-purple-650 dark:bg-purple-950/40 dark:text-purple-400';
      case 'Selected': return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-450';
      case 'Rejected': return 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-450';
      default: return 'bg-slate-50 text-slate-600 dark:bg-slate-900 dark:text-slate-400';
    }
  };

  const getStats = () => {
    return {
      applied: applications.length,
      shortlisted: applications.filter(a => a.status === 'Shortlisted' || a.status === 'Interview Scheduled').length,
      offers: applications.filter(a => a.status === 'Selected').length,
      rejected: applications.filter(a => a.status === 'Rejected').length
    };
  };

  const stats = getStats();

  // Mock trend data for charts: representing preparation progress over months
  const monthlyPrepScore = [
    { name: 'Jan', score: 45 },
    { name: 'Feb', score: 55 },
    { name: 'Mar', score: 62 },
    { name: 'Apr', score: 78 },
    { name: 'May', score: 85 },
    { name: 'Jun', score: 92 },
  ];

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Top Welcome Panel */}
      <div className="relative overflow-hidden p-6 sm:p-8 bg-gradient-to-r from-indigo-900 to-indigo-950 text-white rounded-3xl shadow-lg border border-indigo-800/20">
        <div className="absolute -right-16 -top-16 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-800/40 border border-indigo-700/30 text-xs font-semibold text-indigo-200">
              <Sparkles size={12} />
              Placement Portal Live
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Hello, {userProfile?.name}!
            </h1>
            <p className="text-indigo-200 text-sm max-w-md">
              Keep your profile optimized and apply to matching drives. Check recommendations and AI tips to stand out.
            </p>
          </div>
          
          <Link
            to="/ai-analysis"
            className="flex items-center gap-2 px-5 py-3 bg-white hover:bg-slate-50 text-indigo-900 rounded-2xl text-xs font-bold shadow-md active:scale-98 transition-all shrink-0"
          >
            Run Gemini Resume Scan
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Grid Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-1">
          <p className="text-xs text-slate-400 uppercase font-semibold">Total Applied</p>
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-black dark:text-white">{stats.applied}</h3>
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
              <Briefcase size={16} />
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-1">
          <p className="text-xs text-slate-400 uppercase font-semibold">Shortlisted</p>
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-black dark:text-white">{stats.shortlisted}</h3>
            <span className="p-1.5 rounded-lg bg-purple-50 text-purple-650 dark:bg-purple-950/40 dark:text-purple-400">
              <Clock size={16} />
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-1">
          <p className="text-xs text-slate-400 uppercase font-semibold">Job Offers</p>
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-black dark:text-white text-emerald-600 dark:text-emerald-400">{stats.offers}</h3>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <CheckCircle2 size={16} />
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-1">
          <p className="text-xs text-slate-400 uppercase font-semibold">Rejected</p>
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-black dark:text-white text-rose-500">{stats.rejected}</h3>
            <span className="p-1.5 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-450">
              <XCircle size={16} />
            </span>
          </div>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left column: applications & recommendations */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Applications list */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold dark:text-white">Application History</h2>
              <Link to="/student/applications" className="text-xs font-semibold text-indigo-650 hover:underline">
                View All
              </Link>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {applications.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-sm">
                  You haven't applied to any job openings yet.
                </div>
              ) : (
                applications.map((app) => (
                  <div key={app.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                      <h4 className="text-sm font-bold dark:text-white truncate">{app.jobTitle}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{app.companyName}</p>
                    </div>
                    
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-wide uppercase ${getStatusColor(app.status)}`}>
                        {app.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* AI Skill score area */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold dark:text-white">Resume Matching Index</h2>
            <p className="text-xs text-slate-500 dark:text-slate-450">
              Historical match index based on past profile scans compared against CSE placement profiles.
            </p>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyPrepScore}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorScore)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Right column: notifications & active drives */}
        <div className="space-y-6">
          
          {/* Notifications feed */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold dark:text-white flex items-center gap-1.5">
                <Bell size={16} className="text-slate-400" />
                Latest Alerts
              </h3>
              {notifications.length > 0 && (
                <Link to="/notifications" className="text-[10px] font-semibold text-slate-500 hover:text-indigo-600">
                  Manage
                </Link>
              )}
            </div>

            <div className="space-y-3.5">
              {notifications.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2">No new alerts.</p>
              ) : (
                notifications.map((notif) => (
                  <div key={notif.id} className="text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-700 dark:text-slate-200">{notif.title}</span>
                      <span className="text-[9px] text-slate-400">{new Date(notif.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 leading-normal">{notif.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Featured recommended openings */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold dark:text-white flex items-center gap-1.5">
              <Award size={16} className="text-slate-400" />
              Featured Placement Drives
            </h3>
            
            <div className="space-y-4">
              {activeJobs.map((job) => (
                <div key={job.id} className="text-xs border-b border-slate-100 dark:border-slate-800 pb-3 last:border-0 last:pb-0 space-y-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold dark:text-white">{job.title}</h4>
                    <span className="font-semibold text-indigo-650">{job.packageAmt}</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400">{job.companyName}</p>
                  <div className="pt-1.5 flex justify-between items-center">
                    <span className="text-[10px] text-slate-400">Min CGPA: {job.eligibility.minCGPA}</span>
                    <Link to="/jobs" className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5">
                      Apply
                      <ArrowRight size={10} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
