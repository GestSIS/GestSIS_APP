<script setup>
import { useModalStore } from '../stores/common/Modal';
import permissions from '../store/permissions.js';
import ExerciceComptable from '/src/components/exercice_comptable/ExerciceComptable.vue';
import { useStore } from 'vuex';
import { computed, ref, watch, watchEffect } from 'vue';
import useHasPermission from '../hooks/usePermission';

const store = useStore();

const loadSapeurs = store.dispatch('fetchListeSapeur');
const loadLocalities = store.dispatch('fetchLocalites');
const loadStatFederal = store.dispatch('fetchStatFederals');
const loadTypeInterventions = store.dispatch('fetchTypeInterventions');
const loadInterventionTraitement = store.dispatch(
  'fetchInterventionTraitements',
);

await store.dispatch('fetchExercicesComptables');

const loading = ref(true);
watchEffect(async () => {
  loading.value = true;
  await store.dispatch(
    'fetchListeIntervention',
    store.state.exerciceComptable.activeId,
  );
  loading.value = false;
});

await Promise.all([
  loadSapeurs,
  loadLocalities,
  loadStatFederal,
  loadTypeInterventions,
  loadInterventionTraitement,
]);

const selectedId = ref(null);

const interventions = computed(() =>
  store.state.intervention.liste.sort((a, b) =>
    b.date_debut.localeCompare(a.date_debut),
  ),
);
const types = computed(() => store.state.typeIntervention.liste);
const stats = computed(() => store.state.statFederal.liste);
const traitements = computed(() => store.state.interventionTraitement.liste);
const localites = computed(() =>
  store.state.localite.liste.sort((a, b) =>
    a.designation.localeCompare(b.designation),
  ),
);
const hasValidationPermission = useHasPermission(
  permissions.INTERVENTION.VALIDATION,
);
const hasEditPermission = useHasPermission(
  permissions.INTERVENTION.MODIFICATION,
);

const computedData = computed(() => {
  return interventions.value.map((e) => ({
    ...e,
    type_intervention: types.value.find((c) => c.id == e.type_intervention_id)
      ?.designation,
    localite: localites.value.find((l) => l.id == e.localite_id)?.designation,
    stat_federal: stats.value.find((l) => l.id == e.stat_federal_id)
      ?.designation,
    traitement: traitements.value.find(
      (l) => l.id == e.intervention_traitement_id,
    )?.designation,
  }));
});
const filteredInterventionsTypes = computed(() => {
  const ids = new Set(
    interventions.value.map((i) => parseInt(i.type_intervention_id)),
  );
  return types.value.filter((t) => ids.has(t.id));
});
const filteredLocalites = computed(() => {
  const ids = new Set(interventions.value.map((i) => parseInt(i.localite_id)));
  return localites.value.filter((t) => ids.has(t.id));
});
const filteredStatFederal = computed(() => {
  const ids = new Set(
    interventions.value.map((i) => parseInt(i.stat_federal_id)),
  );
  return stats.value.filter((t) => ids.has(t.id));
});
const canDelete = computed(() => {
  return (
    selectedId.value &&
    interventions.value.filter((i) => i.id == selectedId.value && i.statut < 3)
      .length > 0
  );
});

const { showModal, confirm } = useModalStore();
const select = (row) => (selectedId.value = row?.id);

const supprimerIntervention = (id) =>
  confirm(
    "Voulez-vous vraiment supprimer l'intervention ?",
    "Attention, la suppression d'une intervention est irréversible ! Toutes les données relatives à celle-ci seront supprimées définitivement.",
    () => store.dispatch('removeIntervention', id),
  );
const validerIntervention = (id) => store.dispatch('validerIntervention', id);

const rapportIntervention = () => {
  const intervention = interventions.value.find(
    (i) => i.id == selectedId.value,
  );
  showModal({
    component: 'ModalRapportIntervention',
    size: 1,
    data: {
      interventionId: selectedId.value,
      statut: intervention.statut,
      date: intervention.date_debut,
    },
  });
};
const onRowClass = (dataItem, isSelected) => {
  if (isSelected) {
    return;
  }
  const statutsClass = {
    0: '', // 'A saisir',
    1: '', // 'En attente de validation',
    2: '', // 'Validée',
    3: 'table-success', //'Imputée'
  };
  return statutsClass[dataItem.statut];
};

const fields = [
  { title: 'Date', key: 'date_debut', type: Date },
  {
    title: 'Heure',
    key: 'heure_debut',
    formatter: (value) => value.slice(0, 5),
  },
  { title: "Type d'intervention", key: 'type_intervention' },
  { title: 'Localité', key: 'localite' },
  { title: 'Lieu', key: 'lieu', columnClass: 'align-middle' },
  { title: 'Stat fédérale', key: 'stat_federal' },
  { title: 'Traitement', key: 'traitement' },
  {
    title: 'Étendue',
    key: 'degre',
    formatter: (value) => {
      const degre = {
        1: 'Fausse-alarme',
        2: 'Petite',
        3: 'Moyenne',
        4: 'Grande',
      };
      return degre[value];
    },
  },
  {
    title: 'Statut',
    key: 'statut',
    formatter: (value) => {
      const statuts = {
        0: 'A saisir',
        1: 'A valider',
        2: 'Validée',
        3: 'Imputée',
      };
      return statuts[value];
    },
  },
  { title: 'Actions', slot: 'actions' },
];
</script>

