import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dbMock, JobOpening, StudentData, JobApplication } from '../firebase/dbMock';
import { Briefcase, Calendar, Award, Building, Filter, CheckCircle2, AlertTriangle, Search, PlusCircle, Clock, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';

export const Jobs: React.FC = () => {
  const { userProfile } = useAuth();
  
  const [jobs, setJobs] = useState<JobOpening[]>([]);
  const [studentProfile, setStudentProfile] = useState<StudentData | null>(null);
  const [myApplications, setMyApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [eligibilityFilter, setEligibilityFilter] = useState('ALL'); // ALL, ELIGIBLE

  // Detail view
  const [selectedJob, setSelectedJob] = useState<JobOpening | null>(null);
  
  // Post Job form state (for HR / TPO)
  const [showPostForm, setShowPostForm] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'Full-Time' | 'Internship'>('Full-Time');
  const [description, setDescription] = useState('');
  const [packageAmt, setPackageAmt] = useState('');
  const [minCGPA, setMinCGPA] = useState(6.0);
  const [branches, setBranches] = useState<string[]>(['CSE']);
  const [gradYears, setGradYears] = useState<number[]>([2026]);
  const [skillsRequired, setSkillsRequired] = useState('');
  const [deadline, setDeadline] = useState('');

  const fetchJobsData = async () => {
    try {
      setLoading(true);
      const jobsList = await dbMock.getJobs();
      setJobs(jobsList);

      if (userProfile) {
        const apps = await dbMock.getApplications();
        const myApps = apps.filter(a => a.studentId === userProfile.uid);
        setMyApplications(myApps);

        if (userProfile.role === 'STUDENT') {
          const profile = await dbMock.getStudent(userProfile.uid);
          setStudentProfile(profile);
        }
      }
    } catch (err) {
      toast.error('Error fetching jobs data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobsData();
  }, [userProfile]);

  // Eligibility checking logic
  const checkEligibility = (job: JobOpening): { eligible: boolean; reason?: string } => {
    if (!studentProfile) {
      return { eligible: false, reason: 'Profile not initialized' };
    }

    if (studentProfile.cgpa < job.eligibility.minCGPA) {
      return { 
        eligible: false, 
        reason: `Requires CGPA ${job.eligibility.minCGPA.toFixed(2)} (Yours: ${studentProfile.cgpa.toFixed(2)})` 
      };
    }

    if (!job.eligibility.branches.includes(studentProfile.branch)) {
      return { 
        eligible: false, 
        reason: `Requires ${job.eligibility.branches.join(', ')} branch (Yours: ${studentProfile.branch})` 
      };
    }

    if (!job.eligibility.gradYears.includes(studentProfile.gradYear)) {
      return { 
        eligible: false, 
        reason: `Requires graduation in ${job.eligibility.gradYears.join(', ')} (Yours: ${studentProfile.gradYear})` 
      };
    }

    return { eligible: true };
  };

  const handleApply = async (job: JobOpening) => {
    if (!userProfile) return;
    try {
      const eligibility = checkEligibility(job);
      if (!eligibility.eligible) {
        toast.error(`Eligibility check failed: ${eligibility.reason}`);
        return;
      }

      await dbMock.applyForJob(userProfile.uid, job.id);
      toast.success('Applied successfully!');
      fetchJobsData(); // Refresh counts and application list
    } catch (err: any) {
      toast.error(err.message || 'Failed to apply.');
    }
  };

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;

    if (!title || !description || !packageAmt || !deadline) {
      toast.error('Please fill in all fields.');
      return;
    }

    try {
      const parsedSkills = skillsRequired.split(',').map(s => s.trim()).filter(Boolean);
      await dbMock.addJob({
        companyId: userProfile.uid,
        companyName: userProfile.role === 'TPO_ADMIN' ? 'TPO Placement Office' : (userProfile.companyName || 'Corporate Recruiter'),
        title,
        type,
        description,
        packageAmt,
        eligibility: {
          minCGPA,
          branches,
          gradYears
        },
        skillsRequired: parsedSkills,
        deadline
      });

      toast.success('Job drive posted successfully!');
      setShowPostForm(false);
      
      // Reset form fields
      setTitle('');
      setDescription('');
      setPackageAmt('');
      setMinCGPA(6.0);
      setBranches(['CSE']);
      setGradYears([2026]);
      setSkillsRequired('');
      setDeadline('');
      
      fetchJobsData();
    } catch (err) {
      toast.error('Failed to post job.');
    }
  };

  const hasApplied = (jobId: string) => {
    return myApplications.some(a => a.jobId === jobId);
  };

  const toggleBranch = (b: string) => {
    if (branches.includes(b)) {
      setBranches(branches.filter(item => item !== b));
    } else {
      setBranches([...branches, b]);
    }
  };

  const toggleGradYear = (yr: number) => {
    if (gradYears.includes(yr)) {
      setGradYears(gradYears.filter(item => item !== yr));
    } else {
      setGradYears([...gradYears, yr]);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(search.toLowerCase()) || 
                          job.companyName.toLowerCase().includes(search.toLowerCase());
    
    const matchesType = typeFilter === 'ALL' || job.type === typeFilter;

    if (userProfile?.role === 'STUDENT' && eligibilityFilter === 'ELIGIBLE' && studentProfile) {
      return matchesSearch && matchesType && checkEligibility(job).eligible;
    }

    return matchesSearch && matchesType;
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
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight dark:text-white">Job & Internship Opportunities</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Explore ongoing recruitment drives, eligibility rules, and apply directly.
          </p>
        </div>

        {(userProfile?.role === 'COMPANY_HR' || userProfile?.role === 'TPO_ADMIN') && (
          <button
            onClick={() => setShowPostForm(!showPostForm)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md transition-all self-start"
          >
            <PlusCircle size={18} />
            {showPostForm ? 'View Job Openings' : 'Post New Opening'}
          </button>
        )}
      </div>

      {showPostForm ? (
        /* Job Posting Form for Recruiters & TPO */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm max-w-3xl">
          <h2 className="text-lg font-bold mb-4 dark:text-white">Create Recruitment Drive</h2>
          <form onSubmit={handlePostJob} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-350 uppercase">Job Title</label>
                <input
                  type="text"
                  placeholder="e.g. SDE Intern"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs dark:text-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-350 uppercase">Opening Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs dark:text-white"
                >
                  <option value="Full-Time">Full-Time Job</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-350 uppercase">Salary Package / Stipend</label>
                <input
                  type="text"
                  placeholder="e.g. 14 LPA or 50k/month"
                  value={packageAmt}
                  onChange={(e) => setPackageAmt(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs dark:text-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-355 uppercase">Application Deadline</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs dark:text-white"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-350 uppercase">Job Description</label>
              <textarea
                placeholder="Responsibilities, team context, work culture details..."
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs dark:text-white"
                required
              />
            </div>

            {/* Eligibility Filters Config */}
            <div className="border border-slate-100 dark:border-slate-800 p-4 rounded-xl space-y-4 bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Configure Eligibility Filter</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Min CGPA Required</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={minCGPA}
                    onChange={(e) => setMinCGPA(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs dark:text-white"
                  />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Required Skills (Comma separated)</label>
                  <input
                    type="text"
                    placeholder="React, SQL, Java"
                    value={skillsRequired}
                    onChange={(e) => setSkillsRequired(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">Eligible Branches</label>
                <div className="flex flex-wrap gap-2">
                  {['CSE', 'IT', 'ECE', 'EE', 'ME', 'CE'].map(br => (
                    <button
                      type="button"
                      key={br}
                      onClick={() => toggleBranch(br)}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all ${
                        branches.includes(br)
                          ? 'bg-indigo-650 text-indigo-700 border-indigo-300 dark:bg-indigo-950/60 dark:text-indigo-400 dark:border-indigo-900'
                          : 'bg-white text-slate-500 border-slate-200 dark:bg-slate-900 dark:border-slate-800'
                      }`}
                    >
                      {br}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">Eligible Graduation Years</label>
                <div className="flex flex-wrap gap-2">
                  {[2025, 2026, 2027].map(yr => (
                    <button
                      type="button"
                      key={yr}
                      onClick={() => toggleGradYear(yr)}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all ${
                        gradYears.includes(yr)
                          ? 'bg-indigo-650 text-indigo-700 border-indigo-300 dark:bg-indigo-950/60 dark:text-indigo-400 dark:border-indigo-900'
                          : 'bg-white text-slate-500 border-slate-200 dark:bg-slate-900 dark:border-slate-800'
                      }`}
                    >
                      {yr}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-all"
            >
              Publish Job Opening
            </button>
          </form>
        </div>
      ) : (
        /* Filters and Main Split Column View */
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="flex flex-wrap gap-3 items-center bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
            <div className="relative flex-1 min-w-[200px]">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                <Search size={16} />
              </span>
              <input
                type="text"
                placeholder="Search job title or company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none dark:text-white"
              >
                <option value="ALL">All Types</option>
                <option value="Full-Time">Full-Time</option>
                <option value="Internship">Internship</option>
              </select>

              {userProfile?.role === 'STUDENT' && (
                <select
                  value={eligibilityFilter}
                  onChange={(e) => setEligibilityFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none dark:text-white"
                >
                  <option value="ALL">All Eligible & Ineligible</option>
                  <option value="ELIGIBLE">Only Eligible Jobs</option>
                </select>
              )}
            </div>
          </div>

          {/* Main Layout Split Screen */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left Jobs List */}
            <div className="lg:col-span-2 space-y-4">
              {filteredJobs.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center text-slate-500">
                  <Briefcase className="mx-auto text-slate-400 mb-2" size={32} />
                  No placement openings match your filters.
                </div>
              ) : (
                filteredJobs.map((job) => {
                  const applied = hasApplied(job.id);
                  const eligibility = userProfile?.role === 'STUDENT' ? checkEligibility(job) : null;
                  const isSelected = selectedJob?.id === job.id;

                  return (
                    <div
                      key={job.id}
                      onClick={() => setSelectedJob(job)}
                      className={`group p-5 rounded-2xl bg-white dark:bg-slate-900 border transition-all cursor-pointer ${
                        isSelected 
                          ? 'border-indigo-500 shadow-indigo-100/10 shadow-lg ring-1 ring-indigo-550' 
                          : 'border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700/80 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase mb-1.5 ${
                            job.type === 'Full-Time' ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400' : 'bg-teal-50 dark:bg-teal-950 text-teal-650 dark:text-teal-400'
                          }`}>
                            {job.type}
                          </span>
                          <h3 className="text-base font-bold dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {job.title}
                          </h3>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                            <Building size={14} />
                            {job.companyName}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{job.packageAmt}</div>
                          <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-end gap-1">
                            <Clock size={10} />
                            Exp: {job.deadline}
                          </div>
                        </div>
                      </div>

                      {/* Footer Badge Bar */}
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between flex-wrap gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          {eligibility && (
                            eligibility.eligible ? (
                              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded">
                                <CheckCircle2 size={12} />
                                Eligible
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded">
                                <AlertTriangle size={12} />
                                Ineligible
                              </span>
                            )
                          )}
                          <span className="text-[11px] font-medium text-slate-400">{job.applicantsCount || 0} applicants</span>
                        </div>

                        {applied && (
                          <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">Applied</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Right Job Details View Panel */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm sticky top-6 space-y-6">
              {selectedJob ? (
                <>
                  <div className="space-y-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                      {selectedJob.type}
                    </span>
                    <h2 className="text-xl font-bold dark:text-white leading-tight">{selectedJob.title}</h2>
                    <p className="text-sm font-semibold text-slate-655 dark:text-slate-350">{selectedJob.companyName}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-100 dark:border-slate-800 text-xs">
                    <div>
                      <p className="text-slate-400 uppercase font-semibold">Compensation</p>
                      <p className="font-bold text-slate-850 dark:text-slate-200 mt-0.5">{selectedJob.packageAmt}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 uppercase font-semibold">Deadline</p>
                      <p className="font-bold text-slate-850 dark:text-slate-200 mt-0.5">{selectedJob.deadline}</p>
                    </div>
                  </div>

                  {/* Requirements details */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Eligibility Requirements</h3>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Minimum CGPA:</span>
                        <span className="font-semibold dark:text-slate-250">{selectedJob.eligibility.minCGPA.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Allowed Branches:</span>
                        <span className="font-semibold dark:text-slate-250 text-right">{selectedJob.eligibility.branches.join(', ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Graduation Years:</span>
                        <span className="font-semibold dark:text-slate-250">{selectedJob.eligibility.gradYears.join(', ')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Job Description</h3>
                    <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400 whitespace-pre-line">
                      {selectedJob.description}
                    </p>
                  </div>

                  {/* Skills Required */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Required Skills</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedJob.skillsRequired.map(skill => (
                        <span key={skill} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-xs">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Application action button */}
                  {userProfile?.role === 'STUDENT' ? (
                    (() => {
                      const applied = hasApplied(selectedJob.id);
                      const eligibility = checkEligibility(selectedJob);

                      if (applied) {
                        return (
                          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-450 border border-emerald-250 text-center rounded-xl text-xs font-bold flex items-center justify-center gap-2">
                            <CheckCircle2 size={16} />
                            Applied Already
                          </div>
                        );
                      }

                      if (!eligibility.eligible) {
                        return (
                          <div className="space-y-2">
                            <button
                              disabled
                              className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 text-xs font-semibold rounded-xl"
                            >
                              Ineligible to Apply
                            </button>
                            <p className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-1 justify-center">
                              <AlertTriangle size={12} />
                              {eligibility.reason}
                            </p>
                          </div>
                        );
                      }

                      return (
                        <button
                          onClick={() => handleApply(selectedJob)}
                          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-lg transition-all"
                        >
                          One-Click Apply
                        </button>
                      );
                    })()
                  ) : (
                    <div className="text-center p-3 border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 rounded-xl text-xs">
                      Recruiters/Admins view applications from dashboard
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12 text-slate-450 dark:text-slate-500">
                  <BookOpen className="mx-auto mb-2 text-slate-300" size={24} />
                  Select a job opening to view full criteria & description.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
