import { apiClient } from './api';
import { Complaint } from '../types';

const apiError = (error: any): Error =>
  new Error(error.response?.data?.error || 'Unable to complete complaint request');

export const getComplaints = async (): Promise<Complaint[]> => {
  try {
    const response = await apiClient.get('/complaints');
    return response.data.complaints;
  } catch (error) {
    throw apiError(error);
  }
};

export const getComplaintById = async (id: string): Promise<Complaint | null> => {
  try {
    const response = await apiClient.get(`/complaints/${encodeURIComponent(id.trim())}`);
    return response.data.complaint;
  } catch (error: any) {
    if (error.response?.status === 404) return null;
    throw apiError(error);
  }
};

export const createComplaint = async (
  complaintData: Omit<Complaint, 'id' | 'createdAt' | 'updatedAt' | 'statusTimeline'>,
): Promise<Complaint> => {
  try {
    const response = await apiClient.post('/complaints', complaintData);
    return response.data.complaint;
  } catch (error) {
    throw apiError(error);
  }
};
