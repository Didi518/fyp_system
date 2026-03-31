import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { BookOpenIcon, LoaderIcon } from 'lucide-react';

import { login } from '../../store/slices/authSlice';

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoggingIn, authUser } = useSelector((state) => state.auth);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'Étudiant',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "L'email est requis";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "L'email est invalide";
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 8) {
      newErrors.password =
        'Le mot de passe doit contenir au moins 8 caractères';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const data = new FormData();

    data.append('email', formData.email);
    data.append('password', formData.password);
    data.append('role', formData.role);

    dispatch(login(data));
  };

  useEffect(() => {
    if (authUser) {
      switch (formData.role) {
        case 'Étudiant':
          navigate('/etudiant');
          break;
        case 'Enseignant':
          navigate('/enseignant');
          break;
        case 'Admin':
          navigate('/admin');
          break;

        default:
          navigate('/connexion');
      }
    }
  }, [authUser, formData.role, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-full mb-4">
            <BookOpenIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">
            Gestion de Projet Pédagogique
          </h1>
          <p className="text-slate-600 mt-2">Connectez-vous sur votre compte</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.general}</p>
              </div>
            )}

            <div>
              <label className="label">Rôle</label>
              <select
                className="input"
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="Étudiant">Étudiant</option>
                <option value="Enseignant">Enseignant</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="label">Adresse Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`input ${errors.email ? 'input-error' : ''}`}
                placeholder="Entrez votre email"
              />
              {errors.email && (
                <p className="text-sm text-red-600 mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="label">Mot de Passe</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`input ${errors.password ? 'input-error' : ''}`}
                placeholder="Entrez votre mot de passe"
              />
              {errors.password && (
                <p className="text-sm text-red-600 mt-1">{errors.password}</p>
              )}
            </div>

            <div className="text-right">
              <Link
                to="/mot-de-passe-oublie"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Mot de passe oublié ?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoggingIn ? (
                <div className="flex justify-center items-center">
                  <LoaderIcon className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                  Connexion...
                </div>
              ) : (
                'Connexion'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
