/**
 * AuthContext — gestion de l'authentification via appels API réels.
 * Requirements: 4, 5, 7
 *
 * Provides: { user, isLoggedIn, isAdmin, loading, login, logout }
 *
 * user shape: { id, email, name, role }  where role is 'admin' | 'user'
 *
 * Token JWT persisté dans localStorage sous la clé 'lmaaza_token'.
 * Validation au montage via GET /api/auth/me (timeout 10 secondes).
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// ─── Storage key ─────────────────────────────────────────────────────────────
const TOKEN_KEY = 'lmaaza_token';

// ─── Context ──────────────────────────────────────────────────────────────────
export const AuthContext = createContext(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  // Lire le token de manière synchrone pour initialiser loading correctement
  // (évite un flash non-authentifié si un token est présent au montage)
  const initialToken = localStorage.getItem(TOKEN_KEY);
  const hasInitialToken = typeof initialToken === 'string' && initialToken.length > 0;

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(hasInitialToken);

  // ─── Validation du token au montage ────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);

    // Pas de token ou token invalide (chaîne vide, null, undefined) → pas authentifié
    if (typeof token !== 'string' || token.length === 0) {
      setLoading(false);
      return;
    }

    // Token présent → valider auprès de l'API
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10_000);

    fetch('/api/auth/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    })
      .then((response) => {
        if (response.ok) {
          return response.json().then((data) => {
            setUser(data.user);
          });
        }
        // 401 ou tout autre statut non-OK → session invalide
        localStorage.removeItem(TOKEN_KEY);
        setUser(null);
      })
      .catch(() => {
        // Erreur réseau ou timeout (AbortError) → session invalide
        localStorage.removeItem(TOKEN_KEY);
        setUser(null);
      })
      .finally(() => {
        clearTimeout(timeoutId);
        setLoading(false);
      });

    return () => {
      // Cleanup : annuler la requête si le composant est démonté avant la réponse
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── login(token, user) ────────────────────────────────────────────────────
  /**
   * Appelé après une connexion réussie (POST /api/auth/login → 200).
   * Stocke le token JWT dans localStorage et met à jour l'état.
   */
  const login = useCallback((token, userData) => {
    localStorage.setItem(TOKEN_KEY, token);
    setUser(userData);
  }, []);

  // ─── logout() ─────────────────────────────────────────────────────────────
  /**
   * Supprime le token de localStorage et remet l'état à zéro.
   * Si removeItem lève une exception, l'état n'est pas modifié (Req 7.1).
   */
  const logout = useCallback(() => {
    try {
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
    } catch {
      // Si la suppression échoue, ne pas modifier l'état
    }
  }, []);

  // ─── Valeurs dérivées ──────────────────────────────────────────────────────
  const isLoggedIn = user !== null;
  const isAdmin = user !== null && user.role === 'admin';

  const value = { user, isLoggedIn, isAdmin, loading, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook ──────────────────────────────────────────────────────────────────────
/**
 * useAuth() — hook de consommation de l'AuthContext.
 *
 * Lève une erreur si utilisé en dehors d'un AuthProvider.
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return ctx;
}

export default AuthProvider;
