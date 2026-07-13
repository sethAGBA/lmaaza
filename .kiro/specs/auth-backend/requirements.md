# Requirements Document

## Introduction

Ce document couvre la mise en place de l'authentification réelle pour la plateforme L'Maaza. Le projet dispose déjà de handlers Vercel serverless (`api/auth/login.js`, `api/auth/me.js`) et d'une bibliothèque partagée (`api/lib/auth.js`) qui gèrent JWT, validation des credentials et extraction du token. Cependant, plusieurs pièces sont manquantes ou incomplètes :

- `vercel.json` n'expose pas les routes `/api` — elles sont absorbées par le rewrite SPA
- `jsonwebtoken` n'est pas déclaré dans `package.json` (utilisé par `api/lib/auth.js`)
- `AuthContext` utilise un mock sans appel réseau
- `ProtectedRoute` redirige vers `/profil` au lieu d'une page `/login` dédiée
- Aucune page `/login` n'existe dans `src/pages/`

L'objectif est de connecter toutes ces pièces pour obtenir une authentification fonctionnelle en production (Vercel) et en développement local.

---

## Glossary

- **Auth_API** : les fonctions serverless Vercel exposées sous `/api/auth/` (login, me)
- **Auth_Library** : le module `api/lib/auth.js` partagé entre l'Auth_API et le Dev_Server
- **AuthContext** : le contexte React `src/contexts/AuthContext.jsx` qui gère l'état d'authentification côté frontend
- **Dev_Server** : le serveur Express local `server/dev-server.js` qui simule l'Auth_API en développement sur le port 3001
- **Login_Page** : la page React `/login` (`src/pages/Login.jsx`) affichant le formulaire de connexion
- **ProtectedRoute** : le composant React `src/components/admin/ProtectedRoute.jsx` qui protège les routes admin
- **Token_JWT** : jeton d'authentification JSON Web Token signé avec `JWT_SECRET`, valide 7 jours
- **Token_Storage** : clé `lmaaza_token` dans `localStorage` du navigateur
- **Vercel_Config** : le fichier `vercel.json` qui configure le routage de la plateforme Vercel
- **Package_Config** : le fichier `package.json` qui déclare les dépendances du projet
- **App** : le composant racine React `src/App.js` qui déclare le Router et toutes les routes

---

## Requirements

### Requirement 1: Configuration du routage Vercel

**User Story:** En tant qu'administrateur déployant sur Vercel, je veux que les routes `/api/auth/*` soient servies par les fonctions serverless, afin que l'API d'authentification soit disponible en production sans interférer avec le routing SPA.

#### Acceptance Criteria

1. THE **Vercel_Config** SHALL déclarer la route `/api/auth/login` comme fonction serverless pointant vers `api/auth/login.js`
2. THE **Vercel_Config** SHALL déclarer la route `/api/auth/me` comme fonction serverless pointant vers `api/auth/me.js`
3. WHEN une requête correspond à `/api/auth/login` ou `/api/auth/me`, THE **Vercel_Config** SHALL router la requête vers la fonction serverless correspondante avant d'appliquer le rewrite SPA
4. WHEN une requête ne correspond à aucune route `/api`, THE **Vercel_Config** SHALL appliquer le rewrite `/(.*) → /index.html` pour le routing SPA
5. THE **Vercel_Config** SHALL conserver le rewrite SPA existant sans le supprimer ni le modifier

---

### Requirement 2: Dépendance jsonwebtoken

**User Story:** En tant que développeur déployant l'application, je veux que `jsonwebtoken` soit déclaré comme dépendance de production, afin que la fonction serverless puisse signer et vérifier les tokens JWT sans erreur de module manquant.

#### Acceptance Criteria

