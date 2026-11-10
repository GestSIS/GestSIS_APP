<script setup>
import { computed, nextTick, onMounted, reactive, ref, useTemplateRef, watch } from "vue";
import { useControleStore } from "../../stores/materiel/Controle.js";
import { useMaterielTypeStore } from "../../stores/materiel/Type.js";
import { useModalStore } from "../../stores/common/Modal.js";
import useNotification from "../../composables/useNotification.js";
import ControleExecService from "../../services/materiel/ControleExecService.js";
import ArticleService from "../../services/materiel/ArticleService.js";
import {
  addMonthsIso,
  formatPlage,
  indexedData,
  toDateInputValue,
  toLocalIsoDate,
} from "../../tools/index.js";
import ScanArticle from "../materiel/ScanArticle.vue";
import ComposantSelecteur from "../materiel/ComposantSelecteur.vue";
import useSubmit from "../../composables/useSubmit.js";

const { data, callback } = defineProps({
  data: { type: Object, default: () => {} },
  callback: { type: Function, default: () => {} },
});

const awn = useNotification();
const { closeModal, resize } = useModalStore();

// Trois points d'entrée : depuis un article (data = l'article, le contrôle est
// à choisir parmi ceux applicables à son type, ou déjà désigné par
// data.controleId quand l'appelant sait lequel), depuis la fiche d'un contrôle
// (data = { controleId }, c'est alors l'article à contrôler qui reste à
// choisir), ou en modification d'une exécution existante (data = { execId,
// controleId, articleId, ... }, contrôle et article sont alors tous deux fixes).
const modeEdition = computed(() => data.execId !== undefined);
const articleFixe = computed(() => !modeEdition.value && data.id !== undefined);
// Depuis la fiche d'un contrôle (ni article fixe, ni édition), la saisie se
// fait pour un ou plusieurs articles à la fois, avec la même date partagée.
const modeMultiple = computed(() => !articleFixe.value && !modeEdition.value);

const controleStore = useControleStore();
const materielTypeStore = useMaterielTypeStore();
await Promise.all([controleStore.fetchControles(), materielTypeStore.fetchMaterielTypes()]);

// Le contrôle peut être désigné même quand l'article est fixe : appelé depuis
// la fiche d'un contrôle ou depuis un widget, c'est celui que l'utilisateur a
// sous les yeux qu'il faut présélectionner, pas le premier de la liste.
const controleImpose = computed(() => controleStore.liste.find((c) => c.id === data.controleId));

const controlesApplicables = computed(() => {
  if (articleFixe.value) {
    return controleStore.liste.filter((c) =>
      c.materiel_types?.some((mt) => mt.materiel_type_id === data.materiel_type_id),
    );
  }
  return controleImpose.value ? [controleImpose.value] : [];
});

const controleParDefaut = computed(
  () =>
    controlesApplicables.value.find((c) => c.id === controleImpose.value?.id)?.id ??
    controlesApplicables.value[0]?.id ??
    null,
);

// La saisie multiple a une colonne par tâche : la fenêtre s'adapte à leur nombre.
if (modeMultiple.value && controleImpose.value) {
  const nbTaches = controleImpose.value.taches.length;
  resize(nbTaches <= 2 ? 1 : nbTaches <= 5 ? 2 : 3);
}

const articlesEligibles = ref([]);
if (modeMultiple.value && controleImpose.value) {
  const typeIds = controleImpose.value.materiel_types.map((mt) => mt.materiel_type_id);
  const indexedTypes = indexedData(materielTypeStore.liste);
  const resultats = await Promise.all(
    typeIds.map((typeId) => ArticleService.getParMaterielType(typeId)),
  );
  articlesEligibles.value = resultats
    .flat()
    .filter((a) => a.statut)
    .map((a) => ({
      ...a,
      label: `${a.numero || a.designation || a.id} — ${indexedTypes[a.materiel_type_id]?.designation ?? ""}`,
    }));
}

const { errors, isSubmitting, submit } = useSubmit();

