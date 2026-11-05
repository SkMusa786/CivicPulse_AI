import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, User, Building2, Lock, Mail, ArrowRight, CheckCircle2, ShieldCheck, Wrench, Sparkles } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('citizen@civicai.com');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activePreset, setActivePreset] = useState<'citizen' | 'admin' | 'officer'>('citizen');

  const credentialsList = [
    {
      id: 'citizen' as const,
      title: '1. Citizen Login',
      badge: 'Public Resident',
      email: 'citizen@civicai.com',
      name: 'Rahul Sharma',
      desc: 'Report civic issues, track progress & view proof of resolution (POC).',
      icon: User,
      color: 'blue',
      border: 'hover:border-blue-500',
      activeBorder: 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600',
    },
    {
      id: 'admin' as const,
      title: '2. Admin Login (Verification)',
      badge: 'Control Room',
      email: 'admin@civicai.com',
      name: 'Priya Patel',
      desc: 'Inspect AI predictions, verify grievances & assign to authorities.',
      icon: ShieldCheck,
      color: 'amber',
      border: 'hover:border-amber-500',
      activeBorder: 'border-amber-600 bg-amber-50/50 ring-1 ring-amber-600',
    },
    {
      id: 'officer' as const,
      title: '3. Authorities Login (Work & POC)',
      badge: 'Municipal Authority',
      email: 'officer@civicai.com',
      name: 'Er. Vikram Rao',
      desc: 'Update work status (Pending / In Progress) & deliver POC to users.',
      icon: Building2,
      color: 'teal',
      border: 'hover:border-teal-500',
      activeBorder: 'border-teal-600 bg-teal-50/50 ring-1 ring-teal-600',
    },
  ];

  const handleSelectPreset = (preset: typeof credentialsList[0]) => {
    setEmail(preset.email);
    setPassword('');
    setActivePreset(preset.id);
    toast.success(`Loaded credentials for ${preset.title}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const result = await login(email, password);

      if (result.success && result.user) {
        toast.success(`Welcome back, ${result.user.name}!`);

        if (result.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (result.user.role === 'officer') {
          navigate('/officer/dashboard');
        } else {
          navigate('/citizen/dashboard');
        }
      } else {
        toast.error(result.error || 'Authentication failed. Please check credentials.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <Toaster position="top-right" />

      <div className="max-w-4xl mx-auto w-full space-y-8">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2.5 text-2xl font-extrabold text-slate-900 group">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md group-hover:bg-blue-700 transition-colors">
              <Shield className="w-5 h-5 fill-white" />
            </div>
            <span>
              Civic<span className="text-blue-600">AI</span>
            </span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Municipal Portal Authentication
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
            Select one of the three designated access roles below, or enter your credentials to access your authorized portal.
          </p>
        </div>

        {/* 3 Dedicated Login Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {credentialsList.map((item) => {
            const Icon = item.icon;
            const isSelected = activePreset === item.id && email === item.email;

            return (
              <div
                key={item.id}
                onClick={() => handleSelectPreset(item)}
                className={`p-5 rounded-2xl bg-white border cursor-pointer transition-all shadow-xs flex flex-col justify-between ${
                  isSelected ? item.activeBorder : `border-slate-200 ${item.border}`
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded-xl bg-slate-100 text-slate-800">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full uppercase tracking-wider bg-slate-100 text-slate-700">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-mono space-y-1">
                  <div className="text-slate-600 truncate">
                    <span className="text-slate-400 font-sans">Email:</span> {item.email}
                  </div>
                  <div className="text-slate-600">
                    <span className="text-slate-400 font-sans">Password:</span> Enter demo password
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectPreset(item);
                    }}
                    className={`mt-2 w-full py-1.5 px-3 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1 ${
                      isSelected
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <span>{isSelected ? '✓ Credentials Filled' : 'Use This Login'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Credentials Form Box */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-md max-w-md mx-auto w-full space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">Sign In with Email & Password</h2>
            <p className="text-xs text-slate-500">
              Entering the email and password will direct you to the corresponding portal.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="e.g. citizen@civicai.com or officer@civicai.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm font-mono rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="Enter account password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-wait text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 mt-2"
            >
              <span>{isSubmitting ? 'Signing In...' : 'Sign In & Open Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-100 flex items-center justify-between">
            <Link to="/" className="text-slate-500 hover:text-slate-800">
              ← Return Home
            </Link>
            <span className="text-[11px] text-slate-400 font-mono">CivicAI Multi-Role Auth v4.2</span>
          </div>
        </div>
      </div>
    </div>
  );
};
