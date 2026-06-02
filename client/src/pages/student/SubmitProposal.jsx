import { useState } from 'react';
import { toast } from 'react-toastify';

import { useStudent } from '../../hooks';

const SubmitProposal = () => {
  const { submitProposal } = useStudent();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      submitProposal(formData);
      setIsLoading(false);
      toast.success()
    } catch (err) {
      setIsLoading(false);
      console.error(err);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="card">
          <div className="card-header">
            <h1 className="card-title">Soumettre une Proposition</h1>
            <p className="card-subtitle">
              Merci de renseigner chaque étape de votre proposition de projet.
              Assurez-vous d'être précis et complet sur les objectifs de votre
              projet.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="label">Titre du Projet</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="input"
                placeholder="Entrez le titre du projet"
                required
              />
            </div>
            <div>
              <label className="label">Description du Projet</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="input min-h-30"
                placeholder="Fournir une description détaillée de votre projet..."
                required
              />
            </div>
            <div className="flex justify-end space-x-4 pt-4 border-t border-slate-200">
              <button
                className="btn-primary disabled:opacity-50"
                type="submit"
                disabled={isLoading}
              >
                {isLoading
                  ? 'Soumission en cours...'
                  : 'Soumettre la Proposition'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default SubmitProposal;
