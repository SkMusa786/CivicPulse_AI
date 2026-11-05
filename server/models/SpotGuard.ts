import { Schema, model } from 'mongoose';

const spotGuardSchema = new Schema(
  {
    analysisId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    analysis: { type: Schema.Types.Mixed, required: true },
    originalImageUrl: { type: String, required: true },
    beautifiedImageUrl: { type: String, required: true },
  },
  { timestamps: true },
);

export const SpotGuardModel = model('SpotGuardAnalysis', spotGuardSchema);