const form = reactive({
  controle_id: modeEdition.value ? data.controleId : controleParDefaut.value,
  article_id: modeEdition.value ? data.articleId : articleFixe.value ? data.id : null,
  executed_at: modeEdition.value ? toLocalIsoDate(new Date(data.executed_at)) : toLocalIsoDate(),
  remarque_globale: modeEdition.value ? (data.remarque_globale ?? "") : "",
  // Échéance du prochain contrôle (contrôle PERIODIQUE uniquement) : pré-remplie
  // par défaut à partir de la date d'exécution et de la récurrence du contrôle,
  // mais modifiable — utile pour une récurrence qui varie d'un passage à l'autre
  // (ex : premier service véhicule à 5 ans, puis tous les 2 ans).
  date_echeance: modeEdition.value ? toDateInputValue(data.date_echeance) : null,
});

const controle = computed(() => controlesApplicables.value.find((c) => c.id === form.controle_id));

// --- Articles des tâches composant, chargés seulement si le contrôle en a ---
const articlesComposants = ref([]);
const labelArticle = (a) => {
  const type = materielTypeStore.liste.find((t) => t.id === a.materiel_type_id);
  return { ...a, label: `${a.numero || a.designation || a.id} — ${type?.designation ?? ""}` };
};
const chargerArticlesComposants = async (c) => {
  const typeIds = [
    ...new Set(
      (c?.taches ?? [])
        .filter((t) => t.type === "COMPOSANT")
        .flatMap((t) => t.materiel_types.map((mt) => mt.materiel_type_id)),
    ),
  ];
  const parType = await Promise.all(typeIds.map((id) => ArticleService.getParMaterielType(id)));
  articlesComposants.value = parType.flat().map(labelArticle);
};
await chargerArticlesComposants(controle.value);

const articlesActifsPourTypes = (materielTypes) => {
  const typeIds = materielTypes.map((mt) => mt.materiel_type_id);
  return articlesComposants.value.filter((a) => a.statut && typeIds.includes(a.materiel_type_id));
};

// En édition, la valeur enregistrée fait foi : on ne la recalcule jamais
// automatiquement. À la création, elle reste synchronisée avec la date
// d'exécution et le contrôle choisi tant que l'utilisateur ne l'a pas modifiée
// lui-même (détecté via l'évènement "input", qui ne se déclenche pas sur une
// mise à jour programmatique du champ).
const dateEcheanceTouchee = ref(modeEdition.value);
const dateEcheanceParDefaut = (executedAt, c) =>
  c?.recurrence_type === "PERIODIQUE" ? addMonthsIso(executedAt, c.recurrence_value) : null;
if (!modeEdition.value) {
  form.date_echeance = dateEcheanceParDefaut(form.executed_at, controle.value);
}

// Chaque résultat porte la définition de sa tâche (nom, type, unité, plage) :
// à la création celle de la tâche actuelle du contrôle, en édition celle figée
// sur la ligne de l'exécution — la configuration actuelle du contrôle (tâche
// renommée, retypée, supprimée ou ajoutée depuis) ne s'applique pas à une
// exécution déjà enregistrée.
const buildResultat = (tache) => ({
  key: `tache-${tache.id}`,
  tache_id: tache.id,
  definition: {
    nom: tache.nom,
    description: tache.description,
    type: tache.type,
    unit: tache.unit,
    value_min: tache.value_min,
    value_max: tache.value_max,
    obligatoire: tache.obligatoire,
    materiel_types: tache.materiel_types ?? [],
  },
  article_id: null,
  article: null,
  statut: "",
  value_measured: "",
  remarque: "",
});

const nombreOuNull = (value) => (value !== null && value !== undefined ? Number(value) : null);

const buildResultatDepuisLigne = (ligne) => ({
  key: `ligne-${ligne.id}`,
  id: ligne.id,
  definition: {
    nom: ligne.nom_snapshot,
    description: null,
    type: ligne.type_snapshot,
    unit: ligne.unit_snapshot,
    value_min: nombreOuNull(ligne.value_min_snapshot),
    value_max: nombreOuNull(ligne.value_max_snapshot),
    obligatoire: ligne.obligatoire_snapshot,
    materiel_types:
      controle.value?.taches.find((t) => t.id === ligne.tache_id && t.type === "COMPOSANT")
        ?.materiel_types ?? [],
  },
  article_id: ligne.article_id ?? null,
  article: ligne.article ?? null,
  statut: ligne.statut ?? "",
  value_measured: nombreOuNull(ligne.value_measured) ?? "",
  remarque: ligne.remarque ?? "",
});

