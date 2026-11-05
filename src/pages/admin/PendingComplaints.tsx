import React, { useState, useEffect } from 'react';
import { useComplaints } from '../../hooks/useComplaints';
import { getOfficerDepartments, verifyAndForwardComplaint, rejectComplaint } from '../../services/adminService';
import { Complaint, Department, Severity } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { MapPicker } from '../../components/MapPicker';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Building2,
  MapPin,
  Calendar,
  Sparkles,
  User,
  AlertTriangle,
  ArrowRight,
  Eye,
  Check,
  X,
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export const PendingComplaints: React.FC = () => {
  const { complaints, setComplaints, loading, error, retry } = useComplaints('admin');
  const [selectedForApproval, setSelectedForApproval] = useState<Complaint | null>(null);
  const [selectedForRejection, setSelectedForRejection] = useState<Complaint | null>(null);
  const [viewingComplaint, setViewingComplaint] = useState<Complaint | null>(null);

  // Approval modal state
  const [targetDept, setTargetDept] = useState<Department>('Public Works Department');
  const [targetSeverity, setTargetSeverity] = useState<Severity>('High');
  const [adminNotes, setAdminNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [departmentsList, setDepartmentsList] = useState<Department[]>([]);

  // Rejection modal state
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    void getOfficerDepartments().then((departments) => {
      setDepartmentsList(departments);
      if (departments.length > 0) setTargetDept(departments[0]);
    }).catch((loadError: unknown) => {
      toast.error(loadError instanceof Error ? loadError.message : 'Unable to load department officers.');
    });
  }, []);

  const pendingList = complaints.filter((c) => c.status === 'Pending Admin Verification');
  if (loading) return <div className="p-8 text-sm text-slate-500">Loading verification queue...</div>;
  if (error) return <div className="p-8 space-y-3"><p className="text-sm text-rose-600">{error}</p><button onClick={retry} className="px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold">Retry</button></div>;

  const handleOpenApproveModal = (complaint: Complaint) => {
    setSelectedForApproval(complaint);
    setTargetDept(complaint.department || complaint.aiAnalysis.recommendedDepartment || 'Public Works Department');
    setTargetSeverity(complaint.severity);
    setAdminNotes(`Verified by Municipal Control Room. Dispatched to ${complaint.department || complaint.aiAnalysis.recommendedDepartment || 'the selected department'}.`);
  };

  const handleConfirmApproval = async () => {
    if (!selectedForApproval) return;
    setIsProcessing(true);

    try {
      const res = await verifyAndForwardComplaint(
        selectedForApproval.id,
        targetDept,
        targetSeverity,
        adminNotes
      );
      if (res) {
        toast.success(`Complaint ${res.id} verified and forwarded to ${targetDept}!`);
        setComplaints((items) => items.map((item) => item.id === res.id ? res : item));
        setSelectedForApproval(null);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to verify complaint.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmRejection = async () => {
    if (!selectedForRejection || !rejectionReason.trim()) {
      toast.error('Please enter a rejection reason.');
      return;
    }
    setIsProcessing(true);

    try {
      const res = await rejectComplaint(selectedForRejection.id, rejectionReason);
      if (res) {
        toast.success(`Complaint ${res.id} rejected.`);
        setComplaints((items) => items.map((item) => item.id === res.id ? res : item));
        setSelectedForRejection(null);
        setRejectionReason('');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to reject complaint.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5" />
            <span>Supervisor Verification Queue</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            Pending Citizen Complaints ({pendingList.length})
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review AI defect predictions, inspect location accuracy, and route to the appropriate department.
          </p>
        </div>
      </div>

      {/* Complaints List */}
      {pendingList.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-dashed border-slate-200">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">All Grievances Verified</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            The verification inbox is currently empty. New citizen submissions will populate here automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingList.map((complaint) => (
            <div
              key={complaint.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:border-slate-300 transition-all p-5"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Photo & Priority badge */}
                <div className="lg:col-span-3 space-y-2">
                  <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-100 relative border border-slate-200">
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
                  <div className="text-[11px] text-slate-500 font-mono text-center">
                    ID: {complaint.id}
                  </div>
                </div>

                {/* Complaint Details */}
                <div className="lg:col-span-6 space-y-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-slate-500">{complaint.category}</span>
                      <span>·</span>
                      <span className="text-xs font-mono text-slate-400">
                        {new Date(complaint.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{complaint.title}</h3>
                    <p className="mt-1 text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {complaint.description}
                    </p>
                  </div>

                  {/* AI Detection Callout */}
                  <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-200 text-xs space-y-1">
                    <div className="flex items-center justify-between text-blue-900 font-bold">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        <span>AI Suggestion: {complaint.aiAnalysis.recommendedDepartment || 'None — review manually'}</span>
                      </span>
                      <span className="font-mono text-[11px]">
                        {(complaint.aiAnalysis.confidence * 100).toFixed(0)}% Match
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Recommended Action: {complaint.aiAnalysis.suggestedAction}
                    </p>
                    {complaint.aiAnalysis.requiresManualReview && (
                      <p className="text-[11px] font-semibold text-amber-800">
                        AI marked this report for manual review.
                      </p>
                    )}
                  </div>

                  {/* Citizen & Location Metadata */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{complaint.citizen.name} ({complaint.citizen.email})</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{complaint.location.address}</span>
                    </span>
                  </div>
                </div>

                {/* Admin Action Buttons */}
                <div className="lg:col-span-3 flex flex-col justify-center gap-2 border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-5">
                  <button
                    type="button"
                    onClick={() => handleOpenApproveModal(complaint)}
                    className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve & Verify</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedForRejection(complaint)}
                    className="w-full py-2 px-3 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
                  >
                    <X className="w-4 h-4" />
                    <span>Reject Complaint</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewingComplaint(complaint)}
                    className="w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect Details</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* APPROVE & VERIFY MODAL */}
      {selectedForApproval && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Approve & Forward Grievance</h3>
                  <p className="text-xs text-slate-500 font-mono">{selectedForApproval.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedForApproval(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Assign Municipal Department *
                </label>
                <select
                  value={targetDept}
                  onChange={(e) => setTargetDept(e.target.value as Department)}
                  disabled={departmentsList.length === 0}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-900 bg-white"
                >
                  {departmentsList.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                {departmentsList.length === 0 && (
                  <p className="mt-1 text-[11px] text-amber-700">No officer accounts are configured yet. Add an officer and assign a department before dispatching.</p>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Confirm / Override Severity Rating *
                </label>
                <select
                  value={targetSeverity}
                  onChange={(e) => setTargetSeverity(e.target.value as Severity)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-900 bg-white"
                >
                  <option value="Low">Low Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="High">High Priority</option>
                  <option value="Critical">Critical (Immediate Code Red)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Supervisor Notes / Instructions for Field Crew
                </label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedForApproval(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessing || departmentsList.length === 0}
                onClick={handleConfirmApproval}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
              >
                {isProcessing ? 'Dispatching...' : 'Confirm Verification & Dispatch'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {selectedForRejection && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Reject Complaint</h3>
                  <p className="text-xs text-slate-500 font-mono">{selectedForRejection.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedForRejection(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <label className="block font-bold text-slate-700 uppercase tracking-wider">
                Reason for Rejection *
              </label>
              <textarea
                rows={4}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain clearly why this complaint cannot be serviced (e.g. private property jurisdiction, valid daytime construction permit, duplicate report)..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900"
              />
              <p className="text-[11px] text-slate-500">
                This explanation will be delivered immediately to the reporting citizen via email and dashboard notification.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedForRejection(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessing || !rejectionReason.trim()}
                onClick={handleConfirmRejection}
                className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg disabled:opacity-50 shadow-xs"
              >
                {isProcessing ? 'Rejecting...' : 'Reject Complaint'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INSPECT FULL COMPLAINT MODAL */}
      {viewingComplaint && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">{viewingComplaint.title}</h3>
                <span className="font-mono text-xs text-blue-700">{viewingComplaint.id}</span>
              </div>
              <button
                type="button"
                onClick={() => setViewingComplaint(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-900">
              <img
                src={viewingComplaint.imageUrl}
                alt={viewingComplaint.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="text-xs space-y-2">
              <p className="text-slate-700 leading-relaxed">{viewingComplaint.description}</p>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <div><span className="font-semibold text-slate-800">Citizen:</span> {viewingComplaint.citizen.name} ({viewingComplaint.citizen.email})</div>
                <div><span className="font-semibold text-slate-800">Address:</span> {viewingComplaint.location.address}</div>
                <div><span className="font-semibold text-slate-800">Coordinates:</span> {viewingComplaint.location.latitude}, {viewingComplaint.location.longitude}</div>
              </div>
            </div>

            <div className="pt-2">
              <MapPicker
                latitude={viewingComplaint.location.latitude}
                longitude={viewingComplaint.location.longitude}
                address={viewingComplaint.location.address}
                readOnly
                height="220px"
              />
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setViewingComplaint(null)}
                className="px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