1. THE **Package_Config** SHALL déclarer `jsonwebtoken` dans la section `dependencies` avec une version compatible avec l'API utilisée dans `api/lib/auth.js`
2. WHEN `npm install` est exécuté, THE **Package_Config** SHALL permettre l'installation de `jsonwebtoken` dans `node_modules`
3. THE **Auth_Library** SHALL pouvoir appeler `require('jsonwebtoken')` sans erreur en production Vercel

---

### Requirement 3: Page de connexion

**User Story:** En tant qu'administrateur, je veux accéder à une page de connexion dédiée à l'URL `/login`, afin de pouvoir saisir mes identifiants et accéder au tableau de bord admin.

#### Acceptance Criteria

1. THE **Login_Page** SHALL afficher un formulaire comportant un champ email, un champ mot de passe et un bouton de soumission
2. THE **Login_Page** SHALL afficher tous les libellés, placeholders et messages en français
3. WHEN le formulaire est soumis, IF les champs email ou mot de passe contiennent uniquement des espaces ou une adresse email mal formée, THEN THE **Login_Page** SHALL afficher un message de validation sans appeler `POST /api/auth/login`
4. WHEN le formulaire est soumis avec un email valide et un mot de passe non vide, THE **Login_Page** SHALL appeler `POST /api/auth/login` avec le corps `{ email, password }`
5. WHEN `POST /api/auth/login` répond avec un statut 200, THE **Login_Page** SHALL stocker le token reçu dans le **Token_Storage** et déclencher la mise à jour de l'**AuthContext**
6. WHEN `POST /api/auth/login` répond avec un statut 200, THE **Login_Page** SHALL rediriger l'utilisateur vers `/admin/blog`
7. WHEN `POST /api/auth/login` répond avec un statut 401, THE **Login_Page** SHALL afficher le message d'erreur retourné par l'API ; si ce message n'est pas disponible ou n'est pas en français, THE **Login_Page** SHALL afficher "Email ou mot de passe incorrect."
8. WHEN `POST /api/auth/login` échoue pour une raison réseau ou retourne un statut 500, THE **Login_Page** SHALL afficher le message "Erreur de connexion. Veuillez réessayer."
9. WHILE la requête de connexion est en cours, THE **Login_Page** SHALL désactiver le bouton de soumission et afficher un indicateur de chargement
10. IF les champs email ou mot de passe sont vides ou contiennent uniquement des espaces lors de la soumission, THEN THE **Login_Page** SHALL afficher le message "Veuillez remplir tous les champs." sans envoyer de requête
11. WHEN un utilisateur déjà authentifié accède à `/login`, THE **Login_Page** SHALL rediriger vers `/admin/blog`

---

### Requirement 4: AuthContext avec appels API réels

**User Story:** En tant que développeur frontend, je veux qu'AuthContext gère l'état d'authentification via des appels API réels, afin que les sessions soient validées par le backend et non simulées localement.

#### Acceptance Criteria

1. THE **AuthContext** SHALL exposer les valeurs `user`, `isLoggedIn`, `isAdmin`, `login`, `logout` et `loading` à ses enfants React
2. IF `localStorage.getItem('lmaaza_token')` retourne une chaîne non vide au montage, THEN THE **AuthContext** SHALL utiliser cette valeur comme token de session à valider
3. WHEN un token est trouvé au montage, THE **AuthContext** SHALL appeler `GET /api/auth/me` avec l'en-tête `Authorization: Bearer <token>` pour valider la session
4. WHEN `GET /api/auth/me` répond avec un statut 200, THE **AuthContext** SHALL mettre à jour `user` avec l'objet utilisateur retourné et positionner `isLoggedIn` à `true`
5. IF `GET /api/auth/me` répond avec un statut 401 ou une erreur réseau au montage, THEN THE **AuthContext** SHALL supprimer le token du **Token_Storage** et positionner `user` à `null`
6. WHEN la fonction `login(token, user)` est appelée, THE **AuthContext** SHALL stocker le token dans `localStorage` sous la clé `lmaaza_token`, mettre à jour `user` et positionner `isLoggedIn` à `true`
7. WHEN la fonction `logout()` est appelée, THE **AuthContext** SHALL supprimer la clé `lmaaza_token` de `localStorage`, positionner `user` à `null` et `isLoggedIn` à `false`
8. WHILE la validation du token au montage est en cours, THE **AuthContext** SHALL positionner `loading` à `true`
9. WHEN la validation du token au montage est terminée (succès ou échec), THE **AuthContext** SHALL positionner `loading` à `false`
10. THE **AuthContext** SHALL définir `isAdmin` à `true` uniquement lorsque `user` est non nul et `user.role` est égal à `'admin'` ; dans tous les autres cas `isAdmin` SHALL être `false`