const resultatsInitiaux = () => {
  if (modeEdition.value) {
    return [...(data.execTaches ?? [])]
      .sort((a, b) => a.task_order_snapshot - b.task_order_snapshot)
      .map(buildResultatDepuisLigne);
  }
  return controle.value ? controle.value.taches.map(buildResultat) : [];
};

const resultats = ref(resultatsInitiaux());

// En édition, l'article enregistré reste proposé même s'il est inactif ou que son
// type n'est plus accepté ; une ligne dont la tâche n'est plus un composant
// (materiel_types vide) ne propose donc que lui, ce qui permet de le retirer.
const articlesPourResultat = (resultat) => {
  const articles = articlesActifsPourTypes(resultat.definition.materiel_types);
  return resultat.article && !articles.some((a) => a.id === resultat.article.id)
    ? [...articles, labelArticle(resultat.article)]
    : articles;
};
const resultatInputs = useTemplateRef("resultat-input");
const scanInput = useTemplateRef("scan-input");

const focusPremierResultat = () => {
  nextTick(() => {
    if (modeMultiple.value) {
      // Prêt à scanner le premier article.
      scanInput.value?.focus();
    } else {
      const premier = resultats.value[0];
      if (premier?.definition.type === "COMPOSANT") {
        composantRefs.get(premier.key)?.focus();
      } else {
        resultatInputs.value?.[0]?.focus();
      }
    }
  });
};

// Le ref="..." classique ne fonctionne pas dans un slot de base-table (voir
// setArticleSelectRef) : les sélecteurs de composants sont indexés par clé.
const composantRefs = new Map();
const setComposantRef = (key, el) => {
  if (el) {
    composantRefs.set(key, el);
  } else {
    composantRefs.delete(key);
  }
};

const avancerResultat = (resultat) => {
  const composants = resultats.value.filter((r) => r.definition.type === "COMPOSANT");
  const suivant = composants[composants.indexOf(resultat) + 1];
  nextTick(() => {
    if (suivant) {
      composantRefs.get(suivant.key)?.focus();
    } else {
      resultatInputs.value?.[0]?.focus();
    }
  });
};

// Le focus initial doit attendre le montage réel du composant : un nextTick
// programmé pendant le setup asynchrone (avant que <Suspense> ait fini de
// monter la modale) peut se résoudre avant que les refs de template existent.
onMounted(focusPremierResultat);

watch(controle, (c) => {
  // En édition, le contrôle est fixe et les résultats viennent des lignes de
  // l'exécution : rien à resynchroniser.
  if (modeEdition.value) {
    return;
  }

  resultats.value = c ? c.taches.map(buildResultat) : [];
  chargerArticlesComposants(c);
  focusPremierResultat();

  // Changer de contrôle (uniquement possible en mode article fixe, via le
  // select) change aussi la récurrence de référence : on oublie une éventuelle
  // échéance déjà saisie pour resynchroniser sur le nouveau contrôle.
  dateEcheanceTouchee.value = false;
  form.date_echeance = dateEcheanceParDefaut(form.executed_at, c);
});

const tacheParId = computed(() =>
  Object.fromEntries((controle.value?.taches ?? []).map((t) => [t.id, t])),
);

const plage = (tache) => formatPlage(tache.value_min, tache.value_max, tache.unit);

const horsPlage = (resultat) => {
  const tache = resultat.definition;
  if (tache.type !== "NUMERIC" || resultat.value_measured === "") {
    return false;
  }
  const value = Number(resultat.value_measured);
  if (tache.value_min !== null && value < tache.value_min) return true;
  if (tache.value_max !== null && value > tache.value_max) return true;
  return false;
};

// --- Mode multiple : une ligne par article, ajoutée au besoin (pas de liste
// pré-remplie avec l'ensemble des articles éligibles) ---
let nextLigneKey = 1;
const mkLigneKey = () => nextLigneKey++;

const buildLigneMultiple = () => ({
  _key: mkLigneKey(),
  article_id: null,
  remarque: "",
  date_echeance: dateEcheanceParDefaut(form.executed_at, controle.value),
  // Comme form.date_echeance en mode simple : figé dès que l'utilisateur
  // modifie l'échéance de cette ligne, sinon resynchronisé avec la date
  // d'exécution partagée (voir le watcher plus bas).
  dateEcheanceTouchee: false,
  resultats: Object.fromEntries(
    (controle.value?.taches ?? []).map((t) => [
      t.id,
      { statut: "", value_measured: "", article_id: null },
    ]),
  ),
});

