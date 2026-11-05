import React, { useState } from 'react';
import { DEMO_USERS } from '../../data/mockUsers';
import { User, UserRole } from '../../types';
import { Users, Shield, Building2, UserCheck, Plus, CheckCircle2, Search } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export const UserManagement: React.FC = () => {
  const [userList, setUserList] = useState<User[]>(DEMO_USERS);
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filtered = userList.filter((u) => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.department && u.department.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Shield className="w-3 h-3 text-amber-600" />
            <span>Administrator</span>
          </span>
        );
      case 'department':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
            <Building2 className="w-3 h-3 text-teal-600" />
            <span>Municipal Authority</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
            <UserCheck className="w-3 h-3 text-slate-600" />
            <span>Resident Citizen</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <Toaster position="top-right" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Municipal User & Staff Directory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage administrative credentials, department agency engineers, and active resident access
          </p>
        </div>

        <button
          type="button"
          onClick={() => toast.success('Add Official form modal opened in demo mode')}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Municipal Staff</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search staff name, email, department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
          />
        </div>

        <div className="flex items-center gap-1">
          {['all', 'admin', 'department', 'citizen'].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors ${
                roleFilter === r
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Staff / User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Department / Jurisdiction</th>
                <th className="py-3 px-4">Contact Phone</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center font-bold text-xs text-slate-700">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          user.name.charAt(0)
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{user.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">{getRoleBadge(user.role)}</td>
                  <td className="py-3 px-4">
                    <span className="font-medium text-slate-800">
                      {user.department || user.ward || 'General Resident'}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                    {user.phone || '+1 (555) 000-0000'}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>Active</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => toast.success(`Viewing profile for ${user.name}`)}
                      className="text-blue-600 hover:text-blue-800 font-semibold text-xs"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