---

### Requirement 5: Stockage et transmission du Token JWT

**User Story:** En tant qu'utilisateur authentifié, je veux que mon token JWT soit persisté et transmis automatiquement aux requêtes protégées, afin de maintenir ma session active sans ressaisir mes identifiants.

#### Acceptance Criteria

1. THE **AuthContext** SHALL stocker le **Token_JWT** exclusivement dans `localStorage` sous la clé `lmaaza_token`
2. WHEN une requête vers `GET /api/auth/me` est émise, THE **AuthContext** SHALL inclure l'en-tête `Authorization: Bearer <token>` avec le token lu depuis le **Token_Storage**
3. WHEN `logout()` est appelé, THE **AuthContext** SHALL appeler `localStorage.removeItem('lmaaza_token')` pour effacer le token
4. IF le **Token_Storage** contient une valeur qui n'est pas une chaîne non vide, THEN THE **AuthContext** SHALL l'ignorer et traiter la session comme non authentifiée

---

### Requirement 6: ProtectedRoute avec vérification API

**User Story:** En tant qu'administrateur, je veux que les routes protégées vérifient mon token auprès de l'API au chargement, afin que l'accès soit refusé si ma session a expiré même si un token est présent dans localStorage.

#### Acceptance Criteria

1. WHILE `AuthContext.loading` est `true`, THE **ProtectedRoute** SHALL afficher un élément visible en remplacement des composants enfants et ne pas effectuer de redirection
2. IF `AuthContext.loading` est `false` et `isLoggedIn` est `false`, THEN THE **ProtectedRoute** SHALL rediriger vers `/login` en préservant la destination dans `state.from`
3. IF `AuthContext.loading` est `false` et `isAdmin` est `true`, THEN THE **ProtectedRoute** SHALL rendre les composants enfants sans redirection
4. WHEN `AuthContext.loading` est `false`, `isLoggedIn` est `true` et `isAdmin` est `false`, THEN THE **ProtectedRoute** SHALL afficher une page "Accès refusé" avec un message en français indiquant que l'utilisateur n'a pas les droits suffisants, sans rediriger vers `/login`
5. THE **ProtectedRoute** SHALL utiliser le hook `useAuth()` de l'**AuthContext** pour accéder à `isLoggedIn`, `isAdmin` et `loading`
6. WHEN le **ProtectedRoute** est monté et qu'un token est présent dans le **Token_Storage**, THE **AuthContext** SHALL appeler `GET /api/auth/me` pour valider la session avant de rendre les enfants ou d'effectuer une redirection
7. IF l'appel à `GET /api/auth/me` échoue (erreur réseau ou timeout dépassant 10 secondes), THEN THE **AuthContext** SHALL positionner `loading` à `false` et `isLoggedIn` à `false`, et effacer le **Token_Storage**

---

### Requirement 7: Déconnexion

**User Story:** En tant qu'administrateur connecté, je veux pouvoir me déconnecter, afin que ma session soit terminée et que l'accès aux pages admin soit bloqué immédiatement.

#### Acceptance Criteria

