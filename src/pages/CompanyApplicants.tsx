import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dbMock, JobApplication, JobOpening } from '../firebase/dbMock';
import { Users, Search, Filter, FileText, Check, X, Calendar, Download, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export const CompanyApplicants: React.FC = () => {
  const { userProfile } = useAuth();
  
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [jobs, setJobs] = useState<JobOpening[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [jobFilter, setJobFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [minCGPA, setMinCGPA] = useState<number>(0);
  
  // Status edit notes popup
  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [targetStatus, setTargetStatus] = useState<JobApplication['status']>('Applied');
  const [statusNotes, setStatusNotes] = useState('');

  const loadData = async () => {
    if (!userProfile) return;
    try {
      setLoading(true);
      const allJobs = await dbMock.getJobs();
      setJobs(allJobs.filter(j => j.companyId === userProfile.uid));

      const allApps = await dbMock.getApplications();
      setApplications(allApps.filter(a => a.companyId === userProfile.uid));
    } catch (err) {
      toast.error('Error fetching applicant records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [userProfile]);

  const openStatusUpdate = (app: JobApplication, status: JobApplication['status']) => {
    setSelectedApp(app);
    setTargetStatus(status);
    setStatusNotes('');
    setShowStatusModal(true);
  };

  const handleStatusChange = async () => {
    if (!selectedApp) return;
    try {
      await dbMock.updateApplicationStatus(selectedApp.id, targetStatus, statusNotes);
      toast.success(`Applicant status updated to: ${targetStatus}`);
      setShowStatusModal(false);
      loadData(); // Refresh list
    } catch (err) {
      toast.error('Failed to update status.');
    }
  };

  const simulateDownloadResume = (studentName: string) => {
    toast.success(`Downloading PDF Resume of ${studentName}...`);
  };

  const getStatusBadgeClass = (status: JobApplication['status']) => {
    switch (status) {
      case 'Applied': return 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200/40';
      case 'Under Review': return 'bg-amber-55/60 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/40';
      case 'Shortlisted': return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-200/40';
      case 'Interview Scheduled': return 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border border-purple-200/40';
      case 'Selected': return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/40';
      case 'Rejected': return 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/40';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const filteredApps = applications.filter(app => {
    const matchesSearch = app.studentName.toLowerCase().includes(search.toLowerCase()) || 
                          app.studentBranch.toLowerCase().includes(search.toLowerCase());
    
    const matchesJob = jobFilter === 'ALL' || app.jobId === jobFilter;
    const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
    const matchesCGPA = app.studentCGPA >= minCGPA;

    return matchesSearch && matchesJob && matchesStatus && matchesCGPA;
  });

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight dark:text-white">Applicant Tracking System</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Evaluate credentials, shortlists, configure interview stages, and download resumes.
        </p>
      </div>

      {/* Filters bar */}
      <div className="flex flex-wrap gap-4 items-center bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search candidate name or branch..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-2 sm:flex gap-3">
          <select
            value={jobFilter}
            onChange={(e) => setJobFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none dark:text-white"
          >
            <option value="ALL">All Jobs</option>
            {jobs.map(j => (
              <option key={j.id} value={j.id}>{j.title}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none dark:text-white"
          >
            <option value="ALL">All Statuses</option>
            <option value="Applied">Applied</option>
            <option value="Under Review">Under Review</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Interview Scheduled">Interview Scheduled</option>
            <option value="Selected">Selected</option>
            <option value="Rejected">Rejected</option>
          </select>

          <input
            type="number"
            step="0.1"
            placeholder="Min CGPA"
            onChange={(e) => setMinCGPA(parseFloat(e.target.value) || 0)}
            className="px-3 py-2 w-24 bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none dark:text-white"
          />
        </div>
      </div>

      {/* Candidates List Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-400 uppercase bg-slate-50/30 dark:bg-slate-900/50">
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Applied Opening</th>
                <th className="px-6 py-4">Branch & CGPA</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400">
                    <Users className="mx-auto mb-2 text-slate-350" size={32} />
                    No candidates found matching filters.
                  </td>
                </tr>
              ) : (
                filteredApps.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-bold text-slate-800 dark:text-slate-200">{app.studentName}</div>
                        <div className="text-[10px] text-slate-400">{new Date(app.appliedAt).toLocaleDateString()}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium dark:text-slate-300">{app.jobTitle}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <span className="font-bold text-indigo-650 dark:text-indigo-400">{app.studentBranch}</span>
                        <span className="text-slate-400 ml-2">CGPA: {app.studentCGPA.toFixed(2)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${getStatusBadgeClass(app.status)}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-1 shrink-0">
                      <button
                        onClick={() => simulateDownloadResume(app.studentName)}
                        title="Download Resume"
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 rounded-lg transition-all"
                      >
                        <Download size={14} />
                      </button>

                      {app.status === 'Applied' && (
                        <button
                          onClick={() => openStatusUpdate(app, 'Under Review')}
                          className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold rounded text-[10px] transition-all"
                        >
                          Review
                        </button>
                      )}

                      {(app.status === 'Applied' || app.status === 'Under Review') && (
                        <button
                          onClick={() => openStatusUpdate(app, 'Shortlisted')}
                          className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-750 font-semibold rounded text-[10px] transition-all"
                        >
                          Shortlist
                        </button>
                      )}

                      {app.status === 'Shortlisted' && (
                        <button
                          onClick={() => openStatusUpdate(app, 'Interview Scheduled')}
                          className="px-2 py-1 bg-purple-55 hover:bg-purple-100 text-purple-750 font-semibold rounded text-[10px] transition-all"
                        >
                          Schedule Interview
                        </button>
                      )}

                      {app.status === 'Interview Scheduled' && (
                        <button
                          onClick={() => openStatusUpdate(app, 'Selected')}
                          className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold rounded text-[10px] transition-all"
                        >
                          Select
                        </button>
                      )}

                      {app.status !== 'Selected' && app.status !== 'Rejected' && (
                        <button
                          onClick={() => openStatusUpdate(app, 'Rejected')}
                          className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded text-[10px] transition-all"
                        >
                          Reject
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status Edit Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 animate-scaleUp">
            <h3 className="text-base font-bold dark:text-white">
              Update Status to: <span className="text-indigo-600 dark:text-indigo-400 font-black">{targetStatus}</span>
            </h3>
            
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-350 uppercase">Feedback / Remarks</label>
              <textarea
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                placeholder="e.g. Schedule for Mon 3 PM, or Code test score was 95%..."
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-2 text-xs">
              <button
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-600 dark:text-slate-300 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusChange}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold"
              >
                Confirm Status Update
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
