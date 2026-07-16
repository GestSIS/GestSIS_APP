<script setup>
import { useModalStore } from "../../stores/common/Modal.js";
import { useFonctionStore } from "../../stores/sapeur/Fonction.js";
import { computed } from "vue";
import useNotification from "../../composables/useNotification.js";

const fonctionStore = useFonctionStore();
await fonctionStore.fetchFonctions();

const fields = [
  { title: "Tri", key: "tri" },
  { title: "Abréviation", key: "abreviation" },
  { title: "Nom", key: "nom" },
  { title: "Cumulable", key: "cumulable", type: Boolean },
  { title: "Actif", key: "actif", type: Boolean },
  { title: "Actions", slot: "actions" },
];

const listeFonction = computed(() => fonctionStore.liste.slice().sort((a, b) => b.tri - a.tri));

const { showModal } = useModalStore();
const awn = useNotification();
const ajoutFonction = () => showModal({ component: "ModalFonction", data: {} });
const updateFonction = (fonction) =>
  showModal({ component: "ModalFonction", data: { ...fonction } });
const deleteFonction = (fonction) =>
  fonctionStore
    .removeFonction(fonction.id)
    .catch((res) => awn.alert(res.message || "Erreur lors de la suppression"));
</script>

<template>
  <div class="card card-primary card-outline">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Fonctions</h3>
      <button type="button" class="btn btn-primary" @click="ajoutFonction()">
        Ajouter une fonction
      </button>
    </div>
    <div class="card-body table-responsive p-0">
      <base-table
        :data="listeFonction"
        :fields="fields"
        no-data="Aucune fonction"
        :selectable="true"
      >
        <template #actions="{ rowData }">
          <button
            type="button"
            class="btn btn-outline-primary border-0"
            @click="updateFonction(rowData)"
          >
            <font-awesome-icon :icon="['far', 'edit']" />
          </button>
          <button
            type="button"
            class="btn btn-outline-danger border-0"
            @click="deleteFonction(rowData)"
          >
            <font-awesome-icon :icon="['far', 'trash-alt']" />
          </button>
        </template>
      </base-table>
    </div>
  </div>
</template>
