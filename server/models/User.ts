import { Schema, model, type InferSchemaType } from 'mongoose';

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['citizen', 'admin', 'officer'], required: true, index: true },
    department: { type: String, trim: true },
    isDemoAccount: { type: Boolean, default: false, immutable: true },
  },
  { timestamps: true },
);

export type UserDocument = InferSchemaType<typeof userSchema> & { _id: string };
export const UserModel = model('User', userSchema);
