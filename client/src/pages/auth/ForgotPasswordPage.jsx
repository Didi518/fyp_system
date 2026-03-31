import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { KeyRoundIcon, LoaderIcon } from 'lucide-react';

import { forgotPassword } from '../../store/slices/authSlice';

const ForgotPasswordPage = () => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { isRequestingForToken } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError("L'email est requis");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("L'email est invalide");
      return;
    }

    setError('');

    try {
      await dispatch(forgotPassword({ email })).unwrap();
      setIsSubmitted(true);
    } catch (error) {
      setError(error.message || 'Une erreur est survenue');
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-800">
              Vérifiez Votre Email
            </h1>
            <p className="text-slate-600 mt-2">
              Nous vous avons envoyé un lien pour réinitialiser votre mot de
              passe sur votre boite de réception.
            </p>
          </div>

          <div className="card">
            <div className="text-center">
              <p className="text-slate-700 mb-4">
                Si un compte associé à <strong>{email}</strong> existe, vous
                recevrez un lien pour réinitialiser votre mot de passe très
                vite.
              </p>
              <div className="space-y-3">
                <Link
                  to="/connexion"
                  className="w-full btn-primary inline-block text-center"
                >
                  Vers la Connexion
                </Link>
                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setEmail('');
                  }}
                  className="w-full btn-outline"
                >
                  Réessayer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-full mb-4">
              <KeyRoundIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">
              Mot de Passe Oublié ?
            </h1>
            <p className="text-slate-600 mt-2">
              Entrez votre adresse email et nous vous enverrons un lien pour
              réinitialiser votre mot de passe.
            </p>
          </div>

          <div className="card">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div>
                <label className="label">Adresse Email</label>
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  className={`input ${error ? 'input-error' : ''}`}
                  placeholder="Entrez votre email"
                  disabled={isRequestingForToken}
                />
                {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
              </div>

              <button
                type="submit"
                disabled={isRequestingForToken}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRequestingForToken ? (
                  <div className="flex justify-center items-center">
                    <LoaderIcon className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                    Envoi...
                  </div>
                ) : (
                  'Envoyer le Lien'
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

export default ForgotPasswordPage;
