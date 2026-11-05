import { apiClient } from './api';
import { Complaint, Department, Severity, User } from '../types';

const apiError = (error: any): Error =>
  new Error(error.response?.data?.error || 'Unable to complete administrator request');

export const getOfficerDepartments = async (): Promise<Department[]> => {
  try {
    const response = await apiClient.get<{ officers: Array<{ department?: Department }> }>('/admin/officers');
    return [...new Set(response.data.officers.flatMap((officer) => officer.department ? [officer.department] : []))];
  } catch (error) {
    throw apiError(error);
  }
};

export const getAdminUsers = async (): Promise<User[]> => {
  try {
    const response = await apiClient.get<{ users: User[] }>('/admin/users');
    return response.data.users;
  } catch (error) {
    throw apiError(error);
  }
};

export const createOfficer = async (input: {
  name: string;
  email: string;
  password: string;
  department: Department;
}): Promise<User> => {
  try {
    const response = await apiClient.post<{ user: User }>('/admin/officers', input);
    return response.data.user;
  } catch (error) {
    throw apiError(error);
  }
};

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
