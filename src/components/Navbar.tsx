import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Shield, Bell, PlusCircle, User, LogOut, Menu, X, ArrowUpRight, Sparkles } from 'lucide-react';
import { NotificationPanel } from './NotificationPanel';

export const Navbar: React.FC = () => {
  const { currentUser, role, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifPanelOpen, setNotifPanelOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const getPortalLink = () => {
    if (role === 'admin') return '/admin/dashboard';
    if (role === 'officer' || role === 'department') return '/officer/dashboard';
    return '/citizen/dashboard';
  };

  return (
    <>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Brand Wordmark (Single element) */}
          <Link
            to="/"
            className="flex items-center gap-2.5 text-slate-900 font-extrabold text-lg tracking-tight whitespace-nowrap shrink-0 group"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs group-hover:bg-blue-700 transition-colors">
              <Shield className="w-4 h-4 fill-white" />
            </div>
            <span>
              Civic<span className="text-blue-600">AI</span>
            </span>
          </Link>

          {/* Zone 2: 4-5 Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link
              to="/"
              className={`hover:text-blue-600 transition-colors whitespace-nowrap shrink-0 ${
                location.pathname === '/' ? 'text-blue-600 font-semibold' : ''
              }`}
            >
              Home
            </Link>
            <Link
              to="/citizen/report"
              className={`hover:text-blue-600 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1 ${
                location.pathname === '/citizen/report' ? 'text-blue-600 font-semibold' : ''
              }`}
            >
              <span>Report Issue</span>
            </Link>
            <Link
              to="/citizen/spotguard"
              className={`hover:text-teal-700 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1 ${
                location.pathname.startsWith('/citizen/spotguard') ? 'text-teal-700 font-bold' : 'text-slate-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>SpotGuard</span>
            </Link>
            <Link
              to="/citizen/track"
              className={`hover:text-blue-600 transition-colors whitespace-nowrap shrink-0 ${
                location.pathname.startsWith('/citizen/track') ? 'text-blue-600 font-semibold' : ''
              }`}
            >
              Track Complaint
            </Link>
            <Link
              to={getPortalLink()}
              className={`hover:text-blue-600 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1 ${
                location.pathname.includes('dashboard') ? 'text-blue-600 font-semibold' : ''
              }`}
            >
              <span>{role === 'officer' || role === 'department' ? 'Authorities Portal' : `${role.charAt(0).toUpperCase() + role.slice(1)} Portal`}</span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
            </Link>
          </nav>

          {/* Zone 3: Actions & Notifications & Profile */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Notification Bell */}
            <button
              type="button"
              onClick={() => setNotifPanelOpen(true)}
              className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
              )}
            </button>

            {/* Quick Report CTA (Citizen) */}
            <Link
              to="/citizen/report"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report Issue</span>
            </Link>

            {/* User Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center text-xs font-bold text-slate-700">
                  {currentUser.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    currentUser.name.charAt(0)
                  )}
                </div>
                <div className="hidden lg:block text-left text-xs leading-tight pr-1">
                  <div className="font-semibold text-slate-800 truncate max-w-[120px]">{currentUser.name}</div>
                  <div className="text-[10px] text-slate-400 capitalize">{role}</div>
                </div>
              </button>

              {profileDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-slate-200 shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onClick={() => setProfileDropdownOpen(false)}
                >
                  <div className="px-3.5 py-2 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-900">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                    <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 capitalize">
                      {currentUser.title || role}
                    </span>
                  </div>

                  <Link
                    to={getPortalLink()}
                    className="flex items-center gap-2 px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50"
                  >
                    <Shield className="w-4 h-4 text-slate-400" />
                    <span>Go to Dashboard</span>
                  </Link>

                  <Link
                    to="/citizen/profile"
                    className="flex items-center gap-2 px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>My Profile</span>
                  </Link>

                  <div className="border-t border-slate-100 my-1" />

                  <button
                    type="button"
                    onClick={logout}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50 text-left"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-50"
            >
              Home
            </Link>
            <Link
              to="/citizen/report"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-50"
            >
              Report an Issue
            </Link>
            <Link
              to="/citizen/spotguard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-bold rounded-lg text-teal-800 bg-teal-50"
            >
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span>SpotGuard (AI Prevention)</span>
            </Link>
            <Link
              to="/citizen/track"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-50"
            >
              Track Complaint
            </Link>
            <Link
              to={getPortalLink()}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium rounded-lg text-blue-600 bg-blue-50 font-semibold"
            >
              Switch to {role.toUpperCase()} Dashboard
            </Link>
          </div>
        )}
      </header>

      {/* Slide-out notifications */}
      <NotificationPanel isOpen={notifPanelOpen} onClose={() => setNotifPanelOpen(false)} />
    </>
  );
};
