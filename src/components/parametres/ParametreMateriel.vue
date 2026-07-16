<script setup>
import { useMaterielStore } from "../../stores/intervention/Materiel.js";
import { useUniteStore } from "../../stores/common/Unite.js";
import { useModalStore } from "../../stores/common/Modal.js";
import { computed } from "vue";
import useNotification from "../../composables/useNotification.js";

const materielStore = useMaterielStore();
const uniteStore = useUniteStore();

await materielStore.fetchMateriels();

const fields = [
  { title: "Tri", key: "tri" },
  { title: "Actif", key: "statut", type: Boolean },
  { title: "Désignation", key: "designation" },
  { title: "Prix de forfait", key: "forfait" },
  { title: "Prix de l'unité", key: "unite" },
  { title: "Type d'unité", key: "type_unite" },
  { title: "Actions", slot: "actions" },
];

const listeMateriel = computed(() =>
  materielStore.liste
    .map((m) => ({
      ...m,
      type_unite: uniteStore.liste.find((u) => u.id == m.type_unite_id)?.unite ?? "-",
    }))
    .sort((a, b) => a.tri - b.tri),
);

const { showModal } = useModalStore();
const awn = useNotification();
const ajoutMateriel = () => showModal({ component: "ModalMaterielIntervention", data: {} });
const updateMateriel = (materiel) =>
  showModal({
    component: "ModalMaterielIntervention",
    data: { ...materiel },
  });
const deleteMateriel = (materiel) =>
  materielStore
    .removeMateriel(materiel.id)
    .catch((res) => awn.alert(res.message || "Erreur lors de la suppression"));
</script>

<template>
  <div class="card card-primary card-outline">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Matériel consommable et en prêt</h3>
      <button type="button" class="btn btn-primary" @click="ajoutMateriel()">
        Ajouter du matériel
      </button>
    </div>
    <div class="card-body table-responsive p-0">
      <base-table
        :data="listeMateriel"
        :fields="fields"
        no-data="Aucun materiel"
        :selectable="true"
      >
        <template #actions="{ rowData }">
          <button
            type="button"
            class="btn btn-outline-primary border-0"
            @click="updateMateriel(rowData)"
          >
            <font-awesome-icon :icon="['far', 'edit']" />
          </button>
          <button
            type="button"
            class="btn btn-outline-danger border-0"
            @click="deleteMateriel(rowData)"
          >
            <font-awesome-icon :icon="['far', 'trash-alt']" />
          </button>
        </template>
      </base-table>
    </div>
  </div>
</template>
