import React from 'react';
import { DEPARTMENTS_DATA } from '../../data/mockComplaints';
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

  const slaData = [
    { range: '< 12 Hours', count: 48 },
    { range: '12-24 Hours', count: 64 },
    { range: '24-48 Hours', count: 32 },
    { range: '48-72 Hours', count: 14 },
    { range: '> 72 Hours', count: 6 },
  ];

  const wardPerformance = [
    { ward: 'Ward 14 - Metro Central', total: 64, resolved: 58, rate: '90.6%', avgDays: 1.4 },
    { ward: 'Ward 11 - Market District', total: 42, resolved: 39, rate: '92.8%', avgDays: 1.1 },
    { ward: 'Ward 9 - Oakridge Suburb', total: 31, resolved: 27, rate: '87.0%', avgDays: 2.3 },
    { ward: 'Ward 16 - Riverside', total: 29, resolved: 26, rate: '89.6%', avgDays: 1.8 },
    { ward: 'Ward 3 - Financial District', total: 22, resolved: 21, rate: '95.4%', avgDays: 0.9 },
  ];

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
          value="93.8%"
          subtitle="+2.4% vs last quarter"
          icon={ShieldCheck}
          color="emerald"
        />
        <StatCard
          title="Avg Dispatch Latency"
          value="1.8 Hrs"
          subtitle="Admin verification speed"
          icon={Clock}
          color="blue"
        />
        <StatCard
          title="Field Repair Turnaround"
          value="26.4 Hrs"
          subtitle="Mean time to resolution"
          icon={TrendingUp}
          color="teal"
        />
        <StatCard
          title="Verified Photo Proofs"
          value="99.1%"
          subtitle="Closure compliance rate"
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
            <p className="text-xs text-slate-500">Distribution of resolution duration from complaint filing</p>
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
            {DEPARTMENTS_DATA.slice(0, 5).map((dept) => (
              <div key={dept.shortCode} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span className="truncate max-w-[240px]">{dept.name}</span>
                  <span className="font-mono text-blue-700">{dept.avgResolutionDays} days</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-600 rounded-full"
                    style={{ width: `${Math.min(100, (dept.avgResolutionDays / 4) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
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
