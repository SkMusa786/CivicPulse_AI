import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getComplaints, getComplaintById } from '../../services/complaintService';
import { Complaint } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { MapPicker } from '../../components/MapPicker';
import { ComplaintTimeline } from '../../components/ComplaintTimeline';
import {
  Search,
  MapPin,
  Calendar,
  Building2,
  Clock,
  Sparkles,
  Share2,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export const TrackComplaint: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const idFromQuery = searchParams.get('id') || '';

  const [searchId, setSearchId] = useState(idFromQuery);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  const loadComplaints = async () => {
    setLoading(true);
    setError('');
    try { setComplaints(await getComplaints()); } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load complaints');
    } finally { setLoading(false); }
  };

  useEffect(() => { void loadComplaints(); }, []);

  useEffect(() => {
    if (idFromQuery) {
      void getComplaintById(idFromQuery).then(setSelectedComplaint).catch(() => setSelectedComplaint(null));
    } else if (complaints.length > 0) {
      // Default to the first one so page is immediately populated and engaging
      setSelectedComplaint(complaints[0]);
    }
  }, [idFromQuery, complaints]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;

    const query = searchId.trim().toUpperCase();
    void getComplaintById(query).then((found) => {
      if (found) { setSelectedComplaint(found); setSearchParams({ id: found.id }); }
      else toast.error(`No grievance found with ID "${searchId}". Please verify.`);
    }).catch((loadError) => toast.error(loadError instanceof Error ? loadError.message : 'Unable to search complaint'));
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Grievance tracking link copied to clipboard!');
  };

  return (
    <div className="space-y-6 pb-12">
      <Toaster position="top-right" />
      {loading && <p className="text-sm text-slate-500">Loading complaint data...</p>}
      {error && <div className="p-4 rounded-xl bg-rose-50 text-rose-700 text-sm flex justify-between"><span>{error}</span><button onClick={() => void loadComplaints()} className="font-bold underline">Retry</button></div>}

      {/* Header and Search Form */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Live Grievance Tracking & Verification
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter your complaint registration ID to inspect real-time departmental progress
            </p>
          </div>

          {selectedComplaint && (
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors self-start sm:self-auto"
            >
              <Share2 className="w-3.5 h-3.5 text-slate-500" />
              <span>Share Ticket</span>
            </button>
          )}
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Enter Complaint ID (e.g. CIVIC-2024-8841)..."
              className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm font-mono rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 uppercase"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm rounded-xl transition-colors shadow-xs"
          >
            Track Status
          </button>
        </form>

        {/* Quick sample chips */}
        <div className="flex items-center gap-2 text-xs text-slate-500 pt-1 overflow-x-auto no-scrollbar">
          <span className="font-semibold text-slate-400 whitespace-nowrap">Try example tickets:</span>
          {complaints.slice(0, 4).map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                setSearchId(c.id);
                setSelectedComplaint(c);
                setSearchParams({ id: c.id });
              }}
              className="px-2.5 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 font-mono text-[11px] text-slate-700 whitespace-nowrap transition-colors"
            >
              {c.id} ({c.status})
            </button>
          ))}
        </div>
      </div>

      {!selectedComplaint ? (
        <div className="py-16 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
          <AlertTriangle className="w-10 h-10 mx-auto mb-2 text-amber-500 opacity-60" />
          <h3 className="text-base font-bold text-slate-800">Grievance Not Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Please verify the ticket reference number or select one of the active sample complaints above.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Complaint Overview Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                    {selectedComplaint.id}
                  </span>
                  <StatusBadge status={selectedComplaint.status} />
                  <StatusBadge severity={selectedComplaint.severity} />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  {selectedComplaint.title}
                </h2>
              </div>

              <div className="text-right text-xs text-slate-500 font-mono">
                <div>Reported: {new Date(selectedComplaint.createdAt).toLocaleString()}</div>
                <div>Citizen: {selectedComplaint.citizen.name}</div>
              </div>
            </div>

            {/* Split Grid: Image & AI Analysis on Left, Map & Agency Details on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Original Photograph + Technical Description */}
              <div className="lg:col-span-6 space-y-4">
                <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-900 relative aspect-video">
                  <img
                    src={selectedComplaint.imageUrl}
                    alt={selectedComplaint.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2 left-2 bg-black/70 text-white text-[11px] font-mono px-2 py-0.5 rounded backdrop-blur-xs">
                    ORIGINAL CITIZEN UPLOAD
                  </div>
                </div>

                {/* AI Technical Vision Summary */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      <span>AI Vision Diagnostic Summary</span>
                    </span>
                    <span className="font-mono text-[11px] text-slate-500">
                      Confidence: {(selectedComplaint.aiAnalysis.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    {selectedComplaint.description}
                  </p>
                  {selectedComplaint.aiAnalysis.suggestedAction && (
                    <div className="pt-2 border-t border-slate-200/60 text-slate-500">
                      <span className="font-semibold text-slate-700">Recommended Action:</span>{' '}
                      {selectedComplaint.aiAnalysis.suggestedAction}
                    </div>
                  )}
                  {selectedComplaint.aiAnalysis.detectedTags && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {selectedComplaint.aiAnalysis.detectedTags.map((tag, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-white border border-slate-200 text-slate-600 rounded text-[10px]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Location Map & Assigned Department Card */}
              <div className="lg:col-span-6 space-y-4">
                {/* Location Map Viewport */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-blue-600" />
                      <span>{selectedComplaint.location.address}</span>
                    </span>
                    <span className="font-mono text-[11px]">{selectedComplaint.location.ward}</span>
                  </div>
                  <MapPicker
                    latitude={selectedComplaint.location.latitude}
                    longitude={selectedComplaint.location.longitude}
                    address={selectedComplaint.location.address}
                    readOnly
                    height="200px"
                  />
                </div>

                {/* Assigned Department Card */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium uppercase tracking-wider text-[11px]">
                      Assigned Municipal Department
                    </span>
                    <span className="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 text-[10px] font-bold">
                      SLA: {selectedComplaint.aiAnalysis.slaTargetHours}h
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 pt-1">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">
                        {selectedComplaint.department || 'Awaiting Admin Routing'}
                      </p>
                      <p className="text-slate-500 text-[11px]">
                        Officer in Charge:{' '}
                        <span className="font-medium text-slate-700">
                          {selectedComplaint.assignedOfficer || 'Zonal Dispatch Queue'}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Timeline & Photographic Proof */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Departmental Progress & Proof</h3>
              <p className="text-xs text-slate-500">
                End-to-end audit trail from initial submission to verified photo closure
              </p>
            </div>

            <ComplaintTimeline complaint={selectedComplaint} />
          </div>
        </div>
      )}
    </div>
  );
};
