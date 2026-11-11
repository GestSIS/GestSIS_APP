[![CI](https://github.com/GestSIS/GestSIS_APP/actions/workflows/main.yml/badge.svg)](https://github.com/GestSIS/GestSIS_APP/actions/workflows/main.yml)

# GestSIS_APP

Application web de GestSIS, la gestion des services d'incendie et de secours (SIS) : effectif,
exercices, interventions, matériel, comptabilité…

C'est une application monopage (SPA) qui ne fait que de l'affichage : les données viennent de
[GestSIS_API](https://github.com/GestSIS/GestSIS_API) et la connexion de
[GestSIS_Auth](https://github.com/GestSIS/GestSIS_Auth).

**Stack** : Vue 3 (Composition API, `<script setup>`) · Vite+ · Pinia · Vue Router · Bootstrap 5 ·
Axios · FontAwesome. Versions exactes : [`package.json`](package.json).

## Démarrer

### Avec l'environnement Docker (recommandé)

L'application a besoin de l'API et du serveur d'authentification pour fonctionner. Le dépôt
[GestSIS_Dev_docker](https://github.com/GestSIS/GestSIS_Dev_docker) démarre tous les services
(APP, API, Auth, base de données…) en quelques commandes :

```bash
make init   # sous-modules, clés, fichiers .env
make up     # démarre les services
```

L'application est alors disponible sur <http://localhost:8080>, avec rechargement à chaud : modifier
un fichier sur l'hôte suffit. Les commandes s'exécutent dans le conteneur, par exemple :

```bash
docker compose exec app yarn lint
```

### Sans Docker

Prérequis : Node.js 26 et Yarn 4 (`corepack enable`), ainsi qu'une API et un serveur
d'authentification accessibles.

```bash
yarn install
cp .env.example .env.local   # puis adapter les URL si besoin
yarn dev                     # http://localhost:5173
```

Pour accéder au serveur de développement depuis une autre machine (machine virtuelle, téléphone sur
le même réseau), lancez `yarn dev --host` et remplacez `127.0.0.1` par l'adresse de la machine dans
`.env.local`.

## Configuration

Variables lues depuis `.env.local` (voir [`.env.example`](.env.example)) :

| Variable             | Rôle                                                       |
| -------------------- | ---------------------------------------------------------- |
| `VITE_API_ENDPOINT`  | URL de GestSIS_API, ex. `http://127.0.0.1:8000/api/v2`     |
| `VITE_AUTH_ENDPOINT` | URL de GestSIS_Auth, ex. `http://127.0.0.1:8001/api/v1`    |
| `VITE_DOC_ENDPOINT`  | URL de la documentation utilisateur (GestSIS_Doc)          |
| `VITE_SENTRY_DSN`    | Optionnel : envoi des erreurs à Bugsink. Vide = désactivé. |

Au build uniquement, `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN` et `SENTRY_URL` permettent
d'envoyer les sourcemaps à Bugsink. Sans `SENTRY_AUTH_TOKEN` (cas local), cet envoi est simplement
ignoré.

## Commandes

| Commande       | Rôle                                                                |
| -------------- | ------------------------------------------------------------------- |
| `yarn dev`     | Serveur de développement avec rechargement à chaud                  |
| `yarn build`   | Compilation pour la production (dossier `dist/`)                    |
| `yarn preview` | Aperçu local de la version compilée                                 |
| `yarn lint`    | Analyse du code de `src/` et correction automatique quand c'est sûr |
| `yarn fmt`     | Mise en forme du code                                               |
| `yarn check`   | Mise en forme, lint et vérification des types en une commande       |

Il n'y a pas encore de tests automatisés : un changement se valide avec `yarn lint` et un
`yarn build` qui passe.

## Organisation du code

```text
src/
├── pages/        écrans liés à une route
├── components/   composants, dont components/base/ (base-table, base-select… disponibles partout)
├── stores/       état partagé (Pinia), par domaine
├── services/     appels à l'API, un service par ressource
├── composables/  logique réutilisable (useSubmit, useDownload, useNotification…)
├── tools/        fonctions pures : formatage, dates, règles métier
└── router/       routes et menu
```

Les conventions (composants de base, gestion des appels API, messages, stockage navigateur…) sont
décrites dans [AGENTS.md](AGENTS.md).

## Déploiement

Chaque push sur `main` lance la [CI](.github/workflows/main.yml) : elle compile l'application,
envoie les sourcemaps à Bugsink puis déploie le dossier `dist/`.

Les nouveautés visibles par les utilisateurs sont ajoutées dans [`releases.json`](releases.json),
affiché dans l'application (page « À propos »).

## Contribuer

Voir [CONTRIBUTING.md](CONTRIBUTING.md).

## Licence

[AGPL-3.0](LICENSE.md)
