import { NotificationModel } from './models/Notification';

export const notify = async (input: {
  userId: string;
  targetRole: string;
  title: string;
  message: string;
  complaintId: string;
  complaintTitle: string;
  type: string;
}) => NotificationModel.create(input);
