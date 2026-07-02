import React, { useState, useEffect } from 'react';
import { dbMock } from '../firebase/dbMock';
import { 
  Users, Building, Briefcase, GraduationCap, Award, Percent, 
  TrendingUp, Download, CheckCircle, RefreshCw 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import toast from 'react-hot-toast';

export const TpoDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await dbMock.getTPOAnalytics();
      setStats(data);
    } catch (err) {
      toast.error('Error compiling analytics reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  const triggerCSVDownload = (reportType: string) => {
    toast.success(`Exporting ${reportType} CSV spreadsheet...`);
  };

  if (loading || !stats) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight dark:text-white">TPO Analytics Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Training & Placement Office system-wide overview, hiring distribution rates, and reports.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => triggerCSVDownload('Placement_Report')}
            className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all dark:text-slate-300"
          >
            <Download size={14} />
            Export Placement History
          </button>
        </div>
      </div>

      {/* Stats Counter Rows */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-2">
          <p className="text-xs text-slate-400 uppercase font-semibold">Placement Rate</p>
          <div className="flex justify-between items-end">
            <div>
              <h3 className="text-3xl font-black dark:text-white">{stats.placementRate}%</h3>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-450 font-medium mt-1">
                {stats.placedCount} of {stats.totalStudents} students placed
              </p>
            </div>
            <span className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
              <Percent size={20} />
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-2">
          <p className="text-xs text-slate-400 uppercase font-semibold">Registered Companies</p>
          <div className="flex justify-between items-end">
            <div>
              <h3 className="text-3xl font-black dark:text-white">{stats.totalCompanies}</h3>
              <p className="text-[10px] text-slate-400 font-medium mt-1">
                Active partners onboarding
              </p>
            </div>
            <span className="p-2.5 rounded-2xl bg-cyan-50 text-cyan-600 dark:bg-cyan-950/40 dark:text-cyan-400">
              <Building size={20} />
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-2">
          <p className="text-xs text-slate-400 uppercase font-semibold">Highest Package</p>
          <div className="flex justify-between items-end">
            <div>
              <h3 className="text-3xl font-black dark:text-white text-indigo-600 dark:text-indigo-400">{stats.highestPackage}</h3>
              <p className="text-[10px] text-slate-400 font-medium mt-1">
                International/Domestic CSE
              </p>
            </div>
            <span className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-755 dark:bg-indigo-950/40 dark:text-indigo-400">
              <Award size={20} />
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-2">
          <p className="text-xs text-slate-400 uppercase font-semibold">Average Package</p>
          <div className="flex justify-between items-end">
            <div>
              <h3 className="text-3xl font-black dark:text-white">{stats.averagePackage}</h3>
              <p className="text-[10px] text-slate-400 font-medium mt-1">
                Combined branch aggregate
              </p>
            </div>
            <span className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
              <TrendingUp size={20} />
            </span>
          </div>
        </div>

      </div>

      {/* Visual Analytics Recharts Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Branch placements performance */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold dark:text-white">Branch-wise Placements (%)</h3>
            <p className="text-xs text-slate-400">Placement percentage comparing across academic streams</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.branchChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="branch" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="percentage" name="Placed %" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Package distribution bins */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold dark:text-white">LPA Package Distribution</h3>
            <p className="text-xs text-slate-400">Bin groupings showing salary bands of published offers</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.packagesBuckets}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="range"
                >
                  {stats.packagesBuckets.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Company placements details */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold dark:text-white">Company-wise Offers Accepted</h3>
            <p className="text-xs text-slate-400">Total count of student recruitment selections</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.companyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="company" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '11px' }} />
                <Bar dataKey="offers" name="Offers Placed" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Placements Trend */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold dark:text-white">Monthly Selection Rate</h3>
            <p className="text-xs text-slate-400">Chronological cumulative trend of hires</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.monthlyPlacements}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '11px' }} />
                <Line type="monotone" dataKey="count" name="Placed Count" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
