import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../hooks/useComplaints';
import { uploadResolutionProof } from '../../services/departmentService';
import { uploadImage } from '../../services/complaintService';
import { Complaint, Department } from '../../types';
import {
  CheckCircle2,
  UploadCloud,
  FileCheck,
  Calendar,
  Building2,
  User,
  ArrowRight,
  Sparkles,
  Camera,
  Check,
  RotateCcw,
} from 'lucide-react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

export const ResolutionProofPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialComplaintId = searchParams.get('complaintId') || '';

  const activeDept = currentUser.department || 'Public Works Department';
  const { complaints, loading, error, retry } = useComplaints('officer', activeDept);
  const [selectedComplaintId, setSelectedComplaintId] = useState(initialComplaintId);

  // Form fields
  const [beforeImage, setBeforeImage] = useState('');
  const [afterImage, setAfterImage] = useState('');
  const [afterImageFile, setAfterImageFile] = useState<File | null>(null);
  const [workDescription, setWorkDescription] = useState('');
  const [materialsUsed, setMaterialsUsed] = useState('');
  const [workOrderNumber, setWorkOrderNumber] = useState('');
  const [completedDate, setCompletedDate] = useState(new Date().toISOString().split('T')[0]);
  const [officerName, setOfficerName] = useState(currentUser.name);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter complaints assigned to this department
  const deptComplaints = complaints.filter(
    (c) => c.department === activeDept || (!c.department && c.aiAnalysis.recommendedDepartment === activeDept)
  );

  const eligibleComplaints = deptComplaints.filter((complaint) => complaint.status === 'In Progress');
  const selectedComplaint = eligibleComplaints.find((c) => c.id === selectedComplaintId) || eligibleComplaints[0];

  useEffect(() => {
    if (selectedComplaint) {
      setSelectedComplaintId(selectedComplaint.id);
      setBeforeImage(selectedComplaint.imageUrl);
      setAfterImageFile(null);

      if (selectedComplaint.resolutionProof) {
        setAfterImage(selectedComplaint.resolutionProof.afterImageUrl);
        setWorkDescription(selectedComplaint.resolutionProof.workDescription);
        setMaterialsUsed(selectedComplaint.resolutionProof.materialsUsed || '');
        setWorkOrderNumber(selectedComplaint.resolutionProof.workOrderNumber || `WO-${selectedComplaint.id.split('-').pop()}`);
      } else {
        setWorkOrderNumber(`WO-${activeDept.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`);
        setAfterImage('');
        setWorkDescription('');
        setMaterialsUsed('');
      }
    }
  }, [selectedComplaintId, complaints]);

  if (loading) return <div className="p-8 text-sm text-slate-500">Loading resolution queue...</div>;
  if (error) return <div className="p-8 space-y-3"><p className="text-sm text-rose-600">{error}</p><button onClick={retry} className="px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold">Retry</button></div>;
  if (!selectedComplaint) {
    return (
      <div className="p-8 text-center text-sm text-slate-600">
        <p>No assigned in-progress complaints are ready for resolution proof.</p>
        <Link to="/officer/assigned" className="mt-3 inline-block font-semibold text-blue-600">View assigned work</Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    if (!afterImageFile) {
      toast.error('Upload a real after photograph showing the completed work.');
      return;
    }
    if (!workDescription.trim()) {
      toast.error('Please enter a work completion description.');
      return;
    }

    setIsSubmitting(true);

    try {
      const afterImageUrl = await uploadImage(afterImageFile);
      const res = await uploadResolutionProof(selectedComplaint.id, {
        beforeImageUrl: beforeImage || selectedComplaint.imageUrl,
        afterImageUrl,
        workDescription,
        materialsUsed,
        workOrderNumber,
        completedDate,
        officerName,
        department: activeDept,
      });

      if (res) {
        toast.success(`POC delivered to citizen! Complaint ${res.id} marked as RESOLVED.`);
        setTimeout(() => {
          navigate(`/citizen/track?id=${res.id}`);
        }, 1200);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit resolution proof.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-16 max-w-4xl">
      <Toaster position="top-right" />

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider">
          <FileCheck className="w-4 h-4 text-emerald-600" />
          <span>Authorities POC (Proof of Completion) Portal</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
          Deliver POC (Proof of Completion) to Citizen & Close Ticket
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Attach before-and-after photographic documentation and sign off on completed work orders. The citizen will immediately receive the POC in their tracking timeline and notification center.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Ticket Selector Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
            Select Assigned Complaint Ticket *
          </label>
          <select
            value={selectedComplaintId}
            onChange={(e) => setSelectedComplaintId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold text-xs sm:text-sm text-slate-900 bg-white"
          >
            {eligibleComplaints.map((c) => (
              <option key={c.id} value={c.id}>
                {c.id} — {c.title} ({c.status})
              </option>
            ))}
          </select>

          {selectedComplaint && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="font-semibold text-slate-900">Address:</span> {selectedComplaint.location.address}
              </div>
              <div>
                <span className="font-semibold text-slate-900">Citizen:</span> {selectedComplaint.citizen.name}
              </div>
              <div>
                <span className="font-semibold text-slate-900">Current Status:</span>{' '}
                <span className="font-bold text-blue-700">{selectedComplaint.status}</span>
              </div>
            </div>
          )}
        </div>

        {/* Before and After Photograph Side-by-Side Upload */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-base">Photographic Documentation</h3>
            <span className="text-xs text-slate-500">Side-by-side verification required for closure</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Before Photo */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-rose-800 uppercase tracking-wider">
                1. Before Repair Photograph
              </label>
              <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-300 relative">
                {beforeImage ? (
                  <img
                    src={beforeImage}
                    alt="Before resolution"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                    No image available
                  </div>
                )}
                <div className="absolute top-2 left-2 bg-rose-600 text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-sm">
                  BEFORE (CITIZEN REPORT)
                </div>
              </div>
            </div>

            {/* After Photo */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  2. After Repair Photograph *
                </label>
                <span className="text-[11px] text-slate-400">Post-repair inspection</span>
              </div>

              <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-900 border-2 border-emerald-400 relative">
                {afterImage ? (
                  <img
                    src={afterImage}
                    alt="After resolution"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                    Please upload after image
                  </div>
                )}
                <div className="absolute top-2 left-2 bg-emerald-600 text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  <span>AFTER (COMPLETED PROOF)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="text-xs font-semibold text-slate-700" htmlFor="resolution-photo">
              Upload a real JPEG, PNG, or WEBP completion photograph (10 MB max)
            </label>
            <input
              id="resolution-photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              required={!selectedComplaint?.resolutionProof}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 10 * 1024 * 1024) {
                  toast.error('Choose a JPEG, PNG, or WEBP image no larger than 10 MB.');
                  event.target.value = '';
                  return;
                }
                setAfterImageFile(file);
                const reader = new FileReader();
                reader.onload = () => {
                  if (typeof reader.result === 'string') setAfterImage(reader.result);
                };
                reader.onerror = () => toast.error('Unable to preview this photograph.');
                reader.readAsDataURL(file);
              }}
              className="block w-full text-xs text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-3 file:py-2 file:font-semibold file:text-emerald-800"
            />
          </div>
        </div>

        {/* Work Order Details & Sign-off */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3">
            Action Taken & Official Sign-off
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Work Completion Description *
              </label>
              <textarea
                rows={3}
                required
                value={workDescription}
                onChange={(e) => setWorkDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 leading-relaxed"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Materials / Machinery Deployed
              </label>
              <input
                type="text"
                value={materialsUsed}
                onChange={(e) => setMaterialsUsed(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Work Order / Reference Number
              </label>
              <input
                type="text"
                value={workOrderNumber}
                onChange={(e) => setWorkOrderNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Date of Field Completion *
              </label>
              <input
                type="date"
                required
                value={completedDate}
                onChange={(e) => setCompletedDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Certifying Field Engineer / Officer Name *
              </label>
              <input
                type="text"
                required
                value={officerName}
                onChange={(e) => setOfficerName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-100 p-4 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-600">
            Submitting will permanently transition this ticket to <span className="font-bold text-emerald-800">RESOLVED</span> and create an in-app notification for the citizen.
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isSubmitting ? 'Delivering POC...' : 'Deliver POC to Citizen & Mark Resolved'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
