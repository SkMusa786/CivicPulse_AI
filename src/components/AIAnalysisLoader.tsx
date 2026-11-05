import React from 'react';
import { Cpu, CheckCircle2, Loader2, Sparkles, ShieldAlert } from 'lucide-react';

interface AIAnalysisLoaderProps {
  currentStage: number; // 1 to 5
  stageText: string;
  progressPercent: number;
}

export const AIAnalysisLoader: React.FC<AIAnalysisLoaderProps> = ({
  currentStage,
  stageText,
  progressPercent,
}) => {
  const stages = [
    { num: 1, label: 'Secure image upload' },
    { num: 2, label: 'Gemini image analysis' },
  ];

  return (
    <div className="p-6 rounded-2xl border border-blue-200 bg-linear-to-b from-blue-50/70 to-white shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span>CivicAI Computer Vision Engine</span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800">
                GEMINI AI
              </span>
            </h4>
            <p className="text-xs text-slate-500">The API sends this image to Gemini for visual analysis.</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold font-mono text-blue-700 tabular-nums">
            {progressPercent}%
          </span>
          <span className="block text-[11px] text-slate-400 font-medium">Stage {currentStage} of 2</span>
        </div>
      </div>

      {/* Progress Track */}
      <div className="space-y-2">
        <div className="h-2 w-full bg-slate-200/80 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-teal-500 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-xs font-semibold text-blue-800 flex items-center gap-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
          <span>{stageText}</span>
        </p>
      </div>

      {/* Request stages */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-200/60">
        {stages.map((st) => {
          const isDone = currentStage > st.num || progressPercent >= 100;
          const isCurrent = currentStage === st.num && progressPercent < 100;

          return (
            <div
              key={st.num}
              className={`p-2.5 rounded-lg border text-left transition-all ${
                isDone
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                  : isCurrent
                  ? 'bg-blue-50 border-blue-300 text-blue-900 shadow-xs'
                  : 'bg-white/60 border-slate-200 text-slate-400 opacity-70'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
                ) : (
                  <span className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center text-[10px] font-mono text-slate-400">
                    {st.num}
                  </span>
                )}
                <span className="text-[11px] font-bold">Step {st.num}</span>
              </div>
              <p className="text-[11px] font-medium leading-snug truncate">{st.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
