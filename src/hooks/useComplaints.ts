import { useCallback, useEffect, useState } from 'react';
import { Complaint } from '../types';
import { getComplaints } from '../services/complaintService';
import { getAdminComplaints } from '../services/adminService';
import { getDepartmentComplaints } from '../services/departmentService';

type ComplaintScope = 'citizen' | 'admin' | 'officer';

export const useComplaints = (scope: ComplaintScope, department?: string) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = scope === 'admin'
        ? await getAdminComplaints()
        : scope === 'officer'
          ? await getDepartmentComplaints(department as never)
          : await getComplaints();
      setComplaints(result);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load complaints');
    } finally {
      setLoading(false);
    }
  }, [scope, department]);

  useEffect(() => {
    void load();
  }, [load]);

  return { complaints, setComplaints, loading, error, retry: load };
};
