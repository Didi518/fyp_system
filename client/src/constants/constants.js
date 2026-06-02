export const roleLabels = {
  student: 'Étudiant',
  teacher: 'Enseignant',
  admin: 'Admin',
};

export const PROJECT_STATUS = {
  pending: {
    label: 'En attente',
    className: 'bg-yellow-100 text-yellow-800',
  },
  approved: {
    label: 'Approuvé',
    className: 'bg-blue-100 text-blue-800',
  },
  rejected: {
    label: 'Refusé',
    className: 'bg-orange-100 text-orange-800',
  },
  completed: {
    label: 'Complété',
    className: 'bg-green-100 text-green-800',
  },
  failed: {
    label: 'Échoué',
    className: 'bg-red-100 text-red-800',
  },
};

export const NOTIFICATION_TYPES = {
  request: 'demande',
  approval: 'approbation',
  rejection: 'refus',
  feedback: 'retour',
  deadline: 'date limite',
  general: 'générale',
  meeting: 'réunion',
  system: 'Système',
};

export const NOTIFICATION_PRIORITIES = {
  low: 'faible',
  medium: 'moyenne',
  high: 'élevée',
};
