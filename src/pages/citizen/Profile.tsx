import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../hooks/useComplaints';
import { User, Mail, Phone, MapPin, Award, CheckCircle2, Bell, Shield, Save } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export const Profile: React.FC = () => {
  const { currentUser } = useAuth();
  const { complaints, loading, error, retry } = useComplaints('citizen');
  const myComplaints = complaints.filter((c) => c.citizen.id === currentUser.id);
  const resolvedCount = myComplaints.filter((c) => c.status === 'Resolved').length;
  if (loading) return <div className="p-8 text-sm text-slate-500">Loading profile data...</div>;
  if (error) return <div className="p-8 space-y-3"><p className="text-sm text-rose-600">{error}</p><button onClick={retry} className="px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold">Retry</button></div>;

  const [name, setName] = useState(currentUser.name);
  const [phone, setPhone] = useState(currentUser.phone || '+1 (555) 234-5678');
  const [ward, setWard] = useState(currentUser.ward || 'Ward 14 - Metro Central');
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [smsNotifs, setSmsNotifs] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Resident profile settings updated successfully.');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <Toaster position="top-right" />

      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Citizen Profile & Preferences</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage your verified contact coordinates and notification preferences
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-2xl overflow-hidden shadow-sm">
            {currentUser.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              currentUser.name.charAt(0)
            )}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{currentUser.name}</h2>
            <p className="text-xs text-slate-500 font-medium">{currentUser.email}</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Verified Resident</span>
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs font-mono text-slate-500">{ward}</span>
            </div>
          </div>
        </div>

        {/* Civic Impact Badge */}
        <div className="p-4 rounded-xl bg-linear-to-r from-blue-50 to-teal-50 border border-blue-100 text-right self-stretch sm:self-auto">
          <div className="flex items-center justify-end gap-1.5 text-xs font-bold text-blue-900">
            <Award className="w-4 h-4 text-blue-600" />
            <span>Community Impact</span>
          </div>
          <div className="mt-1 text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {resolvedCount} / {myComplaints.length}
          </div>
          <p className="text-[11px] text-slate-500">Defects successfully resolved</p>
        </div>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          Contact Coordinates & Municipal Ward
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Full Legal Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              disabled
              value={currentUser.email}
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Phone Number
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Residential Ward
            </label>
            <input
              type="text"
              value={ward}
              onChange={(e) => setWard(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            />
          </div>
        </div>

        {/* Notifications */}
        <div className="border-t border-slate-100 pt-5 space-y-3">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Grievance Progress Notifications
          </h4>

          <div className="space-y-2">
            <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={emailNotifs}
                onChange={(e) => setEmailNotifs(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-900 block">Email Resolution Notifications</span>
                <span className="text-slate-500">
                  Receive email alerts when departments accept work orders or upload before-and-after proof.
                </span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={smsNotifs}
                onChange={(e) => setSmsNotifs(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-900 block">SMS Urgent Emergency Dispatches</span>
                <span className="text-slate-500">
                  Receive SMS alerts for Critical safety hazards and immediate evacuation/water shutdown warnings.
                </span>
              </div>
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-3">
          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
};
