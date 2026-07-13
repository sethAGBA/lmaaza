# Implementation Plan: auth-backend

## Overview

Connecter toutes les pièces de l'authentification L'Maaza : corriger la configuration Vercel et package.json, réécrire AuthContext avec de vrais appels API, créer la page Login, mettre à jour ProtectedRoute et App.js. Le backend (`api/lib/auth.js`, `api/auth/login.js`, `api/auth/me.js`) et le dev-server (`server/dev-server.js`) sont déjà complets — seuls les fichiers de configuration et le frontend sont à modifier.

## Tasks

- [x] 1. Corrections de configuration (aucune dépendance entre 1.1 et 1.2)
  - [x] 1.1 Modifier `vercel.json` — passer de `rewrites` à `routes`
    - Remplacer la clé `rewrites` par `routes`
    - Ajouter la route `{ "src": "/api/auth/login", "dest": "/api/auth/login.js" }` en première position
    - Ajouter la route `{ "src": "/api/auth/me", "dest": "/api/auth/me.js" }` en deuxième position
    - Conserver le rewrite SPA `{ "src": "/(.*)", "dest": "/index.html" }` en dernière position
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 1.2 Modifier `package.json` — ajouter `jsonwebtoken` et le script `dev:api`
    - Ajouter `"jsonwebtoken": "9.0.2"` dans la section `dependencies` (pas `devDependencies`)
    - Ajouter le script `"dev:api": "node server/dev-server.js"` dans la section `scripts`
    - Ne pas modifier les autres dépendances ni scripts existants
    - _Requirements: 2.1, 2.2, 9.1_

  - [ ]* 1.3 Tests smoke — vérification statique de la configuration
    - Vérifier que `vercel.json` contient les trois routes dans le bon ordre (`/api/auth/login`, `/api/auth/me`, `/(.*)`), en utilisant `JSON.parse` + assertions Jest
    - Vérifier que `package.json` contient `jsonwebtoken` dans `dependencies` et le script `dev:api`
    - _Requirements: 1.1, 2.1, 9.1_

- [x] 2. Réécriture de `src/contexts/AuthContext.jsx`
  - [x] 2.1 Implémenter la nouvelle version d'`AuthContext` avec appels API réels
    - Remplacer le mock actuel par un contexte React utilisant `useState` et `useEffect`
    - Exposer `{ user, isLoggedIn, isAdmin, loading, login, logout }` via le Provider
    - Au montage (`useEffect`) : lire `localStorage.getItem('lmaaza_token')` ; si token non vide, appeler `GET /api/auth/me` avec `Authorization: Bearer <token>` et `AbortController` (timeout 10 s)
    - Si la réponse est 200 → `setUser(data.user)`, `loading=false`
    - Si 401, erreur réseau ou timeout → `localStorage.removeItem('lmaaza_token')`, `setUser(null)`, `loading=false`
    - Si aucun token au montage → `loading=false` immédiatement, sans appel API
    - Implémenter `login(token, user)` : `localStorage.setItem('lmaaza_token', token)`, `setUser(user)`
    - Implémenter `logout()` dans un bloc `try/catch` : `localStorage.removeItem('lmaaza_token')`, `setUser(null)` ; si `removeItem` lève une exception, ne pas modifier l'état
    - Définir `isLoggedIn = user !== null`, `isAdmin = user !== null && user.role === 'admin'`
    - Conserver le hook `useAuth()` avec la vérification d'usage hors Provider
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10, 5.1, 5.2, 5.3, 5.4, 6.6, 6.7, 7.1, 7.2_

  - [ ]* 2.2 Tests unitaires pour `AuthContext`
    - Tester que `loading=true` pendant l'appel à `/api/auth/me` et `loading=false` après
    - Tester que `/api/auth/me` est appelé au montage si token présent
    - Tester que `/api/auth/me` n'est pas appelé si token absent ou chaîne vide
    - Tester le timeout de 10 s via `AbortController` (simuler un fetch qui ne répond pas)
    - Tester que `logout()` ne modifie pas l'état si `removeItem` lève une exception
    - _Requirements: 4.3, 4.8, 4.9, 5.4, 6.7, 7.1_

  - [ ]* 2.3 Tests de propriétés pour `AuthContext` (fast-check)
    - **Property 4 : Transmission de l'en-tête Authorization** — Pour tout token non vide dans `localStorage['lmaaza_token']`, vérifier que l'appel `GET /api/auth/me` inclut `Authorization: Bearer <token>` exact
    - **Validates: Requirements 4.2, 4.3, 5.2**
    - **Property 5 : Cohérence de l'état après validation du token** — Pour tout objet `user` renvoyé par une réponse 200, vérifier que `context.user === user`, `context.isLoggedIn === true`, `context.loading === false`
    - **Validates: Requirements 4.4, 4.9**
    - **Property 6 : Calcul correct de isAdmin** — Pour toute valeur de `user.role`, `isAdmin` doit être `true` si et seulement si `role === 'admin'` ; pour `user=null`, `isAdmin=false`
    - **Validates: Requirements 4.10**
    - **Property 7 : Round-trip login/logout** — Appeler `login(token, user)` puis `logout()` doit résulter en `localStorage.getItem('lmaaza_token') === null`, `user=null`, `isLoggedIn=false`, `isAdmin=false`
    - **Validates: Requirements 4.6, 4.7, 7.1, 7.2**
    - **Property 8 : Rejet des valeurs de stockage invalides** — Pour toute valeur non-string-non-vide dans `localStorage['lmaaza_token']`, `AuthContext` ne doit pas appeler `GET /api/auth/me` et doit traiter la session comme non authentifiée
    - **Validates: Requirements 5.4**
    - Utiliser `fc.string({ minLength: 20, maxLength: 200 })` pour les tokens, `fc.record({ id: fc.string(), email: fc.emailAddress(), name: fc.string(), role: fc.string() })` pour les users
    - Minimum 100 itérations par propriété

