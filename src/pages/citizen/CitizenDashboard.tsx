import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../hooks/useComplaints';
import { Complaint } from '../../types';
import { StatCard } from '../../components/StatCard';
import { ComplaintCard } from '../../components/ComplaintCard';
import {
  FileText,
  Clock,
  Wrench,
  CheckCircle2,
  PlusCircle,
  Search,
  ArrowRight,
  Sparkles,
  MapPin,
  TrendingUp,
} from 'lucide-react';

export const CitizenDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { complaints, loading, error, retry } = useComplaints('citizen');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter for citizen complaints
  const myComplaints = complaints.filter(
    (c) => c.citizen.id === currentUser.id || c.citizen.email === currentUser.email
  );

  const total = myComplaints.length;
  const pending = myComplaints.filter((c) => c.status === 'Pending Admin Verification').length;
  const inProgress = myComplaints.filter(
    (c) => c.status === 'In Progress' || c.status === 'Forwarded to Department' || c.status === 'Verified'
  ).length;
  const resolved = myComplaints.filter((c) => c.status === 'Resolved').length;

  const filteredRecent = myComplaints
    .filter((c) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        c.title.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.location.address.toLowerCase().includes(q)
      );
    })
    .slice(0, 4);

  if (loading) return <div className="p-8 text-sm text-slate-500">Loading your complaints...</div>;
  if (error) return <div className="p-8 space-y-3"><p className="text-sm text-rose-600">{error}</p><button onClick={retry} className="px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold">Retry</button></div>;

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span>Welcome back, {currentUser.name}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            Citizen Grievance Redressal Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Registered Ward: <span className="font-semibold text-slate-700">{currentUser.ward || 'Ward 14 - Metro Central'}</span>
          </p>
        </div>

        <Link
          to="/citizen/report"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 hover:shadow-lg transition-all self-start sm:self-auto shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Report New Civic Defect</span>
        </Link>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Submitted"
          value={total}
          subtitle="All grievances on record"
          icon={FileText}
          color="blue"
        />
        <StatCard
          title="Pending Verification"
          value={pending}
          subtitle="Under control room review"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="In Progress"
          value={inProgress}
          subtitle="Dispatched to field teams"
          icon={Wrench}
          color="teal"
        />
        <StatCard
          title="Resolved"
          value={resolved}
          subtitle="With verified photo proof"
          icon={CheckCircle2}
          color="emerald"
        />
      </div>

      {/* Proactive SpotGuard Callout Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-blue-900 to-slate-900 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-teal-800">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-teal-400/20 text-teal-300 font-bold text-[11px] uppercase tracking-wider border border-teal-400/30">
              NEW: Proactive Neighborhood Protection
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-white">
            Could a shared space be more welcoming and usable?
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Upload a photo to review visible conditions, consider potential environmental risks, and explore permission-aware improvement ideas with an AI-generated conceptual preview.
          </p>
        </div>

        <Link
          to="/citizen/spotguard"
          className="px-5 py-3 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 whitespace-nowrap shrink-0"
        >
          <Sparkles className="w-4 h-4 text-slate-950" />
          <span>Launch SpotGuard AI Shield</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Recent Complaints Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Your Recent Grievances</h2>
            <p className="text-xs text-slate-500">
              Track real-time progress and inspect photographic resolution proof
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search ticket ID or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 w-48 sm:w-64"
              />
            </div>
            <Link
              to="/citizen/my-complaints"
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 whitespace-nowrap pl-2"
            >
              View All ({myComplaints.length})
            </Link>
          </div>
        </div>

        {filteredRecent.length === 0 ? (
          <div className="py-12 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl">
            <FileText className="w-10 h-10 mx-auto mb-2 opacity-40 text-slate-500" />
            <p className="text-sm font-semibold text-slate-700">No matching grievances found</p>
            <p className="text-xs text-slate-400 mt-1">
              Have you spotted a defect? File your first complaint in seconds.
            </p>
            <Link
              to="/citizen/report"
              className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Report Issue with AI</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredRecent.map((comp) => (
              <ComplaintCard
                key={comp.id}
                complaint={comp}
                actionUrl={`/citizen/track?id=${comp.id}`}
                actionLabel="Track Progress"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
