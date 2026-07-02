import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dbMock, JobOpening, JobApplication } from '../firebase/dbMock';
import { Briefcase, Users, FileText, CheckCircle2, UserCheck, XCircle, Search, Filter, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export const CompanyDashboard: React.FC = () => {
  const { userProfile } = useAuth();
  
  const [jobs, setJobs] = useState<JobOpening[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);

  // Stats calculation
  const fetchCompanyData = async () => {
    if (!userProfile) return;
    try {
      setLoading(true);
      const allJobs = await dbMock.getJobs();
      const companyJobs = allJobs.filter(j => j.companyId === userProfile.uid);
      setJobs(companyJobs);

      const allApps = await dbMock.getApplications();
      const companyApps = allApps.filter(a => a.companyId === userProfile.uid);
      setApplications(companyApps);
    } catch (err) {
      toast.error('Error fetching dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyData();
  }, [userProfile]);

  const getStats = () => {
    return {
      drives: jobs.length,
      applicants: applications.length,
      shortlisted: applications.filter(a => a.status === 'Shortlisted' || a.status === 'Interview Scheduled').length,
      placed: applications.filter(a => a.status === 'Selected').length
    };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight dark:text-white">Recruitment Workspace</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage your corporate placement drives, active applicants, shortlists, and offers.
          </p>
        </div>

        <Link
          to="/jobs/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md transition-all self-start"
        >
          Post Job Opening
        </Link>
      </div>

      {/* Recruiter Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-1">
          <p className="text-xs text-slate-400 uppercase font-semibold">Active Placement Drives</p>
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-black dark:text-white">{stats.drives}</h3>
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400">
              <Briefcase size={16} />
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-1">
          <p className="text-xs text-slate-400 uppercase font-semibold">Total Applications</p>
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-black dark:text-white">{stats.applicants}</h3>
            <span className="p-1.5 rounded-lg bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-400">
              <Users size={16} />
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-1">
          <p className="text-xs text-slate-400 uppercase font-semibold">Shortlisted Profiles</p>
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-black dark:text-white text-indigo-650 dark:text-indigo-400">{stats.shortlisted}</h3>
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
              <FileText size={16} />
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-1">
          <p className="text-xs text-slate-400 uppercase font-semibold">Selected Candidates</p>
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-black dark:text-white text-emerald-600 dark:text-emerald-450">{stats.placed}</h3>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-450">
              <UserCheck size={16} />
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Active job drives list */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold dark:text-white">Active Recruitment Drives</h2>
            
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {jobs.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-sm">
                  You haven't posted any job openings yet.
                </div>
              ) : (
                jobs.map((job) => (
                  <div key={job.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold dark:text-white">{job.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Package: {job.packageAmt} | Min CGPA: {job.eligibility.minCGPA}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right text-xs">
                        <span className="font-bold text-slate-700 dark:text-slate-350">{job.applicantsCount || 0}</span>
                        <span className="text-slate-400"> applicants</span>
                      </div>
                      <Link
                        to="/company/applicants"
                        className="text-xs font-bold text-indigo-650 hover:underline flex items-center gap-0.5"
                      >
                        Manage Profiles
                        <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Short info workspace instructions */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          <h3 className="text-sm font-bold dark:text-white text-slate-800">Automated Filtering Engine</h3>
          <p>
            Our placement portal automatically enforces eligibility parameters before students submit applications. Students who do not meet your configured criteria (CGPA, Branch, Grad Year) are prevented from applying, keeping your recruitment pipeline clean and focused.
          </p>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300">
              <CheckCircle2 size={16} className="text-emerald-500" />
              Pre-filtered candidates lists
            </div>
            <div className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300">
              <CheckCircle2 size={16} className="text-emerald-500" />
              Download direct PDF resumes
            </div>
            <div className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300">
              <CheckCircle2 size={16} className="text-emerald-500" />
              Perform status changes on applicant profiles
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
