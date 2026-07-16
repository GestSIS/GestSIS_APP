<script setup>
import { computed, ref, watchEffect } from "vue";
import { useSapeurStore } from "../../stores/sapeur/Sapeur.js";
import { useFonctionStore } from "../../stores/sapeur/Fonction.js";
import { useModalStore } from "../../stores/common/Modal.js";
import permissions from "/src/composables/permissions.js";
import useHasPermission from "../../composables/usePermission.js";

const sapeurStore = useSapeurStore();
const fonctionStore = useFonctionStore();
const loading = ref(true);

watchEffect(async () => {
  loading.value = true;
  await sapeurStore.fetchSapeurFonctions(sapeurStore.active.id);
  loading.value = false;
});
await fonctionStore.fetchFonctions();

const activeSapeurFonctions = computed(() =>
  sapeurStore.active.fonctions
    .slice()
    .sort((a, b) => b.debut.localeCompare(a.debut))
    .map((f) => ({
      ...f,
      fonction: fonctionStore.liste.find((fonction) => fonction.id == f.fonction_id)?.nom,
      actif: fonctionStore.liste.find((fonction) => fonction.id == f.fonction_id)?.actif,
    })),
);
const hasEditPermission = useHasPermission(permissions.SAPEUR.MODIFICATION);

const { showModal, confirm } = useModalStore();

const newFonction = () => {
  showModal("ModalSapeurFonction");
};
const editFonction = (fonction) => {
  showModal({ component: "ModalSapeurFonction", data: fonction });
};
const supprimerFonction = (fonction) =>
  confirm(
    "Voulez-vous vraiment supprimer cette fonction ?",
    "Attention, la suppression d'une fonction est irréversible ! Toutes les données de cette fonction seront perdues !",
  ).then(() => sapeurStore.removeSapeurFonction(fonction?.id));

const fields = [
  { title: "Début", key: "debut", type: Date },
  { title: "Fin", key: "fin", slot: "fin" },
  { title: "Fonction", key: "fonction" },
  { title: "Remarques", key: "remarque" },
  { title: "Actions", slot: "actions" },
];
</script>

<template>
  <div class="card card-primary card-outline">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Fonctions</h3>
      <button v-if="hasEditPermission" type="button" class="btn btn-primary" @click="newFonction">
        Ajouter une fonction
      </button>
    </div>
    <div class="card-body table-responsive p-0">
      <base-table
        :loading="loading"
        :fields="fields"
        :data="activeSapeurFonctions"
        no-data="Aucune fonction"
      >
        <template #fin="{ rowData }">
          {{ rowData.fin ? new Date(rowData.fin).toLocaleDateString("fr-CH") : "" }}
          <font-awesome-icon
            v-if="rowData.fin === null && !rowData.actif"
            v-tooltip.bottom="
              'Fonction inactive, vous devriez mettre une date de fin à cette fonction !'
            "
            class="text-danger"
            :icon="['fas', 'info-circle']"
          />
        </template>
        <template #actions="{ rowData }">
          <button
            v-if="hasEditPermission"
            type="button"
            class="btn btn-outline-primary border-0"
            @click="editFonction(rowData)"
          >
            <font-awesome-icon :icon="['far', 'edit']" />
          </button>
          <button
            v-if="hasEditPermission"
            type="button"
            class="btn btn-outline-danger border-0"
            @click="supprimerFonction(rowData)"
          >
            <font-awesome-icon :icon="['far', 'trash-alt']" />
          </button>
        </template>
      </base-table>
    </div>
  </div>
</template>
