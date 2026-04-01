import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  AlertTriangleIcon,
  BadgeCheckIcon,
  PlusIcon,
  TriangleAlertIcon,
  UsersIcon,
  XIcon,
} from 'lucide-react';

import AddTeacher from '../../components/modal/AddTeacher';
import { toggleTeacherModal } from '../../store/slices/popupSlice';
import {
  deleteUser,
  getAllUsers,
  updateUser,
} from '../../store/slices/adminSlice';

const ManageTeachers = () => {
  const dispatch = useDispatch();
  const { users } = useSelector((state) => state.admin);
  const { isCreateTeacherModalOpen } = useSelector((state) => state.popup);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [teacherToDelete, setTeacherToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    expertises: '',
    maxStudents: 10,
  });

  const teachers = useMemo(
    () => (users || []).filter((u) => u.role?.toLowerCase() === 'enseignant'),
    [users],
  );

  const departments = useMemo(() => {
    const set = new Set(
      (teachers || []).map((t) => t.department).filter(Boolean),
    );

    return Array.from(set);
  }, [teachers]);

  useEffect(() => {
    dispatch(getAllUsers({ role: 'Enseignant' }));
  }, [dispatch]);

  const filteredTeachers = teachers.filter((teacher) => {
    const matchesSearch =
      (teacher.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (teacher.email || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterDepartment === 'all' || teacher.department === filterDepartment;

    return matchesSearch && matchesFilter;
  });

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTeacher(null);
    setFormData({
      name: '',
      email: '',
      department: '',
      expertises: '',
      maxStudents: 10,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      !formData.department ||
      !formData.expertises ||
      !formData.maxStudents
    ) {
      return;
    }

    try {
      if (editingTeacher) {
        await dispatch(
          updateUser({ id: editingTeacher._id, ...formData }),
        ).unwrap();
      }

      handleCloseModal();
    } catch {
      // osef, le toast s'en charge
    }
  };

  const handleEdit = (teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      name: teacher.name,
      email: teacher.email,
      department: teacher.department,
      expertises: Array.isArray(teacher.expertises)
        ? teacher.expertises[0]
        : teacher.expertises,
      maxStudents:
        typeof teacher.maxStudents === 'number' ? teacher.maxStudents : 10,
    });

    setShowModal(true);
  };

  const handleDelete = (teacher) => {
    setTeacherToDelete(teacher);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (teacherToDelete) {
      dispatch(deleteUser(teacherToDelete._id));
      setShowDeleteModal(false);
      setTeacherToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setTeacherToDelete(null);
  };

  return (
    <>
      <div className="space-y-6">
        <div className="card">
          <div className="card-header flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="card-title">Gestion des Enseignants</h1>
              <p className="card-subtitle">
                Ajouter, modifier et gérer les comptes enseignants
              </p>
            </div>
            <button
              onClick={() => dispatch(toggleTeacherModal())}
              className="btn-primary flex items-center space-x-2 mt-4 md:mt-0"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Ajouter Nouvel Enseignant</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <UsersIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">
                  Total Enseignants
                </p>
                <p className="text-lg font-semibold text-slate-800">
                  {teachers.length}
                </p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <BadgeCheckIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">
                  Étudiants Assignés
                </p>
                <p className="text-lg font-semibold text-slate-800">
                  {teachers.reduce(
                    (sum, t) => sum + (t.assignedStudents?.length || 0),
                    0,
                  )}
                </p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <TriangleAlertIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Sections</p>
                <p className="text-lg font-semibold text-slate-800">
                  {departments.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Recherche Enseignants
              </label>
              <input
                type="text"
                placeholder="Recherche par nom ou email..."
                className="input-field w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-48">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Filtre
              </label>
              <select
                className="input-field w-full"
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
              >
                <option value="all">Toutes les Sections</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Liste des Enseignants</h2>
          </div>
          <div className="overflow-x-auto">
            {filteredTeachers && filteredTeachers.length > 0 ? (
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                      Info Enseignant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                      Section
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                      Compétence
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                      Ancienneté
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredTeachers.map((teacher) => {
                    return (
                      <tr key={teacher._id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-slate-900">
                              {teacher.name}
                            </div>
                            <div className="text-sm text-slate-500">
                              {teacher.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-900">
                            {teacher.department || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {Array.isArray(teacher.expertises)
                            ? teacher.expertises.join(', ')
                            : teacher.expertises}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-slate-900">
                            {teacher.createdAt
                              ? new Date(teacher.createdAt).toLocaleString()
                              : '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(teacher)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Éditer
                            </button>
                            <button
                              onClick={() => handleDelete(teacher)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Supprimer
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              filteredTeachers.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  Aucun enseignant trouvé selon vos critères.
                </div>
              )
            )}
          </div>

          {showModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Éditer Enseignant
                  </h3>
                  <button
                    onClick={handleCloseModal}
                    className="text-slate-400 hover:to-slate-600"
                  >
                    <XIcon className="w-6 h-6" />
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Nom Complet
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="input-field w-full py-1 border-b border-slate-600 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="input-field w-full py-1 border-b border-slate-600 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Section
                    </label>
                    <select
                      className="input-field w-full py-1 border-b border-slate-600 focus:outline-none"
                      required
                      value={formData.department}
                      onChange={(e) =>
                        setFormData({ ...formData, department: e.target.value })
                      }
                    >
                      <option value="Informatique">Informatique</option>
                      <option value="Génie Logiciel">Génie Logiciel</option>
                      <option value="Services Numériques">
                        Services Numériques
                      </option>
                      <option value="Data Science">Data Science</option>
                      <option value="Génie Électrique">Génie Électrique</option>
                      <option value="Génie Mécanique">Génie Mécanique</option>
                      <option value="Génie Civil">Génie Civil</option>
                      <option value="Gestion d'Entreprise">
                        Gestion d'Entreprise
                      </option>
                      <option value="Économie">Économie</option>
                      <option value="Psychologie">Psychologie</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Compétence
                    </label>
                    <select
                      className="input-field w-full py-1 border-b border-slate-600 focus:outline-none"
                      required
                      value={formData.expertises}
                      onChange={(e) =>
                        setFormData({ ...formData, expertises: e.target.value })
                      }
                    >
                      <option value="">Domaine de Compétences</option>
                      <option value="Intelligence Artificielle">
                        Intelligence Artificielle
                      </option>
                      <option value="Machine Learning">Machine Learning</option>
                      <option value="Data Science">Data Science</option>
                      <option value="Cybersécurité">Cybersécurité</option>
                      <option value="Cloud Computing">Cloud Computing</option>
                      <option value="Développement Logiciel">
                        Développement Logiciel
                      </option>
                      <option value="Développement Web">
                        Développement Web
                      </option>
                      <option value="Développement Web">
                        Développement Web
                      </option>
                      <option value="Développement Appli Mobile">
                        Développement Appli Mobile
                      </option>
                      <option value="Database System">Database System</option>
                      <option value="Réseau Informatique">
                        Réseau Informatique
                      </option>
                      <option value="Système d'Exploitation">
                        Système d'Exploitation
                      </option>
                      <option value="Interaction Homme-Machine">
                        Interaction Homme-Machine
                      </option>
                      <option value="Analyse Données">Analyse Données</option>
                      <option value="Blockchain">Blockchain</option>
                      <option value="Internet des Objets">
                        Internet des Objets
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Étudiants Max
                    </label>
                    <input
                      type="number"
                      max={10}
                      min={1}
                      value={formData.maxStudents}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          maxStudents: e.target.value,
                        })
                      }
                      className="input-field w-full py-1 border-b border-slate-600 focus:outline-none"
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <button onClick={handleCloseModal} className="btn-danger">
                      Annuler
                    </button>
                    <button type="submit" className="btn-primary">
                      Éditer Enseignant
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {showDeleteModal && teacherToDelete && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
                <div className="flex items-center mb-4">
                  <div className="shrink-0 w-10 h-10 mx-auto flex items-center justify-center rounded-full bg-red-100">
                    <AlertTriangleIcon className="w-6 h-6 text-red-600" />
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-medium text-slate-900 mb-2">
                    Supprimer Enseignant
                  </h3>
                  <p className="text-sm text-slate-500 mb-4">
                    Êtes-vous sûr de vouloir supprimer {teacherToDelete.name}?{' '}
                    <span>Cette action est irréversible.</span>
                  </p>
                  <div className="flex justify-center space-x-3">
                    <button onClick={cancelDelete} className="btn-secondary">
                      Annuler
                    </button>
                    <button onClick={confirmDelete} className="btn-danger">
                      Valider
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isCreateTeacherModalOpen && <AddTeacher />}
        </div>
      </div>
    </>
  );
};

export default ManageTeachers;
