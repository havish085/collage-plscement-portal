import React, { useState, useEffect } from 'react';
import { dbMock, CompanyData } from '../firebase/dbMock';
import { Building, Search, Globe, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export const TpoCompanies: React.FC = () => {
  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const list = await dbMock.getCompanies();
      setCompanies(list);
    } catch (err) {
      toast.error('Error loading partners records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const filteredCompanies = companies.filter(c => {
    return c.name.toLowerCase().includes(search.toLowerCase()) || 
           c.industry.toLowerCase().includes(search.toLowerCase());
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
        <h1 className="text-3xl font-extrabold tracking-tight dark:text-white">Partner Companies</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Review onboarded hiring partners, active sectors, and industry statistics.
        </p>
      </div>

      {/* Filter panel */}
      <div className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search company name or industry..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
          />
        </div>
      </div>

      {/* Grid of companies */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCompanies.length === 0 ? (
          <div className="col-span-full text-center py-8 text-slate-400">
            No partner companies found.
          </div>
        ) : (
          filteredCompanies.map((c) => (
            <div key={c.uid} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400">
                  <Building size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold dark:text-white">{c.name}</h3>
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-500">
                    {c.industry || 'Technology'}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-550 dark:text-slate-400 leading-normal line-clamp-3">
                {c.description || 'No business description provided yet.'}
              </p>

              {c.website && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] font-semibold">
                  <a 
                    href={c.website} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    <Globe size={12} />
                    Visit Website
                  </a>
                </div>
              )}
            </div>
          ))
        )}
      </div>

    </div>
  );
};
