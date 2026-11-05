export type UserRole = 'citizen' | 'admin' | 'officer' | 'department';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  department?: Department;
  title?: string;
  avatar?: string;
  phone?: string;
  ward?: string;
}

export type Severity = 'Low' | 'Medium' | 'High' | 'Critical';

export type ComplaintStatus =
  | 'Pending Admin Verification'
  | 'Verified'
  | 'Forwarded to Department'
  | 'In Progress'
  | 'Resolved'
  | 'Rejected';

export type Category =
  | 'Roads & Pavements'
  | 'Garbage & Sanitation'
  | 'Street Lighting'
  | 'Water Supply & Sewage'
  | 'Parks & Public Spaces'
  | 'Traffic & Signage'
  | 'Public Health & Hazards';

export type Department =
  | 'Public Works Department'
  | 'Sanitation & Solid Waste'
  | 'Electricity & Street Lighting'
  | 'Water Supply & Sewerage Board'
  | 'Horticulture & Parks'
  | 'Traffic Engineering Division'
  | 'Health & Safety Directorate';

export interface TimelineEntry {
  status: ComplaintStatus;
  timestamp: string;
  note: string;
  actor: string;
  role: UserRole;
}

export interface AIAnalysisResult {
  detectedIssue: string;
  issuePresent?: boolean;
  category: Category | null;
  severity: Severity | null;
  confidence: number;
  description: string;
  recommendedDepartment: Department | null;
  suggestedAction: string;
  detectedTags: string[];
  estimatedCostRange?: string | null;
  slaTargetHours: number;
  requiresManualReview?: boolean;
  processedAt: string;
}

export interface ResolutionProof {
  beforeImageUrl?: string;
  afterImageUrl: string;
  workDescription: string;
  completedDate: string;
  officerName: string;
  department: Department;
  materialsUsed?: string;
  workOrderNumber?: string;
}

export interface LocationInfo {
  address: string;
  latitude: number;
  longitude: number;
  landmark?: string;
  ward?: string;
  city: string;
  pincode?: string;
}

export interface Complaint {
  id: string;
  title: string;
  category: Category;
  severity: Severity;
  description: string;
  aiAnalysis: AIAnalysisResult;
  imageUrl: string;
  location: LocationInfo;
  status: ComplaintStatus;
  citizen: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  department?: Department;
  assignedOfficer?: string;
  assignedAt?: string;
  rejectionReason?: string;
  resolutionProof?: ResolutionProof;
  statusTimeline: TimelineEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  targetRole: UserRole | 'all';
  title: string;
  message: string;
  complaintId: string;
  complaintTitle: string;
  type: 'submitted' | 'verified' | 'forwarded' | 'in_progress' | 'resolved' | 'rejected';
  timestamp: string;
  read: boolean;
}

export interface DepartmentSummary {
  name: Department;
  shortCode: string;
  headOfficer: string;
  contactEmail: string;
  activeCount: number;
  resolvedCount: number;
  avgResolutionDays: number;
}

export interface SpotGuardIntervention {
  category: 'Green Hedge Shield' | 'Motion Lighting' | 'Low-Cost Fencing' | 'Wall Mural & Art' | 'Civic Deterrent Signage';
  title: string;
  description: string;
  materials: string[];
  estimatedCost: string;
  difficulty: string;
  implementationSteps: string[];
  expectedBenefit: string;
}

export interface SpotGuardAnalysis {
  id: string;
  spotName: string;
  detectedType: string;
  originalImageUrl: string;
  beautifiedImageUrl: string;
  vulnerabilityScore: number;
  vulnerabilityLevel: 'Moderate Risk' | 'High Risk' | 'Critical Risk';
  visibleConditions: string[];
  potentialRisks: string[];
  aiOverview: string;
  interventions: SpotGuardIntervention[];
  maintenanceTip: string;
  permissionsGuidance: string;
  municipalSupportAvailable: string[];
  previewLabel: string;
  createdAt: string;
}
