import { useEffect } from 'react';
import {
  AlertTriangleIcon,
  BadgeCheckIcon,
  MessageCircleIcon,
} from 'lucide-react';

import { useStudent } from '../../hooks';

const FeedbackPage = () => {
  const { fetchProject, getFeedback, feedback, project } = useStudent();

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  useEffect(() => {
    if (project?._id) {
      getFeedback(project._id);
    }
  }, [project, getFeedback]);

  const getFeedbackIcon = (type) => {
    if (type === 'positive') {
      return <BadgeCheckIcon className="w-6 h-6 text-green-500" />;
    }
    if (type === 'negative') {
      return <AlertTriangleIcon className="w-6 h-6 text-red-500" />;
    }
    return <MessageCircleIcon className="w-6 h-6 text-blue-500" />;
  };

  const feedbackStats = [
    {
      type: 'general',
      title: 'Tous les Retours',
      bg: 'bg-blue-50',
      iconBg: 'bg-blue-100',
      textColor: 'text-blue-800',
      valueColor: 'text-blue-900',
      getCount: (feedback) => feedback?.length || 0,
    },
    {
      type: 'positive',
      title: 'Positif',
      bg: 'bg-green-50',
      iconBg: 'bg-green-100',
      textColor: 'text-green-800',
      valueColor: 'text-green-900',
      getCount: (feedback) =>
        feedback?.filter((f) => f.type === 'positive').length || 0,
    },
    {
      type: 'negative',
      title: 'A Améliorer',
      bg: 'bg-yellow-50',
      iconBg: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      valueColor: 'text-yellow-900',
      getCount: (feedback) =>
        feedback?.filter((f) => f.type === 'negative').length || 0,
    },
  ];

  return (
    <>
      <div className="space-y-6">
        <div className="card">
          <div className="card-header">
            <h1 className="card-title">Retours Superviseur</h1>
            <p className="card-subtitle">
              Voir les retours et les commentaires de ton superviseur
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {feedbackStats.map((item) => {
            return (
              <div key={item.type} className={`${item.bg} rounded-lg p-4`}>
                <div className="flex items-center">
                  <div className={`p-2 ${item.iconBg} rounded-lg`}>
                    {getFeedbackIcon(item.type)}
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${item.textColor}`}>
                      {item.title}
                    </p>
                    <p className={`text-sm font-medium ${item.valueColor}`}>
                      {item.getCount(feedback)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="space-y-4">
          {feedback && feedback.length > 0 ? (
            <>
              {feedback.map((f, i) => (
                <div
                  key={i}
                  className="border border-slate-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        {getFeedbackIcon(f.type)}
                        <h3 className="font-medium text-slate-800">
                          {f.title || 'Retour'}
                        </h3>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm border-slate-600">
                        {new Date(f.createdAt).toLocaleDateString()}
                      </p>
                      <p>{f.supervisorName || 'Superviseur'}</p>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-lg mb-3">
                    <p className="text-slate-700 leading-relaxed">
                      {f.message}
                    </p>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="text-center py-8">
              <MessageCircleIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Aucun retour reçu pour le moment</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default FeedbackPage;
