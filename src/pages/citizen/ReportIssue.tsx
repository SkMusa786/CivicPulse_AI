import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ImageUploader } from '../../components/ImageUploader';
import { AIAnalysisLoader } from '../../components/AIAnalysisLoader';
import { MapPicker } from '../../components/MapPicker';
import { analyzeImageWithAI } from '../../services/aiService';
import { createComplaint, uploadImage } from '../../services/complaintService';
import { useNotifications } from '../../context/NotificationContext';
import {
  Category,
  Severity,
  Department,
  AIAnalysisResult,
  LocationInfo,
} from '../../types';
import {
  Sparkles,
  Cpu,
  MapPin,
  CheckCircle2,
  AlertCircle,
  FileText,
  Send,
  Building,
  ArrowRight,
  ShieldAlert,
  HelpCircle,
  Share2,
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export const ReportIssue: React.FC = () => {
  const { currentUser } = useAuth();
  const { retry: refreshNotifications } = useNotifications();
  const navigate = useNavigate();

  // Step 1: Image
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Step 2: AI Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStage, setAnalysisStage] = useState(1);
  const [analysisStageText, setAnalysisStageText] = useState('');
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);

  // Step 3: Editable Form Fields (AI Populated)
  const [problemTitle, setProblemTitle] = useState('');
  const [category, setCategory] = useState<Category>('Roads & Pavements');
  const [severity, setSeverity] = useState<Severity>('High');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState<Department>('Public Works Department');
  const [suggestedAction, setSuggestedAction] = useState('');

  // Step 4: Location
  const [location, setLocation] = useState<LocationInfo>({
    address: '',
    latitude: 20.5937,
    longitude: 78.9629,
    ward: '',
    city: '',
  });
  const [isLocationSelected, setIsLocationSelected] = useState(false);

  // Step 5: Submission & Confirmation
  const [confirmedAccurate, setConfirmedAccurate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const categoriesList: Category[] = [
    'Roads & Pavements',
    'Garbage & Sanitation',
    'Street Lighting',
    'Water Supply & Sewage',
    'Parks & Public Spaces',
    'Traffic & Signage',
    'Public Health & Hazards',
  ];

  const departmentsList: Department[] = [
    'Public Works Department',
    'Sanitation & Solid Waste',
    'Electricity & Street Lighting',
    'Water Supply & Sewerage Board',
    'Horticulture & Parks',
    'Traffic Engineering Division',
    'Health & Safety Directorate',
  ];

  const handleImageSelected = (file: File | null, preview: string | null) => {
    setSelectedFile(file);
    setPreviewUrl(preview);
    setAiResult(null);
    setProblemTitle('');
    setCategory('Roads & Pavements');
    setSeverity('High');
    setDescription('');
    setDepartment('Public Works Department');
    setSuggestedAction('');
  };

  const handleStartAIAnalysis = async () => {
    if (!selectedFile) {
      toast.error('Please upload an image before starting AI analysis.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisStage(1);
    setAnalysisProgress(0);
    setAnalysisStageText('Uploading image securely to CivicPulse AI...');

    try {
      const result = await analyzeImageWithAI(
        selectedFile,
        (stage, name, progress) => {
          setAnalysisStage(stage);
          setAnalysisStageText(name);
          setAnalysisProgress(progress);
        }
      );

      setAiResult(result);
      // Auto-populate editable form fields
      setProblemTitle(result.issuePresent ? result.detectedIssue : '');
      setDescription(result.description);
      if (result.issuePresent) {
        if (result.category) setCategory(result.category);
        if (result.severity) setSeverity(result.severity);
        if (result.recommendedDepartment) setDepartment(result.recommendedDepartment);
      }
      setSuggestedAction(result.suggestedAction);

      toast.success(result.issuePresent ? 'Gemini analysis complete. Review the suggested details.' : 'Image analyzed. Please review and enter the civic issue details manually.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to analyze image.');
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLocationPicked = (lat: number, lng: number, manualAddress?: string) => {
    setIsLocationSelected(true);
    setLocation((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      address: manualAddress || prev.address,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!previewUrl || !selectedFile) {
      toast.error('Please upload an image of the civic issue.');
      return;
    }
    if (!aiResult) {
      toast.error('Analyze the uploaded photograph before submitting the complaint.');
      return;
    }
    if (!problemTitle.trim()) {
      toast.error('Please provide a title for the civic issue.');
      return;
    }
    if (!description.trim()) {
      toast.error('Please provide a description.');
      return;
    }
    if (!confirmedAccurate) {
      toast.error('Please check the confirmation box before submitting.');
      return;
    }
    if (!isLocationSelected || !location.address.trim() || !Number.isFinite(location.latitude) || !Number.isFinite(location.longitude)) {
      toast.error('Enter the street address and set the map pin to the actual issue location.');
      return;
    }

    setIsSubmitting(true);

    try {
      const imageUrl = await uploadImage(selectedFile);
      const created = await createComplaint({
        title: problemTitle,
        category,
        severity,
        description,
        imageUrl,
        location,
        status: 'Pending Admin Verification',
        citizen: {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          phone: currentUser.phone,
        },
        department,
        aiAnalysis: aiResult,
      });

      setSubmittedId(created.id);
      await refreshNotifications();
      toast.success(`Complaint ${created.id} submitted successfully!`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to submit complaint. Please retry.');
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      <Toaster position="top-right" />

      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI-Assisted Grievance Submission</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
          Report a Public Infrastructure Problem
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Upload a clear photograph of the defect. CivicAI vision models will detect the issue, measure severity, and route it to the proper municipal department.
        </p>
      </div>

      {/* Success Modal / Card after Submission */}
      {submittedId ? (
        <div className="p-8 rounded-2xl bg-white border border-emerald-300 shadow-lg text-center space-y-6 max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Grievance Registered Successfully
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900">
              Complaint ID: <span className="text-blue-600 font-mono">{submittedId}</span>
            </h2>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Your report has been queued for Admin Verification. You will receive real-time email notifications as field crews are dispatched and proof of resolution is uploaded.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs space-y-1.5 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-500">Target SLA:</span>
              <span className="text-slate-900 font-bold">24-48 Hours</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Assigned Agency:</span>
              <span className="text-slate-900 font-bold">{department}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Location Ward:</span>
              <span className="text-slate-900 font-bold">{location.ward || 'Not specified'}</span>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(`/citizen/track?id=${submittedId}`)}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-colors flex items-center gap-2"
            >
              <span>Track Complaint Status</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setSubmittedId(null);
                setPreviewUrl(null);
                setSelectedFile(null);
                setAiResult(null);
                setProblemTitle('');
                setDescription('');
                setConfirmedAccurate(false);
              }}
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm border border-slate-300 transition-colors"
            >
              Report Another Problem
            </button>
          </div>
        </div>
      ) : (
        /* The 5-Step Complaint Submission Flow */
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* STEP 1: Upload Photograph */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center font-mono">
                  1
                </span>
                <h3 className="text-base font-bold text-slate-900">Upload Image</h3>
              </div>
              <span className="text-xs text-slate-500">High-resolution camera capture</span>
            </div>

            <ImageUploader
              onImageSelected={handleImageSelected}
              selectedPreview={previewUrl}
            />
          </div>

          {/* STEP 2: AI Vision Analysis Trigger & Animated Progress */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center font-mono">
                  2
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">AI Vision Diagnosis</h3>
                  <p className="text-xs text-slate-500">
                    Run computer vision to auto-detect defect geometry, severity and municipal jurisdiction.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleStartAIAnalysis}
                disabled={!selectedFile || isAnalyzing}
                className={`px-5 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
                  !selectedFile
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                    : isAnalyzing
                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 hover:shadow-lg'
                }`}
              >
                <Cpu className="w-4 h-4" />
                <span>{isAnalyzing ? 'Analyzing Image...' : 'Analyze with CivicAI'}</span>
              </button>
            </div>

            {/* AI Analysis Loader (when active) */}
            {isAnalyzing && (
              <AIAnalysisLoader
                currentStage={analysisStage}
                stageText={analysisStageText}
                progressPercent={analysisProgress}
              />
            )}

            {/* AI Diagnosis Result Summary Bar (if already completed) */}
            {aiResult && !isAnalyzing && (
              <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs ${
                aiResult.requiresManualReview ? 'border-amber-300 bg-amber-50' : 'border-emerald-200 bg-emerald-50/60'
              }`}>
                <div className={`flex items-center gap-2 font-semibold ${
                  aiResult.requiresManualReview ? 'text-amber-950' : 'text-emerald-950'
                }`}>
                  {aiResult.requiresManualReview
                    ? <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    : <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                  <span>
                    {aiResult.issuePresent ? 'Gemini diagnosis' : 'No recognizable issue was confirmed'}:
                    {' '}<span className="font-bold">{aiResult.detectedIssue}</span>
                    {' '}(Confidence: {(aiResult.confidence * 100).toFixed(1)}%)
                    {aiResult.requiresManualReview && ' — manual review required.'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {aiResult.issuePresent && (
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium">
                      Target SLA: {aiResult.slaTargetHours}h
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={handleStartAIAnalysis}
                    className="text-blue-600 hover:underline font-bold"
                  >
                    Re-run
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* STEP 3: AI-Generated Complaint Form (Editable) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center font-mono">
                  3
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Complaint Details <span className="text-xs text-blue-600 font-semibold">(AI Pre-filled & Editable)</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Review and customize all details before final submission.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Main Problem Title */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  Main Problem Title *
                </label>
                <input
                  type="text"
                  value={problemTitle}
                  onChange={(e) => setProblemTitle(e.target.value)}
                  placeholder="e.g., Deep Pothole on 4th Cross Avenue"
                  required
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-sm text-slate-900 transition-colors"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  Problem Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-sm text-slate-900 transition-colors bg-white"
                >
                  {categoriesList.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Severity */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  Severity Level *
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as Severity)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-sm text-slate-900 transition-colors bg-white font-semibold"
                >
                  <option value="Low">Low - Cosmetic defect / Minor inconvenience</option>
                  <option value="Medium">Medium - Walkway obstruction / Standard backlog</option>
                  <option value="High">High - Vehicle damage risk / Road bottleneck</option>
                  <option value="Critical">Critical - Immediate life/safety hazard</option>
                </select>
              </div>

              {/* Suggested Department */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  Suggested Municipal Department *
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value as Department)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-sm text-slate-900 transition-colors bg-white"
                >
                  {departmentsList.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Recommended Action */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  Recommended Action (AI Recommendation)
                </label>
                <input
                  type="text"
                  value={suggestedAction}
                  onChange={(e) => setSuggestedAction(e.target.value)}
                  placeholder="e.g. Cold-mix asphalt patch repair and road surface leveling"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-sm text-slate-900 transition-colors"
                />
              </div>

              {/* AI-Generated Description */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  Detailed Complaint Description *
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed observations about defect dimensions, surrounding hazards, and duration..."
                  required
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-sm text-slate-900 transition-colors leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* STEP 4: Location & Interactive Map */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center font-mono">
                  4
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Geographic Location</h3>
                  <p className="text-xs text-slate-500">
                    Position the pin precisely where the defect is located.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Map Viewport */}
              <div className="lg:col-span-7">
                <MapPicker
                  latitude={location.latitude}
                  longitude={location.longitude}
                  address={location.address}
                  height="340px"
                  onLocationChange={handleLocationPicked}
                />
              </div>

              {/* Address Form Inputs */}
              <div className="lg:col-span-5 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                    Street Address / Location *
                  </label>
                  <input
                    type="text"
                    value={location.address}
                    onChange={(e) =>
                      setLocation((prev) => ({ ...prev, address: e.target.value }))
                    }
                    placeholder="e.g. 4th Cross Ave, Near Central Metro Gate 2"
                    required
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={location.latitude}
                      onChange={(e) =>
                        {
                          setIsLocationSelected(true);
                          setLocation((prev) => ({
                            ...prev,
                            latitude: parseFloat(e.target.value) || 0,
                          }));
                        }
                      }
                      className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-300 bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={location.longitude}
                      onChange={(e) =>
                        {
                          setIsLocationSelected(true);
                          setLocation((prev) => ({
                            ...prev,
                            longitude: parseFloat(e.target.value) || 0,
                          }));
                        }
                      }
                      className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-300 bg-slate-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Landmark / Proximity
                  </label>
                  <input
                    type="text"
                    value={location.landmark || ''}
                    onChange={(e) =>
                      setLocation((prev) => ({ ...prev, landmark: e.target.value }))
                    }
                    placeholder="e.g. Next to Central Metro Gate 2"
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Municipal Ward
                  </label>
                  <input
                    type="text"
                    value={location.ward || ''}
                    onChange={(e) =>
                      setLocation((prev) => ({ ...prev, ward: e.target.value }))
                    }
                    placeholder="Ward 14 - Metro Central"
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* STEP 5: Final Confirmation & Submit Button */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center font-mono">
                5
              </span>
              <h3 className="text-base font-bold text-slate-900">Verification & Submission</h3>
            </div>

            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 space-y-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmedAccurate}
                  onChange={(e) => setConfirmedAccurate(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <span className="text-xs text-slate-700 leading-relaxed font-medium">
                  I confirm that the uploaded photograph accurately depicts an authentic public infrastructure problem and that all reported location and description details are truthful to the best of my knowledge.
                </span>
              </label>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="text-xs text-slate-500">
                Reporting as: <span className="font-bold text-slate-800">{currentUser.name}</span> ({currentUser.email})
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !confirmedAccurate}
                className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
                  !confirmedAccurate || isSubmitting
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25 hover:shadow-lg'
                }`}
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Registering Grievance...' : 'Submit Complaint'}</span>
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
