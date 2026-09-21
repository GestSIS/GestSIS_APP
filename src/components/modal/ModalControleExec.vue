<script setup>
import { computed, nextTick, onMounted, reactive, ref, useTemplateRef, watch } from "vue";
import { useControleStore } from "../../stores/materiel/Controle.js";
import { useMaterielTypeStore } from "../../stores/materiel/Type.js";
import { useModalStore } from "../../stores/common/Modal.js";
import useNotification from "../../composables/useNotification.js";
import ControleExecService from "../../services/materiel/ControleExecService.js";
import ArticleService from "../../services/materiel/ArticleService.js";
import { addMonthsIso, indexedData, toDateInputValue, toLocalIsoDate } from "../../tools/index.js";

const { data, callback } = defineProps({
  data: { type: Object, default: () => {} },
  callback: { type: Function, default: () => {} },
});

const awn = useNotification();
const { closeModal } = useModalStore();

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

const errors = ref({});
const saving = ref(false);

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

const buildResultat = (tache) => {
  const existant = modeEdition.value
    ? (data.execTaches ?? []).find((t) => t.tache_id === tache.id)
    : null;

  return {
    tache_id: tache.id,
    statut: existant?.statut ?? "",
    value_measured:
      existant?.value_measured !== null && existant?.value_measured !== undefined
        ? Number(existant.value_measured)
        : "",
    remarque: existant?.remarque ?? "",
  };
};

const resultats = ref(controle.value ? controle.value.taches.map(buildResultat) : []);
const resultatInputs = useTemplateRef("resultat-input");

const focusPremierResultat = () => {
  nextTick(() => {
    if (modeMultiple.value) {
      articleSelectRefs.get(lignesMultiples.value[0]?._key)?.focus();
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
  resultats.value = c ? c.taches.map(buildResultat) : [];
  focusPremierResultat();

  // Changer de contrôle (uniquement possible en mode article fixe, via le
  // select) change aussi la récurrence de référence : on oublie une éventuelle
  // échéance déjà saisie pour resynchroniser sur le nouveau contrôle.
  if (!modeEdition.value) {
    dateEcheanceTouchee.value = false;
    form.date_echeance = dateEcheanceParDefaut(form.executed_at, c);
  }
});

const tacheParId = computed(() =>
  Object.fromEntries((controle.value?.taches ?? []).map((t) => [t.id, t])),
);

const horsPlage = (resultat) => {
  const tache = tacheParId.value[resultat.tache_id];
  if (!tache || tache.type !== "NUMERIC" || resultat.value_measured === "") {
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
  date_echeance: dateEcheanceParDefaut(form.executed_at, controle.value),
  // Comme form.date_echeance en mode simple : figé dès que l'utilisateur
  // modifie l'échéance de cette ligne, sinon resynchronisé avec la date
  // d'exécution partagée (voir le watcher plus bas).
  dateEcheanceTouchee: false,
  resultats: Object.fromEntries(
    (controle.value?.taches ?? []).map((t) => [t.id, { statut: "", value_measured: "" }]),
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

// Un même article ne doit pas pouvoir être sélectionné sur deux lignes.
const articlesDejaChoisis = computed(
  () => new Set(lignesMultiples.value.map((l) => l.article_id).filter((id) => id !== null)),
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
  { key: "_actions", title: "", slot: "row-actions" },
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

  errors.value = {};
  saving.value = true;

  try {
    if (modeMultiple.value) {
      await ControleExecService.creerExecsMultiple(form.controle_id, {
        executed_at: form.executed_at,
        trigger_type: controle.value.recurrence_type,
        remarque_globale: form.remarque_globale || null,
        executions: lignesValides.map((ligne) => ({
          article_id: ligne.article_id,
          date_echeance: ligne.date_echeance || null,
          taches: (controle.value.taches ?? []).map((t) => {
            const r = ligne.resultats[t.id];
            return {
              tache_id: t.id,
              statut: r.statut || null,
              value_measured: r.value_measured !== "" ? Number(r.value_measured) : null,
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
          tache_id: r.tache_id,
          statut: r.statut || null,
          value_measured: r.value_measured !== "" ? Number(r.value_measured) : null,
          remarque: r.remarque || null,
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
    closeModal();
    callback();
  } catch (err) {
    errors.value = err.errors ?? {};
    awn.alert(err?.message ?? "Erreur lors de l'enregistrement du contrôle");
  } finally {
    saving.value = false;
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
                    <th v-for="tache in controle.taches" :key="tache.id">{{ tache.nom }}</th>
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
                      <div v-if="tache.type === 'NUMERIC'">
                        Plage : {{ tache.value_min ?? "—" }} à {{ tache.value_max ?? "—" }}
                        {{ tache.unit }}
                      </div>
                    </th>
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
                <template v-if="tacheParId[tacheIdFromKey(key)].type === 'BOOLEAN'">
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
                    :required="!!rowData.article_id"
                    :placeholder="tacheParId[tacheIdFromKey(key)].unit || ''"
                  />
                </template>
              </template>
              <template #row-actions="{ rowData }">
                <button
                  type="button"
                  class="btn btn-outline-danger border-0"
                  :disabled="lignesMultiples.length <= 1"
                  @click="removeLigneMultiple(rowData._key)"
                >
                  <font-awesome-icon :icon="['far', 'trash-alt']" />
                </button>
              </template>
              <template #foot>
                <tr>
                  <td :colspan="colonnesMultiples.length">
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
              <div v-for="resultat in resultats" :key="resultat.tache_id" class="card mb-2">
                <div class="card-body py-2 px-3">
                  <div class="row g-2 align-items-start">
                    <div class="col-4">
                      <strong>{{ tacheParId[resultat.tache_id].nom }}</strong>
                      <div
                        v-if="resultats.length > 1 && tacheParId[resultat.tache_id].description"
                        class="text-muted small"
                      >
                        {{ tacheParId[resultat.tache_id].description }}
                      </div>
                    </div>
                    <div v-if="tacheParId[resultat.tache_id].type === 'BOOLEAN'" class="col-3">
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
                          required
                          class="form-control form-control-sm"
                          :class="{ 'is-invalid': horsPlage(resultat) }"
                          :placeholder="tacheParId[resultat.tache_id].unit || ''"
                        />
                        <div class="form-text">
                          <template
                            v-if="
                              tacheParId[resultat.tache_id].value_min !== null ||
                              tacheParId[resultat.tache_id].value_max !== null
                            "
                          >
                            Plage : {{ tacheParId[resultat.tache_id].value_min ?? "—" }} à
                            {{ tacheParId[resultat.tache_id].value_max ?? "—" }}
                            {{ tacheParId[resultat.tache_id].unit }}
                          </template>
                        </div>
                      </div>
                    </template>
                    <div class="col-5">
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

          <div class="mb-0">
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
      <button v-if="controle" type="submit" class="btn btn-primary" :disabled="saving">
        Enregistrer
      </button>
    </div>
  </form>
</template>
