<script setup>
import { computed, ref, watchEffect } from 'vue';
import { useSapeurStore } from '../../stores/sapeur/Sapeur.js';
import { useExerciceComptableStore } from '../../stores/comptabilite/ExerciceComptable.js';
import { useLocaliteStore } from '../../stores/common/Localite.js';
import { useExerciceStore } from '../../stores/exercice/Exercice.js';
import { useExcuseTypeStore } from '../../stores/exercice/ExcuseType.js';
import { useExerciceCategorieStore } from '../../stores/exercice/ExerciceCategorie.js';
import { useModalStore } from '../../stores/common/Modal.js';
import { useExcuseParamStore } from '../../stores/exercice/ExcuseParam.js';
import permissions from '../../store/permissions.js';
import useHasPermission from '../../hooks/usePermission.js';

const sapeurStore = useSapeurStore();
const exerciceComptableStore = useExerciceComptableStore();
const localiteStore = useLocaliteStore();
const exerciceStore = useExerciceStore();
const excuseTypeStore = useExcuseTypeStore();
const exerciceCategorieStore = useExerciceCategorieStore();
const excuseParamStore = useExcuseParamStore();
exerciceStore.fetchExerciceAbsences();
excuseParamStore.fetchParams();
excuseTypeStore.fetchExcuseTypes();

const loading = ref(true);
watchEffect(async () => {
  loading.value = true;
  await Promise.all([
    exerciceStore.fetchListeExercice(exerciceComptableStore.activeId),
    exerciceStore.fetchExerciceAbsences(exerciceComptableStore.activeId),
  ]);
  loading.value = false;
});

const selectedId = ref(null);
const selectExercice = (row) => (selectedId.value = row?.id);

const excuseParam = computed(() => excuseParamStore.params);
const sapeurs = computed(() => sapeurStore.liste);
const absences = computed(() => exerciceStore.absences);
const exercices = computed(() =>
  exerciceStore.liste.sort((a, b) => a.date?.localeCompare(b.date)),
);
const categories = computed(() => exerciceCategorieStore.liste);
const localites = computed(() =>
  localiteStore.liste.sort((a, b) =>
    a.designation?.localeCompare(b.designation),
  ),
);
const hasValidationPermission = useHasPermission(
  permissions.EXERCICE.VALIDATION,
);

const computedData = computed(() => {
  return absences.value
    .map((a) => ({
      ...a,
      sapeur: sapeurs.value.find((s) => s.id == a.sapeur_id)?.nom_prenom,
      ...exercices.value.find((e) => e.id == a.exercice_id),
      id: a.id,
    }))
    .map((e) => ({
      ...e,
      categorie: categories.value.find((c) => c.id == e.exercice_categorie_id)
        ?.designation,
      localite: localites.value.find((l) => l.id == e.localite_id)?.designation,
    }));
});
const filteredExercicesCategories = computed(() => {
  const ids = new Set(
    exercices.value.map((i) => parseInt(i.exercice_categorie_id)),
  );
  return categories.value.filter((t) => ids.has(t.id));
});
const filteredLocalites = computed(() => {
  const ids = new Set(exercices.value.map((i) => parseInt(i.localite_id)));
  return localites.value.filter((t) => ids.has(t.id));
});

const { showModal } = useModalStore();

const review = () => showModal({ component: 'ModalReviewAbsence', size: 2 });
const reviewAbsence = (absence) =>
  showModal({
    component: 'ModalReviewAbsence',
    size: 2,
    data: absence,
  });

const onRowClass = (dataItem) => {
  if (dataItem?.excuse_statut === -2) {
    return 'text-danger';
  }
  const statutsClass = {
    '-1': 'text-warning', //'Annulé',
    0: '', //'A saisir',
    1: 'text-success', //'Saisie',
  };
  return statutsClass[dataItem.excuse_statut];
};

