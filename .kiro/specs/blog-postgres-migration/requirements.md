# Requirements Document

## Introduction

Ce document définit les exigences pour la migration du backend du blog de L'Maaza
de localStorage vers Vercel Postgres. Le blog dynamique existe déjà côté frontend
avec `ArticleService`, `LocalStorageAdapter`, et les modèles `Article`/`MediaAsset`.
La migration introduit une couche API serverless Vercel (fonctions dans `api/blog/`)
qui expose les opérations CRUD du blog via HTTP, remplace le stockage localStorage
par Vercel Postgres, et adapte le frontend pour appeler les nouvelles routes API
en conservant les interfaces de service existantes (`ArticleService`, `SearchService`).

La plateforme L'Maaza est déployée sur Vercel (React 18 + fonctions serverless).
L'authentification JWT est déjà opérationnelle via `api/lib/auth.js`.
Toutes les réponses API sont en JSON. L'interface utilisateur reste en français.

## Glossary

- **API_Blog**: L'ensemble des fonctions serverless Vercel dans `api/blog/` gérant les opérations CRUD du blog via HTTP
- **Article**: Un article de blog avec les champs : id, title, slug, excerpt, content, author, category, tags, status, publishedAt, createdAt, updatedAt, featuredImage, seoTitle, seoDescription, seoKeywords, readTime
- **Article_Service**: Le service frontend existant (`src/services/articleService.js`) qui orchestre les opérations sur les articles
- **Admin_User**: Utilisateur authentifié avec le rôle "admin", habilité à créer, modifier, supprimer et publier des articles
- **Regular_User**: Visiteur du site pouvant consulter les articles publiés sans authentification
- **Postgres_DB**: L'instance Vercel Postgres hébergeant la table `articles`
- **LocalStorage_DB**: Le stockage localStorage navigateur utilisé avant la migration
- **Migration_Script**: Script exécuté au premier déploiement pour transférer les articles de LocalStorage_DB vers Postgres_DB
- **JWT_Token**: Jeton d'authentification signé par `api/lib/auth.js` et transmis dans l'en-tête `Authorization: Bearer <token>`
- **Published_Article**: Article avec `status = 'published'`, visible publiquement
- **Draft_Article**: Article avec `status = 'draft'`, visible uniquement par l'Admin_User
- **Pagination_Meta**: Objet JSON contenant `{ total, page, limit, totalPages }` renvoyé avec chaque liste paginée
- **POSTGRES_URL**: Variable d'environnement contenant la chaîne de connexion Vercel Postgres

## Requirements

### Requirement 1: Schéma de base de données

**User Story:** En tant que développeur système, je veux un schéma PostgreSQL correspondant exactement au modèle Article existant, afin que toutes les données du blog soient stockées de manière persistante et accessible depuis n'importe quel navigateur.

#### Acceptance Criteria

1. THE Postgres_DB SHALL contenir une table `articles` avec les colonnes : `id` (UUID, clé primaire), `title` (VARCHAR 200), `slug` (VARCHAR 255, unique), `excerpt` (VARCHAR 500), `content` (TEXT), `author` (VARCHAR 100), `category` (VARCHAR 50), `tags` (JSONB), `status` (VARCHAR 20), `published_at` (TIMESTAMPTZ, nullable), `created_at` (TIMESTAMPTZ), `updated_at` (TIMESTAMPTZ), `featured_image` (TEXT, nullable), `seo_title` (VARCHAR 60, nullable), `seo_description` (VARCHAR 160, nullable), `seo_keywords` (JSONB, nullable), `read_time` (INTEGER)
2. THE Postgres_DB SHALL enforcer une contrainte CHECK sur `status` acceptant uniquement les valeurs `'draft'` et `'published'`
3. THE Postgres_DB SHALL enforcer une contrainte CHECK sur `category` acceptant uniquement les valeurs : `'Agriculture'`, `'Santé'`, `'Éducation'`, `'Environnement'`, `'Formation'`, `'Innovation'`, `'Technologie'`
4. THE Postgres_DB SHALL créer un index sur la colonne `status` pour optimiser les requêtes de filtrage
5. THE Postgres_DB SHALL créer un index sur la colonne `category` pour optimiser les requêtes de filtrage par catégorie
6. THE Postgres_DB SHALL créer un index sur la colonne `published_at` pour optimiser le tri chronologique