<template>
  <stateful-filter
    id="interventions"
    v-slot="{ setFilter, filters, filteredData, canReset, reset }"
    :data="computedData"
  >
    <div class="container-fluid">
      <div class="row">
        <div class="col-sm-6">
          <nav aria-label="breadcrumb">
            <ol class="breadcrumb m-3">
              <li class="breadcrumb-item">
                <router-link :to="{ name: 'accueil' }">Accueil</router-link>
              </li>
              <li class="breadcrumb-item active" aria-current="page">
                Interventions
              </li>
            </ol>
          </nav>
        </div>
        <div class="col-sm-6 d-flex justify-content-end">
          <exercice-comptable />
        </div>
      </div>
      <div class="row">
        <div class="col-md-3">
          <div class="card card-primary card-outline mb-2">
            <div class="card-header d-flex justify-content-between">
              <h5>Actions</h5>
            </div>
            <div class="card-body d-grid gap-1">
              <router-link
                v-slot="{ navigate }"
                custom
                :to="{ name: 'intervention-details', params: { id: 'new' } }"
              >
                <button
                  v-if="hasEditPermission"
                  class="btn btn-outline-primary"
                  @click="navigate"
                >
                  Ajouter une intervention
                </button>
              </router-link>
              <router-link
                v-slot="{ navigate }"
                custom
                :to="'/interventions/' + selectedId"
              >
                <button
                  :disabled="!selectedId"
                  class="btn btn-outline-primary"
                  @click="navigate"
                >
                  {{ hasEditPermission ? 'Modifier' : 'Aperçu' }}
                </button>
              </router-link>
              <button
                v-if="hasEditPermission"
                :disabled="!canDelete"
                class="btn btn-outline-danger"
                @click="supprimerIntervention(selectedId)"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card card-primary card-outline mb-2">
            <div class="card-header d-flex justify-content-between">
              <h5>Impressions</h5>
            </div>
            <div class="card-body d-grid gap-1">
              <button
                :disabled="!selectedId"
                class="btn btn-outline-primary"
                @click="rapportIntervention"
              >
                Rapport d'intervention
              </button>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card card-primary card-outline mb-2">
            <div class="card-header d-flex justify-content-between">
              <h5>Filtres</h5>
            </div>
            <div class="card-body">
              <div class="row">
                <base-select
                  class="mb-1 col-md-4"
                  :options="filteredLocalites"
                  base-option="<Localité>"
                  :model-value="filters.localite_id"
                  @update:model-value="
                    (value) => setFilter('localite_id', value)
                  "
                />
                <base-select
                  class="mb-1 col-md-4"
                  :options="filteredInterventionsTypes"
                  base-option="<Type>"
                  :model-value="filters.type_intervention_id"
                  @update:model-value="
                    (value) => setFilter('type_intervention_id', value)
                  "
                />
                <base-select
                  class="mb-1 col-md-4"
                  :options="filteredStatFederal"
                  base-option="<Statistique fédérale>"
                  :model-value="filters.stat_federal_id"
                  @update:model-value="
                    (value) => setFilter('stat_federal_id', value)
                  "
                />
                <base-select
                  class="mb-1 col-md-4"
                  :options="traitements"
                  base-option="<Traitement>"
                  :model-value="filters.intervention_traitement_id"
                  @update:model-value="
                    (value) => setFilter('intervention_traitement_id', value)
                  "
                />
                <base-select
                  class="mb-1 col-md-4"
                  base-option="<Etendue>"
                  :options="[
                    { id: 1, designation: 'Fausse alarme' },
                    { id: 2, designation: 'Petite' },
                    { id: 3, designation: 'Moyenne' },
                    { id: 4, designation: 'Grande' },
                  ]"
                  :model-value="filters.degre"
                  @update:model-value="(value) => setFilter('degre', value)"
                />
                <div v-if="canReset" class="col-md-4">
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
                :fields="fields"
                :row-class="onRowClass"
                no-data="Aucune intervention à afficher"
                :data="filteredData ?? []"
                :selectable="true"
                @selected="select"
              >
                <template #actions="{ rowData }">
                  <router-link
                    v-slot="{ navigate }"
                    :to="'/interventions/' + rowData.id"
                    custom
                  >
                    <button
                      class="btn btn-outline-primary border-0"
                      @click="navigate"
                    >
                      <font-awesome-icon :icon="['far', 'edit']" />
                    </button>
                  </router-link>
                  <button
                    v-if="hasValidationPermission && rowData.statut === 1"
                    class="btn btn-outline-primary border-0"
                    @click="validerIntervention(rowData.id)"
                  >
                    <font-awesome-icon :icon="['fas', 'check']" />
                  </button>
                  <button
                    v-if="hasEditPermission && rowData.statut <= 3"
                    title="supprimer"
                    class="btn btn-outline-danger border-0"
                    @click="supprimerIntervention(rowData.id)"
                  >
                    <font-awesome-icon :icon="['far', 'trash-alt']" />
                  </button>
                </template>
              </base-table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </stateful-filter>
</template>