- [x] 3. Checkpoint — Vérifier AuthContext
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Mise à jour de `src/components/admin/ProtectedRoute.jsx`
  - [x] 4.1 Mettre à jour `ProtectedRoute` avec gestion du loading et page "Accès refusé"
    - Ajouter la destructuration de `loading` depuis `useAuth()`
    - Si `loading === true` → afficher un spinner ou skeleton (ex. `<div className="min-h-screen flex items-center justify-center"><p>Chargement...</p></div>`)
    - Si `loading === false` et `isLoggedIn === false` → `<Navigate to="/login" state={{ from: location }} replace />`
    - Si `loading === false` et `isLoggedIn === true` et `isAdmin === false` → afficher une page "Accès refusé" inline (h1 rouge "Accès refusé", paragraphe en français, lien vers "/")
    - Si `isAdmin === true` → rendre `children`
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [ ]* 4.2 Tests unitaires pour `ProtectedRoute`
    - Tester que le spinner est affiché quand `loading=true`
    - Tester la redirection vers `/login` avec `state.from` quand `isLoggedIn=false`
    - Tester l'affichage de "Accès refusé" quand `isLoggedIn=true` et `isAdmin=false`
    - Tester que les enfants sont rendus quand `isAdmin=true`
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 5. Création de `src/pages/Login.jsx`
  - [x] 5.1 Implémenter la page de connexion
    - Créer `src/pages/Login.jsx` avec les états locaux `email`, `password`, `error`, `loading`
    - Afficher le formulaire avec labels, inputs et bouton en français (`<label>Adresse email</label>`, `<label>Mot de passe</label>`, bouton "Se connecter")
    - Validation côté client : si `email.trim()` ou `password.trim()` est vide → afficher "Veuillez remplir tous les champs." sans appel API ; si format email invalide (`/.+@.+\..+/`) → afficher "Adresse email invalide."
    - Si validation OK → appeler `POST /api/auth/login` avec `{ email, password }`, désactiver le bouton et afficher un spinner pendant la requête
    - Si réponse 200 → appeler `auth.login(data.token, data.user)` puis `navigate('/admin/blog')`
    - Si réponse 401 → afficher `data.error || "Email ou mot de passe incorrect."`
    - Si réponse 500 ou erreur réseau → afficher "Erreur de connexion. Veuillez réessayer."
    - Au montage, si `isLoggedIn && !loading` → `navigate('/admin/blog', { replace: true })`
    - Utiliser Tailwind CSS pour le style (centrage, carte blanche, ombre)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 3.11_

  - [ ]* 5.2 Tests unitaires pour `Login.jsx`
    - Tester que tous les labels, placeholders et le bouton sont en français
    - Tester la redirection vers `/admin/blog` si l'utilisateur est déjà connecté
    - Tester l'affichage du spinner et la désactivation du bouton pendant la requête
    - Tester l'affichage du message d'erreur réseau
    - Tester la redirection vers `/admin/blog` après connexion réussie
    - Tester l'affichage de "Veuillez remplir tous les champs." si champs vides
    - _Requirements: 3.2, 3.3, 3.6, 3.8, 3.9, 3.10, 3.11_

  - [ ]* 5.3 Tests de propriétés pour `Login.jsx` (fast-check)
    - **Property 1 : Validation des entrées du formulaire de connexion** — Pour tout couple `(email, password)` où `email.trim()` est vide, `password.trim()` est vide ou le format email est invalide, la soumission ne doit pas déclencher d'appel à `POST /api/auth/login`
    - **Validates: Requirements 3.3, 3.10**
    - **Property 2 : Appel API avec identifiants valides** — Pour tout couple d'email syntaxiquement valide et password non vide, la soumission doit déclencher exactement un appel `POST /api/auth/login` avec `{ email, password }`
    - **Validates: Requirements 3.4**
    - **Property 3 : Stockage du token après connexion réussie** — Pour tout token JWT renvoyé par une réponse 200, ce token doit être stocké dans `localStorage` sous la clé exacte `lmaaza_token`
    - **Validates: Requirements 3.5, 5.1**
    - Utiliser `fc.emailAddress()` pour les emails valides, `fc.string().filter(s => !s.trim())` pour les valeurs invalides, `fc.string({ minLength: 20, maxLength: 200 })` pour les tokens
    - Minimum 100 itérations par propriété

