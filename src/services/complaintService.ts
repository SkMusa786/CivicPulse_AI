import { apiClient } from './api';
import { Complaint } from '../types';

const apiError = (error: unknown): Error => {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as { response?: { data?: { error?: string } } }).response;
    if (response?.data?.error) return new Error(response.data.error);
  }
  return new Error('Unable to complete complaint request');
};

export const uploadImage = async (file: File): Promise<string> => {
  try {
    const response = await apiClient.post<{ imageUrl: string }>('/uploads/image', file, {
      headers: { 'Content-Type': file.type },
      timeout: 120000,
    });
    return response.data.imageUrl;
  } catch (error) {
    throw apiError(error);
  }
};

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
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'response' in error) {
      const response = (error as { response?: { status?: number } }).response;
      if (response?.status === 404) return null;
    }
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