const lignesMultiples = ref([buildLigneMultiple()]);

// La date d'exécution est partagée par toutes les lignes en mode multiple :
// un changement doit resynchroniser l'échéance par défaut de chaque ligne non
// modifiée manuellement, en plus du champ du mode simple.
watch(
  () => form.executed_at,
  (executedAt) => {
    if (!dateEcheanceTouchee.value) {
      form.date_echeance = dateEcheanceParDefaut(executedAt, controle.value);
    }
    lignesMultiples.value.forEach((ligne) => {
      if (!ligne.dateEcheanceTouchee) {
        ligne.date_echeance = dateEcheanceParDefaut(executedAt, controle.value);
      }
    });
  },
);

// Un même article ne doit pas pouvoir être choisi deux fois dans la fenêtre :
// article contrôlé ou composant, toutes lignes confondues.
const articlesDejaChoisis = computed(
  () =>
    new Set(
      [
        form.article_id,
        ...resultats.value.map((r) => r.article_id),
        ...lignesMultiples.value.flatMap((l) => [
          l.article_id,
          ...Object.values(l.resultats).map((r) => r.article_id),
        ]),
      ].filter((id) => id !== null),
    ),
);
const optionsPourLigneMultiple = (ligne) =>
  articlesEligibles.value.filter(
    (a) => a.id === ligne.article_id || !articlesDejaChoisis.value.has(a.id),
  );

// Le ref="..." classique ne fonctionne pas ici : ce champ est rendu dans un
// slot scopé de base-table (voir ModalControle.vue pour la même astuce).
const articleSelectRefs = new Map();
const setArticleSelectRef = (key, el) => {
  if (el) {
    articleSelectRefs.set(key, el);
  } else {
    articleSelectRefs.delete(key);
  }
};

const addLigneMultiple = () => {
  const nouvelleLigne = buildLigneMultiple();
  lignesMultiples.value.push(nouvelleLigne);
  nextTick(() => articleSelectRefs.get(nouvelleLigne._key)?.focus());
};
// Article scanné (voir ScanArticle.vue) : placé dans la première ligne vide,
// sinon dans une nouvelle ligne.
const ajouterArticleScanne = (article) => {
  let ligne = lignesMultiples.value.find((l) => l.article_id === null);
  if (ligne) {
    ligne.article_id = article.id;
  } else {
    ligne = { ...buildLigneMultiple(), article_id: article.id };
    lignesMultiples.value.push(ligne);
  }
  focusComposantMultiple(ligne._key, tachesComposant.value[0]?.id);
};

const tachesComposant = computed(() =>
  (controle.value?.taches ?? []).filter((t) => t.type === "COMPOSANT"),
);
const focusComposantMultiple = (ligneKey, tacheId) => {
  if (tacheId === undefined) {
    return;
  }
  nextTick(() => composantRefs.get(`${ligneKey}-${tacheId}`)?.focus());
};
const avancerComposantMultiple = (ligneKey, tacheId) => {
  const index = tachesComposant.value.findIndex((t) => t.id === tacheId);
  const suivante = tachesComposant.value[index + 1];
  if (suivante) {
    focusComposantMultiple(ligneKey, suivante.id);
  } else {
    nextTick(() => scanInput.value?.focus());
  }
};

const removeLigneMultiple = (key) => {
  lignesMultiples.value = lignesMultiples.value.filter((l) => l._key !== key);
};

const colonnesMultiples = computed(() => [
  { key: "article_id", title: "Article", slot: "article-select" },
  ...(controle.value?.recurrence_type === "PERIODIQUE"
    ? [{ key: "date_echeance", title: "Échéance", slot: "echeance-select" }]
    : []),
  ...(controle.value?.taches ?? []).map((t) => ({
    key: `tache_${t.id}`,
    title: t.nom,
    slot: "tacheCell",
  })),
  { key: "remarque", title: "Remarque", slot: "remarque-cell" },
  { title: "", slot: "actions" },
]);

const tacheIdFromKey = (key) => Number(key.replace("tache_", ""));