### Requirement 2: Route GET /api/blog/articles — Liste des articles publiés

**User Story:** En tant que Regular_User, je veux récupérer la liste des articles publiés avec filtrage et pagination, afin d'afficher le blog correctement depuis le frontend.

#### Acceptance Criteria

1. WHEN une requête `GET /api/blog/articles` est reçue, THE API_Blog SHALL retourner uniquement les Published_Article au format JSON
2. WHEN le paramètre `?page=N&limit=M` est fourni, THE API_Blog SHALL retourner les articles correspondant à la page N avec au maximum M articles, accompagnés d'un objet Pagination_Meta
3. IF aucun paramètre `page` n'est fourni, THEN THE API_Blog SHALL utiliser `page=1` par défaut
4. IF aucun paramètre `limit` n'est fourni, THEN THE API_Blog SHALL utiliser `limit=12` par défaut
5. IF les paramètres `page` ou `limit` sont égaux à zéro, négatifs, ou non numériques, THEN THE API_Blog SHALL retourner un code HTTP 400 avec `{ "error": "Paramètres de pagination invalides" }` sans effectuer de requête Postgres_DB
5. WHEN le paramètre `?category=X` est fourni, THE API_Blog SHALL retourner uniquement les Published_Article dont la `category` correspond exactement à X
6. WHEN le paramètre `?tag=X` est fourni, THE API_Blog SHALL retourner uniquement les Published_Article dont le tableau `tags` contient X
7. WHEN le paramètre `?search=query` est fourni, THE API_Blog SHALL retourner les Published_Article dont le `title`, l'`excerpt` ou le `content` contient `query` via une recherche insensible à la casse
8. THE API_Blog SHALL trier les résultats par `published_at` décroissant (plus récent en premier) par défaut
9. THE API_Blog SHALL retourner un code HTTP 200 avec un tableau vide et Pagination_Meta si aucun article ne correspond aux filtres

### Requirement 3: Route GET /api/blog/articles/[id] — Article par identifiant ou slug

**User Story:** En tant que Regular_User, je veux récupérer un article individuel par son id ou son slug, afin d'afficher la page de détail d'un article.

#### Acceptance Criteria

1. WHEN une requête `GET /api/blog/articles/[id]` est reçue et que `[id]` correspond à un UUID existant, THE API_Blog SHALL retourner l'Article complet au format JSON avec un code HTTP 200
2. WHEN une requête `GET /api/blog/articles/[id]` est reçue et que `[id]` correspond à un slug existant, THE API_Blog SHALL retourner l'Article complet au format JSON avec un code HTTP 200
3. IF aucun article ne correspond à l'identifiant ou au slug fourni, THEN THE API_Blog SHALL retourner un code HTTP 404 avec un corps JSON `{ "error": "Article non trouvé" }`
4. WHEN l'article trouvé a le statut `'draft'` et que la requête ne contient pas de JWT_Token valide avec rôle "admin", THE API_Blog SHALL retourner un code HTTP 404

### Requirement 4: Route POST /api/blog/articles — Création d'un article

**User Story:** En tant qu'Admin_User, je veux créer un nouvel article via l'API, afin d'alimenter le blog depuis l'interface d'administration.

#### Acceptance Criteria

