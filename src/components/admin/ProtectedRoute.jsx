/**
 * ProtectedRoute — protège les routes administrateur.
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 *
 * Arbre de décision :
 *   loading === true              → indicateur de chargement
 *   loading === false, !isLoggedIn → Navigate vers /login (state.from)
 *   loading === false, isLoggedIn, !isAdmin → page "Accès refusé" inline
 *   isAdmin === true              → rendre children
 *
 * Usage:
 *   <Route
 *     path="/admin/blog"
 *     element={
 *       <ProtectedRoute>
 *         <AdminBlogDashboard />
 *       </ProtectedRoute>
 *     }
 *   />
 */

import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * @param {{ children: React.ReactNode }} props
 */
function ProtectedRoute({ children }) {
  const { isLoggedIn, isAdmin, loading } = useAuth();
  const location = useLocation();

  // Req 6.1 — En cours de validation du token : afficher un indicateur de chargement
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Chargement...</p>
      </div>
    );
  }

  // Req 6.2 — Non authentifié : rediriger vers /login en préservant la destination
  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Req 6.4 — Authentifié mais pas admin : page "Accès refusé" inline
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Accès refusé</h1>
          <p className="text-gray-600 mt-2">
            Vous n'avez pas les droits suffisants pour accéder à cette page.
          </p>
          <Link to="/" className="mt-4 inline-block text-blue-600 hover:underline">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  // Req 6.3 — Admin confirmé : rendre les enfants
  return children;
}

export default ProtectedRoute;
