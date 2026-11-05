import React from 'react';
import { Complaint } from '../types';
import { StatusBadge } from './StatusBadge';
import { MapPin, Calendar, ArrowRight, Building, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ComplaintCardProps {
  complaint: Complaint;
  actionUrl?: string;
  actionLabel?: string;
  onActionClick?: (complaint: Complaint) => void;
  showAdminActions?: boolean;
}

export const ComplaintCard: React.FC<ComplaintCardProps> = ({
  complaint,
  actionUrl,
  actionLabel = 'Track Complaint',
  onActionClick,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-slate-300 hover:shadow-xs transition-all flex flex-col sm:flex-row">
      {/* Image Thumbnail */}
      <div className="sm:w-48 sm:h-auto h-40 bg-slate-100 shrink-0 relative overflow-hidden">
        <img
          src={complaint.imageUrl}
          alt={complaint.title}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-2 left-2">
          <StatusBadge severity={complaint.severity} />
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
            <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
              {complaint.id}
            </span>
            <StatusBadge status={complaint.status} />
          </div>

          <h3 className="text-sm sm:text-base font-bold text-slate-900 line-clamp-1 hover:text-blue-600 transition-colors">
            {complaint.title}
          </h3>

          <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {complaint.description}
          </p>
        </div>

        {/* Metadata Footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1 truncate max-w-[200px]">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{complaint.location.address}</span>
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
            </span>
            {complaint.department && (
              <span className="flex items-center gap-1 text-slate-600 hidden md:inline-flex">
                <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate max-w-[150px]">{complaint.department}</span>
              </span>
            )}
          </div>

          <div>
            {actionUrl ? (
              <Link
                to={actionUrl}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
              >
                <span>{actionLabel}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : onActionClick ? (
              <button
                type="button"
                onClick={() => onActionClick(complaint)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
              >
                <span>{actionLabel}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <Link
                to={`/citizen/track?id=${complaint.id}`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
              >
                <span>Track</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
