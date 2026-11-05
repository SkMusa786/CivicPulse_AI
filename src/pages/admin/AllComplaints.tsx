import React, { useState, useEffect } from 'react';
import { useComplaints } from '../../hooks/useComplaints';
import { Complaint, ComplaintStatus, Category, Department } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import {
  FileText,
  Search,
  Filter,
  Download,
  Building2,
  MapPin,
  Calendar,
  Eye,
  CheckCircle2,
  Clock,
  ArrowUpDown,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

export const AllComplaints: React.FC = () => {
  const { complaints, loading, error, retry } = useComplaints('admin');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [deptFilter, setDeptFilter] = useState<string>('All');

  const filtered = complaints.filter((c) => {
    if (statusFilter !== 'All' && c.status !== statusFilter) return false;
    if (categoryFilter !== 'All' && c.category !== categoryFilter) return false;
    if (deptFilter !== 'All' && c.department !== deptFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.title.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.citizen.name.toLowerCase().includes(q) ||
        c.location.address.toLowerCase().includes(q)
      );
    }
    return true;
  });
  if (loading) return <div className="p-8 text-sm text-slate-500">Loading all complaints...</div>;
  if (error) return <div className="p-8 space-y-3"><p className="text-sm text-rose-600">{error}</p><button onClick={retry} className="px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold">Retry</button></div>;

  const handleExportCSV = () => {
    const headers = ['ID', 'Title', 'Category', 'Severity', 'Status', 'Department', 'Citizen', 'Address', 'Date'];
    const rows = filtered.map((c) => [
      c.id,
      `"${c.title.replace(/"/g, '""')}"`,
      c.category,
      c.severity,
      c.status,
      c.department || 'Unassigned',
      `"${c.citizen.name}"`,
      `"${c.location.address.replace(/"/g, '""')}"`,
      new Date(c.createdAt).toLocaleDateString(),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `civicai_grievances_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${filtered.length} complaints to CSV`);
  };

  return (
    <div className="space-y-6 pb-12">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Master Complaints Registry
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Full central repository of all registered civic issues across all municipal wards
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-slate-500" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search ID, title, citizen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            />
          </div>

          {/* Status */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-600 bg-white"
            >
              <option value="All">All Statuses</option>
              <option value="Pending Admin Verification">Pending Admin Verification</option>
              <option value="Verified">Verified</option>
              <option value="Forwarded to Department">Forwarded to Department</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Category */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-600 bg-white"
            >
              <option value="All">All Categories</option>
              <option value="Roads & Pavements">Roads & Pavements</option>
              <option value="Garbage & Sanitation">Garbage & Sanitation</option>
              <option value="Street Lighting">Street Lighting</option>
              <option value="Water Supply & Sewage">Water Supply & Sewage</option>
              <option value="Parks & Public Spaces">Parks & Public Spaces</option>
              <option value="Traffic & Signage">Traffic & Signage</option>
              <option value="Public Health & Hazards">Public Health & Hazards</option>
            </select>
          </div>

          {/* Department */}
          <div>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-600 bg-white"
            >
              <option value="All">All Departments</option>
              <option value="Public Works Department">Public Works Department</option>
              <option value="Sanitation & Solid Waste">Sanitation & Solid Waste</option>
              <option value="Electricity & Street Lighting">Electricity & Street Lighting</option>
              <option value="Water Supply & Sewerage Board">Water Supply & Sewerage Board</option>
              <option value="Horticulture & Parks">Horticulture & Parks</option>
            </select>
          </div>
        </div>
      </div>

      {/* High-Density Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Ticket ID</th>
                <th className="py-3 px-4">Problem Title</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No complaints matched current filters.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-700 whitespace-nowrap">
                      {item.id}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900 max-w-[200px] truncate">
                      {item.title}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">{item.category}</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <StatusBadge severity={item.severity} />
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-700">
                      {item.department || <span className="text-slate-400 italic">Unassigned</span>}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] whitespace-nowrap text-slate-500">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <Link
                        to={`/citizen/track?id=${item.id}`}
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </Link>
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
