import { useState } from 'react';
import { XIcon } from 'lucide-react';
import { useDispatch } from 'react-redux';

import { createUser } from '../../store/slices/adminSlice';
import { toggleTeacherModal } from '../../store/slices/popupSlice';

const AddTeacher = () => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    password: '',
    expertises: '',
    maxStudents: 1,
  });

  const handleCreateTeacher = async (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.department ||
      !formData.expertises ||
      !formData.maxStudents
    ) {
      return;
    }

    try {
      await dispatch(createUser({ role: 'Enseignant', ...formData })).unwrap();

      setFormData({
        name: '',
        email: '',
        department: '',
        password: '',
        expertises: '',
        maxStudents: 1,
      });
      dispatch(toggleTeacherModal());
    } catch {
      // toast déjà géré
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-slate-900">
              Ajouter Enseignant
            </h3>
            <button
              onClick={() => dispatch(toggleTeacherModal())}
              className="text-slate-400 hover:to-slate-600"
            >
              <XIcon className="w-6 h-6" />
            </button>
          </div>
          <form onSubmit={handleCreateTeacher} className="space-y-4">
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
                Mot de Passe
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
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
                <option value="Services Numériques">Services Numériques</option>
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
                <option value="Développement Web">Développement Web</option>
                <option value="Développement Web">Développement Web</option>
                <option value="Développement Appli Mobile">
                  Développement Appli Mobile
                </option>
                <option value="Database System">Database System</option>
                <option value="Réseau Informatique">Réseau Informatique</option>
                <option value="Système d'Exploitation">
                  Système d'Exploitation
                </option>
                <option value="Interaction Homme-Machine">
                  Interaction Homme-Machine
                </option>
                <option value="Analyse Données">Analyse Données</option>
                <option value="Blockchain">Blockchain</option>
                <option value="Internet des Objets">Internet des Objets</option>
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
              <button
                onClick={() => dispatch(toggleTeacherModal())}
                className="btn-danger"
              >
                Annuler
              </button>
              <button type="submit" className="btn-primary">
                Ajouter Enseignant
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddTeacher;