- [x] 6. Checkpoint — Vérifier Login et ProtectedRoute
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Mise à jour de `src/App.js` — ajouter la route `/login`
  - [x] 7.1 Ajouter l'import et la route `/login` dans `App.js`
    - Ajouter `import LoginPage from './pages/Login';` avec les autres imports de pages
    - Dans `AppRoutes()`, à l'intérieur du bloc `<Routes>`, ajouter `<Route path="/login" element={<LoginPage />} />` — la placer avant les routes `/admin` pour la lisibilité
    - Vérifier que `LoginPage` est bien enveloppée dans `<AuthProvider>` (déjà le cas via `App()`)
    - _Requirements: 10.1, 10.2, 10.3_

  - [ ]* 7.2 Tests unitaires pour la route `/login` dans `App.js`
    - Tester que la route `/login` rend `LoginPage` sans erreur 404
    - Tester que `LoginPage` peut appeler `useAuth()` depuis l'arborescence
    - _Requirements: 10.1, 10.2, 10.3_

- [ ] 8. Tests de propriétés pour `api/lib/auth.js` (fast-check)
  - [ ]* 8.1 Property 9 : Round-trip signe/vérifie JWT
    - **Property 9 : Round-trip JWT sign/verify** — Pour tout objet utilisateur valide `{ id, email, name, role }` et toute valeur de `JWT_SECRET`, `verifyToken(signToken(user))` doit retourner un objet avec les mêmes valeurs `{ id, email, name, role }`
    - **Validates: Requirements 8.1**
    - Utiliser `fc.record({ id: fc.string({ minLength: 1 }), email: fc.emailAddress(), name: fc.string({ minLength: 1 }), role: fc.constantFrom('admin', 'user') })`
    - Minimum 100 itérations

  - [ ]* 8.2 Property 10 : Validation des credentials depuis l'environnement
    - **Property 10 : Validation credentials env** — Pour toute paire `(ADMIN_EMAIL, ADMIN_PASSWORD)` définie dans les variables d'environnement, `validateCredentials(ADMIN_EMAIL, ADMIN_PASSWORD)` doit retourner un objet non nul ; toute autre paire doit retourner `null`
    - **Validates: Requirements 8.2**
    - Utiliser `fc.emailAddress()` et `fc.string({ minLength: 1 })` pour les credentials ; exclure les paires qui correspondent accidentellement aux valeurs configurées
    - Minimum 100 itérations

  - [ ]* 8.3 Tests unitaires pour `api/lib/auth.js`
    - Tester que `getJwtSecret()` lève une erreur si `NODE_ENV=production` et `JWT_SECRET` est absent
    - Tester que `getJwtSecret()` retourne la valeur de secours en développement sans `JWT_SECRET`
    - Tester que `handleLogin` retourne 400 si email ou password est absent
    - Tester que `handleLogin` retourne 401 pour credentials incorrects
    - Tester que `handleMe` retourne 401 si pas d'en-tête Authorization
    - Tester que `handleMe` retourne 401 si token expiré ou invalide
    - _Requirements: 8.1, 8.4, 8.5_

- [ ] 9. Tests d'intégration avec le Dev_Server
  - [ ]* 9.1 Tests d'intégration Auth_API via Dev_Server
    - Tester `POST /api/auth/login` avec credentials valides → réponse 200 avec `{ token, user }`
    - Tester `GET /api/auth/me` avec token valide → réponse 200 avec `{ user }`
    - Tester `GET /api/auth/me` avec token invalide → réponse 401
    - Tester que le Dev_Server démarre sur le port 3001 par défaut
    - _Requirements: 9.2, 9.3, 9.4, 9.5_

- [x] 10. Checkpoint final — Vérification complète
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Les tâches marquées `*` sont optionnelles et peuvent être ignorées pour un MVP plus rapide
- Chaque tâche référence les exigences spécifiques pour la traçabilité
- L'ordre des tâches respecte les dépendances : configuration → AuthContext → ProtectedRoute → Login.jsx → App.js → tests
- `api/lib/auth.js`, `api/auth/login.js`, `api/auth/me.js` et `server/dev-server.js` ne doivent **pas** être modifiés
- La bibliothèque de property-based testing est `fast-check` (déjà dans `devDependencies`)
- Les tests de propriétés utilisent le tag `// Feature: auth-backend, Property <N>: <titre>`

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["1.3", "2.1"] },
    { "id": 2, "tasks": ["2.2", "2.3", "4.1"] },
    { "id": 3, "tasks": ["4.2", "5.1"] },
    { "id": 4, "tasks": ["5.2", "5.3", "7.1", "8.1", "8.2", "8.3"] },
    { "id": 5, "tasks": ["7.2", "9.1"] }
  ]
}
```
