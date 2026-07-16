<script setup>
import { computed, ref, watchEffect } from "vue";
import { useModalStore } from "../../stores/common/Modal.js";
import useHasPermission from "../../composables/usePermission.js";
import permissions from "/src/composables/permissions.js";
import { useInterventionStore } from "../../stores/intervention/Intervention.js";
import { useMaterielStore } from "../../stores/intervention/Materiel.js";

const interventionStore = useInterventionStore();
const materielStore = useMaterielStore();

await materielStore.fetchMateriels();

const { id } = defineProps({
  id: {
    type: String,
    required: true,
  },
});

const loading = ref(true);
watchEffect(async () => {
  loading.value = true;
  await interventionStore.fetchInterventionMateriels(id);
  loading.value = false;
});

const activeMateriels = computed(() =>
  interventionStore.active.materiels.map((m) => ({
    ...m,
    designation: materielStore.liste?.find((mat) => mat.id == m.materiel_id)?.designation,
  })),
);

const hasEditPermission = useHasPermission(permissions.INTERVENTION.MODIFICATION);

const { confirm, showModal } = useModalStore();

const newMateriel = () => showModal("ModalInterventionMateriel");

const editMateriel = (materielId) =>
  showModal("ModalInterventionMateriel", {
    data: activeMateriels.value.find((m) => m.id == materielId),
  });

const supprimerMateriel = (materielId) =>
  confirm(
    "Voulez-vous vraiment supprimer cette absence ?",
    "Attention, la suppression d'un absence est irréversible ! Toutes les données de cette absence seront perdues !",
  ).then(() => interventionStore.removeInterventionMateriel(materielId));

const fields = [
  { title: "Matériel", key: "designation" },
  { title: "Quantité", key: "quantite" },
  { title: "Actions", slot: "actions" },
];
</script>

<template>
  <div class="col-xs-12 col-lg-6">
    <div class="card card-primary card-outline mb-3">
      <div class="card-header d-flex justify-content-between">
        <h3 class="card-title">Matériel consommable et en prêt</h3>
        <button v-if="hasEditPermission" type="button" class="btn btn-primary" @click="newMateriel">
          Ajouter du matériel
        </button>
      </div>
      <div class="card-body table-responsive p-0">
        <base-table
          :loading="loading"
          :fields="fields"
          :data="activeMateriels"
          :selectable="true"
          no-data="Aucun matériel consommable ou en prêt"
        >
          <template #actions="{ rowData }">
            <div class="d-flex justify-content-center">
              <button
                type="button"
                class="btn btn-outline-primary border-0"
                @click="editMateriel(rowData.id)"
              >
                <font-awesome-icon :icon="['far', 'edit']" />
              </button>
              <button
                type="button"
                class="btn btn-outline-danger border-0"
                @click="supprimerMateriel(rowData.id)"
              >
                <font-awesome-icon :icon="['far', 'trash-alt']" />
              </button>
            </div>
          </template>
        </base-table>
      </div>
    </div>
  </div>
</template>
