<script setup>
import { useMissionStore } from "../../stores/intervention/Mission.js";
import { useModalStore } from "../../stores/common/Modal.js";
import { computed } from "vue";
import { useSubmit } from "../../composables/useSubmit.js";

const missionStore = useMissionStore();
await missionStore.fetchMissions();

const fields = [
  { title: "Titre", key: "titre" },
  { title: "Actions", slot: "actions" },
];

const listeMission = computed(() => missionStore.liste.slice().sort((a, b) => a.tri - b.tri));

const { confirm, showModal } = useModalStore();
const { isSubmitting, submit } = useSubmit();
const ajoutMission = () => showModal({ component: "ModalMission", data: {} });
const updateMission = (mission) => showModal({ component: "ModalMission", data: { ...mission } });
const deleteMission = async (mission) => {
  if (
    await confirm(
      "Voulez-vous vraiment supprimer cette mission ?",
      "Attention, la suppression d'une mission est irréversible ! Toutes les données de cette mission seront perdues !",
    )
  ) {
    await submit(
      () => missionStore.removeMission(mission.id),
      "Erreur lors de la suppression de la mission.",
      "Mission supprimée.",
    );
  }
};
</script>

<template>
  <div class="card card-primary card-outline">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Mission</h3>
      <button type="button" class="btn btn-primary" @click="ajoutMission()">
        Ajouter une mission
      </button>
    </div>
    <div class="card-body table-responsive p-0">
      <base-table :data="listeMission" :fields="fields" no-data="Aucune mission" :selectable="true">
        <template #actions="{ rowData }">
          <button
            type="button"
            class="btn btn-outline-primary border-0"
            @click="updateMission(rowData)"
          >
            <font-awesome-icon :icon="['far', 'edit']" />
          </button>
          <button
            :disabled="isSubmitting"
            type="button"
            class="btn btn-outline-danger border-0"
            @click="deleteMission(rowData)"
          >
            <font-awesome-icon :icon="['far', 'trash-alt']" />
          </button>
        </template>
      </base-table>
    </div>
  </div>
</template>