1. WHEN une requête `POST /api/blog/articles` est reçue avec un JWT_Token valide de rôle "admin", THE API_Blog SHALL créer l'article dans Postgres_DB et retourner un code HTTP 201 avec l'Article créé incluant au minimum les champs : `id`, `title`, `slug`, `excerpt`, `content`, `author`, `category`, `status`, `created_at`, `updated_at`
2. WHEN une requête `POST /api/blog/articles` est reçue sans JWT_Token, THE API_Blog SHALL retourner un code HTTP 401 avec `{ "error": "Non authentifié" }`
3. WHEN une requête `POST /api/blog/articles` est reçue avec un JWT_Token dont le rôle n'est pas "admin", THE API_Blog SHALL retourner un code HTTP 403 avec `{ "error": "Accès administrateur requis" }`
4. WHEN une requête `POST /api/blog/articles` est reçue avec un JWT_Token valide de rôle "admin", THE API_Blog SHALL attribuer automatiquement au nouvel article un `id` UUID v4 unique, un `created_at` et `updated_at` égaux à l'horodatage courant, et un `status` égal à `'draft'`
5. IF les champs obligatoires (`title`, `excerpt`, `content`, `author`, `category`) sont absents, composés uniquement d'espaces, ou dépassent les longueurs maximales (`title`: 255 caractères, `excerpt`: 500 caractères, `content`: 100 000 caractères, `author`: 100 caractères, `category`: 100 caractères), THEN THE API_Blog SHALL retourner un code HTTP 400 avec un objet JSON listant les erreurs par champ sans créer d'article
6. WHEN une requête `POST /api/blog/articles` est reçue avec un JWT_Token valide de rôle "admin" et qu'aucun `slug` n'est fourni, THE API_Blog SHALL générer automatiquement un `slug` composé uniquement de caractères `[a-z0-9-]` d'au maximum 255 caractères à partir du `title`, et en cas de collision d'unicité dans Postgres_DB, SHALL ajouter un suffixe numérique incrémental (ex. `mon-titre-2`, `mon-titre-3`)
7. WHEN une requête `POST /api/blog/articles` est reçue avec un JWT_Token valide de rôle "admin" mais que Postgres_DB est inaccessible, THE API_Blog SHALL retourner un code HTTP 503 avec `{ "error": "Service temporairement indisponible" }` sans persister de données partielles

### Requirement 5: Route PUT /api/blog/articles/[id] — Modification d'un article

**User Story:** En tant qu'Admin_User, je veux modifier un article existant via l'API, afin de corriger ou mettre à jour le contenu publié.

#### Acceptance Criteria

1. WHEN une requête `PUT /api/blog/articles/[id]` est reçue avec un JWT_Token valide de rôle "admin", THE API_Blog SHALL mettre à jour les champs fournis dans Postgres_DB et retourner l'Article mis à jour avec un code HTTP 200
2. THE API_Blog SHALL préserver le `id` et le `created_at` d'origine lors de toute mise à jour
3. THE API_Blog SHALL mettre à jour automatiquement le champ `updated_at` à l'horodatage courant lors de chaque modification
4. IF l'article n'existe pas, THEN THE API_Blog SHALL retourner un code HTTP 404 avec `{ "error": "Article non trouvé" }`
5. WHEN une requête `PUT /api/blog/articles/[id]` est reçue sans JWT_Token valide de rôle "admin", THE API_Blog SHALL retourner le code HTTP approprié (401 ou 403)
6. IF les champs fournis échouent à la validation, THEN THE API_Blog SHALL retourner un code HTTP 400 avec les détails des erreurs par champ

### Requirement 6: Route DELETE /api/blog/articles/[id] — Suppression d'un article

**User Story:** En tant qu'Admin_User, je veux supprimer définitivement un article via l'API, afin de retirer du contenu obsolète ou erroné.

#### Acceptance Criteria

