<script setup>
import { computed } from "vue";
import { useControleStore } from "../../stores/materiel/Controle.js";
import { useModalStore } from "../../stores/common/Modal.js";
import useNotification from "../../composables/useNotification.js";
import ParametreTachesControle from "./ParametreTachesControle.vue";

const store = useControleStore();
await store.fetchControles();

const controles = computed(() => store.liste.slice().sort((a, b) => a.nom.localeCompare(b.nom)));

const { showModal, confirm } = useModalStore();
const awn = useNotification();

const recurrenceLabel = (controle) => {
  if (controle.recurrence_type !== "PERIODIQUE") return "";
  const preavis = controle.duree_preavis ? ` (préavis ${controle.duree_preavis} mois)` : "";
  return `Tous les ${controle.recurrence_value} mois${preavis}`;
};

const recurrenceTypeLabel = (type) => {
  if (type === "PERIODIQUE") return "Périodique";
  if (type === "NON_PERIODIQUE") return "Non périodique";
  return "Après usage";
};

const ajoutControle = () => showModal({ component: "ModalControle", data: {}, size: 2 });

const editControle = (controle) =>
  showModal({ component: "ModalControle", data: { ...controle }, size: 2 });

const deleteControle = (controle) =>
  confirm(
    "Supprimer ce contrôle ?",
    `Voulez-vous vraiment supprimer le contrôle "${controle.nom}" ? Cette action est irréversible.`,
  ).then(() =>
    store
      .removeControle(controle.id)
      .catch((err) => awn.alert(err.message ?? "Impossible de supprimer ce contrôle")),
  );

const ajoutTache = (controle) =>
  showModal({
    component: "ModalControleTache",
    data: {
      controle_id: controle.id,
      order: (controle.taches?.length ?? 0) + 1,
    },
  });

const fields = [
  { title: "Nom", key: "nom" },
  { title: "Description", key: "description" },
  { title: "Récurrence", slot: "recurrence" },
  { title: "Responsable", slot: "responsable" },
  { title: "Actions", slot: "actions" },
];
</script>

<template>
  <div class="card card-primary card-outline">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title me-auto">Contrôles</h3>
      <button type="button" class="btn btn-primary" @click="ajoutControle">
        Ajouter un contrôle
      </button>
    </div>
    <div class="card-body table-responsive p-0">
      <base-table
        :data="controles"
        :fields="fields"
        :detail-row-column="true"
        no-data="Aucun contrôle défini"
      >
        <template #recurrence="{ rowData }">
          <span class="badge bg-secondary me-2">{{
            recurrenceTypeLabel(rowData.recurrence_type)
          }}</span>
          {{ recurrenceLabel(rowData) }}
        </template>
        <template #responsable="{ rowData }">
          <span v-if="rowData.externe" class="badge bg-warning text-dark me-2">Externe</span>
          {{ rowData.reparateur }}
        </template>
        <template #actions="{ rowData }">
          <button
            type="button"
            class="btn btn-outline-primary border-0"
            @click="editControle(rowData)"
          >
            <font-awesome-icon :icon="['far', 'edit']" />
          </button>
          <button
            type="button"
            class="btn btn-outline-danger border-0"
            @click="deleteControle(rowData)"
          >
            <font-awesome-icon :icon="['far', 'trash-alt']" />
          </button>
        </template>
        <template #detail-row="{ rowData }">
          <div class="p-3 bg-light border-top">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <strong>Tâches — {{ rowData.nom }}</strong>
              <button
                type="button"
                class="btn btn-sm btn-outline-primary"
                @click="ajoutTache(rowData)"
              >
                <font-awesome-icon :icon="['fas', 'plus']" class="me-1" />
                Ajouter une tâche
              </button>
            </div>
            <ParametreTachesControle :controle="rowData" />
          </div>
        </template>
      </base-table>
    </div>
  </div>
</template>
