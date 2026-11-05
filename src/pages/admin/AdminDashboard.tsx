import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useComplaints } from '../../hooks/useComplaints';
import { Complaint, Category, Severity, Department } from '../../types';
import { StatCard } from '../../components/StatCard';
import { StatusBadge } from '../../components/StatusBadge';
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  TrendingUp,
  Building2,
  ShieldCheck,
  AlertCircle,
  Eye,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';

export const AdminDashboard: React.FC = () => {
  const { complaints, loading, error, retry } = useComplaints('admin');

  if (loading) return <div className="p-8 text-sm text-slate-500">Loading administration data...</div>;
  if (error) return <div className="p-8 space-y-3"><p className="text-sm text-rose-600">{error}</p><button onClick={retry} className="px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold">Retry</button></div>;

  const total = complaints.length;
  const pending = complaints.filter((c) => c.status === 'Pending Admin Verification').length;
  const verified = complaints.filter((c) => c.status === 'Verified').length;
  const forwarded = complaints.filter((c) => c.status === 'Forwarded to Department' || c.status === 'In Progress').length;
  const resolved = complaints.filter((c) => c.status === 'Resolved').length;
  const rejected = complaints.filter((c) => c.status === 'Rejected').length;
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  // Chart 1: Category breakdown
  const categoryCounts: Record<string, number> = {};
  complaints.forEach((c) => {
    categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
  });
  const categoryData = Object.keys(categoryCounts).map((cat) => ({
    name: cat.split(' ')[0], // short name for axis
    fullName: cat,
    count: categoryCounts[cat],
  }));

  // Chart 2: Severity distribution
  const severityColors: Record<Severity, string> = {
    Low: '#10B981',
    Medium: '#F59E0B',
    High: '#F97316',
    Critical: '#EF4444',
  };
  const severityData = (['Low', 'Medium', 'High', 'Critical'] as Severity[]).map((sev) => ({
    name: sev,
    value: complaints.filter((c) => c.severity === sev).length,
    color: severityColors[sev],
  }));

  // Chart 3: Department load
  const deptCounts: Record<string, number> = {};
  complaints.forEach((c) => {
    if (c.department) {
      deptCounts[c.department] = (deptCounts[c.department] || 0) + 1;
    }
  });
  const departmentData = Object.keys(deptCounts).map((dept) => ({
    name: dept.split(' ')[0],
    fullName: dept,
    count: deptCounts[dept],
  }));

  // Chart 4: Monthly trend simulated data
  const monthlyData = [
    { month: 'Jun', total: 42, resolved: 38 },
    { month: 'Jul', total: 58, resolved: 52 },
    { month: 'Aug', total: 71, resolved: 65 },
    { month: 'Sep', total: 89, resolved: 81 },
    { month: 'Oct', total: 95, resolved: 89 },
    { month: 'Nov', total: 112, resolved: 104 },
  ];

  const pendingList = complaints
    .filter((c) => c.status === 'Pending Admin Verification')
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Welcome Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Municipal Command Center</span>
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            Executive Operations & Verification Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor incoming AI-diagnosed civic grievances, verify priority ratings, and assign department work orders.
          </p>
        </div>

        <Link
          to="/admin/pending"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-amber-500/20 transition-all self-start sm:self-auto shrink-0"
        >
          <Clock className="w-4 h-4" />
          <span>Verify Pending ({pending})</span>
        </Link>
      </div>

      {/* 6 Key Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard title="Total Tickets" value={total} icon={FileText} color="blue" />
        <StatCard title="Pending Review" value={pending} icon={Clock} color="amber" />
        <StatCard title="Verified" value={verified} icon={ShieldCheck} color="indigo" />
        <StatCard title="Forwarded" value={forwarded} icon={Building2} color="teal" />
        <StatCard title="Resolved" value={resolved} icon={CheckCircle2} color="emerald" />
        <StatCard title="Resolution %" value={`${resolutionRate}%`} icon={TrendingUp} color="emerald" />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Volume Trend */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Grievance Intake vs Resolution Trend</h3>
              <p className="text-xs text-slate-500">6-Month historical performance</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                <span>Reported</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Resolved</span>
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1D4ED8" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#1D4ED8" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="total" stroke="#1D4ED8" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
                <Area type="monotone" dataKey="resolved" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorResolved)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Breakdown Pie */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Complaints by Severity Rating</h3>
            <p className="text-xs text-slate-500">AI triage priority distribution</p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-100 pt-3">
            {severityData.map((s) => (
              <div key={s.name} className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                  <span>{s.name} Priority:</span>
                </span>
                <span className="font-mono font-bold text-slate-900 tabular-nums">{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Breakdown Bar Chart */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Complaints by Defect Category</h3>
            <p className="text-xs text-slate-500">Infrastructure distribution</p>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#1D4ED8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Distribution Bar Chart */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Workload by Municipal Department</h3>
            <p className="text-xs text-slate-500">Active assigned grievances</p>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#0F766E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Immediate Attention: Pending Verification Queue */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Grievances Awaiting Verification</h3>
            <p className="text-xs text-slate-500">Require supervisor approval and agency dispatch</p>
          </div>
          <Link
            to="/admin/pending"
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <span>Review All Pending ({pending})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {pendingList.length === 0 ? (
          <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">Verification Queue Clear</p>
            <p className="text-xs text-slate-400 mt-0.5">All incoming citizen reports have been processed.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {pendingList.map((item) => (
              <div key={item.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-16 h-12 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-700">{item.id}</span>
                      <StatusBadge severity={item.severity} />
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1">{item.title}</h4>
                    <p className="text-[11px] text-slate-500">
                      Reported by {item.citizen.name} · {item.location.address}
                    </p>
                  </div>
                </div>

                <Link
                  to="/admin/pending"
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold self-start sm:self-auto transition-colors flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Verify Now</span>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
