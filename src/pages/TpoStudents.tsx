import React, { useState, useEffect } from 'react';
import { dbMock, StudentData } from '../firebase/dbMock';
import { Search, GraduationCap, Download, SlidersHorizontal } from 'lucide-react';
import toast from 'react-hot-toast';

export const TpoStudents: React.FC = () => {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('ALL');
  const [minCGPA, setMinCGPA] = useState<number>(0);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const list = await dbMock.getStudents();
        setStudents(list);
      } catch (err) {
        toast.error('Error fetching students records.');
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const triggerDownload = (name: string) => {
    toast.success(`Downloading resume of ${name}...`);
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
                          s.email.toLowerCase().includes(search.toLowerCase());
    
    const matchesBranch = branchFilter === 'ALL' || s.branch === branchFilter;
    const matchesCGPA = s.cgpa >= minCGPA;

    return matchesSearch && matchesBranch && matchesCGPA;
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
      
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight dark:text-white">Manage Students</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Monitor enrolled student academic summaries, CGPAs, branches, and download verification resumes.
        </p>
      </div>

      {/* Filters bar */}
      <div className="flex flex-wrap gap-4 items-center bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
        
        <div className="relative flex-1 min-w-[200px]">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search students name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none dark:text-white"
          >
            <option value="ALL">All Branches</option>
            <option value="CSE">CSE</option>
            <option value="IT">IT</option>
            <option value="ECE">ECE</option>
            <option value="EE">EE</option>
            <option value="ME">ME</option>
          </select>

          <input
            type="number"
            step="0.1"
            placeholder="Min CGPA"
            onChange={(e) => setMinCGPA(parseFloat(e.target.value) || 0)}
            className="px-3 py-2 w-28 bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none dark:text-white"
          />
        </div>

      </div>

      {/* Students Data Grid */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-400 uppercase bg-slate-50/30 dark:bg-slate-900/50">
                <th className="px-6 py-4">Student Name</th>
                <th className="px-6 py-4">Academic Branch</th>
                <th className="px-6 py-4">CGPA</th>
                <th className="px-6 py-4">Grad Year</th>
                <th className="px-6 py-4">Skills</th>
                <th className="px-6 py-4 text-right">Resume</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    No student records found.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => (
                  <tr key={s.uid} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-bold text-slate-800 dark:text-slate-200">{s.name}</div>
                        <div className="text-[10px] text-slate-400">{s.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{s.branch}</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">{s.cgpa.toFixed(2)}</td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{s.gradYear}</td>
                    <td className="px-6 py-4 max-w-[200px] truncate">
                      <div className="flex gap-1 overflow-hidden truncate">
                        {s.skills.slice(0, 3).map(sk => (
                          <span key={sk} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-655 dark:text-slate-405">
                            {sk}
                          </span>
                        ))}
                        {s.skills.length > 3 && <span className="text-[10px] text-slate-400">+{s.skills.length - 3}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => triggerDownload(s.name)}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-650 rounded-lg transition-all"
                      >
                        <Download size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
