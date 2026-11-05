import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../hooks/useComplaints';
import { Complaint, ComplaintStatus } from '../../types';
import { StatCard } from '../../components/StatCard';
import { StatusBadge } from '../../components/StatusBadge';
import {
  Building2,
  Clock,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  MapPin,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const DepartmentDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  // Filter complaints assigned to this department
  const activeDept = currentUser.department || 'Public Works Department';
  const { complaints, loading, error, retry } = useComplaints('officer', activeDept);
  if (loading) return <div className="p-8 text-sm text-slate-500">Loading officer work orders...</div>;
  if (error) return <div className="p-8 space-y-3"><p className="text-sm text-rose-600">{error}</p><button onClick={retry} className="px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold">Retry</button></div>;
  const deptComplaints = complaints.filter(
    (c) => c.department === activeDept || (!c.department && c.aiAnalysis.recommendedDepartment === activeDept)
  );

  const assignedTotal = deptComplaints.length;
  const newAssigned = deptComplaints.filter(
    (c) => c.status === 'Forwarded to Department' || c.status === 'Verified'
  ).length;
  const inProgress = deptComplaints.filter((c) => c.status === 'In Progress').length;
  const resolved = deptComplaints.filter((c) => c.status === 'Resolved').length;

  const urgentQueue = deptComplaints
    .filter((c) => c.status !== 'Resolved' && c.status !== 'Rejected')
    .slice(0, 4);

  return (
    <div className="space-y-6 pb-12">
      {/* Department Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 uppercase tracking-wider">
            <Building2 className="w-4 h-4 text-teal-600" />
            <span>{activeDept} Operations Console</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            Department Work Orders & Field Dispatch
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Logged in as <span className="font-bold text-slate-700">{currentUser.name}</span> ({currentUser.title || 'Executive Officer'})
          </p>
        </div>

        <Link
          to="/department/proof"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-500/20 transition-all self-start sm:self-auto shrink-0"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Upload Resolution Proof</span>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Assigned"
          value={assignedTotal}
          subtitle={`Cumulative for ${activeDept.split(' ')[0]}`}
          icon={Building2}
          color="blue"
        />
        <StatCard
          title="New Work Orders"
          value={newAssigned}
          subtitle="Awaiting crew dispatch"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Active Field Repairs"
          value={inProgress}
          subtitle="Currently underway"
          icon={Wrench}
          color="teal"
        />
        <StatCard
          title="Resolved with Proof"
          value={resolved}
          subtitle="Closed & verified"
          icon={CheckCircle2}
          color="emerald"
        />
      </div>

      {/* Urgent Field Queue */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Active Work Orders Requiring Field Action</h3>
            <p className="text-xs text-slate-500">
              Update operations status or upload completion proof once work is finished
            </p>
          </div>
          <Link
            to="/department/assigned"
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <span>View All Assigned ({deptComplaints.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {urgentQueue.length === 0 ? (
          <div className="p-12 text-center text-slate-400 bg-slate-50 rounded-xl">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-800">All Assigned Tasks Completed</h4>
            <p className="text-xs text-slate-500 mt-1">
              No active or pending grievances in this department's work order queue.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {urgentQueue.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-16 h-14 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-blue-700">{item.id}</span>
                      <StatusBadge status={item.status} />
                      <StatusBadge severity={item.severity} />
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate max-w-md">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                      <span className="truncate max-w-[200px]">{item.location.address}</span>
                      <span>·</span>
                      <span>SLA: {item.aiAnalysis.slaTargetHours}h</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  <Link
                    to={`/department/assigned?id=${item.id}`}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                  >
                    Update Progress
                  </Link>
                  <Link
                    to={`/department/proof?complaintId=${item.id}`}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors"
                  >
                    Upload Proof
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
