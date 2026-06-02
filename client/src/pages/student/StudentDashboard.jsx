import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  BellIcon,
  MessageCircleIcon,
  MessageCircleWarningIcon,
} from 'lucide-react';

import { useAuth, useStudent } from '../../hooks';
import { PROJECT_STATUS } from '../../constants/constants';
import { fetchDashboardStats } from '../../store/slices/studentSlice';

const StudentDashboard = () => {
  const dispatch = useDispatch();
  const { authUser } = useAuth();
  const { dashboardStats } = useStudent();

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  const project = dashboardStats?.project || {};
  const supervisorName = dashboardStats?.supervisorName || 'N/A';
  const upcomingDeadline = dashboardStats?.upcomingDeadline || [];
  const topNotifications = dashboardStats?.topNotifications || [];
  const feedback = (dashboardStats?.feedback || []).slice(-2).reverse();

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const statusConfig = PROJECT_STATUS[project?.status];

  return (
    <>
      <div className="space-y-6">
        <div className="bg-linear-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">
            Bienvenue, {authUser?.name || 'Etudiant'}
          </h1>
          <p className="text-blue-100">
            Retrouve ton projet et les dernières mises à jour.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">📘</div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Projet</p>
                <p className="text-lg font-semibold text-slate-800">
                  {project?.title || 'Aucun projet en cours'}
                </p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">🧑‍🏫</div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">
                  Superviseur
                </p>
                <p className="text-lg font-semibold text-slate-800">
                  {supervisorName || 'N/A'}
                </p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">⏰</div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">
                  Date Limite
                </p>
                <p className="text-lg font-semibold text-slate-800">
                  {formatDate(project?.deadline)}
                </p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">💬</div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">
                  Dernier Retour
                </p>
                <p className="text-lg font-semibold text-slate-800">
                  {feedback?.length
                    ? formatDate(feedback[0].createdAt)
                    : 'Aucun retour pour le moment'}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Aperçu du Projet</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-600">
                  Titre
                </label>
                <p className="text-slate-800 font-medium">
                  {project?.title || 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">
                  Description
                </label>
                <p className="text-slate-800 font-medium">
                  {project?.description || 'Aucune description disponible'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-slate-600">
                  Statut
                </label>
                <span className={`badge ${statusConfig?.className}`}>
                  {statusConfig?.label}
                </span>
              </div>
              <label className="text-sm font-medium text-slate-600">
                Date Limite
              </label>
              <p className="text-slate-800 font-medium">
                {formatDate(project?.deadline)}
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-header flex items-center justify-between">
              <h2 className="card-title">Dernier Retour</h2>
              <Link
                to={'/etudiant/retours'}
                className="text-sm bg-blue-500 text-white px-3 py-1 rounded-full font-medium hover:bg-blue-600 transition-all duration-300"
              >
                Voir tout
              </Link>
            </div>
            {feedback && feedback.length > 0 ? (
              <div className="space-y-4 p-4">
                {feedback.map((fb, index) => {
                  return (
                    <div
                      key={fb._id || index}
                      className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <MessageCircleIcon className="w-5 h-5 text-blue-500" />
                          <h3 className="font-medium text-slate-800">
                            {fb.title || 'Retour du Superviseur'}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-500">
                          {formatDate(fb.createdAt)}
                        </p>
                      </div>
                      <div className="text-slate-500 rounded-lg p-3">
                        <p className="text-slate-700 text-sm leading-relaxed">
                          {fb.message}
                        </p>
                      </div>
                      <div className="flex justify-between items-center mt-3">
                        <p className="text-xs text-slate-500">
                          - {supervisorName || 'Superviseur'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageCircleIcon className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">
                  Aucun retour disponible pour le moment.
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <div className="card-header">
              <div className="card-title">Date Limite à Venir</div>
            </div>
            {upcomingDeadline && upcomingDeadline.length > 0 ? (
              <div className="space-y-3">
                {upcomingDeadline.map((d, i) => {
                  return (
                    <div
                      key={d._id || i}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-slate-800">{d.title}</p>
                        <p className="text-sm text-slate-600">
                          {formatDate(d.deadline)}
                        </p>
                      </div>
                      <div className={`badge badge-pending`}>
                        prochaines échéances
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageCircleWarningIcon className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">
                  Aucune date limite pour le moment.
                </p>
              </div>
            )}
          </div>
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Dernières Notifications</h2>{' '}
            </div>
            {topNotifications && topNotifications.length > 0 ? (
              <div className="space-y-3">
                {topNotifications.map((n, i) => {
                  return (
                    <div
                      key={n._id || i}
                      className="p-3 bg-slate-50 rounded-lg border border-slate-100"
                    >
                      <p className="font-medium text-slate-800">{n.message}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {formatDate(n.createdAt)}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <BellIcon className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">
                  Aucune notification pour le moment.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentDashboard;
