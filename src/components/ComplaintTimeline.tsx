import React, { useState } from 'react';
import { Complaint, ComplaintStatus } from '../types';
import { CheckCircle2, Clock, ShieldCheck, ArrowRight, Wrench, CheckCheck, FileCheck, Eye } from 'lucide-react';

interface ComplaintTimelineProps {
  complaint: Complaint;
}

export const ComplaintTimeline: React.FC<ComplaintTimelineProps> = ({ complaint }) => {
  const [activeTab, setActiveTab] = useState<'slider' | 'side-by-side'>('side-by-side');
  const [sliderPosition, setSliderPosition] = useState(50);

  const steps: { status: ComplaintStatus; title: string; desc: string; icon: any }[] = [
    {
      status: 'Pending Admin Verification',
      title: 'Complaint Submitted',
      desc: 'Citizen uploaded photograph & AI analysis generated.',
      icon: Clock,
    },
    {
      status: 'Verified',
      title: 'Admin Verified',
      desc: 'Municipal operator inspected and validated problem authenticity.',
      icon: ShieldCheck,
    },
    {
      status: 'Forwarded to Department',
      title: 'Forwarded to Department',
      desc: `Dispatched to ${complaint.department || 'responsible agency'}.`,
      icon: ArrowRight,
    },
    {
      status: 'In Progress',
      title: 'Work In Progress',
      desc: 'Field crew assigned and maintenance operations commenced.',
      icon: Wrench,
    },
    {
      status: 'Resolved',
      title: 'Issue Resolved & Proof Uploaded',
      desc: 'Maintenance completed with before & after photographic verification.',
      icon: CheckCheck,
    },
  ];

  // Determine current step index
  const statusHierarchy: ComplaintStatus[] = [
    'Pending Admin Verification',
    'Verified',
    'Forwarded to Department',
    'In Progress',
    'Resolved',
  ];

  const isRejected = complaint.status === 'Rejected';
  const currentStepIdx = isRejected
    ? -1
    : statusHierarchy.indexOf(complaint.status as any);

  return (
    <div className="space-y-6">
      {/* Rejection banner if rejected */}
      {isRejected && (
        <div className="p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-800">
          <h4 className="font-semibold text-sm">Complaint Not Actionable (Rejected)</h4>
          <p className="mt-1 text-xs text-rose-700">
            {complaint.rejectionReason || 'The submitted defect did not qualify for municipal work order dispatch.'}
          </p>
        </div>
      )}

      {/* Progress Timeline */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {steps.map((st, index) => {
          const isDone = !isRejected && currentStepIdx >= index;
          const isCurrent = !isRejected && currentStepIdx === index;
          const IconComponent = st.icon;

          // Find matching event from complaint.statusTimeline
          const matchedEvent = complaint.statusTimeline.find(
            (e) => e.status === st.status || (st.status === 'Resolved' && e.status === 'Resolved')
          );

          return (
            <div key={st.status} className="relative group">
              {/* Step indicator dot/icon */}
              <div
                className={`absolute -left-6 top-0 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${
                  isDone
                    ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                    : isCurrent
                    ? 'bg-white border-blue-600 text-blue-600 ring-4 ring-blue-100'
                    : 'bg-white border-slate-300 text-slate-300'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-slate-300" />
                )}
              </div>

              {/* Step Content */}
              <div
                className={`p-4 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-blue-50/50 border-blue-200 shadow-xs'
                    : isDone
                    ? 'bg-white border-slate-200'
                    : 'bg-slate-50/50 border-slate-100 opacity-60'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <IconComponent
                      className={`w-4 h-4 ${
                        isDone || isCurrent ? 'text-blue-600' : 'text-slate-400'
                      }`}
                    />
                    <h5
                      className={`text-sm font-bold ${
                        isCurrent ? 'text-blue-900' : isDone ? 'text-slate-900' : 'text-slate-500'
                      }`}
                    >
                      {st.title}
                    </h5>
                  </div>
                  {matchedEvent && (
                    <span className="text-xs font-mono text-slate-500 tabular-nums">
                      {new Date(matchedEvent.timestamp).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  )}
                </div>

                <p className="mt-1 text-xs text-slate-600">{st.desc}</p>

                {matchedEvent && matchedEvent.note && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 text-xs text-slate-700 bg-slate-50/70 p-2 rounded-md">
                    <span className="font-semibold text-slate-900">{matchedEvent.actor}:</span>{' '}
                    <span>{matchedEvent.note}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Before and After Photographic Resolution Proof (If Resolved) */}
      {complaint.resolutionProof && (
        <div className="mt-8 p-6 rounded-2xl border border-emerald-200 bg-linear-to-b from-emerald-50/60 to-white shadow-sm space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                <FileCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-emerald-950">
                  Official POC (Proof of Completion) Delivered by Authorities
                </h4>
                <p className="text-xs text-emerald-800/80">
                  Uploaded by {complaint.resolutionProof.officerName} ({complaint.resolutionProof.department})
                </p>
              </div>
            </div>

            {/* Toggle view mode */}
            <div className="flex items-center gap-1 p-1 bg-white rounded-lg border border-slate-200 text-xs font-medium">
              <button
                type="button"
                onClick={() => setActiveTab('side-by-side')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  activeTab === 'side-by-side' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Side-by-Side
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('slider')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  activeTab === 'slider' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Interactive Slider
              </button>
            </div>
          </div>

          {/* Visual Showcase */}
          {activeTab === 'side-by-side' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Before */}
              <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-xs">
                <div className="relative aspect-video bg-slate-900">
                  <img
                    src={complaint.resolutionProof.beforeImageUrl || complaint.imageUrl}
                    alt="Before resolution"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2 left-2 bg-rose-600 text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-sm">
                    BEFORE REPAIR
                  </div>
                </div>
                <div className="p-3 text-xs text-slate-600">
                  <span className="font-medium text-slate-800">Original Reported Defect</span>
                </div>
              </div>

              {/* After */}
              <div className="rounded-xl border border-emerald-300 overflow-hidden bg-white shadow-xs ring-1 ring-emerald-200">
                <div className="relative aspect-video bg-slate-900">
                  <img
                    src={complaint.resolutionProof.afterImageUrl}
                    alt="After resolution"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2 left-2 bg-emerald-600 text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
                    <CheckCheck className="w-3 h-3" />
                    <span>AFTER RESOLUTION</span>
                  </div>
                </div>
                <div className="p-3 text-xs text-slate-600">
                  <span className="font-medium text-emerald-800">Verified Work Completed</span>
                </div>
              </div>
            </div>
          ) : (
            /* Interactive Comparison Slider */
            <div className="relative aspect-video w-full max-h-96 rounded-xl overflow-hidden border border-slate-300 shadow-sm select-none">
              <img
                src={complaint.resolutionProof.afterImageUrl}
                alt="After"
                className="absolute inset-0 w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${sliderPosition}%` }}
              >
                <img
                  src={complaint.resolutionProof.beforeImageUrl || complaint.imageUrl}
                  alt="Before"
                  className="absolute inset-0 w-full h-full object-cover max-w-none"
                  style={{ width: '100%' }}
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Slider control line */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize shadow-md"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white shadow-lg border border-slate-300 flex items-center justify-center text-slate-700 text-xs font-bold">
                  ↔
                </div>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                value={sliderPosition}
                onChange={(e) => setSliderPosition(Number(e.target.value))}
                className="absolute inset-0 opacity-0 cursor-ew-resize w-full h-full"
              />

              <div className="absolute top-3 left-3 bg-rose-600/90 text-white text-xs font-bold px-2 py-0.5 rounded pointer-events-none">
                BEFORE
              </div>
              <div className="absolute top-3 right-3 bg-emerald-600/90 text-white text-xs font-bold px-2 py-0.5 rounded pointer-events-none">
                AFTER
              </div>
            </div>
          )}

          {/* Action Taken Description Box */}
          <div className="bg-white p-4 rounded-xl border border-emerald-100 text-xs text-slate-700 space-y-2">
            <div>
              <span className="font-bold text-slate-900 block text-xs">Action Taken & Materials:</span>
              <p className="mt-0.5 text-slate-600 leading-relaxed">
                {complaint.resolutionProof.workDescription}
              </p>
            </div>
            {complaint.resolutionProof.materialsUsed && (
              <div className="pt-2 border-t border-slate-100 text-slate-500">
                <span className="font-semibold text-slate-700">Materials / Equipment:</span>{' '}
                {complaint.resolutionProof.materialsUsed}
              </div>
            )}
            <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500 font-mono">
              <span>Work Order: {complaint.resolutionProof.workOrderNumber || 'WO-COMP-2024'}</span>
              <span>
                Completed: {new Date(complaint.resolutionProof.completedDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
