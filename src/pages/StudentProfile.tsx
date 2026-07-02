import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dbMock, StudentData } from '../firebase/dbMock';
import { User, FileText, Award, Layers, Plus, Trash2, Save, FileUp } from 'lucide-react';
import toast from 'react-hot-toast';

export const StudentProfile: React.FC = () => {
  const { userProfile, updateProfileState } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [branch, setBranch] = useState('CSE');
  const [cgpa, setCgpa] = useState<number>(8.0);
  const [gradYear, setGradYear] = useState<number>(2026);
  const [phone, setPhone] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [certifications, setCertifications] = useState<string[]>([]);
  const [newCert, setNewCert] = useState('');
  
  // Projects state
  const [projects, setProjects] = useState<Array<{ title: string; desc: string; link?: string }>>([]);
  const [projTitle, setProjTitle] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projLink, setProjLink] = useState('');

  // Resume state
  const [resumeName, setResumeName] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userProfile) return;
      try {
        setLoading(true);
        const data = await dbMock.getStudent(userProfile.uid);
        if (data) {
          setName(data.name);
          setBranch(data.branch || 'CSE');
          setCgpa(data.cgpa || 8.0);
          setGradYear(data.gradYear || 2026);
          setPhone(data.phone || '');
          setSkills(data.skills || []);
          setCertifications(data.certifications || []);
          setProjects(data.projects || []);
          setResumeName(data.resumeFileName || '');
        } else {
          setName(userProfile.name);
        }
      } catch (err) {
        toast.error('Error fetching profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userProfile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;
    
    if (cgpa < 0 || cgpa > 10) {
      toast.error('CGPA must be between 0 and 10');
      return;
    }

    try {
      setSaving(true);
      const updatedData: StudentData = {
        uid: userProfile.uid,
        name,
        email: userProfile.email,
        branch,
        cgpa,
        gradYear,
        phone,
        skills,
        certifications,
        projects,
        resumeFileName: resumeName || 'Resume.pdf',
        resumeUrl: 'mock-resume-path-on-storage'
      };

      await dbMock.saveStudent(updatedData);
      updateProfileState({ name }); // Update global user name state
      toast.success('Profile saved successfully!');
    } catch (err) {
      toast.error('Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  // Skill Handlers
  const addSkill = () => {
    const trimmed = newSkill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  // Certification Handlers
  const addCert = () => {
    const trimmed = newCert.trim();
    if (trimmed && !certifications.includes(trimmed)) {
      setCertifications([...certifications, trimmed]);
      setNewCert('');
    }
  };

  const removeCert = (certToRemove: string) => {
    setCertifications(certifications.filter(c => c !== certToRemove));
  };

  // Project Handlers
  const addProject = () => {
    if (!projTitle.trim() || !projDesc.trim()) {
      toast.error('Project title and description are required.');
      return;
    }
    setProjects([...projects, {
      title: projTitle.trim(),
      desc: projDesc.trim(),
      link: projLink.trim() || undefined
    }]);
    setProjTitle('');
    setProjDesc('');
    setProjLink('');
  };

  const removeProject = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  // Simulated PDF Resume upload
  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Only PDF files are supported.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size cannot exceed 5MB.');
        return;
      }
      setResumeName(file.name);
      toast.success(`Resume "${file.name}" selected! Click save to update profile.`);
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
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight dark:text-white">Academic Profile</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Manage your academic status, CGPA, projects, and resume. Keep this updated to ensure correct job eligibility.
        </p>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Main profile inputs */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Card 1: Personal Academic details */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <span className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
                <User size={20} />
              </span>
              <h2 className="text-lg font-bold dark:text-white">Academic Details</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm dark:text-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Academic Branch</label>
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm dark:text-white"
                >
                  <option value="CSE">Computer Science Engineering (CSE)</option>
                  <option value="IT">Information Technology (IT)</option>
                  <option value="ECE">Electronics & Communication (ECE)</option>
                  <option value="EE">Electrical Engineering (EE)</option>
                  <option value="ME">Mechanical Engineering (ME)</option>
                  <option value="CE">Civil Engineering (CE)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Current CGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={cgpa}
                    onChange={(e) => setCgpa(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm dark:text-white"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Passout Year</label>
                  <input
                    type="number"
                    min="2020"
                    max="2035"
                    value={gradYear}
                    onChange={(e) => setGradYear(parseInt(e.target.value) || 2026)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm dark:text-white"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Projects */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <span className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
                <Layers size={20} />
              </span>
              <h2 className="text-lg font-bold dark:text-white">Academic Projects</h2>
            </div>

            {/* Project List */}
            <div className="space-y-3">
              {projects.length === 0 ? (
                <p className="text-sm text-slate-400 dark:text-slate-500 italic">No projects added yet.</p>
              ) : (
                projects.map((proj, idx) => (
                  <div key={idx} className="flex justify-between items-start p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold dark:text-white">{proj.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{proj.desc}</p>
                      {proj.link && (
                        <a href={proj.link} target="_blank" rel="noreferrer" className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                          Project Link
                        </a>
                      )}
                    </div>
                    <button 
                      type="button" 
                      onClick={() => removeProject(idx)}
                      className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 p-1.5 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Project Adding Form */}
            <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/30 space-y-3">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Add Project</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Project Title"
                  value={projTitle}
                  onChange={(e) => setProjTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs dark:text-white"
                />
                <input
                  type="text"
                  placeholder="Demo Link (GitHub/Live)"
                  value={projLink}
                  onChange={(e) => setProjLink(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs dark:text-white"
                />
              </div>
              <textarea
                placeholder="Brief project details (technologies used, features, role)"
                rows={2}
                value={projDesc}
                onChange={(e) => setProjDesc(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs dark:text-white resize-none"
              />
              <button
                type="button"
                onClick={addProject}
                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-300 text-indigo-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all"
              >
                <Plus size={14} />
                Add Project to Profile
              </button>
            </div>

          </div>
        </div>

        {/* Right 1 Column: Resume Upload & Skills list */}
        <div className="space-y-8">
          
          {/* Resume Upload Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <span className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
                <FileText size={20} />
              </span>
              <h2 className="text-lg font-bold dark:text-white">Resume Document</h2>
            </div>

            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30 text-center">
              <FileUp size={36} className="text-slate-400 mb-2" />
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1">
                Upload your resume (PDF only)
              </p>
              <p className="text-[10px] text-slate-400 mb-3">Maximum file size: 5MB</p>
              
              <label className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl text-xs font-bold shadow-sm cursor-pointer transition-all">
                Select File
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleResumeChange}
                  className="hidden"
                />
              </label>

              {resumeName && (
                <div className="mt-4 px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/20 text-left w-full flex items-center gap-2">
                  <FileText size={16} className="text-emerald-500 shrink-0" />
                  <span className="text-xs text-emerald-800 dark:text-emerald-400 font-medium truncate flex-1">{resumeName}</span>
                </div>
              )}
            </div>
          </div>

          {/* Technical Skills Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <span className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
                <Award size={20} />
              </span>
              <h2 className="text-lg font-bold dark:text-white">Technical Skills</h2>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Python, React, SQL..."
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs dark:text-white"
              />
              <button
                type="button"
                onClick={addSkill}
                className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all"
              >
                <Plus size={16} />
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 mt-2">
              {skills.length === 0 ? (
                <span className="text-xs text-slate-400 italic">No skills listed.</span>
              ) : (
                skills.map((skill) => (
                  <span 
                    key={skill}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  >
                    {skill}
                    <button type="button" onClick={() => removeSkill(skill)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-100">
                      ×
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Certifications Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <span className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
                <Award size={20} />
              </span>
              <h2 className="text-lg font-bold dark:text-white">Certifications</h2>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="AWS, GCP, Scrum..."
                value={newCert}
                onChange={(e) => setNewCert(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCert())}
                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs dark:text-white"
              />
              <button
                type="button"
                onClick={addCert}
                className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all"
              >
                <Plus size={16} />
              </button>
            </div>

            <div className="space-y-1.5 mt-2">
              {certifications.length === 0 ? (
                <span className="text-xs text-slate-400 italic">No certifications added.</span>
              ) : (
                certifications.map((cert) => (
                  <div key={cert} className="flex justify-between items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-350">
                    <span className="truncate mr-2">{cert}</span>
                    <button type="button" onClick={() => removeCert(cert)} className="text-rose-500 hover:underline text-xs">
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Action Trigger Card */}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 transition-all disabled:opacity-50"
          >
            <Save size={18} />
            {saving ? 'Saving Profile...' : 'Save All Profile Info'}
          </button>

        </div>

      </form>
    </div>
  );
};
