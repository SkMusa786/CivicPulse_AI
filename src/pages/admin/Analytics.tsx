import React from 'react';
import { useComplaints } from '../../hooks/useComplaints';
import { StatCard } from '../../components/StatCard';
import {
  BarChart3,
  TrendingUp,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Building2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

export const Analytics: React.FC = () => {
  const { complaints, loading, error, retry } = useComplaints('admin');
  if (loading) return <div className="p-8 text-sm text-slate-500">Loading analytics...</div>;
  if (error) return <div className="p-8 space-y-3"><p className="text-sm text-rose-600">{error}</p><button onClick={retry} className="px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold">Retry</button></div>;

  const resolvedComplaints = complaints.flatMap((complaint) => {
    const resolvedAt = complaint.statusTimeline.find((entry) => entry.status === 'Resolved')?.timestamp;
    if (!resolvedAt) return [];
    const filedAt = new Date(complaint.createdAt).getTime();
    const closedAt = new Date(resolvedAt).getTime();
    const forwardedAt = complaint.statusTimeline.find((entry) => entry.status === 'Forwarded to Department')?.timestamp;
    return [{
      complaint,
      filedAt,
      closedAt,
      dispatchAt: forwardedAt ? new Date(forwardedAt).getTime() : filedAt,
      hoursToClose: (closedAt - filedAt) / 3_600_000,
    }];
  });
  const formatAverageHours = (hours: number[]): string => hours.length
    ? `${(hours.reduce((sum, value) => sum + value, 0) / hours.length).toFixed(1)} Hrs`
    : '—';
  const withinSla = resolvedComplaints.filter(({ complaint, hoursToClose }) =>
    hoursToClose <= complaint.aiAnalysis.slaTargetHours
  ).length;
  const dispatchHours = resolvedComplaints.map(({ dispatchAt, filedAt }) => (dispatchAt - filedAt) / 3_600_000);
  const repairHours = resolvedComplaints.map(({ closedAt, dispatchAt }) => (closedAt - dispatchAt) / 3_600_000);
  const proofRate = resolvedComplaints.length
    ? Math.round((resolvedComplaints.filter(({ complaint }) => Boolean(complaint.resolutionProof?.afterImageUrl)).length / resolvedComplaints.length) * 100)
    : null;
  const slaData = [
    { range: '< 12 Hours', min: 0, max: 12 },
    { range: '12-24 Hours', min: 12, max: 24 },
    { range: '24-48 Hours', min: 24, max: 48 },
    { range: '48-72 Hours', min: 48, max: 72 },
    { range: '> 72 Hours', min: 72, max: Infinity },
  ].map(({ range, min, max }) => ({
    range,
    count: resolvedComplaints.filter(({ hoursToClose }) => hoursToClose >= min && hoursToClose < max).length,
  }));
  const departmentStats = new Map<string, { total: number; resolvedHours: number[] }>();
  const wardStats = new Map<string, { total: number; resolvedHours: number[] }>();
  complaints.forEach((complaint) => {
    if (complaint.department) {
      const current = departmentStats.get(complaint.department) || { total: 0, resolvedHours: [] };
      current.total += 1;
      const resolved = resolvedComplaints.find((entry) => entry.complaint.id === complaint.id);
      if (resolved) current.resolvedHours.push(resolved.hoursToClose);
      departmentStats.set(complaint.department, current);
    }
    const ward = complaint.location.ward?.trim() || 'Ward not specified';
    const current = wardStats.get(ward) || { total: 0, resolvedHours: [] };
    const resolved = resolvedComplaints.find((entry) => entry.complaint.id === complaint.id);
    if (resolved) current.resolvedHours.push(resolved.hoursToClose);
    current.total += 1;
    wardStats.set(ward, current);
  });
  const departments = [...departmentStats.entries()].sort((a, b) => b[1].total - a[1].total);
  const wardPerformance = [...wardStats.entries()].map(([ward, stats]) => ({
    ward,
    total: stats.total,
    resolved: stats.resolvedHours.length,
    rate: stats.total ? `${((stats.resolvedHours.length / stats.total) * 100).toFixed(1)}%` : '—',
    avgDays: stats.resolvedHours.length
      ? (stats.resolvedHours.reduce((sum, hours) => sum + hours, 0) / stats.resolvedHours.length / 24).toFixed(1)
      : '—',
  }));

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
          Municipal Infrastructure Analytics & SLA Reports
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Data-driven operational intelligence on civic resolution velocity, SLA compliance, and ward hotspots
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall SLA Adherence"
          value={resolvedComplaints.length ? `${Math.round((withinSla / resolvedComplaints.length) * 100)}%` : '—'}
          subtitle={`${withinSla} of ${resolvedComplaints.length} resolved tickets within SLA`}
          icon={ShieldCheck}
          color="emerald"
        />
        <StatCard
          title="Avg Dispatch Latency"
          value={formatAverageHours(dispatchHours)}
          subtitle="Average filing-to-dispatch time"
          icon={Clock}
          color="blue"
        />
        <StatCard
          title="Field Repair Turnaround"
          value={formatAverageHours(repairHours)}
          subtitle="Average dispatch-to-resolution time"
          icon={TrendingUp}
          color="teal"
        />
        <StatCard
          title="Verified Photo Proofs"
          value={proofRate === null ? '—' : `${proofRate}%`}
          subtitle="Resolved tickets with after photographs"
          icon={CheckCircle2}
          color="indigo"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SLA Distribution */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Closure Turnaround Time Distribution</h3>
            <p className="text-xs text-slate-500">Distribution of actual completed complaints by filing-to-resolution time</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={slaData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="range" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#1D4ED8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department SLA Comparison */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Department Turnaround Benchmarks</h3>
            <p className="text-xs text-slate-500">Average days required to achieve photographic closure</p>
          </div>

          <div className="space-y-3 pt-2">
            {departments.map(([name, stats]) => (
              <div key={name} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span className="truncate max-w-[240px]">{name} ({stats.total})</span>
                  <span className="font-mono text-blue-700">{formatAverageHours(stats.resolvedHours)}</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-600 rounded-full"
                    style={{ width: `${stats.total ? (stats.resolvedHours.length / stats.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
            {departments.length === 0 && <p className="text-xs text-slate-500">No department assignments have been recorded.</p>}
          </div>
        </div>
      </div>

      {/* Ward Hotspots Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs p-6 space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Municipal Ward Performance Heatmap</h3>
          <p className="text-xs text-slate-500">
            Breakdown of resolution rates and average turnaround by civic jurisdiction
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Municipal Ward</th>
                <th className="py-3 px-4">Total Logged</th>
                <th className="py-3 px-4">Resolved</th>
                <th className="py-3 px-4">Resolution Rate</th>
                <th className="py-3 px-4">Avg Turnaround</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {wardPerformance.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-slate-900">{row.ward}</td>
                  <td className="py-3 px-4 font-mono tabular-nums">{row.total}</td>
                  <td className="py-3 px-4 font-mono tabular-nums text-emerald-700 font-bold">{row.resolved}</td>
                  <td className="py-3 px-4 font-mono font-bold text-blue-700">{row.rate}</td>
                  <td className="py-3 px-4 font-mono text-slate-600">{row.avgDays} days</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
