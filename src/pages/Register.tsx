import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, User, Mail, Lock, Phone, MapPin, ArrowRight } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export const Register: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [ward, setWard] = useState('Ward 14 - Metro Central');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error('Please enter name and email');
      return;
    }
    login(email, 'citizen');
    toast.success('Registration successful! Welcome to CivicAI.');
    navigate('/citizen/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <Toaster position="top-right" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 text-2xl font-extrabold text-slate-900">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
            <Shield className="w-5 h-5 fill-white" />
          </div>
          <span>Civic<span className="text-blue-600">AI</span></span>
        </Link>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
          Resident Account Registration
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Report civic issues, receive email status tracking, and hold municipal departments accountable
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-slate-200 sm:px-10 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Maya Lin"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:border-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="maya@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:border-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Mobile Phone
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:border-blue-600 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Residential Ward
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:border-blue-600 bg-white"
                >
                  <option value="Ward 14 - Metro Central">Ward 14 - Metro Central</option>
                  <option value="Ward 11 - Market District">Ward 11 - Market District</option>
                  <option value="Ward 9 - Oakridge Suburb">Ward 9 - Oakridge Suburb</option>
                  <option value="Ward 16 - Riverside">Ward 16 - Riverside</option>
                  <option value="Ward 3 - Financial District">Ward 3 - Financial District</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:border-blue-600"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center justify-center gap-1.5 pt-2"
            >
              <span>Create Citizen Account</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="text-center text-xs text-slate-500">
            <span>Already have an account? </span>
            <Link to="/login" className="font-bold text-blue-600 hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