const absenceStatuts = [
  { id: -2, designation: 'Amendé' },
  { id: -1, designation: 'Refusé' },
  { id: 0, designation: 'A traiter' },
  { id: -1, designation: 'Accepté' },
];
const fieldsBase = [
  { title: 'Date', key: 'date', type: Date },
  { title: 'Sapeur', key: 'sapeur' },
  { title: 'Categorie', key: 'categorie' },
  {
    title: 'Heure',
    key: 'heure',
    formatter(value) {
      return value.slice(0, 5);
    },
  },
  { title: 'Localité', key: 'localite' },
  { title: 'Designation', key: 'designation' },
  {
    title: 'Statut',
    key: 'excuse_statut',
    slot: 'statut',
    formatter(value, rowData) {
      const statuts = {
        '-2': 'Amendée',
        '-1': 'Refusée',
        0: 'Excusé, à traiter',
        1: 'Acceptée',
      };
      if (rowData.excuse_type_id) {
        return statuts[value];
      }

      var dateParts = rowData.date.split('-');
      const d = new Date(
        dateParts[0],
        dateParts[1] - 1,
        dateParts[2].substr(0, 2),
      );

      d.setDate(d.getDate() + (excuseParam.value?.delai_excuse ?? 0));
      const diffDays = Math.ceil(
        Math.abs(new Date() - d) / (1000 * 60 * 60 * 24),
      );

      if (d < new Date()) {
        return 'Non excusé, à traiter';
      } else {
        return 'Non excusé (' + diffDays + ' jours restants)';
      }
    },
  },
  { title: 'Actions', slot: 'actions' },
];
</script>

<template>
  <stateful-filter
    id="absences"
    v-slot="{ setFilter, filters, filteredData, canReset, reset }"
    :data="computedData"
  >
    <div class="row">
      <div class="col-md-3">
        <div class="card card-primary card-outline mb-2">
          <div class="card-header d-flex justify-content-between">
            <h5>Actions</h5>
          </div>
          <div class="card-body d-grid gap-2">
            <button
              class="btn btn-outline-primary"
              :disabled="!computedData.length"
              @click="review"
            >
              Examiner les excuses non traitées
            </button>
          </div>
        </div>
      </div>
      <div class="col-md-9">
        <div class="card card-primary card-outline mb-2">
          <div class="card-header d-flex justify-content-between">
            <h5>Filtres</h5>
          </div>
          <div class="card-body">
            <div class="row">
              <base-select
                class="col-md-4"
                :options="absenceStatuts"
                base-option="<Statut>"
                :model-value="filters.excuse_statut"
                @update:model-value="
                  (value) => setFilter('excuse_statut', value)
                "
              />
              <base-select
                class="col-md-4"
                :options="filteredLocalites"
                base-option="<Localité>"
                :model-value="filters.localite_id"
                @update:model-value="(value) => setFilter('localite_id', value)"
              />
              <base-select
                class="col-md-4"
                :options="filteredExercicesCategories"
                base-option="<Catégorie>"
                :model-value="filters.exercice_categorie_id"
                @update:model-value="
                  (value) => setFilter('exercice_categorie_id', value)
                "
              />
              <div v-if="canReset" class="col-md-4 mt-1">
                <button class="btn btn-sm btn-warning w-100" @click="reset">
                  Réinitialiser
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-md-12">
        <div class="card card-primary card-outline mb-3">
          <div class="card-body table-responsive p-0">
            <base-table
              :loading="loading"
              :selectable="true"
              :fields="fieldsBase"
              no-data="Aucune absence à afficher"
              :data="filteredData"
              :row-class="onRowClass"
              @selected="selectExercice"
            >
              <template #statut="{ rowData, formatter }">
                <span
                  class="badge rounded-pill"
                  :class="{
                    'text-bg-danger': rowData.excuse_statut == -2,
                    'text-bg-warning': rowData.excuse_statut == -1,
                    'text-bg-secondary': rowData.excuse_statut == 0,
                    'text-bg-success': rowData.excuse_statut == 1,
                  }"
                  >{{ formatter(rowData.excuse_statut, rowData) }}</span
                >
              </template>
              <template #actions="{ rowData }">
                <button
                  v-if="hasValidationPermission"
                  :title="rowData.excuse_statut == 0 ? 'Examen' : 'Réexaminer'"
                  class="btn border-0"
                  :class="
                    rowData.excuse_statut == 0
                      ? 'btn-outline-success'
                      : 'btn-outline'
                  "
                  @click="reviewAbsence(rowData)"
                >
                  <font-awesome-icon :icon="['far', 'eye']" />
                </button>
              </template>
            </base-table>
          </div>
        </div>
      </div>
    </div>
  </stateful-filter>
</template>
