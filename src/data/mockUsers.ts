import { User } from '../types';

export const DEMO_USERS: User[] = [
  {
    id: 'user-citizen-1',
    name: 'Rahul Sharma',
    email: 'citizen@civicai.com',
    role: 'citizen',
    title: 'Verified Resident Citizen',
    phone: '+1 (555) 234-5678',
    ward: 'Ward 14 - Metro Central',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
  },
  {
    id: 'user-admin-1',
    name: 'Priya Patel',
    email: 'admin@civicai.com',
    role: 'admin',
    title: 'Chief Municipal Grievance Officer (Verification Authority)',
    phone: '+1 (555) 876-5432',
    ward: 'Central Municipal Command',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
  },
  {
    id: 'user-dept-pwd',
    name: 'Er. Vikram Rao',
    email: 'officer@civicai.com',
    role: 'officer',
    department: 'Public Works Department',
    title: 'Municipal Field Engineering Authority (Resolution & POC Officer)',
    phone: '+1 (555) 345-6789',
    ward: 'Zonal Engineering Authority Depot',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
  },
];
