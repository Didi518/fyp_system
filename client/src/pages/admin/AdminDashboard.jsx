import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  AlertCircleIcon,
  AlertTriangleIcon,
  BoxIcon,
  FileTextIcon,
  FolderIcon,
  PlusIcon,
  UserIcon,
  XIcon,
} from 'lucide-react';

import AddStudent from '../../components/modal/AddStudent';
import AddTeacher from '../../components/modal/AddTeacher';
import { useAdmin, useNotification, usePopup, useProject } from '../../hooks';
import {
  NOTIFICATION_PRIORITIES,
  NOTIFICATION_TYPES,
} from '../../constants/constants';

const COLORS = ['#1e3A8A', '#2563EB', '#3B82F6', '#60A5FA', '#93C5FD'];

const AdminDashboard = () => {
  const [reportSearch, setReportSearch] = useState('');
  const [isReportsModalOpen, setIsReportsModalOpen] = useState(false);
  const { getNotifications, notifications } = useNotification();
  const { downloadProjectFile } = useProject();
  const { getAllProjects, getDashboardStats, projects, stats } = useAdmin();
  const {
    isCreateStudentModalOpen,
    isCreateTeacherModalOpen,
    toggleStudentModal,
    toggleTeacherModal,
  } = usePopup();

  useEffect(() => {
    getDashboardStats();
    getNotifications();
    getAllProjects();
  }, [getAllProjects, getDashboardStats, getNotifications]);

  const nearingDeadlines = useMemo(() => {
    const now = new Date();
    const threeDays = 3 * 24 * 60 * 60 * 1000;
    return (projects || []).filter((p) => {
      if (!p.deadline) return false;
      const d = new Date(p.deadline);
      return d >= now && d.getTime() - now.getTime() <= threeDays;
    }).length;
  }, [projects]);

  const files = useMemo(() => {
    return (projects || []).flatMap((p) =>
      (p.files || []).map((f) => ({
        projectId: p._id,
        fileId: f._id,
        originalName: f.originalName,
        uploadedAt: f.uploadedAt,
        projectTitle: p.title,
        studentName: p.student?.name,
      })),
    );
  }, [projects]);

  const filteredFiles = files.filter(
    (f) =>
      (f.originalName || '')
        .toLowerCase()
        .includes(reportSearch.toLowerCase()) ||
      (f.projectTitle || '')
        .toLowerCase()
        .includes(reportSearch.toLowerCase()) ||
      (f.studentName || '').toLowerCase().includes(reportSearch.toLowerCase()),
  );

  const handleDownload = async (projectId, fileId) => {
    downloadProjectFile({ projectId, fileId });
  };

  const supervisorsBucket = useMemo(() => {
    const map = new Map();

    (projects || []).forEach((p) => {
      if (!p?.supervisor) return;

      const name = p.supervisor.name;

      map.set(name, (map.get(name) || 0) + 1);
    });

    return Array.from(map.entries())
      .map(([name, count], index) => ({
        name,
        count,
        fill: COLORS[index % COLORS.length],
      }))
      .sort((a, b) => b.count - a.count);
  }, [projects]);

  const latestNotifications = useMemo(
    () => (notifications || []).slice(0, 6),
    [notifications],
  );

  const getBulletColor = (type, priority) => {
    const t = (type || '').toLowerCase();
    const p = (priority || '').toLowerCase();
    if (p === 'high' && (t === 'rejection' || t === 'reject'))
      return 'bg-red-600';
    if (p === 'medium' && (t === 'deadline' || t === 'due'))
      return 'bg-orange-500';
    if (p === 'high') return 'bg-red-500';
    if (p === 'medium') return 'bg-yellow-500';
    if (p === 'low') return 'bg-slate-400';

    if (t === 'approval' || t === 'approved') return 'bg-green-600';
    if (t === 'demande') return 'bg-blue-600';
    if (t === 'retour') return 'bg-purple-600';
    if (t === 'meeting') return 'bg-cyan-600';
    if (t === 'system') return 'bg-slate-600';

    return 'bg-slate-400';
  };

  const getBadgeClasses = (kind, value) => {
    const v = (value || '').toLowerCase();
    if (kind === 'type') {
      if (['rejection', 'reject'].includes(v)) return 'bg-red-100 text-red-800';
      if (['approval', 'approved'].includes(v))
        return 'bg-green-100 text-green-800';
      if (['deadline', 'due'].includes(v))
        return 'bg-orange-100 text-orange-800';
      if (v === 'demande') return 'bg-blue-100 text-blue-800';
      if (v === 'retour') return 'bg-purple-100 text-purple-800';
      if (v === 'meeting') return 'bg-cyan-100 text-cyan-800';
      if (v === 'system') return 'bg-slate-100 text-slate-800';
      return 'bg-gray-100 text-gray-800';
    }
    if (v === 'high') return 'bg-red-100 text-red-800';
    if (v === 'medium') return 'bg-yellow-100 text-yellow-800';
    if (v === 'low') return 'bg-gray-100 text-gray-800';

    return 'bg-slate-100 text-slate-800';
  };

  const dashboardStats = [
    {
      title: 'Total Etudiants',
      value: stats?.totalStudents ?? 0,
      bg: 'bg-blue-100',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      Icon: UserIcon,
    },
    {
      title: 'Total Enseignants',
      value: stats?.totalTeachers ?? 0,
      bg: 'bg-green-100',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      Icon: BoxIcon,
    },
    {
      title: 'Demandes en Attente',
      value: stats?.pendingRequests ?? 0,
      bg: 'bg-orange-100',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      Icon: AlertCircleIcon,
    },
    {
      title: 'Projects Actifs',
      value: stats?.totalProjects ?? 0,
      bg: 'bg-yellow-100',
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      Icon: FolderIcon,
    },
    {
      title: 'Date Limite Proche',
      value: nearingDeadlines,
      bg: 'bg-red-100',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      Icon: AlertTriangleIcon,
    },
  ];

  const actionButtons = [
    {
      label: 'Ajouter Etudiant',
      onClick: () => toggleStudentModal(),
      btnClass: 'btn-primary',
      Icon: PlusIcon,
    },
    {
      label: 'Ajouter Enseignant',
      onClick: () => toggleTeacherModal(),
      btnClass: 'btn-secondary',
      Icon: PlusIcon,
    },
    {
      label: 'Voir les Fichiers',
      onClick: () => setIsReportsModalOpen(true),
      btnClass: 'btn-outline',
      Icon: FileTextIcon,
    },
  ];

  return (
    <>
      <div className="space-y-6">
        <div className="bg-linear-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Dashboard Admin</h1>
          <p className="text-blue-100">
            Gérer l'ensemble du système et voir toutes les activités.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {dashboardStats.map((item) => {
            return (
              <div key={item.title} className={`${item.bg} rounded-lg p-4`}>
                <div className="flex items-center">
                  <div className={`p-2 ${item.iconBg} rounded-lg`}>
                    <item.Icon className={`w-6 h-6 ${item.iconColor}`} />
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium text-slate-600`}>
                      {item.title}
                    </p>
                    <p className={`text-sm font-medium text-slate-800`}>
                      {item.value}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card">
            <div className="card-header">
              <h3 className="card-title">
                Répartitions des Projets par Superviseur
              </h3>
            </div>
            <div className="p-4">
              {supervisorsBucket.length === 0 ? (
                <div className="h-64 flex items-center justify-center bg-slate-50 rounded text-slate-500">
                  Aucune donnée
                </div>
              ) : (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={supervisorsBucket}
                      margin={{ top: 8, right: 8, bottom: 8, left: 8 }}
                      barCategoryGap="20%"
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 12, fill: '#334155' }}
                        axisLine={{ stroke: '#CBD5E1' }}
                        tickLine={{ stroke: '#CBD5E1' }}
                        interval={0}
                        height={50}
                        dy={10}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fontSize: 12, fill: '#334155' }}
                        axisLine={{ stroke: '#CBD5E1' }}
                        tickLine={{ stroke: '#CBD5E1' }}
                      />
                      <Tooltip
                        cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                        contentStyle={{
                          borderRadius: 8,
                          borderColor: '#E2E8F0',
                        }}
                        formatter={(value, name) => [
                          value,
                          name === 'count' ? 'Projets Assignés' : name,
                        ]}
                        labelFormatter={(label) => `Superviseur: ${label}`}
                      />
                      <Bar
                        dataKey={'count'}
                        radius={[8, 8, 0, 0]}
                        shape={(props) => (
                          <rect
                            {...props}
                            rx={8}
                            ry={8}
                            fill={props.payload.fill}
                          />
                        )}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Activité Récente</h3>
            </div>
            <div className="space-y-3">
              {latestNotifications.map((n) => {
                return (
                  <div key={n._id} className="flex items-center text-sm">
                    <div
                      className={`mt-1 w-2 h-2 ${getBulletColor(n.type, n.priority)} rounded-full mr3`}
                    />
                    <div className="flex-1">
                      <p className="font-medium text-slate-800">{n.message}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-sm font-medium ${getBadgeClasses('type', n.type)}`}
                        >
                          Type: {NOTIFICATION_TYPES[n.type] ?? n.type}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-sm font-medium`}
                        >
                          Priorité:{' '}
                          {NOTIFICATION_PRIORITIES[n.priority] ?? n.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {latestNotifications.length === 0 && (
                <div className="text-slate-500 text-sm">
                  Aucune notification récente
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Actions Rapides</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {actionButtons.map((btn, index) => {
              return (
                <button
                  key={index}
                  className={`${btn.btnClass} flex items-center justify-center space-x-2`}
                  onClick={btn.onClick}
                >
                  <btn.Icon className="w-5 h-5" /> <span>{btn.label}</span>
                </button>
              );
            })}
          </div>
        </div>
        {isReportsModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-3xl mx-4 max-h-screen overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-900">
                  Tous les fichiers
                </h3>
                <button
                  onClick={() => setIsReportsModalOpen(false)}
                  className="text-slate-400 hover:to-slate-600"
                >
                  <XIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="mb-4">
                <input
                  type="text"
                  className="input w-full"
                  placeholder="Recherche par nom de fichier, titre de projet ou nom d'étudiant"
                  value={reportSearch}
                  onChange={(e) => setReportSearch(e.target.value)}
                />
              </div>
              {filteredFiles.length === 0 ? (
                <div className="text-slate-500">Aucun fichier trouvé</div>
              ) : (
                <div className="space-y-2">
                  {filteredFiles.map((f, i) => {
                    return (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded"
                      >
                        <div>
                          <div className="font-medium text-slate-800">
                            {f.originalName}
                          </div>
                          <div className="text-sm text-slate-500">
                            {f.projectTitle} - {f.studentName}
                          </div>
                        </div>
                        <button
                          className="btn-outline btn-small"
                          onClick={() =>
                            handleDownload(
                              f.projectId,
                              f.fileId,
                              f.originalName,
                            )
                          }
                        >
                          Télécharger
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
        {isCreateStudentModalOpen && <AddStudent />}
        {isCreateTeacherModalOpen && <AddTeacher />}
      </div>
    </>
  );
};

export default AdminDashboard;
