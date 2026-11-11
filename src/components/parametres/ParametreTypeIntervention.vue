<script setup>
import { computed } from "vue";
import { useSubmit } from "../../composables/useSubmit.js";
import { useStatInterventionStore } from "../../stores/intervention/StatIntervention.js";
import { useTypeInterventionStore } from "../../stores/intervention/TypeIntervention.js";
import { useModalStore } from "../../stores/common/Modal";

const statInterventionStore = useStatInterventionStore();
const typeInterventionStore = useTypeInterventionStore();

const loadStatIntervention = statInterventionStore.fetchStatInterventions();
const loadTypeIntervention = typeInterventionStore.fetchTypeInterventions();

await Promise.all([loadStatIntervention, loadTypeIntervention]);

const fieldsType = [
  { title: "Tri", key: "tri" },
  { title: "Type d'intervention", key: "designation" },
  { title: "Statistique", key: "statistique" },
  { title: "Actions", slot: "actions" },
];
const fieldsStat = [
  { title: "Tri", key: "tri" },
  { title: "Désignation", key: "designation" },
  { title: "Actions", slot: "actions" },
];

const listeType = computed(() =>
  typeInterventionStore.liste
    .map((t) => ({
      ...t,
      statistique: statInterventionStore.liste.find((s) => s.id == t.stat_intervention_id)
        ?.designation,
    }))
    .sort((a, b) => a.tri - b.tri),
);
const listeStat = computed(() => statInterventionStore.liste.slice().sort((a, b) => a.tri - b.tri));

const { showModal, confirm } = useModalStore();
const { isSubmitting, submit } = useSubmit();

const ajoutType = () => showModal({ component: "ModalTypeIntervention", data: {} });

const updateType = (type) =>
  showModal({
    component: "ModalTypeIntervention",
    data: { ...type },
  });

const deleteType = async (type) => {
  if (
    await confirm(
      "Voulez-vous vraiment supprimer ce type d'intervention ?",
      "Attention, la suppression d'un type d'intervention est irréversible !",
    )
  ) {
    await submit(
      () => typeInterventionStore.removeTypeIntervention(type.id),
      "Erreur lors de la suppression",
      "Type d'intervention supprimé.",
    );
  }
};

const ajoutStat = () => showModal({ component: "ModalStatIntervention", data: {} });

const updateStat = (stat) =>
  showModal({
    component: "ModalStatIntervention",
    data: { ...stat },
  });

const deleteStat = async (stat) => {
  if (
    await confirm(
      "Voulez-vous vraiment supprimer cette statistique ?",
      "Attention, la suppression d'une statistique est irréversible !",
    )
  ) {
    await submit(
      () => statInterventionStore.removeStatIntervention(stat.id),
      "Erreur lors de la suppression",
      "Statistique supprimée.",
    );
  }
};
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
                :disabled="isSubmitting"
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
          <base-table :data="listeStat" :fields="fieldsStat" no-data="Aucune statistique">
            <template #actions="{ rowData }">
              <button
                type="button"
                class="btn btn-outline-primary border-0"
                @click="updateStat(rowData)"
              >
                <font-awesome-icon :icon="['far', 'edit']" />
              </button>
              <button
                :disabled="isSubmitting"
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