1. WHEN une requête `DELETE /api/blog/articles/[id]` est reçue avec un JWT_Token valide de rôle "admin", THE API_Blog SHALL supprimer l'article de Postgres_DB et retourner un code HTTP 200 avec `{ "message": "Article supprimé" }`
2. IF l'article n'existe pas lors d'une requête `DELETE /api/blog/articles/[id]`, THEN THE API_Blog SHALL retourner un code HTTP 404 avec `{ "error": "Article non trouvé" }`
3. IF la suppression échoue pour une raison technique (erreur Postgres_DB ou contrainte), THEN THE API_Blog SHALL retourner un code HTTP 500 avec `{ "error": "Erreur lors de la suppression de l'article" }`
4. WHEN une requête `DELETE /api/blog/articles/[id]` est reçue sans JWT_Token valide de rôle "admin", THE API_Blog SHALL retourner le code HTTP approprié (401 ou 403) avant tout traitement

### Requirement 7: Routes de publication et dépublication

**User Story:** En tant qu'Admin_User, je veux publier ou dépublier un article en un seul appel API dédié, afin de contrôler précisément la visibilité du contenu.

#### Acceptance Criteria

1. WHEN une requête `PUT /api/blog/articles/[id]/publish` est reçue avec un JWT_Token valide de rôle "admin", THE API_Blog SHALL changer le `status` à `'published'`, définir `published_at` à l'horodatage courant si la valeur est null, mettre à jour `updated_at`, et retourner l'Article mis à jour avec un code HTTP 200
2. WHEN une requête `PUT /api/blog/articles/[id]/unpublish` est reçue avec un JWT_Token valide de rôle "admin", THE API_Blog SHALL changer le `status` à `'draft'`, conserver la valeur existante de `published_at`, mettre à jour `updated_at`, et retourner l'Article mis à jour avec un code HTTP 200
3. IF l'article n'existe pas lors d'une tentative de publication ou dépublication, THEN THE API_Blog SHALL retourner un code HTTP 404 avec `{ "error": "Article non trouvé" }`
4. WHEN une requête de publication ou dépublication est reçue sans JWT_Token valide de rôle "admin", THE API_Blog SHALL retourner le code HTTP approprié (401 ou 403) avant tout traitement de l'article

### Requirement 8: Route GET /api/blog/articles/[id]/related — Articles liés

**User Story:** En tant que Regular_User, je veux voir des suggestions d'articles liés sur la page d'un article, afin de découvrir davantage de contenu pertinent.

#### Acceptance Criteria

1. WHEN une requête `GET /api/blog/articles/[id]/related` est reçue, THE API_Blog SHALL retourner au maximum 4 Published_Article partageant la même `category` ou au moins un `tag` en commun avec l'article demandé, au format JSON avec un code HTTP 200
2. THE API_Blog SHALL exclure l'article lui-même des résultats d'articles liés
3. IF l'article n'existe pas, THEN THE API_Blog SHALL retourner un code HTTP 404 avec `{ "error": "Article non trouvé" }`
4. IF aucun article lié n'est trouvé, THEN THE API_Blog SHALL retourner un code HTTP 200 avec un tableau vide

### Requirement 9: Middleware d'authentification

**User Story:** En tant que développeur système, je veux un middleware d'authentification réutilisable pour les routes admin, afin de protéger les opérations sensibles sans dupliquer la logique.

#### Acceptance Criteria

1. THE API_Blog SHALL réutiliser les fonctions `verifyToken` et `extractBearerToken` de `api/lib/auth.js` pour valider les JWT_Token dans toutes les routes protégées
2. WHEN un JWT_Token est absent de l'en-tête `Authorization`, THE API_Blog SHALL retourner un code HTTP 401 avec `{ "error": "Non authentifié" }`
3. WHEN un JWT_Token est présent mais expiré ou invalide, THE API_Blog SHALL retourner un code HTTP 401 avec `{ "error": "Session expirée ou invalide" }`
4. WHEN un JWT_Token est valide mais que le rôle de l'utilisateur n'est pas "admin", THE API_Blog SHALL retourner un code HTTP 403 avec `{ "error": "Accès administrateur requis" }`
5. THE API_Blog SHALL répondre aux requêtes HTTP OPTIONS avec les en-têtes CORS appropriés et un code HTTP 204 pour toutes les routes `/api/blog/*`

### Requirement 10: Adaptation du frontend — remplacement de localStorage

