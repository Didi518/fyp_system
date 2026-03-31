import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { KeyRoundIcon, LoaderIcon } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { resetPassword } from '../../store/slices/authSlice';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isUpdatingPassword } = useSelector((state) => state.auth);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });

  console.log('TOKEN FRONT:', token);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 8) {
      newErrors.password =
        'Le mot de passe doit contenir au moins 8 caractères';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'La confirmation du mot de passe est requise';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await dispatch(
        resetPassword({
          token,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        }),
      ).unwrap();

      navigate('/connexion');
    } catch (error) {
      setErrors({
        general: error || 'Echec de la réinitialisation du mot de passe',
      });
    }
  };

  return (
    <>
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-full mb-4">
              <KeyRoundIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">
              Réinitialiser le Mot de Passe
            </h1>
            <p className="text-slate-600 mt-2">
              Entrez votre nouveau mot de passe
            </p>
          </div>

          <div className="card">
            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{errors.general}</p>
                </div>
              )}

              <div>
                <label className="label">Nouveau Mot de Passe</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`input ${errors.password ? 'input-error' : ''}`}
                  placeholder="Entrez votre nouveau mot de passe"
                />
                {errors.password && (
                  <p className="text-sm text-red-600 mt-1">{errors.password}</p>
                )}
              </div>

              <div>
                <label className="label">Confirmer le Mot de Passe</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`input ${errors.confirmPassword ? 'input-error' : ''}`}
                  placeholder="Confirmez votre mot de passe"
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isUpdatingPassword}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdatingPassword ? (
                  <div className="flex justify-center items-center">
                    <LoaderIcon className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                    Réinitialisation...
                  </div>
                ) : (
                  'Réinitialiser'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600">
                Vous vous souvenez de votre mot de passe ?{' '}
                <Link
                  to="/connexion"
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  Connexion
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResetPasswordPage;
