export const roleLabels = {
  student: 'Étudiant',
  teacher: 'Enseignant',
  admin: 'Admin',
};

export const ACTIVE_STATUSES = ['pending', 'approved'];
export const FINAL_STATUSES = ['rejected', 'completed', 'failed'];
export const ARCHIVED_STATUS = 'archived';

export const NON_ACTIVE_STATUSES = [...FINAL_STATUSES, ARCHIVED_STATUS];
