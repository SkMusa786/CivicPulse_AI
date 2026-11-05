import React from 'react';
import { useAuth } from '../context/AuthContext';
import { RotateCcw, UserCheck, Shield, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DemoSwitcher: React.FC = () => {
  const { currentUser, switchUser, allDemoUsers } = useAuth();
  const navigate = useNavigate();

  // Exactly the 3 logins
  const roleCards = [
    {
      id: 'user-citizen-1',
      label: '1. Citizen',
      name: 'Rahul Sharma',
      role: 'citizen',
      path: '/citizen/dashboard',
      icon: UserCheck,
    },
    {
      id: 'user-admin-1',
      label: '2. Admin (Verification)',
      name: 'Priya Patel',
      role: 'admin',
      path: '/admin/dashboard',
      icon: Shield,
    },
    {
      id: 'user-dept-pwd',
      label: '3. Authorities (Work & POC)',
      name: 'Er. Vikram Rao',
      role: 'department',
      path: '/department/dashboard',
      icon: Building2,
    },
  ];

  const handleSelect = (userItem: typeof roleCards[0]) => {
    switchUser(userItem.id);
    navigate(userItem.path);
  };

  const handleReset = () => {
    if (window.confirm('Reset all demo complaints and notifications back to initial factory state?')) {
      navigate('/');
    }
  };

  return (
    <div className="bg-slate-900 text-slate-200 border-b border-slate-800 text-xs py-2 px-4 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white tracking-wide uppercase text-[11px] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span>3 Authorized Municipal Roles:</span>
          </span>
        </div>

        {/* 3 User Buttons */}
        <div className="flex items-center flex-wrap gap-1.5">
          {roleCards.map((item) => {
            const isActive = currentUser.id === item.id || (item.role === 'department' && currentUser.role === 'department');
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs font-bold ring-1 ring-blue-400'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                <span className="text-[11px] opacity-75 hidden lg:inline">({item.name.split(' ')[0]})</span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-900/60 text-slate-400 hover:text-rose-200 text-xs font-medium transition-colors ml-1 border border-slate-700"
            title="Reset complaints and logs to clean default"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Reset State</span>
          </button>
        </div>
      </div>
    </div>
  );
};
