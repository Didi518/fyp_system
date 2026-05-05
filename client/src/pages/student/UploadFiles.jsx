import { toast } from 'react-toastify';
import { useEffect, useRef, useState } from 'react';
import {
  ArchiveIcon,
  File,
  FileCodeCornerIcon,
  FilePlusIcon,
  FileTextIcon,
} from 'lucide-react';

import { useStudent } from '../../hooks/useStudent';

const UploadFiles = () => {
  const codeRef = useRef(null);
  const presRef = useRef(null);
  const reportRef = useRef(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const { downloadFile, fetchProject, files, project, uploadFiles } =
    useStudent();

  useEffect(() => {
    if (!project) fetchProject();
  }, [fetchProject, project]);

  const handleFilePick = (e) => {
    const list = Array.from(e.target.files || []);
    setSelectedFiles((prev) => [...prev, ...list]);
    e.target.value = '';
  };

  const handleUpload = async () => {
    let activeProject = project;
    if (!activeProject) {
      const action = await fetchProject();
      activeProject = action?.payload || null;
    }

    if (selectedFiles.length === 0) return;
    if (!activeProject?._id) {
      toast.error('Aucun projet trouvé pour cet upload.');
      return;
    }

    const resultAction = await uploadFiles({
      projectId: activeProject._id,
      files: selectedFiles,
    });

    if (resultAction?.type?.endsWith('/fulfilled')) {
      setSelectedFiles([]);
    }
  };

  const removeSelected = (name) => {
    setSelectedFiles((prev) => prev.filter((file) => file.name !== name));
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    const Icon = ({ className }) => <File className={className} />;
    const color =
      extension === 'pdf'
        ? 'text-red-500'
        : ['doc', 'docx'].includes(extension)
          ? 'text-blue-500'
          : ['ppt', 'pptx'].includes(extension)
            ? 'text-orange-500'
            : 'text-slate-500';

    return <Icon className={`w-8 h-8 ${color}`} />;
  };

  const handleDownloadFile = (file) => {
    downloadFile({
      projectId: project._id,
      fileId: file._id,
    });
  };

  return (
    <>
      <div className="space-y-6">
        <div className="card">
          <div className="card-header">
            <h1 className="card-title">Charger les Fichiers du Projet</h1>
            <p className="card-subtitle">
              Envoyer les documents du projet, incluant rapports, présentations
              et fichiers de code.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <div className="mb-4">
                <FileTextIcon className="w-12 h-12 text-slate-400 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-slate-800 mb-2">
                Rapport
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                Envoyer votre rapport du projet (PDF, DOC)
              </p>
              <label className="btn-outline cursor-pointer">
                Choisir un Fichier
                <input
                  type="file"
                  ref={reportRef}
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFilePick}
                  multiple
                />
              </label>
            </div>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <div className="mb-4">
                <ArchiveIcon className="w-12 h-12 text-slate-400 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-slate-800 mb-2">
                Présentation
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                Envoyer votre présentation (PPT, PPTX, PDF)
              </p>
              <label className="btn-outline cursor-pointer">
                Choisir un Fichier
                <input
                  type="file"
                  ref={presRef}
                  className="hidden"
                  accept=".pdf,.ppt,.pptx"
                  onChange={handleFilePick}
                  multiple
                />
              </label>
            </div>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <div className="mb-4">
                <FileCodeCornerIcon className="w-12 h-12 text-slate-400 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-slate-800 mb-2">
                Fichiers de Code
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                Envoyer votre Code Source (ZIP, RAR, TAR)
              </p>
              <label className="btn-outline cursor-pointer">
                Choisir un Fichier
                <input
                  type="file"
                  ref={codeRef}
                  className="hidden"
                  accept=".zip,.rar,.tar,.gz"
                  onChange={handleFilePick}
                  multiple
                />
              </label>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button onClick={handleUpload} className="btn-primary">
              Télécharger les Fichiers Sélectionnés
            </button>
          </div>
        </div>
        {selectedFiles.length > 0 && (
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Prêt à Envoyer</h2>
            </div>
            <div className="space-y-3">
              {selectedFiles.map((file) => {
                return (
                  <div
                    key={file.name}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      {getFileIcon(file.name)}
                      <div>
                        <p className="font-medium text-slate-800">
                          {file.name}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-slate-600">
                          <span>
                            {(file.size / (1024 * 1024)).toFixed(1)} MB
                          </span>
                        </div>
                        <button
                          className="btn-danger btn-small"
                          onClick={() => removeSelected(file.name)}
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Fichiers Envoyés</h2>
                  <p className="card-subtitle">
                    Gérer les uploads du projet déjà envoyés.
                  </p>
                </div>
                {(files || []).length === 0 ? (
                  <div className="text-center py-4">
                    <FilePlusIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p>Aucun fichier uploadé pour le moment</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {files.map((file) => (
                      <div
                        key={file._id || file.fileUrl}
                        className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          {getFileIcon(file.originalName)}
                          <div>
                            <p className="font-medium text-slate-800">
                              {file.originalName}
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-slate-600">
                              <span>{file.fileType || 'Fichier'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            className="btn-outline btn-small"
                            onClick={() => handleDownloadFile(file)}
                          >
                            Télécharger
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default UploadFiles;
