import { apiClient } from './api';
import { Complaint, ComplaintStatus, Department, ResolutionProof } from '../types';

const apiError = (error: any): Error =>
  new Error(error.response?.data?.error || 'Unable to complete officer request');

export const getDepartmentComplaints = async (department?: Department): Promise<Complaint[]> => {
  try {
    const response = await apiClient.get('/department/complaints', { params: department ? { department } : undefined });
    return response.data.complaints;
  } catch (error) {
    throw apiError(error);
  }
};

export const updateDepartmentStatus = async (
  complaintId: string,
  newStatus: ComplaintStatus,
  note: string,
  officerName: string,
): Promise<Complaint> => {
  try {
    const response = await apiClient.put(`/department/complaints/${encodeURIComponent(complaintId)}/status`, {
      status: newStatus,
      note,
      officerName,
    });
    return response.data.complaint;
  } catch (error) {
    throw apiError(error);
  }
};

export const uploadResolutionProof = async (
  complaintId: string,
  proof: ResolutionProof,
): Promise<Complaint> => {
  try {
    const response = await apiClient.post(`/department/complaints/${encodeURIComponent(complaintId)}/proof`, proof);
    return response.data.complaint;
  } catch (error) {
    throw apiError(error);
  }
};
