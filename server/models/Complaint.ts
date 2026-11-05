import { Schema, model } from 'mongoose';

const timelineSchema = new Schema(
  {
    status: { type: String, required: true },
    timestamp: { type: Date, required: true },
    note: { type: String, required: true },
    actor: { type: String, required: true },
    role: { type: String, required: true },
  },
  { _id: false },
);

const complaintSchema = new Schema(
  {
    complaintId: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true },
    severity: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    location: { type: Schema.Types.Mixed, required: true },
    status: { type: String, required: true, index: true },
    citizen: { type: Schema.Types.Mixed, required: true },
    department: { type: String, index: true },
    assignedOfficer: { type: String },
    rejectionReason: { type: String },
    aiAnalysis: { type: Schema.Types.Mixed, required: true },
    resolutionProof: { type: Schema.Types.Mixed },
    statusTimeline: { type: [timelineSchema], default: [] },
  },
  { timestamps: true },
);

export const ComplaintModel = model('Complaint', complaintSchema);