1. WHEN `logout()` est appelé depuis n'importe quel composant, IF `localStorage.removeItem('lmaaza_token')` s'exécute sans erreur, THEN THE **AuthContext** SHALL positionner `user` à `null` et `isLoggedIn` à `false` ; IF la suppression du token échoue, THEN THE **AuthContext** SHALL interrompre la déconnexion et ne pas modifier le state
2. WHEN `logout()` est appelé, THE **AuthContext** SHALL positionner `isLoggedIn` à `false` et `isAdmin` à `false`
3. WHEN l'utilisateur est déconnecté et tente d'accéder à une route protégée, THE **ProtectedRoute** SHALL rediriger vers `/login`

---

### Requirement 8: Variables d'environnement

**User Story:** En tant que développeur déployant sur Vercel, je veux que les credentials admin et le secret JWT soient configurés via des variables d'environnement, afin de ne pas exposer de données sensibles dans le code source.

#### Acceptance Criteria

1. THE **Auth_Library** SHALL lire `JWT_SECRET` depuis `process.env.JWT_SECRET` pour signer et vérifier les tokens
2. THE **Auth_Library** SHALL lire `ADMIN_EMAIL` et `ADMIN_PASSWORD` depuis les variables d'environnement pour valider les credentials admin ; ces deux variables doivent être disponibles au moment de la validation des credentials
3. THE **Auth_Library** SHALL lire `ADMIN_NAME` depuis `process.env.ADMIN_NAME` pour renseigner le nom de l'utilisateur admin avec la valeur par défaut `'Administrateur'`
4. IF `JWT_SECRET` est absent en environnement de production, THEN THE **Auth_Library** SHALL lever une erreur avec le message `'JWT_SECRET is required in production'`
5. WHERE l'environnement est différent de `'production'`, THE **Auth_Library** SHALL utiliser la valeur de secours `'lmaaza-dev-secret-change-in-production'` lorsque `JWT_SECRET` est absent
6. THE **Dev_Server** SHALL tenter de charger les variables d'environnement depuis `.env.local` en priorité ; WHERE `.env.local` est absent ou échoue à se charger, THE **Dev_Server** SHALL charger uniquement `.env`

---

### Requirement 9: Serveur de développement local

**User Story:** En tant que développeur, je veux pouvoir lancer l'API d'authentification localement avec `npm run dev:api`, afin de tester l'intégration frontend/backend sans déployer sur Vercel.

#### Acceptance Criteria

1. THE **Package_Config** SHALL déclarer un script `"dev:api"` qui exécute `node server/dev-server.js`
2. WHEN `npm run dev:api` est exécuté, THE **Dev_Server** SHALL démarrer sur le port défini par `process.env.API_PORT` ou sur le port `3001` par défaut
3. WHEN le **Dev_Server** est démarré, THE **Dev_Server** SHALL exposer `POST /api/auth/login` en déléguant à la fonction `handleLogin` de l'**Auth_Library**
4. WHEN le **Dev_Server** est démarré, THE **Dev_Server** SHALL exposer `GET /api/auth/me` en déléguant à la fonction `handleMe` de l'**Auth_Library**
5. THE **Dev_Server** SHALL utiliser le même code d'**Auth_Library** que les fonctions serverless Vercel afin de garantir la parité de comportement
6. WHERE un fichier `.env.local` est présent à la racine du projet, THE **Dev_Server** SHALL charger les variables d'environnement depuis ce fichier au démarrage

---

### Requirement 10: Routage React et intégration de la page Login

**User Story:** En tant qu'utilisateur, je veux que la route `/login` soit disponible dans l'application React, afin que les redirections de ProtectedRoute et les liens de navigation atteignent la page de connexion.

#### Acceptance Criteria

1. THE **App** SHALL déclarer une route avec `path="/login"` qui rend la **Login_Page** dans le Router
2. WHEN un composant effectue une navigation vers `/login`, THE **App** SHALL rendre la **Login_Page** sans déclencher d'erreur 404
3. THE **App** SHALL envelopper la **Login_Page** dans l'**AuthContext** Provider afin que la **Login_Page** puisse appeler `useAuth()`
