import { Schema, model } from 'mongoose';

const notificationSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    targetRole: { type: String, required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    complaintId: { type: String, required: true },
    complaintTitle: { type: String, required: true },
    type: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const NotificationModel = model('Notification', notificationSchema);
