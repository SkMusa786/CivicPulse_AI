import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';

export const CitizenLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        <Sidebar />
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