**User Story:** En tant que Regular_User et Admin_User, je veux que le frontend appelle les nouvelles routes API au lieu de localStorage, afin que les articles soient visibles depuis n'importe quel navigateur.

#### Acceptance Criteria

1. THE Article_Service SHALL remplacer les appels à `LocalStorageAdapter` par des appels `fetch` vers les routes `API_Blog` correspondantes pour toutes les opérations CRUD
2. THE Article_Service SHALL transmettre le JWT_Token dans l'en-tête `Authorization: Bearer <token>` pour toutes les opérations nécessitant le rôle "admin"
3. THE Article_Service SHALL conserver les signatures de méthodes existantes (`createArticle`, `updateArticle`, `deleteArticle`, `getArticle`, `getAllArticles`, `getPublishedArticles`, `publishArticle`, `unpublishArticle`, `getSuggestedRelatedArticles`) afin de ne pas modifier les composants React consommateurs
4. WHEN une requête API échoue avec un code HTTP 4xx ou 5xx, THE Article_Service SHALL propager une erreur avec un message en français lisible par l'interface utilisateur ; IF la génération du message français échoue, THEN THE Article_Service SHALL propager l'erreur originale sans la supprimer
5. THE Article_Service SHALL supporter la pagination en transmettant les paramètres `page` et `limit` aux appels `GET /api/blog/articles`
6. THE Article_Service SHALL supporter les filtres `category`, `tag` et `search` en les transmettant comme paramètres de requête à `GET /api/blog/articles`

### Requirement 11: Migration des données existantes

**User Story:** En tant que développeur système, je veux un script de migration exécutable une seule fois, afin de transférer les articles existants de localStorage vers Postgres_DB sans perte de données.

#### Acceptance Criteria

1. THE Migration_Script SHALL lire les articles stockés dans LocalStorage_DB sous la clé `lmaaza_blog_articles` et les insérer dans Postgres_DB
2. THE Migration_Script SHALL préserver pour chaque article : `id`, `title`, `slug`, `excerpt`, `content`, `author`, `category`, `tags`, `status`, `published_at`, `created_at`, `updated_at`, `featured_image`, `seo_title`, `seo_description`, `seo_keywords`, `read_time`
3. WHEN un article avec le même `id` existe déjà dans Postgres_DB, THE Migration_Script SHALL ignorer l'article silencieusement et continuer sans erreur ni mention dans le résumé (idempotence)
4. THE Migration_Script SHALL afficher un résumé indiquant le nombre d'articles migrés et les erreurs éventuelles
5. IF Postgres_DB est inaccessible lors de l'exécution, THEN THE Migration_Script SHALL afficher un message d'erreur explicite et terminer immédiatement avec un code de sortie non nul sans tenter de reconnexion

### Requirement 12: Gestion des médias

**User Story:** En tant qu'Admin_User, je veux que les images des articles soient correctement stockées et affichées après la migration, afin de préserver l'intégrité visuelle du contenu.

#### Acceptance Criteria

1. THE API_Blog SHALL stocker les images en tant que valeurs base64 ou URLs dans la colonne `featured_image` de la table `articles`
2. THE API_Blog SHALL stocker les images et vidéos embarquées dans le contenu HTML directement dans la colonne `content`
3. WHEN le frontend reçoit un Article de l'API_Blog avec une valeur `featured_image` non null, THE Article_Service SHALL utiliser cette valeur comme source de l'image principale de l'article
4. THE API_Blog SHALL accepter des valeurs `featured_image` dont la taille base64 ne dépasse pas 2 Mo par article

### Requirement 13: Configuration des variables d'environnement

**User Story:** En tant que développeur système, je veux que la connexion Postgres soit configurée via une variable d'environnement, afin de sécuriser les credentials et faciliter le déploiement sur Vercel.

#### Acceptance Criteria

