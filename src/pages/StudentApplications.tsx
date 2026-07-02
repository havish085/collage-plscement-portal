import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dbMock, JobApplication } from '../firebase/dbMock';
import { Clock, CheckCircle, XCircle, FileText, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export const StudentApplications: React.FC = () => {
  const { userProfile } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApps = async () => {
      if (!userProfile) return;
      try {
        setLoading(true);
        const list = await dbMock.getApplications();
        setApplications(list.filter(a => a.studentId === userProfile.uid));
      } catch (e) {
        toast.error('Failed to fetch applications.');
      } finally {
        setLoading(false);
      }
    };
    fetchApps();
  }, [userProfile]);

  const getStatusBadge = (status: JobApplication['status']) => {
    switch (status) {
      case 'Applied':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400';
      case 'Under Review':
        return 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400';
      case 'Shortlisted':
        return 'bg-indigo-50 text-indigo-705 dark:bg-indigo-950/40 dark:text-indigo-400';
      case 'Interview Scheduled':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400';
      case 'Selected':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400';
      case 'Rejected':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight dark:text-white">My Applications</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Monitor your recruitment workflow stages, feedback, and shortlist notifications.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        {applications.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            <FileText className="mx-auto mb-2 text-slate-300" size={32} />
            No applications submitted yet.
          </div>
        ) : (
          <div className="space-y-6 divide-y divide-slate-100 dark:divide-slate-800">
            {applications.map((app, idx) => (
              <div key={app.id} className={`pt-6 first:pt-0 flex flex-col md:flex-row md:items-center justify-between gap-4`}>
                <div className="space-y-2">
                  <h3 className="text-base font-bold dark:text-white">{app.jobTitle}</h3>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{app.companyName}</p>
                  
                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock size={12} />
                    Applied on {new Date(app.appliedAt).toLocaleDateString()}
                  </div>

                  {app.statusNotes && (
                    <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-450">
                      <span className="font-bold text-slate-800 dark:text-slate-300 block mb-0.5">Recruiter Remarks:</span>
                      {app.statusNotes}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 self-start md:self-center">
                  <span className={`px-3 py-1 rounded text-xs font-bold tracking-wide uppercase ${getStatusBadge(app.status)}`}>
                    {app.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