const horsPlageMultiple = (ligne, tacheId) => {
  const tache = tacheParId.value[tacheId];
  const r = ligne.resultats[tacheId];
  if (!tache || tache.type !== "NUMERIC" || !r || r.value_measured === "") {
    return false;
  }
  const value = Number(r.value_measured);
  if (tache.value_min !== null && value < tache.value_min) return true;
  if (tache.value_max !== null && value > tache.value_max) return true;
  return false;
};

const save = async () => {
  const lignesValides = lignesMultiples.value.filter((l) => l.article_id !== null);

  if (modeMultiple.value && lignesValides.length === 0) {
    awn.warning("Veuillez ajouter au moins un article à contrôler");
    return;
  }

  const { ok } = await submit(async () => {
    if (modeMultiple.value) {
      await ControleExecService.creerExecsMultiple(form.controle_id, {
        executed_at: form.executed_at,
        trigger_type: controle.value.recurrence_type,
        executions: lignesValides.map((ligne) => ({
          article_id: ligne.article_id,
          remarque_globale: ligne.remarque || null,
          date_echeance: ligne.date_echeance || null,
          taches: (controle.value.taches ?? []).map((t) => {
            const r = ligne.resultats[t.id];
            return {
              tache_id: t.id,
              statut: r.statut || null,
              value_measured: r.value_measured !== "" ? Number(r.value_measured) : null,
              article_id: r.article_id,
              remarque: null,
            };
          }),
        })),
      });
      awn.success("Contrôle enregistré");
    } else {
      const payload = {
        executed_at: form.executed_at,
        remarque_globale: form.remarque_globale || null,
        date_echeance: form.date_echeance || null,
        taches: resultats.value.map((r) => ({
          // En édition, une ligne s'identifie par son propre id (sa tâche a pu
          // être supprimée depuis) ; à la création, par la tâche du contrôle.
          ...(modeEdition.value ? { id: r.id } : { tache_id: r.tache_id }),
          statut: r.statut || null,
          value_measured: r.value_measured !== "" ? Number(r.value_measured) : null,
          article_id: r.article_id,
          remarque: r.definition.type === "COMPOSANT" ? null : r.remarque || null,
        })),
      };

      if (modeEdition.value) {
        await ControleExecService.modifierExec(data.execId, payload);
        awn.success("Contrôle modifié");
      } else {
        await ControleExecService.creerExec(form.controle_id, form.article_id, {
          ...payload,
          trigger_type: controle.value.recurrence_type,
        });
        awn.success("Contrôle enregistré");
      }
    }
  }, "Erreur lors de l'enregistrement du contrôle");
  if (ok) {
    closeModal();
    callback();
  }
};
</script>

