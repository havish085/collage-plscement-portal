import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dbMock, CompanyData } from '../firebase/dbMock';
import { Building, Globe, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export const CompanyProfile: React.FC = () => {
  const { userProfile, updateProfileState } = useAuth();
  
  const [name, setName] = useState('');
  const [website, setWebsite] = useState('');
  const [industry, setIndustry] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchCompany = async () => {
      if (!userProfile) return;
      try {
        setLoading(true);
        const data = await dbMock.getCompany(userProfile.uid);
        if (data) {
          setName(data.name);
          setWebsite(data.website);
          setIndustry(data.industry);
          setDescription(data.description);
        } else {
          setName(userProfile.name || '');
        }
      } catch (err) {
        toast.error('Error fetching company details.');
      } finally {
        setLoading(false);
      }
    };
    fetchCompany();
  }, [userProfile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;

    try {
      setSaving(true);
      const updatedData: CompanyData = {
        uid: userProfile.uid,
        name,
        email: userProfile.email,
        website,
        industry,
        description,
        isApproved: true
      };

      await dbMock.saveCompany(updatedData);
      updateProfileState({ name, companyName: name });
      toast.success('Company profile updated successfully!');
    } catch (err) {
      toast.error('Failed to save profile.');
    } finally {
      setSaving(false);
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
    <div className="space-y-8 animate-fadeIn max-w-3xl">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight dark:text-white">Company Profile</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Configure corporate details, website links, and brand descriptions visible to applying candidates.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
        
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <span className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <Building size={20} />
          </span>
          <h2 className="text-lg font-bold dark:text-white">Corporate Workspace Profile</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Company Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm dark:text-white"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Industry Domain</label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm dark:text-white"
            >
              <option value="">Select Domain</option>
              <option value="Technology">Technology</option>
              <option value="Finance">Finance</option>
              <option value="IT Services">IT Services</option>
              <option value="Consulting">Consulting</option>
              <option value="Healthcare">Healthcare</option>
            </select>
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Corporate Website</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                <Globe size={16} />
              </span>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://company.com"
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm dark:text-white"
                required
              />
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">About Company</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            placeholder="Write a brief overview of your business values, tech stack, workspace benefits..."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm dark:text-white resize-none"
            required
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm flex items-center gap-2 transition-all disabled:opacity-50"
        >
          <Save size={16} />
          {saving ? 'Saving...' : 'Update Corporate Profile'}
        </button>

      </form>
    </div>
  );
};
