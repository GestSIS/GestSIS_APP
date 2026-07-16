# AGENTS.md — GestSIS_APP

Frontend web de GestSIS : SPA Vue 3 (Composition API, `<script setup>`).

> Dans l'environnement de dev intégré [GestSIS_dev_docker](../AGENTS.md), ce service tourne dans le conteneur `gestsis-app` (port 8080) et **les commandes s'exécutent via Docker Compose**, ex. `docker compose exec app yarn lint`. Les commandes ci-dessous sont données depuis la racine du dépôt (utiles en standalone, et à préfixer par `docker compose exec app` dans l'env intégré).

## Stack

Vue 3 (Composition API) · Vite · Pinia · Vue Router · Bootstrap · Axios · FontAwesome · Luxon · awesome-notifications. Versions exactes : voir `package.json`.

## Structure (`src/`)

- `pages/` — vues de niveau route ; `layouts/` — gabarits ; `router/` — routes + menu
- `components/` — composants réutilisables (dont `components/modal/`)
- `stores/` — stores Pinia (`defineStore`), organisés par domaine
- `services/` — accès API (axios), un service par ressource
- `http/` — client axios et intercepteurs ; `composables/` — logique réutilisable (ex. `useNotification`, `usePermission`)
- `assets/`, `icons.js`, `tools/`

## Composants de base (globaux)

Une bibliothèque de composants de base est **enregistrée globalement** dans `src/main.js` : ils s'utilisent partout **sans import**, en kebab-case (`<base-table>`, `<base-select>`, …). Définis dans `src/components/base/` (et `src/components/table/`). **Réutiliser ces composants plutôt que réécrire un `<table>`, `<select>`, checkbox, etc. à la main.**

### `<base-table>` — `components/table/BaseTable.vue`

Tableau de données avec tri par colonne (clic sur l'en-tête), états de chargement/vide, sélection de ligne, lignes de détail dépliables et export CSV intégré.

- Props : `:data` (Array), `:fields` (définition des colonnes), `:loading`, `no-data` (texte si vide), `:selectable` (+ événement `@selected="row => …"`), `select-key` (défaut `id`), `:row-class`, `:grouped-data`, `:detail-row-column`, `hide-download`.
- `fields` = tableau d'objets `{ title, key, type?, slot?, formatter?, titleClass?, columnClass?, sortKey?, labelKey? }`. `type` ∈ `Boolean`, `Date`, `Number`, `'datetime'`, `'time'`, `'multiline'` (formatage auto). Une colonne avec `slot: 'nom'` se rend via `<template #nom="{ rowData, value, actions, status }">`.
- Slots : la colonne personnalisée (`#nom`), `#head`, `#foot="{ data }"`, `#detail-row="{ rowData }"`, `#groupeHeader`.

```vue
<base-table :loading="loading" :fields="fields" :data="items" no-data="Aucune donnée">
  <template #actions="{ rowData }">
    <button @click="edit(rowData)">…</button>
  </template>
</base-table>
<!-- fields = [{ title: 'Nom', key: 'nom' }, { title: 'Actif', key: 'actif', type: Boolean }, { title: 'Actions', slot: 'actions' }] -->
```

### `<base-select>` — `<select>` Bootstrap

`v-model`, `:options` (requis), `value-key` (défaut `id`), `display-key` (défaut `designation`), `:formatter` (fn → libellé), `label`, `placeholder`, `:required`, `:select-class`, `base-option`/`base-value` (option « vide »/par défaut).

### Autres composants

- **`<base-multi-select>`** — sélection multiple (basé sur `vue3-select-component`) ; `v-model` (Array), mêmes `options`/`value-key`/`display-key`/`formatter`/`label`/`base-option`.
- **`<base-checkbox>`** — `v-model` (Boolean/Number), `label`, `true-value`/`false-value`.
- **`<base-radio>`** — `v-model`, `:options` (requis), `label`, `advanced-label`.
- **`<base-dropdown>`** — menu déroulant Bootstrap ; props `tag`, `button-class`, `menu-class`, `title` ; slots `#title` et défaut.
- **`<base-card>`** — carte Bootstrap ; slots `#title`, `#header`, `#body`, `#body-table`, `#footer`.
- **`<base-navigation-tab>`** — onglets de navigation à partir de `:routes` (Array).
- **`<stateful-filter>`** — wrapper de filtrage à état persistant (clé `:id`, `:data`) ; expose en scoped slot `{ setFilter, filters, filteredData, reset, canReset }`.

> `BaseAutocomplete` (`components/base/BaseAutocomplete.vue`) existe mais n'est **pas** enregistré globalement → l'importer localement si besoin.

## Commandes

```bash
yarn install        # dépendances
yarn dev            # serveur de dev + hot reload (port 8080 dans Docker)
yarn build          # build de production
yarn preview        # aperçu du build
yarn lint           # ESLint (--fix) sur src
```

**Tests :** pas de suite de tests automatisés pour l'instant — `package.json` ne définit pas de script `test` et la CI se limite à `yarn build`. Valider un changement via `yarn lint` et un build qui passe.

## Configuration

Variables dans `.env.local` (copier depuis `.env.example`) : `VITE_API_ENDPOINT`, `VITE_AUTH_ENDPOINT`, `VITE_DOC_ENDPOINT`. Dans l'env Docker, le fichier est fourni par `init.sh` (copie de `.env.docker`).

## Conventions

- Composition API + `<script setup>` ; état partagé dans les stores Pinia, jamais d'appel API directement dans les composants → passer par `services/`.
- **Réutiliser les composants de base** (voir section ci-dessus) au lieu de recréer tableaux, selects, cartes, etc.
- Respecter la config ESLint existante (`eslint.config.js`) ; lancer `yarn lint` avant de commit.
- Pas de logique métier lourde dans les templates.

<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, and it invokes Vite through `vp dev` and `vp build`. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

Docs are local at `node_modules/vite-plus/docs` or online at https://viteplus.dev/guide/.

## Review Checklist

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp check` and `vp test` to format, lint, type check and test changes.
- [ ] Check if there are `vite.config.ts` tasks or `package.json` scripts necessary for validation, run via `vp run <script>`.
- [ ] If setup, runtime, or package-manager behavior looks wrong, run `vp env doctor` and include its output when asking for help.

<!--VITE PLUS END-->
