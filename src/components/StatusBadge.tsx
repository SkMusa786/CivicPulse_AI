import React from 'react';
import { ComplaintStatus, Severity } from '../types';

interface StatusBadgeProps {
  status?: ComplaintStatus;
  severity?: Severity;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, severity, className = '' }) => {
  if (severity) {
    const severityStyles: Record<Severity, { bg: string; text: string; dot: string }> = {
      Low: { bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' },
      Medium: { bg: 'bg-amber-50 text-amber-800 border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500' },
      High: { bg: 'bg-orange-50 text-orange-800 border-orange-200', text: 'text-orange-700', dot: 'bg-orange-500' },
      Critical: { bg: 'bg-rose-50 text-rose-800 border-rose-200', text: 'text-rose-700', dot: 'bg-rose-600' },
    };

    const s = severityStyles[severity] || severityStyles.Medium;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border ${s.bg} ${className}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} aria-hidden="true" />
        <span>{severity} Priority</span>
      </span>
    );
  }

  if (status) {
    const statusStyles: Record<ComplaintStatus, { bg: string; text: string; dot: string }> = {
      'Pending Admin Verification': {
        bg: 'bg-amber-50 text-amber-900 border-amber-200',
        text: 'text-amber-800',
        dot: 'bg-amber-500',
      },
      'Verified': {
        bg: 'bg-blue-50 text-blue-900 border-blue-200',
        text: 'text-blue-800',
        dot: 'bg-blue-600',
      },
      'Forwarded to Department': {
        bg: 'bg-indigo-50 text-indigo-900 border-indigo-200',
        text: 'text-indigo-800',
        dot: 'bg-indigo-600',
      },
      'In Progress': {
        bg: 'bg-cyan-50 text-cyan-900 border-cyan-200',
        text: 'text-cyan-800',
        dot: 'bg-cyan-500 animate-pulse',
      },
      'Resolved': {
        bg: 'bg-emerald-50 text-emerald-900 border-emerald-200',
        text: 'text-emerald-800',
        dot: 'bg-emerald-500',
      },
      'Rejected': {
        bg: 'bg-slate-100 text-slate-700 border-slate-300',
        text: 'text-slate-700',
        dot: 'bg-slate-400',
      },
    };

    const s = statusStyles[status] || statusStyles['Pending Admin Verification'];
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md border ${s.bg} ${className}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} aria-hidden="true" />
        <span>{status}</span>
      </span>
    );
  }

  return null;
};