1. THE API_Blog SHALL utiliser la variable d'environnement `POSTGRES_URL` comme chaîne de connexion à Postgres_DB pour toutes les opérations de base de données
2. IF la variable `POSTGRES_URL` est absente en environnement de production, THEN THE API_Blog SHALL retourner un code HTTP 500 avec `{ "error": "Configuration base de données manquante" }` pour toute requête reçue, indépendamment du moment de détection
3. THE API_Blog SHALL utiliser la variable d'environnement `JWT_SECRET` existante (déjà gérée par `api/lib/auth.js`) pour la validation des tokens sans duplication de configuration

### Requirement 14: Configuration vercel.json — Routes /api/blog/*

**User Story:** En tant que développeur système, je veux que les routes `/api/blog/*` soient correctement déclarées dans `vercel.json` avant le rewrite SPA, afin que Vercel les route vers les fonctions serverless et non vers `index.html`.

#### Acceptance Criteria

1. THE Article_Service SHALL déclarer les routes `/api/blog/*` dans `vercel.json` avant la règle de rewrite SPA `/(.*) → /index.html`
2. THE Article_Service SHALL router `/api/blog/articles` vers le fichier `api/blog/articles.js`
3. THE Article_Service SHALL router `/api/blog/articles/[id]` vers le fichier `api/blog/[id].js` ou équivalent Vercel
4. THE Article_Service SHALL router `/api/blog/articles/[id]/publish` vers le fichier `api/blog/[id]/publish.js` ou équivalent Vercel
5. THE Article_Service SHALL router `/api/blog/articles/[id]/unpublish` vers le fichier `api/blog/[id]/unpublish.js` ou équivalent Vercel
6. THE Article_Service SHALL router `/api/blog/articles/[id]/related` vers le fichier `api/blog/[id]/related.js` ou équivalent Vercel

### Requirement 15: Pagination et métadonnées

**User Story:** En tant que Regular_User, je veux que le frontend reçoive les métadonnées de pagination avec chaque liste d'articles, afin d'afficher correctement les contrôles de navigation entre les pages.

#### Acceptance Criteria

1. WHEN l'API_Blog retourne une liste d'articles, THE API_Blog SHALL inclure dans la réponse un objet `pagination` contenant : `total` (nombre total d'articles correspondant aux filtres), `page` (page courante), `limit` (nombre d'articles par page), `totalPages` (nombre total de pages calculé comme `ceil(total / limit)`)
2. THE API_Blog SHALL retourner un tableau `data` contenant les articles de la page courante en parallèle de l'objet `pagination`
3. IF la page demandée dépasse `totalPages` et que `totalPages > 0`, THEN THE API_Blog SHALL retourner un code HTTP 400 avec `{ "error": "Page hors limites" }`
4. WHEN `totalPages` est égal à zéro (aucun résultat), THE API_Blog SHALL retourner un code HTTP 200 avec un tableau `data` vide et l'objet `pagination` indiquant les valeurs calculées, sans retourner d'erreur 400

### Requirement 16: Recherche full-text

**User Story:** En tant que Regular_User, je veux effectuer une recherche textuelle dans les articles, afin de trouver rapidement les contenus qui m'intéressent.

#### Acceptance Criteria

1. WHEN le paramètre `?search=query` est fourni à `GET /api/blog/articles`, THE API_Blog SHALL rechercher `query` dans les colonnes `title`, `excerpt` et `content` via une comparaison insensible à la casse (PostgreSQL `ILIKE`)
2. THE API_Blog SHALL retourner uniquement les Published_Article dont au moins une des colonnes `title`, `excerpt` ou `content` contient la chaîne `query`
3. WHEN les paramètres `?search=query&category=X` sont fournis simultanément, THE API_Blog SHALL appliquer les deux filtres en conjonction (AND) et retourner uniquement les Published_Article satisfaisant les deux critères
4. IF le paramètre `search` est une chaîne vide ou composée uniquement d'espaces, THEN THE API_Blog SHALL ignorer le filtre de recherche et retourner tous les Published_Article correspondant aux autres filtres actifs
