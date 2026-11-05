import React, { useState } from 'react';
import { analyzeSpotGuardWithAI } from '../../services/aiService';
import { SpotGuardAnalysis } from '../../types';
import {
  ShieldAlert,
  Sparkles,
  Leaf,
  Lightbulb,
  Fence,
  Palette,
  AlertTriangle,
  UploadCloud,
  CheckCircle2,
  Cpu,
  Loader2,
  ArrowRight,
  Share2,
  Download,
  Building2,
  RefreshCw,
  Eye,
  Check,
  Zap,
  Info,
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export const SpotGuardPage: React.FC = () => {
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStageText, setAnalysisStageText] = useState('');
  const [analysisResult, setAnalysisResult] = useState<SpotGuardAnalysis | null>(null);

  // Comparison slider
  const [sliderPosition, setSliderPosition] = useState(50);
  const [viewMode, setViewMode] = useState<'slider' | 'side-by-side'>('side-by-side');

  // Municipal request state
  const [municipalRequested, setMunicipalRequested] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        toast.error('Upload a JPEG, PNG, or WEBP image.');
        e.target.value = '';
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image files must be 10 MB or smaller.');
        e.target.value = '';
        return;
      }
      setUploadedFile(file);
      setAnalysisResult(null);
      setMunicipalRequested(false);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') setCustomImage(reader.result);
        else toast.error('Unable to read this image file.');
      };
      reader.onerror = () => toast.error('Unable to read this image file.');
      reader.readAsDataURL(file);
    }
  };

  const handleRunAnalysis = async () => {
    if (!uploadedFile) {
      toast.error('Please upload a spot photograph first.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress(10);
    setAnalysisStageText('Scanning spatial perimeter & lighting conditions...');

    try {
      const result = await analyzeSpotGuardWithAI(
        uploadedFile,
        (stage, name, progress) => {
          setAnalysisProgress(progress);
          setAnalysisStageText(name);
        }
      );

      setAnalysisResult(result);
      toast.success('Gemini analysis and conceptual preview generated.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to analyze spot.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRequestMunicipalAssistance = () => {
    setMunicipalRequested(true);
    toast.success('Marked for discussion. No request has been sent to the municipality.');
  };

  const handleSharePlan = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Neighborhood SpotGuard Prevention Blueprint link copied!');
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Green Hedge Shield':
        return <Leaf className="w-4 h-4 text-emerald-600" />;
      case 'Motion Lighting':
        return <Lightbulb className="w-4 h-4 text-amber-500" />;
      case 'Low-Cost Fencing':
        return <Fence className="w-4 h-4 text-blue-600" />;
      case 'Wall Mural & Art':
        return <Palette className="w-4 h-4 text-purple-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
    }
  };

  return (
    <div className="space-y-8 pb-16">
      <Toaster position="top-right" />

      {/* Proactive Hero Callout Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-teal-800 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs border border-white/20 text-teal-200 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>CivicAI SpotGuard · Proactive Urban Shield</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Make overlooked spaces <span className="text-teal-300">safer</span> and more welcoming.
          </h1>

          <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
            Upload a photograph to identify visible conditions, consider potential environmental risks without assuming incidents, and explore practical improvements. Suggestions are conceptual and any work on public land requires approval from the responsible authority.
          </p>
        </div>
      </div>

      {/* STEP 1: Upload or Choose Vulnerable Spot */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              1. Take or Upload Photograph of Vulnerable Spot
            </h3>
            <p className="text-xs text-slate-500">
              Capture any empty open space, bare perimeter wall, or dark roadside recess
            </p>
          </div>
          <span className="text-xs font-semibold text-blue-600">Proactive Prevention Engine</span>
        </div>

        {/* Upload Zone */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 space-y-3">
            <label className="block border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-6 text-center cursor-pointer transition-all bg-slate-50/50 hover:bg-white group">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileUpload}
                className="hidden"
              />
              <UploadCloud className="w-10 h-10 mx-auto mb-2 text-slate-400 group-hover:text-blue-600 transition-colors" />
              <p className="text-xs font-bold text-slate-800">Click to upload your own spot photo</p>
              <p className="text-[11px] text-slate-400 mt-0.5">JPG, PNG, WEBP from camera (up to 10 MB)</p>
            </label>
          </div>

          {/* Preview Box & Analyze Trigger */}
          <div className="lg:col-span-7 space-y-4">
            <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-900 aspect-video relative shadow-xs">
              {customImage ? (
                <img
                  src={customImage}
                  alt="Vulnerable Spot"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                  Upload an image to preview
                </div>
              )}
              {customImage && (
                <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>UPLOADED LOCATION</span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleRunAnalysis}
              disabled={isAnalyzing || !uploadedFile}
              className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-teal-300" />
              <span>{isAnalyzing ? 'Analyzing Spatial Vulnerabilities...' : 'Analyze Spot & Generate Beautification Shield'}</span>
            </button>
          </div>
        </div>

        {/* AI Analysis Loader (when active) */}
        {isAnalyzing && (
          <div className="p-6 rounded-2xl border border-blue-200 bg-blue-50/50 space-y-3 animate-pulse">
            <div className="flex items-center justify-between text-xs font-bold text-blue-900">
              <span className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-blue-600 animate-spin" />
                <span>{analysisStageText}</span>
              </span>
              <span className="font-mono text-sm">{analysisProgress}%</span>
            </div>
            <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-teal-500 transition-all duration-300 rounded-full"
                style={{ width: `${analysisProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* STEP 2: AI Visual Transformation Blueprint */}
      {analysisResult && !isAnalyzing && (
        <div className="space-y-6">
          {/* Risk Score & Diagnosis Header */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                    Visible Conditions & Potential Risks
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">
                  {analysisResult.spotName}
                </h2>
                <p className="text-xs text-slate-500">{analysisResult.detectedType}</p>
              </div>

              {/* Risk Meter Badge */}
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold text-sm">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-rose-800 font-bold uppercase tracking-wider">
                    {analysisResult.vulnerabilityLevel}
                  </div>
                  <div className="text-lg font-bold font-mono text-rose-900 tabular-nums">
                    {analysisResult.vulnerabilityScore}% Indicative Exposure Score
                  </div>
                </div>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
              {analysisResult.aiOverview}
            </p>

            <p className="text-[11px] text-slate-500">
              This advisory score reflects visible environmental features only; it is not evidence that an incident has occurred.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
                  Visible conditions
                </span>
                <div className="grid grid-cols-1 gap-2 text-xs">
                  {analysisResult.visibleConditions.map((factor, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
                    <Eye className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                    <span>{factor}</span>
                  </div>
                ))}
                </div>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
                  Potential risks (not assumed incidents)
                </span>
                <div className="grid grid-cols-1 gap-2 text-xs">
                  {analysisResult.potentialRisks.map((factor, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-slate-700">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <span>{factor}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Visual Transformation Showcase (Side-by-Side & Interactive Slider) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  AI-Generated Conceptual Preview
                </h3>
                <p className="text-xs text-slate-500">
                  An illustrative proposal based on this uploaded location. The same layout is used as a guide, but generated details may differ.
                </p>
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setViewMode('side-by-side')}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    viewMode === 'side-by-side' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
                  }`}
                >
                  Side-by-Side
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('slider')}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    viewMode === 'slider' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
                  }`}
                >
                  Interactive Slider
                </button>
              </div>
            </div>

            {viewMode === 'side-by-side' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Before */}
                <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-900 shadow-xs">
                  <div className="relative aspect-video">
                    <img
                      src={analysisResult.originalImageUrl}
                      alt="Before"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2 left-2 bg-rose-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded shadow-sm">
                      ORIGINAL UPLOADED PHOTO
                    </div>
                  </div>
                  <div className="p-3 text-xs text-slate-600 bg-slate-50 border-t border-slate-100">
                    Source image for the recommendations above.
                  </div>
                </div>

                {/* After / Beautified */}
                <div className="rounded-xl border border-emerald-300 overflow-hidden bg-slate-900 shadow-xs ring-1 ring-emerald-200">
                  <div className="relative aspect-video">
                    <img
                      src={analysisResult.beautifiedImageUrl}
                      alt="AI-generated conceptual improvement preview"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2 left-2 bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded shadow-sm flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>AI CONCEPT PREVIEW</span>
                    </div>
                  </div>
                  <div className="p-3 text-xs text-emerald-900 bg-emerald-50 border-t border-emerald-200 font-semibold">
                    {analysisResult.previewLabel}
                  </div>
                </div>
              </div>
            ) : (
              /* Slider mode */
              <div className="relative aspect-video w-full max-h-[420px] rounded-2xl overflow-hidden border border-slate-300 shadow-sm select-none">
                <img
                  src={analysisResult.beautifiedImageUrl}
                  alt="Beautified"
                  className="absolute inset-0 w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${sliderPosition}%` }}
                >
                  <img
                    src={analysisResult.originalImageUrl}
                    alt="Original"
                    className="absolute inset-0 w-full h-full object-cover max-w-none"
                    style={{ width: '100%' }}
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div
                  className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize shadow-md"
                  style={{ left: `${sliderPosition}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white shadow-lg border border-slate-300 flex items-center justify-center text-slate-800 text-xs font-bold">
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
                  BEFORE: VULNERABLE SPOT
                </div>
                <div className="absolute top-3 right-3 bg-emerald-600/90 text-white text-xs font-bold px-2 py-0.5 rounded pointer-events-none">
                  AI CONCEPT PREVIEW
                </div>
              </div>
            )}
          </div>

          {/* STEP 3: Recommended Interventions Grid */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Actionable Prevention Interventions (DIY & Community)
              </h3>
              <p className="text-xs text-slate-500">
                Practical, indicative options to review with the responsible authority before any work begins.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysisResult.interventions.map((item, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-white transition-all space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800">
                        {getCategoryIcon(item.category)}
                        <span>{item.category}</span>
                      </span>
                      <span className="text-[11px] font-bold font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                        {item.expectedBenefit}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 text-[11px] space-y-1.5">
                    <div className="flex justify-between text-slate-500">
                      <span>Estimated Cost:</span>
                      <span className="font-bold text-slate-800 font-mono">{item.estimatedCost}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Effort Level:</span>
                      <span className="font-semibold text-slate-700">{item.difficulty}</span>
                    </div>
                    <div className="text-slate-600 pt-1">
                      <span className="font-semibold text-slate-700">Materials:</span>{' '}
                      {item.materials.join(', ')}
                    </div>
                    <div className="text-slate-600 pt-1">
                      <span className="font-semibold text-slate-700">Implementation:</span>
                      <ol className="list-decimal pl-4 mt-1 space-y-0.5">
                        {item.implementationSteps.map((step, stepIndex) => <li key={stepIndex}>{step}</li>)}
                      </ol>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Maintenance tip */}
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-900 flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-600 shrink-0" />
              <span><b>Maintenance Guidance:</b> {analysisResult.maintenanceTip}</span>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-700 shrink-0" />
              <span><b>Permissions & Access:</b> {analysisResult.permissionsGuidance}</span>
            </div>
          </div>

          {/* STEP 4: Citizen Action Toolbar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Take Action in Your Neighborhood</h4>
              <p className="text-xs text-slate-500">
                Partner with municipal nurseries or coordinate with your Resident Welfare Association (RWA)
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={handleSharePlan}
                className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Share with Neighbors</span>
              </button>

              <button
                type="button"
                onClick={handleRequestMunicipalAssistance}
                disabled={municipalRequested}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                  municipalRequested
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20'
                }`}
              >
                {municipalRequested ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Marked for discussion (not sent)</span>
                  </>
                ) : (
                  <>
                    <Building2 className="w-4 h-4" />
                    <span>Mark for municipal discussion</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
