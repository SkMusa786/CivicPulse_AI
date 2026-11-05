import { apiClient } from './api';
import { Complaint, Department, Severity } from '../types';

const apiError = (error: any): Error =>
  new Error(error.response?.data?.error || 'Unable to complete administrator request');

export const getAdminComplaints = async (): Promise<Complaint[]> => {
  try {
    const response = await apiClient.get('/admin/complaints');
    return response.data.complaints;
  } catch (error) {
    throw apiError(error);
  }
};

export const verifyAndForwardComplaint = async (
  complaintId: string,
  department: Department,
  severity?: Severity,
  adminNotes?: string,
): Promise<Complaint> => {
  try {
    const response = await apiClient.put(`/admin/complaints/${encodeURIComponent(complaintId)}/verify`, {
      department,
      severity,
      adminNotes,
    });
    return response.data.complaint;
  } catch (error) {
    throw apiError(error);
  }
};

export const rejectComplaint = async (complaintId: string, rejectionReason: string): Promise<Complaint> => {
  try {
    const response = await apiClient.put(`/admin/complaints/${encodeURIComponent(complaintId)}/reject`, {
      rejectionReason,
    });
    return response.data.complaint;
  } catch (error) {
    throw apiError(error);
  }
};
