/**
 * Login.jsx — Page de connexion
 * Requirements: 3, 10
 *
 * Affiche un formulaire email/mot de passe, valide les entrées côté client,
 * appelle POST /api/auth/login et gère les réponses.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { login, isLoggedIn, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Au montage, si déjà authentifié → rediriger vers /admin/blog
  useEffect(() => {
    if (isLoggedIn && !authLoading) {
      navigate('/admin/blog', { replace: true });
    }
  }, [isLoggedIn, authLoading, navigate]);

  // ─── Validation côté client ──────────────────────────────────────────────
  function validate() {
    if (email.trim() === '' || password.trim() === '') {
      setError('Veuillez remplir tous les champs.');
      return false;
    }
    if (!/.+@.+\..+/.test(email)) {
      setError('Adresse email invalide.');
      return false;
    }
    return true;
  }

  // ─── Soumission du formulaire ─────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!validate()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // 200 → stocker le token et rediriger
        login(data.token, data.user);
        navigate('/admin/blog');
      } else if (response.status === 401) {
        setError(data.error || 'Email ou mot de passe incorrect.');
      } else {
        // 500 ou tout autre code d'erreur
        setError('Erreur de connexion. Veuillez réessayer.');
      }
    } catch {
      // Erreur réseau (fetch rejeté)
      setError('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        {/* Titre */}
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Connexion
        </h1>

        {/* Message d'erreur */}
        {error && (
          <div
            role="alert"
            className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} noValidate>
          {/* Champ email */}
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Adresse email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@lmaaza.net"
              autoComplete="email"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          {/* Champ mot de passe */}
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          {/* Bouton de soumission */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {loading ? (
              <>
                {/* Spinner */}
                <svg
                  className="mr-2 h-4 w-4 animate-spin text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Connexion en cours…
              </>
            ) : (
              'Se connecter'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
