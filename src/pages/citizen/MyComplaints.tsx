import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../hooks/useComplaints';
import { Complaint, ComplaintStatus, Category } from '../../types';
import { ComplaintCard } from '../../components/ComplaintCard';
import { Search, Filter, PlusCircle, ArrowUpDown, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

export const MyComplaints: React.FC = () => {
  const { currentUser } = useAuth();
  const { complaints, loading, error, retry } = useComplaints('citizen');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  const statuses: ('All' | ComplaintStatus)[] = [
    'All',
    'Pending Admin Verification',
    'Verified',
    'Forwarded to Department',
    'In Progress',
    'Resolved',
    'Rejected',
  ];

  const categories: string[] = [
    'All',
    'Roads & Pavements',
    'Garbage & Sanitation',
    'Street Lighting',
    'Water Supply & Sewage',
    'Parks & Public Spaces',
    'Traffic & Signage',
    'Public Health & Hazards',
  ];

  // Citizen filter (or all if current user owns or is demo viewing)
  const myComplaints = complaints.filter(
    (c) => c.citizen.id === currentUser.id || c.citizen.email === currentUser.email
  );

  const filtered = myComplaints
    .filter((c) => {
      if (statusFilter !== 'All' && c.status !== statusFilter) return false;
      if (categoryFilter !== 'All' && c.category !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          c.title.toLowerCase().includes(q) ||
          c.id.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.location.address.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
    });
  if (loading) return <div className="p-8 text-sm text-slate-500">Loading complaints...</div>;
  if (error) return <div className="p-8 space-y-3"><p className="text-sm text-rose-600">{error}</p><button onClick={retry} className="px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold">Retry</button></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">My Submitted Complaints</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track grievances, view administrative approvals, and inspect resolution proof
          </p>
        </div>

        <Link
          to="/citizen/report"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Report New Defect</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Keyword Search */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ID, keyword, address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            />
          </div>

          {/* Category Dropdown */}
          <div className="md:col-span-4">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 bg-white"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  Category: {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Sorting */}
          <div className="md:col-span-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
              className="w-full flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium border border-slate-300 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
              <span>{sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}</span>
            </button>
          </div>
        </div>

        {/* Status Tab Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100 no-scrollbar">
          {statuses.map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Complaints List */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
          <Filter className="w-10 h-10 mx-auto mb-2 opacity-40 text-slate-500" />
          <h3 className="text-sm font-semibold text-slate-700">No grievances match your criteria</h3>
          <p className="text-xs text-slate-400 mt-1">
            Try resetting your search query or status filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('All');
              setCategoryFilter('All');
            }}
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset Filters</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((comp) => (
            <ComplaintCard
              key={comp.id}
              complaint={comp}
              actionUrl={`/citizen/track?id=${comp.id}`}
              actionLabel="View Tracking & Proof"
            />
          ))}
        </div>
      )}
    </div>
  );
};
