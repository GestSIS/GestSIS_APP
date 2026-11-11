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
- `http/` — client axios et intercepteurs ; `composables/` — logique réutilisable (ex. `useNotification`, `useHasPermission`, `useSubmit`) — toujours en export nommé : `export function useXxx`, importé avec `import { useXxx } from …`
- `tools/` — fonctions pures, sans réactivité ni store (pas de préfixe `use`) : utilitaires techniques (`index.js`, `storage.js`, `formatters.js`, `passwordPolicy.js`…) et règles métier / statuts par domaine (`exercice.js`, `intervention.js`, `travail.js`, `materiel.js`, `comptabilite.js`). `composables/` est réservé aux vrais composables (réactivité, store, cycle de vie).
- `assets/`, `icons.js`

## Composants de base (globaux)

Une bibliothèque de composants de base est **enregistrée globalement** dans `src/main.js` : ils s'utilisent partout **sans import**, en kebab-case (`<base-table>`, `<base-select>`, …). Définis dans `src/components/base/` (et `src/components/table/`). **Réutiliser ces composants plutôt que réécrire un `<table>`, `<select>`, checkbox, etc. à la main.**

### `<base-table>` — `components/table/BaseTable.vue`

Tableau de données avec tri par colonne (clic sur l'en-tête), états de chargement/vide, sélection de ligne, lignes de détail dépliables et export CSV intégré.

- Props : `:data` (Array), `:fields` (définition des colonnes), `:loading`, `no-data` (texte si vide), `:selectable` (+ événement `@selected="row => …"`), `select-key` (défaut `id`), `:row-class`, `:grouped-data`, `:detail-row-column`, `hide-download`, `show-count` (affiche « Nombre : N » dans le pied).
- `fields` = tableau d'objets `{ title, key, type?, slot?, formatter?, titleClass?, columnClass?, sortKey?, labelKey? }`. `type` ∈ `Boolean`, `Date`, `Number`, `'datetime'`, `'time'`, `'multiline'` (formatage auto). Une colonne avec `slot: 'nom'` se rend via `<template #nom="{ rowData, value, actions, status }">`.
- Slots : la colonne personnalisée (`#nom`), `#head`, `#foot="{ data, colspan }"` (`colspan` = nombre de colonnes affichées, colonne de détail comprise), `#detail-row="{ rowData }"`, `#groupeHeader`.

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
- **`<base-radio>`** — `v-model`, `:options` (requis, `{ value, label, disabled?, color? }`), `label`, `advanced-label`. `button-style` (+ `size`, ex. `"sm"`) rend un groupe de boutons Bootstrap (segment visuel) au lieu de radios empilées ; `option.color` (suffixe Bootstrap : `success`, `danger`, …) teinte le bouton, `option.disabled` le désactive individuellement.
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

Variables dans `.env.local` (copier depuis `.env.example`) : `VITE_API_ENDPOINT`, `VITE_AUTH_ENDPOINT`, `VITE_DOC_ENDPOINT`, `VITE_SENTRY_DSN` (optionnel, reporting d'erreurs Bugsink, vide = désactivé). Dans l'env Docker, le fichier est fourni par `init.sh` (copie de `.env.docker`).

Upload des sourcemaps vers Bugsink au build (`vite.config.js`, `@sentry/vite-plugin`) : variables `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN`, `SENTRY_URL` — sans `SENTRY_AUTH_TOKEN` (cas local/dev), l'upload est simplement désactivé.

Les erreurs sont envoyées à Bugsink via un tunnel côté API (`main.js` → `${VITE_API_ENDPOINT}/monitoring-tunnel` → `MonitoringTunnelController` dans GestSIS_API, variable `SENTRY_TUNNEL_DSN`), pas directement depuis le navigateur — évite le blocage par les bloqueurs de pub/tracker sur le motif `/api/<id>/envelope/`.

## Conventions

- Composition API + `<script setup>` ; état partagé dans les stores Pinia, jamais d'appel API directement dans les composants → passer par `services/`.
- **Réutiliser les composants de base** (voir section ci-dessus) au lieu de recréer tableaux, selects, cartes, etc.
- Respecter la config ESLint existante (`eslint.config.js`) ; lancer `yarn lint` avant de commit.
- Pas de logique métier lourde dans les templates.

## Appels API déclenchés par l'utilisateur

Ne pas écrire de `.then/.catch` à la main pour une action utilisateur : passer par les composables.

- **Formulaire ou action** → `useSubmit()` : `const { errors, isSubmitting, submit } = useSubmit();` puis `const { ok, data } = await submit(() => store.save(form), "Message par défaut");`. Erreurs de champs dans `errors` (clés renvoyées par l'API, ex. `errors['appels.0.date']` directement dans le template), sinon message de l'API en notification. Bouton déclencheur : `:disabled="isSubmitting"` (bloque le double envoi ; un appel ignoré renvoie `{ ok: false, ignored: true }`). Message de succès : 3e argument optionnel, affiché seulement si l'appel réussit — `await submit(() => store.remove(id), "Erreur lors de la suppression", "Grade supprimé.")` ; sans lui, aucun message (cas des modales, voir ci-dessous). Le reste de l'après-succès (fermer la modale, naviguer) reste à l'appelant via `ok`.
- **Action à confirmer** (suppression, validation, annulation) → `confirm()` du store des modales, puis `useSubmit` :
  `if (!(await confirm("Titre ?", "Explication"))) return;` puis `await submit(..., "Erreur…", "Grade supprimé.")`. `confirm()` ne rejette jamais : il résout `false` à l'annulation, toujours tester son résultat.
- **Téléchargement** (PDF, Excel, XML) → `useDownload()` : `download(() => Service.downloadXxx(...), "Message par défaut")` (fenêtre de chargement + message d'erreur).
- **Copie dans le presse-papiers** → `useClipboard()` : `copy(texte, "Lien copié dans le presse-papiers")` (succès annoncé seulement une fois la copie faite, échec signalé). Jamais `navigator.clipboard` directement.
- **Stockage navigateur** → jamais `localStorage`/`sessionStorage` directement : `safeLocalStorage` / `safeSessionStorage` (`tools/storage.js`, non réactif) ou `useLocalStorage` / `useSessionStorage` (`composables/useStorage.js`, réactif, pour l'état d'interface). Les jetons passent par `TokenService`.

### Message de succès (`awn.success`)

- **Page ou onglet** (le formulaire reste affiché) : toujours un message (« Modifications enregistrées »).
- **Modale** : pas de message, sa fermeture suffit — sauf si l'effet n'est pas visible à l'écran (envoi de SMS, import, traitement en lot, duplication).
- **Action confirmée** (suppression, validation, annulation) : toujours un message (« Grade supprimé. »).
- **Action directe** (bouton de statut) : un message, sauf pour les cases cochées en série (présences, quittances) où il serait trop bavard.
- **Téléchargement** : pas de message, le fichier suffit.

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
