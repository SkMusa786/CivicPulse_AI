import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../hooks/useComplaints';
import { updateDepartmentStatus } from '../../services/departmentService';
import { Complaint, ComplaintStatus } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import {
  Building2,
  Clock,
  Wrench,
  CheckCircle2,
  Play,
  Check,
  MapPin,
  Calendar,
  User,
  ArrowRight,
  Sparkles,
  FileText,
  X,
  AlertTriangle,
  UploadCloud,
  FileCheck,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

export const AssignedComplaints: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const activeDept = currentUser.department || 'Public Works Department';

  const { complaints, setComplaints, loading, error, retry } = useComplaints('officer', activeDept);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  // Status update modal state
  const [progressModalOpen, setProgressModalOpen] = useState(false);
  const [progressStatus, setProgressStatus] = useState<ComplaintStatus>('In Progress');
  const [workStage, setWorkStage] = useState<'in_progress' | 'pending_materials' | 'site_survey' | 'night_shift'>('in_progress');
  const [progressNote, setProgressNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const deptComplaints = complaints.filter(
    (c) => c.department === activeDept || (!c.department && c.aiAnalysis.recommendedDepartment === activeDept)
  );

  const filtered = deptComplaints.filter((c) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'pending') return c.status === 'Forwarded to Department' || c.status === 'Verified';
    if (statusFilter === 'progress') return c.status === 'In Progress';
    if (statusFilter === 'resolved') return c.status === 'Resolved';
    return true;
  });
  if (loading) return <div className="p-8 text-sm text-slate-500">Loading assigned work orders...</div>;
  if (error) return <div className="p-8 space-y-3"><p className="text-sm text-rose-600">{error}</p><button onClick={retry} className="px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold">Retry</button></div>;

  const handleOpenStatusModal = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setProgressStatus(complaint.status === 'Forwarded to Department' ? 'In Progress' : complaint.status);
    setProgressNote(`Field crew dispatched to ${complaint.location.address}. Equipment active on site.`);
    setProgressModalOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedComplaint) return;
    setIsSubmitting(true);

    try {
      const res = await updateDepartmentStatus(
        selectedComplaint.id,
        progressStatus,
        progressNote,
        `${currentUser.name} (${activeDept})`
      );
      if (res) {
        toast.success(`Work status updated on ${res.id}!`);
        setComplaints((items) => items.map((item) => item.id === res.id ? res : item));
        setProgressModalOpen(false);
      }
    } catch {
      toast.error('Failed to update status.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDirectMarkDone = (complaint: Complaint) => {
    // Navigate directly to the POC upload page for this complaint
    navigate(`/department/proof?complaintId=${complaint.id}`);
  };

  return (
    <div className="space-y-6 pb-12">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 uppercase tracking-wider">
            <Building2 className="w-4 h-4 text-teal-600" />
            <span>Authorities Operations Console</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            Work Order Status & Proof of Completion (POC)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Logged in as <span className="font-bold text-slate-800">{currentUser.name}</span>. Update whether on-ground repair is pending, in-progress, or done. If done, deliver photographic POC to the citizen.
          </p>
        </div>

        <Link
          to="/department/proof"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-500/20 transition-all self-start sm:self-auto shrink-0"
        >
          <FileCheck className="w-4 h-4" />
          <span>Upload POC to Users</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 p-1 bg-white rounded-xl border border-slate-200 w-fit text-xs font-medium">
        <button
          type="button"
          onClick={() => setStatusFilter('all')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            statusFilter === 'all' ? 'bg-slate-900 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All Work Orders ({deptComplaints.length})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('pending')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            statusFilter === 'pending' ? 'bg-slate-900 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Work Not Done / In Queue ({deptComplaints.filter((c) => c.status === 'Forwarded to Department' || c.status === 'Verified').length})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('progress')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            statusFilter === 'progress' ? 'bg-slate-900 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          In Progress ({deptComplaints.filter((c) => c.status === 'In Progress').length})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('resolved')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            statusFilter === 'resolved' ? 'bg-slate-900 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Work Done & POC Delivered ({deptComplaints.filter((c) => c.status === 'Resolved').length})
        </button>
      </div>

      {/* Complaints List */}
      {filtered.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-dashed border-slate-200">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No complaints in this filter</h3>
          <p className="text-xs text-slate-500 mt-1">All assigned tasks in this state are up to date.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => {
            const isDone = item.status === 'Resolved';
            const isInProgress = item.status === 'In Progress';

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border overflow-hidden shadow-xs p-5 transition-all ${
                  isDone ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  {/* Photo & Badge */}
                  <div className="lg:col-span-3 space-y-2">
                    <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-900 relative border border-slate-200">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-2 left-2">
                        <StatusBadge severity={item.severity} />
                      </div>
                      {isDone && (
                        <div className="absolute bottom-2 left-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>POC DELIVERED</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 px-1">
                      <span className="font-bold text-blue-700">{item.id}</span>
                      <span>SLA: {item.aiAnalysis.slaTargetHours}h</span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="lg:col-span-5 space-y-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <StatusBadge status={item.status} />
                        <span className="text-xs text-slate-400 font-mono">
                          Received {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                      <p className="mt-1 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
                      <div className="font-bold text-slate-800 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        <span>Recommended Engineering Action:</span>
                      </div>
                      <p className="text-[11px] text-slate-600">{item.aiAnalysis.suggestedAction}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate max-w-[200px]">{item.location.address}</span>
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.citizen.name}</span>
                      </span>
                    </div>
                  </div>

                  {/* Operational Status & POC Actions (Right Column) */}
                  <div className="lg:col-span-4 flex flex-col justify-center gap-2.5 border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-5">
                    {/* Primary Button: Work Done -> Upload POC */}
                    <button
                      type="button"
                      onClick={() => handleDirectMarkDone(item)}
                      className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 ${
                        isDone
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20'
                      }`}
                    >
                      <FileCheck className="w-4 h-4" />
                      <span>{isDone ? 'Inspect Delivered POC' : 'Work Done? Upload POC to User'}</span>
                    </button>

                    {/* Secondary Button: Work Not Done / In Progress */}
                    {!isDone && (
                      <button
                        type="button"
                        onClick={() => handleOpenStatusModal(item)}
                        className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Wrench className="w-3.5 h-3.5 text-slate-600" />
                        <span>{isInProgress ? 'Update Work In Progress' : 'Work Not Done / Set In Progress'}</span>
                      </button>
                    )}

                    {/* Link to public citizen tracking view */}
                    <Link
                      to={`/citizen/track?id=${item.id}`}
                      className="text-center text-[11px] text-blue-600 hover:underline pt-1 flex items-center justify-center gap-1"
                    >
                      <span>Preview Citizen Progress Timeline</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* UPDATE STATUS MODAL */}
      {progressModalOpen && selectedComplaint && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Update Work Progress</h3>
                <p className="text-xs text-slate-500 font-mono">{selectedComplaint.id}</p>
              </div>
              <button
                type="button"
                onClick={() => setProgressModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Current Status
                </label>
                <select
                  value={progressStatus}
                  onChange={(e) => setProgressStatus(e.target.value as ComplaintStatus)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-semibold text-xs text-slate-900 bg-white"
                >
                  <option value="In Progress">Work In Progress (Crew active on-site)</option>
                  <option value="Forwarded to Department">Work Pending / Queued (Not yet commenced)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Operational Reason / Notes for Citizens & Control Room *
                </label>
                <textarea
                  rows={3}
                  value={progressNote}
                  onChange={(e) => setProgressNote(e.target.value)}
                  placeholder="e.g. Field crew dispatched, surface leveling started / delayed awaiting bituminous delivery..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900"
                />
              </div>

              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px] space-y-1">
                <span className="font-bold block">Is the work fully finished?</span>
                <p>
                  If repair is complete, please use the <b>Upload POC to User</b> button to attach photographic proof of resolution.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setProgressModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleUpdateStatus}
                className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
              >
                {isSubmitting ? 'Updating...' : 'Save Work Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
