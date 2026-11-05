import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  Search,
  Bell,
  User,
  ShieldCheck,
  Building2,
  CheckCircle2,
  BarChart3,
  Users,
  LogOut,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useComplaints } from '../hooks/useComplaints';

export const Sidebar: React.FC = () => {
  const { role, currentUser, logout } = useAuth();
  const scope = role === 'admin' ? 'admin' : role === 'officer' || role === 'department' ? 'officer' : 'citizen';
  const { complaints } = useComplaints(scope, currentUser.department);

  // Dynamic counts for badge indicators
  const pendingAdminCount = complaints.filter((c) => c.status === 'Pending Admin Verification').length;
  const myComplaintsCount = complaints.filter((c) => c.citizen.id === currentUser.id).length;
  const deptAssignedCount = complaints.filter(
    (c) => (c.department === currentUser.department || !currentUser.department) && c.status !== 'Resolved' && c.status !== 'Rejected'
  ).length;

  interface NavItem {
    name: string;
    to: string;
    icon: any;
    highlight?: boolean;
    badge?: number;
    badgeColor?: string;
  }

  const citizenNav: NavItem[] = [
    { name: 'Overview', to: '/citizen/dashboard', icon: LayoutDashboard },
    { name: 'Report New Issue', to: '/citizen/report', icon: PlusCircle, highlight: true },
    { name: 'SpotGuard (AI Prevention)', to: '/citizen/spotguard', icon: Sparkles },
    { name: 'My Complaints', to: '/citizen/my-complaints', icon: FileText, badge: myComplaintsCount },
    { name: 'Track Complaint', to: '/citizen/track', icon: Search },
    { name: 'Profile', to: '/citizen/profile', icon: User },
  ];

  const adminNav: NavItem[] = [
    { name: 'Admin Overview', to: '/admin/dashboard', icon: LayoutDashboard },
    {
      name: 'Verify Complaints',
      to: '/admin/pending',
      icon: Clock,
      badge: pendingAdminCount,
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    { name: 'All Complaints', to: '/admin/complaints', icon: FileText },
    { name: 'Analytics & Trends', to: '/admin/analytics', icon: BarChart3 },
    { name: 'User Management', to: '/admin/users', icon: Users },
  ];

  const departmentNav: NavItem[] = [
    { name: 'Authorities Overview', to: '/department/dashboard', icon: LayoutDashboard },
    {
      name: 'Assigned Work Orders',
      to: '/department/assigned',
      icon: Building2,
      badge: deptAssignedCount,
      badgeColor: 'bg-teal-100 text-teal-800',
    },
    { name: 'Upload POC to Users', to: '/department/proof', icon: CheckCircle2 },
  ];

  const currentNav =
    role === 'admin' ? adminNav : role === 'officer' || role === 'department' ? departmentNav : citizenNav;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 shrink-0 flex flex-col justify-between hidden md:flex min-h-[calc(100vh-6rem)]">
      <div className="p-4 space-y-6">
        {/* User Card */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-full h-full object-cover rounded-lg"
                  referrerPolicy="no-referrer"
                />
              ) : (
                currentUser.name.charAt(0)
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
              <p className="text-[11px] text-slate-500 capitalize truncate">
                {role === 'officer' || role === 'department' ? 'Municipal Authority' : currentUser.department || currentUser.role}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
            {role === 'officer' || role === 'department' ? 'AUTHORITIES PORTAL' : `${role.toUpperCase()} PORTAL`}
          </p>
          {currentNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to.endsWith('dashboard')}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 shadow-xs ring-1 ring-blue-200'
                      : item.highlight
                      ? 'text-blue-700 hover:bg-blue-50/50 bg-blue-50/30 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`
                }
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.name}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                      item.badgeColor || 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer / Quick Info */}
      <div className="p-4 border-t border-slate-200 space-y-3">
        <div className="p-3 rounded-lg bg-linear-to-r from-blue-50 to-teal-50 border border-blue-100 text-[11px] text-slate-600">
          <div className="flex items-center gap-1.5 font-bold text-blue-900 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>CivicAI Vision 4.2</span>
          </div>
          <p className="text-[11px] leading-tight text-slate-500">
            Real-time automated grievance categorization & SLA routing.
          </p>
        </div>

        <button
          type="button"
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Switch / Exit Session</span>
        </button>
      </div>
    </aside>
  );
};