<template>
  <form @submit.prevent="save">
    <div class="modal-header">
      <h5 class="modal-title">
        {{
          modeEdition
            ? `Modifier le contrôle — ${controleImpose?.nom}`
            : articleFixe
              ? `Contrôler ${data.numero || data.designation}`
              : `Nouveau contrôle — ${controleImpose?.nom}`
        }}
      </h5>
      <button type="button" class="btn-close" @click="closeModal"></button>
    </div>

    <div class="modal-body">
      <div v-if="controlesApplicables.length === 0" class="alert alert-warning mb-0">
        Aucun contrôle n'est configuré pour ce type de matériel.
      </div>
      <div
        v-else-if="!articleFixe && !modeEdition && articlesEligibles.length === 0"
        class="alert alert-warning mb-0"
      >
        Aucun article éligible pour ce contrôle.
      </div>
      <template v-else>
        <div class="row mb-3">
          <div v-if="articleFixe" class="col-md-6">
            <base-select
              v-model="form.controle_id"
              label="Contrôle"
              :required="true"
              :options="controlesApplicables"
              display-key="nom"
            />
          </div>
          <div v-else class="col-md-6">
            <label>Contrôle</label>
            <input
              type="text"
              class="form-control form-control-sm"
              :value="controleImpose?.nom"
              disabled
            />
          </div>
          <div class="col-md-6">
            <label>Exécuté le <span class="text-danger">*</span></label>
            <input
              v-model="form.executed_at"
              type="date"
              required
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['executed_at'] }"
            />
          </div>
          <div v-if="controle?.recurrence_type === 'PERIODIQUE'" class="col-md-6 mt-3">
            <label>Échéance du prochain contrôle</label>
            <input
              v-model="form.date_echeance"
              type="date"
              required
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['date_echeance'] }"
              @input="dateEcheanceTouchee = true"
            />
            <div class="form-text">
              Pré-remplie à partir de la récurrence du contrôle, modifiable si besoin (ex : une
              première échéance différente des suivantes).
            </div>
          </div>
        </div>
        <template v-if="controle">
          <template v-if="modeMultiple">
            <label class="mb-2 d-block"
              >Articles à contrôler <span class="text-danger">*</span></label
            >
            <scan-article
              ref="scan-input"
              :articles="articlesEligibles"
              :deja-selectionnes="articlesDejaChoisis"
              @scan="ajouterArticleScanne"
            />
            <base-table
              :data="lignesMultiples"
              :fields="colonnesMultiples"
              select-key="_key"
              :hide-download="true"
              no-data="Aucun article ajouté"
            >
              <template #head>
                <thead>
                  <tr>
                    <th>Article</th>
                    <th v-if="controle.recurrence_type === 'PERIODIQUE'">Échéance</th>
                    <th v-for="tache in controle.taches" :key="tache.id">
                      {{ tache.nom }}
                      <span v-if="!tache.obligatoire" class="text-muted small fw-normal">
                        (optionnel)</span
                      >
                    </th>
                    <th>Remarque</th>
                    <th></th>
                  </tr>
                  <tr v-if="controle.taches.length > 0" class="table-light">
                    <th></th>
                    <th v-if="controle.recurrence_type === 'PERIODIQUE'"></th>
                    <th
                      v-for="tache in controle.taches"
                      :key="'detail-' + tache.id"
                      class="fw-normal small text-muted"
                    >
                      <div v-if="tache.description">{{ tache.description }}</div>
                      <em v-if="tache.type === 'NUMERIC' && plage(tache)">
                        Plage : {{ plage(tache) }}
                      </em>
                    </th>
                    <th></th>
                    <th></th>
                  </tr>
                </thead>
              </template>
              <template #article-select="{ rowData }">
                <base-select
                  :ref="(el) => setArticleSelectRef(rowData._key, el)"
                  v-model="rowData.article_id"
                  :options="optionsPourLigneMultiple(rowData)"
                  display-key="label"
                />
              </template>
              <template #echeance-select="{ rowData }">
                <input
                  v-model="rowData.date_echeance"
                  type="date"
                  class="form-control form-control-sm"
                  :disabled="!rowData.article_id"
                  :required="!!rowData.article_id"
                  @input="rowData.dateEcheanceTouchee = true"
                />
              </template>
              <template #tacheCell="{ key, rowData }">
                <template v-if="tacheParId[tacheIdFromKey(key)].type === 'COMPOSANT'">
                  <composant-selecteur
                    v-if="rowData.article_id"
                    :ref="(el) => setComposantRef(`${rowData._key}-${tacheIdFromKey(key)}`, el)"
                    v-model="rowData.resultats[tacheIdFromKey(key)].article_id"
                    :articles="
                      articlesActifsPourTypes(tacheParId[tacheIdFromKey(key)].materiel_types)
                    "
                    :deja-selectionnes="articlesDejaChoisis"
                    :required="tacheParId[tacheIdFromKey(key)].obligatoire"
                    @avancer="avancerComposantMultiple(rowData._key, tacheIdFromKey(key))"
                  />
                </template>
                <template v-else-if="tacheParId[tacheIdFromKey(key)].type === 'BOOLEAN'">
                  <select
                    v-model="rowData.resultats[tacheIdFromKey(key)].statut"
                    class="form-select form-select-sm"
                    :disabled="!rowData.article_id"
                    :required="!!rowData.article_id"
                  >
                    <option value="" disabled>Résultat</option>
                    <option value="OK">OK</option>
                    <option value="KO">KO</option>
                  </select>
                </template>
                <template v-else>
                  <input
                    v-model="rowData.resultats[tacheIdFromKey(key)].value_measured"
                    type="number"
                    step="any"
                    class="form-control form-control-sm"
                    :class="{ 'is-invalid': horsPlageMultiple(rowData, tacheIdFromKey(key)) }"
                    :disabled="!rowData.article_id"
                    :required="!!rowData.article_id && tacheParId[tacheIdFromKey(key)].obligatoire"
                    :placeholder="tacheParId[tacheIdFromKey(key)].unit || ''"
                  />
                </template>
              </template>
              <template #remarque-cell="{ rowData }">
                <input
                  v-model="rowData.remarque"
                  type="text"
                  class="form-control form-control-sm"
                  aria-label="Remarque"
                  :disabled="!rowData.article_id"
                />
              </template>
              <template #actions="{ rowData }">
                <button
                  type="button"
                  class="btn btn-outline-danger border-0"
                  :disabled="lignesMultiples.length <= 1"
                  @click="removeLigneMultiple(rowData._key)"
                >
                  <font-awesome-icon :icon="['far', 'trash-alt']" />
                </button>
              </template>
              <template #foot="{ colspan }">
                <tr>
                  <td :colspan="colspan">
                    <button type="button" class="btn btn-outline-primary" @click="addLigneMultiple">
                      Ajouter
                      <font-awesome-icon :icon="['far', 'plus-square']" />
                    </button>
                  </td>
                </tr>
              </template>
            </base-table>
            <p v-if="(controle.taches ?? []).length === 0" class="text-muted small mt-2">
              Ce contrôle ne comporte aucune tâche : seule la date d'exécution sera enregistrée pour
              chaque article ajouté.
            </p>
          </template>

          <template v-else>
            <div v-if="resultats.length === 0" class="alert alert-info py-2 px-3">
              Ce contrôle ne comporte aucune tâche : seule la date d'exécution sera enregistrée.
            </div>
            <template v-else>
              <label>Résultat</label>
              <div v-for="resultat in resultats" :key="resultat.key" class="card mb-2">
                <div class="card-body py-2 px-3">
                  <div class="row g-2 align-items-start">
                    <div class="col-4">
                      <strong>{{ resultat.definition.nom }}</strong>
                      <span v-if="!resultat.definition.obligatoire" class="text-muted small">
                        (optionnel)</span
                      >
                      <div
                        v-if="resultats.length > 1 && resultat.definition.description"
                        class="text-muted small"
                      >
                        {{ resultat.definition.description }}
                      </div>
                    </div>
                    <div v-if="resultat.definition.type === 'COMPOSANT'" class="col-3">
                      <composant-selecteur
                        :ref="(el) => setComposantRef(resultat.key, el)"
                        v-model="resultat.article_id"
                        :articles="articlesPourResultat(resultat)"
                        :deja-selectionnes="articlesDejaChoisis"
                        :required="resultat.definition.obligatoire"
                        @avancer="avancerResultat(resultat)"
                      />
                    </div>
                    <div v-else-if="resultat.definition.type === 'BOOLEAN'" class="col-3">
                      <select
                        ref="resultat-input"
                        v-model="resultat.statut"
                        class="form-select form-select-sm"
                        required
                      >
                        <option value="" disabled>Résultat</option>
                        <option value="OK">OK</option>
                        <option value="KO">KO</option>
                      </select>
                    </div>
                    <template v-else>
                      <div class="col-3">
                        <input
                          ref="resultat-input"
                          v-model="resultat.value_measured"
                          type="number"
                          step="any"
                          :required="resultat.definition.obligatoire"
                          class="form-control form-control-sm"
                          :class="{ 'is-invalid': horsPlage(resultat) }"
                          :placeholder="resultat.definition.unit || ''"
                        />
                        <div class="form-text">
                          <template v-if="plage(resultat.definition)">
                            Plage : {{ plage(resultat.definition) }}
                          </template>
                        </div>
                      </div>
                    </template>
                    <div v-if="resultat.definition.type !== 'COMPOSANT'" class="col-3">
                      <input
                        v-model="resultat.remarque"
                        type="text"
                        class="form-control form-control-sm"
                        :placeholder="
                          resultat.statut === 'KO' || horsPlage(resultat)
                            ? 'Remarque (recommandée)'
                            : 'Remarque (optionnel)'
                        "
                      />
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </template>

          <div v-if="!modeMultiple" class="mb-0">
            <label class="form-label">Remarque globale</label>
            <textarea
              v-model="form.remarque_globale"
              class="form-control form-control-sm"
              rows="2"
            ></textarea>
          </div>
        </template>
      </template>
    </div>

    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="closeModal">Fermer</button>
      <button v-if="controle" type="submit" class="btn btn-primary" :disabled="isSubmitting">
        Enregistrer
      </button>
    </div>
  </form>
</template>
