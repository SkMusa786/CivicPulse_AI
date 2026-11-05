import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../hooks/useComplaints';
import { uploadResolutionProof } from '../../services/departmentService';
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
import { useSearchParams, useNavigate } from 'react-router-dom';
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

  const selectedComplaint = deptComplaints.find((c) => c.id === selectedComplaintId) || deptComplaints[0];
  if (loading) return <div className="p-8 text-sm text-slate-500">Loading resolution queue...</div>;
  if (error) return <div className="p-8 space-y-3"><p className="text-sm text-rose-600">{error}</p><button onClick={retry} className="px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold">Retry</button></div>;

  useEffect(() => {
    if (selectedComplaint) {
      setSelectedComplaintId(selectedComplaint.id);
      setBeforeImage(selectedComplaint.imageUrl);

      if (selectedComplaint.resolutionProof) {
        setAfterImage(selectedComplaint.resolutionProof.afterImageUrl);
        setWorkDescription(selectedComplaint.resolutionProof.workDescription);
        setMaterialsUsed(selectedComplaint.resolutionProof.materialsUsed || '');
        setWorkOrderNumber(selectedComplaint.resolutionProof.workOrderNumber || `WO-${selectedComplaint.id.split('-').pop()}`);
      } else {
        setWorkOrderNumber(`WO-${activeDept.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`);
        // Default smart action description
        setWorkDescription(
          `Completed on-site civil repair in accordance with municipal standards. Restored surface integrity, cleared residual debris, and performed safety verification.`
        );
        setMaterialsUsed('Bituminous cold-patch aggregate, surface sealant, municipal compaction roller #CR-04');
        // Pre-fill a realistic completed after-image
        setAfterImage('https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80');
      }
    }
  }, [selectedComplaintId, complaints]);

  const sampleCompletedPresets = [
    {
      name: 'Asphalt Patch Repair (Roads)',
      url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Sanitized Dumpster Perimeter (Sanitation)',
      url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Restored LED Luminaire (Lighting)',
      url: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80',
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    if (!afterImage) {
      toast.error('Please upload or select an After image showing work completion.');
      return;
    }
    if (!workDescription.trim()) {
      toast.error('Please enter a work completion description.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await uploadResolutionProof(selectedComplaint.id, {
        beforeImageUrl: beforeImage || selectedComplaint.imageUrl,
        afterImageUrl: afterImage,
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
    } catch {
      toast.error('Failed to submit resolution proof.');
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
            {deptComplaints.map((c) => (
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

          {/* Quick Preset Selector for After Image */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-500">
              Select verified field completion photo preset:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {sampleCompletedPresets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAfterImage(preset.url)}
                  className={`p-2 rounded-lg border text-left text-xs font-semibold transition-all ${
                    afterImage === preset.url
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-600'
                      : 'border-slate-200 bg-slate-50 hover:bg-white text-slate-700'
                  }`}
                >
                  <div className="aspect-video w-full rounded overflow-hidden mb-1 bg-slate-200">
                    <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                  </div>
                  <span className="truncate block text-[11px]">{preset.name}</span>
                </button>
              ))}
            </div>
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
            Submitting will permanently transition this ticket to <span className="font-bold text-emerald-800">RESOLVED</span> and trigger an email closure notification to the citizen.
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
