import { useState } from 'react';
import { XIcon } from 'lucide-react';
import { useDispatch } from 'react-redux';

import { createUser } from '../../store/slices/adminSlice';
import { toggleStudentModal } from '../../store/slices/popupSlice';

const AddStudent = () => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    password: '',
  });

  const handleCreateStudent = async (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.department
    ) {
      return;
    }

    try {
      await dispatch(createUser({ role: 'Étudiant', ...formData })).unwrap();

      setFormData({ name: '', email: '', department: '', password: '' });
      dispatch(toggleStudentModal());
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
              Ajouter Étudiant
            </h3>
            <button
              onClick={() => dispatch(toggleStudentModal())}
              className="text-slate-400 hover:to-slate-600"
            >
              <XIcon className="w-6 h-6" />
            </button>
          </div>
          <form onSubmit={handleCreateStudent} className="space-y-4">
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
            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={() => dispatch(toggleStudentModal())}
                className="btn-danger"
              >
                Annuler
              </button>
              <button type="submit" className="btn-primary">
                Ajouter Étudiant
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddStudent;
