import { XIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { PROJECT_STATUS } from '../../constants/constants';
import { useAuth, usePopup, useStudent } from '../../hooks';

const SupervisorPage = () => {
  const [requestMessage, setRequestMessage] = useState('');
  const [selectedSupervisor, setSelectedSupervisor] = useState(null);
  const { authUser } = useAuth();
  const { isCreateRequestModalOpen, openRequestModal, closeRequestModal } =
    usePopup();
  const {
    fetchProject,
    getSupervisor,
    fetchSupervisors,
    requestSupervisor,
    project,
    supervisor,
    supervisors,
  } = useStudent();

  useEffect(() => {
    fetchProject();
    getSupervisor();
    fetchSupervisors();
  }, [fetchProject, fetchSupervisors, getSupervisor]);

  const statusConfig = PROJECT_STATUS[project?.status];

  const hasSupervisor = useMemo(
    () => !!(supervisor && supervisor._id),
    [supervisor],
  );

  const formatDeadline = (dateString) => {
    if (!dateString) return '-';

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';

    const prefix = 'Le';
    const day = date.getDate();
    const month = date.toLocaleString('fr-FR', { month: 'long' });
    const year = date.getFullYear();
    return `${prefix} ${day} ${month} ${year}`;
  };

  const handleOpenRequestModal = (supervisor) => {
    setSelectedSupervisor(supervisor);
    openRequestModal();
  };

  const submitRequest = async () => {
    if (!selectedSupervisor) return;

    const message =
      requestMessage?.trim() ||
      `${authUser.name || "L'étudiant"} souhaite être supervisé par ${selectedSupervisor.name} pour son projet.`;

    try {
      await requestSupervisor({
        teacherId: selectedSupervisor._id,
        message,
      }).unwrap();
      closeRequestModal();
      setSelectedSupervisor(null);
      setRequestMessage('');
    } catch {
      // toast géré par le thunk
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="card">
          <div className="card-header">
            <h1 className="card-title">Superviseur</h1>
            {hasSupervisor && (
              <span className="badge badge-approved">Assigné</span>
            )}
          </div>
          {hasSupervisor ? (
            <div className="space-y-6">
              <div className="flex items-start space-x-6">
                <img
                  src="/placeholder.jpg"
                  alt="Avatar Superviseur"
                  className="w-20 h-20 rounded-full object-cover shadow-md"
                />
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800">
                      {supervisor?.name || '-'}
                    </h3>
                    <p className="text-lg text-slate-600">
                      {supervisor?.department || '-'}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                        Email
                      </label>
                      <p className="text-slate-800 font-medium">
                        {supervisor?.email || '-'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                        Compétences
                      </label>
                      <p className="text-slate-800 font-medium">
                        {Array.isArray(supervisor?.expertises)
                          ? supervisor.expertises.join(', ')
                          : supervisor?.expertises || '-'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center">
              <p className="text-slate-600 text-lg">
                Aucun superviseur assigné pour le moment.
              </p>
            </div>
          )}
        </div>
        {project && (
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Détails du projet</h2>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                      Titre du Projet
                    </label>
                    <p className="text-lg font-semibold text-slate-800 mt-1">
                      {project?.title || '-'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                      Statut
                    </label>
                    <div className="mt-1">
                      <span
                        className={`badge ${statusConfig?.className || 'bg-gray-100 text-gray-800'}`}
                      >
                        {statusConfig?.label || 'Invalide'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                      Deadline
                    </label>
                    <p className="text-lg font-semibold text-slate-800 mt-1">
                      {project?.deadline
                        ? formatDeadline(project.deadline)
                        : 'Indéfinie'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                      Création
                    </label>
                    <p className="text-lg font-semibold text-slate-800 mt-1">
                      {project?.createdAt
                        ? formatDeadline(project.createdAt)
                        : 'Inconnue'}
                    </p>
                  </div>
                </div>
              </div>
              {project?.description && (
                <div>
                  <label className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                    Description
                  </label>
                  <p className="text-slate-700 mt-2 leading-relaxed">
                    {project?.description || '-'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
        {!project && (
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Projet Requis</h2>
            </div>
            <div className="p-6 text-center">
              <p className="text-slate-600 text-lg">
                Aucune proposition de projet soumise pour le moment, vous ne
                pouvez donc pas demander un superviseur.
              </p>
            </div>
          </div>
        )}
        {project && !hasSupervisor && (
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">
                {supervisors?.length === 0
                  ? 'Aucun superviseur disponible'
                  : supervisors?.length === 1
                    ? '1 Superviseur Disponible'
                    : `${supervisors?.length} Superviseurs Disponibles`}
              </h2>
              <p className="card-subtitle">
                Sélectionnez un superviseur pour votre projet parmis nos
                enseignants disponibles.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {supervisors &&
                supervisors.map((sup) => (
                  <div
                    key={sup._id}
                    className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-12 h-12 bg-slate-300 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-slate-600">
                          {sup.name || 'Anonyme'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-800">
                          {sup.name}
                        </h4>
                        <p className="text-sm text-slate-600">
                          {sup.department}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div>
                        <label className="text-xs font-medium text-slate-500">
                          Email
                        </label>
                        <p className="text-sm text-slate-700">
                          {sup.email || '-'}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-500">
                          Compétences
                        </label>
                        <p className="text-sm text-slate-700">
                          {Array.isArray(sup?.expertises)
                            ? sup.expertises.join(', ')
                            : sup?.expertises || '-'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleOpenRequestModal(sup)}
                      className="btn-primary w-full"
                    >
                      Demande de Superviseur
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}
        {isCreateRequestModalOpen && selectedSupervisor && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-800">
                    Demande de Superviseur
                  </h3>
                  <button
                    className="text-slate-400 hover:text-slate-600"
                    onClick={() => {
                      closeRequestModal();
                      setSelectedSupervisor(null);
                      setRequestMessage('');
                    }}
                  >
                    <XIcon className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-md">
                    <p className="text-sm text-slate-600">
                      {selectedSupervisor?.name}
                    </p>
                  </div>
                  <div>
                    <label className="label">
                      Message à {selectedSupervisor?.name}
                    </label>
                    <textarea
                      className="input min-h-30"
                      required
                      value={requestMessage}
                      onChange={(e) => setRequestMessage(e.target.value)}
                      placeholder="Présentez-vous et expliquez pourquoi voulez-vous cet enseignant pour superviser votre projet..."
                    />
                  </div>
                  <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
                    <button
                      onClick={() => {
                        closeRequestModal();
                        setSelectedSupervisor(null);
                        setRequestMessage('');
                      }}
                      className="btn-outline"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={submitRequest}
                      className="btn-primary"
                      disabled={!requestMessage.trim()}
                    >
                      Envoyer la Demande
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default SupervisorPage;
