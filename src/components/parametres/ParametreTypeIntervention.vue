<script setup>
import { computed, inject } from 'vue';
import { useStore } from 'vuex';
import { useModalStore } from '../../stores/common/Modal';
const store = useStore();

const loadStatIntervention = store.dispatch('fetchStatInterventions');
const loadTypeIntervention = store.dispatch('fetchTypeInterventions');

await Promise.all([loadStatIntervention, loadTypeIntervention]);

const fieldsType = [
  { title: 'Tri', key: 'tri' },
  { title: "Type d'intervention", key: 'designation' },
  { title: 'Statistique', key: 'statistique' },
  { title: 'Actions', slot: 'actions' },
];
const fieldsStat = [
  { title: 'Tri', key: 'tri' },
  { title: 'Désignation', key: 'designation' },
  { title: 'Actions', slot: 'actions' },
];

const listeType = computed(() =>
  store.state.typeIntervention.liste
    .map((t) => ({
      ...t,
      statistique: store.state.statIntervention.liste.find(
        (s) => s.id == t.stat_intervention_id,
      )?.designation,
    }))
    .sort((a, b) => a.tri - b.tri),
);
const listeStat = computed(() =>
  store.state.statIntervention.liste.sort((a, b) => a.tri - b.tri),
);

const { showModal } = useModalStore();

const ajoutType = () =>
  showModal({ component: 'ModalTypeIntervention', data: {} });

const updateType = (type) =>
  showModal({
    component: 'ModalTypeIntervention',
    data: { ...type },
  });

const awn = inject('awn');
const deleteType = (type) =>
  store
    .dispatch('removeTypeIntervention', type.id)
    .catch((res) => awn.alert(res.message || 'Erreur lors de la suppression'));

const ajoutStat = () =>
  showModal({ component: 'ModalStatIntervention', data: {} });

const updateStat = (stat) =>
  showModal({
    component: 'ModalStatIntervention',
    data: { ...stat },
  });

const deleteStat = (stat) =>
  store
    .dispatch('removeStatIntervention', stat.id)
    .catch((res) => awn.alert(res.message || 'Erreur lors de la suppression'));
</script>

<template>
  <div class="row">
    <div class="col-sm-12 col-xl-6">
      <div class="card card-primary card-outline">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Type d'intervention</h3>
          <button type="button" class="btn btn-primary" @click="ajoutType()">
            Ajouter un type
          </button>
        </div>
        <div class="card-body table-responsive p-0">
          <base-table
            :data="listeType"
            :fields="fieldsType"
            no-data="Aucun type"
            :selectable="true"
          >
            <template #actions="{ rowData }">
              <button
                type="button"
                class="btn btn-outline-primary border-0"
                @click="updateType(rowData)"
              >
                <font-awesome-icon :icon="['far', 'edit']" />
              </button>
              <button
                type="button"
                class="btn btn-outline-danger border-0"
                @click="deleteType(rowData)"
              >
                <font-awesome-icon :icon="['far', 'trash-alt']" />
              </button>
            </template>
          </base-table>
        </div>
      </div>
    </div>
    <div class="col-sm-12 col-xl-6">
      <div class="card card-primary card-outline">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Statistiques</h3>
          <button type="button" class="btn btn-primary" @click="ajoutStat()">
            Ajouter un type de statistique
          </button>
        </div>
        <div class="card-body table-responsive p-0">
          <base-table
            :data="listeStat"
            :fields="fieldsStat"
            no-data="Aucune statistique"
          >
            <template #actions="{ rowData }">
              <button
                type="button"
                class="btn btn-outline-primary border-0"
                @click="updateStat(rowData)"
              >
                <font-awesome-icon :icon="['far', 'edit']" />
              </button>
              <button
                type="button"
                class="btn btn-outline-danger border-0"
                @click="deleteStat(rowData)"
              >
                <font-awesome-icon :icon="['far', 'trash-alt']" />
              </button>
            </template>
          </base-table>
        </div>
      </div>
    </div>
  </div>
</template>
