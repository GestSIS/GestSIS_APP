<script setup>
import { ref, computed, watchEffect } from "vue";
import { useSapeurStore } from "../../stores/sapeur/Sapeur.js";
import { useLocaliteStore } from "../../stores/common/Localite.js";
import { useModalStore } from "../../stores/common/Modal.js";
import permissions from "/src/composables/permissions.js";
import { useHasPermission } from "../../composables/useHasPermission.js";
import { useSubmit } from "../../composables/useSubmit.js";
import { NATURE_MUTATION } from "../../tools/sapeur.js";

const sapeurStore = useSapeurStore();
const localiteStore = useLocaliteStore();
const loading = ref(true);
watchEffect(async () => {
  loading.value = true;
  await sapeurStore.fetchSapeurMutations(sapeurStore.active.id);
  loading.value = false;
});

const mutations = computed(() =>
  sapeurStore.active.mutations.map((m) => ({
    ...m,
    nature_libelle: m.nature === NATURE_MUTATION.CIVIL ? "Civil" : "Sapeur",
    localite: localiteStore.liste.find((l) => l.id == m.localite_id)?.designation,
  })),
);
const hasEditPermission = useHasPermission(permissions.SAPEUR.MODIFICATION);
// Sapeur et civil ont chacun leur période en cours, indépendamment l'une de l'autre
const mutationSapeurOuverte = computed(() =>
  mutations.value.find((m) => m.nature === NATURE_MUTATION.SAPEUR && !m.sortie),
);
const mutationCivileOuverte = computed(() =>
  mutations.value.find((m) => m.nature === NATURE_MUTATION.CIVIL && !m.sortie),
);

const { showModal, confirm } = useModalStore();
const { isSubmitting, submit } = useSubmit();

// La dernière mutation ne se supprime pas : une mutation sapeur permet de repasser
// en recrue, celle d'un civil est refusée par l'API (supprimer la personne)
const isLastMutation = computed(() => mutations.value.length === 1);
const peutRepasserEnRecrue = computed(
  () => isLastMutation.value && mutations.value[0].nature === NATURE_MUTATION.SAPEUR,
);

const removeMutation = async (mutation) => {
  if (
    await confirm(
      "Voulez-vous vraiment supprimer cette mutation ?",
      "Attention, la suppression d'une mutation est irréversible ! Toutes les données de cette mutation seront perdues !",
    )
  ) {
    await submit(
      () => sapeurStore.removeMutation(mutation?.id),
      "Erreur lors de la suppression de la mutation.",
      "Mutation supprimée.",
    );
  }
};

const backToRecrue = async () => {
  if (
    await confirm(
      "Voulez-vous vraiment repasser ce sapeur en recrue ?",
      "Sa mutation sera supprimée et il retournera dans la liste des recrues.",
    )
  ) {
    await submit(
      () => sapeurStore.removeMutation(mutations.value[0].id),
      "Erreur lors du passage en recrue.",
      "Le sapeur est repassé en recrue.",
    );
  }
};

const editMutation = (mutation) => showModal({ component: "ModalMutation", data: mutation });

const finService = () =>
  showModal({
    component: "ModalMutation",
    data: { action: "finService", ...mutationSapeurOuverte.value },
  });

const incorporation = () =>
  showModal({ component: "ModalMutation", data: { nature: NATURE_MUTATION.SAPEUR } });

const incorporationCivile = () =>
  showModal({ component: "ModalMutation", data: { nature: NATURE_MUTATION.CIVIL } });

const fields = [
  { title: "Nature", key: "nature_libelle" },
  { title: "Incorporation", key: "incorporation", type: Date },
  { title: "Sortie", key: "sortie", type: Date },
  { title: "Motif", key: "motif" },
  { title: "Localité", key: "localite" },
  { title: "Actions", slot: "actions" },
];
</script>

<template>
  <base-card title="Incorporation / Sortie">
    <template #header>
      <div>
        <button
          v-if="mutationSapeurOuverte && hasEditPermission"
          type="button"
          class="btn btn-outline-primary"
          @click="finService"
        >
          <font-awesome-icon class="me-1" :icon="['fas', 'door-closed']" />Fin de service
        </button>
        <button
          v-else-if="hasEditPermission"
          type="button"
          class="btn btn-outline-primary"
          @click="incorporation"
        >
          <font-awesome-icon class="me-1" :icon="['fas', 'door-closed']" />Incorporation
        </button>
        <button
          v-if="!mutationCivileOuverte && hasEditPermission"
          type="button"
          class="btn btn-outline-primary ms-2"
          @click="incorporationCivile"
        >
          <font-awesome-icon class="me-1" :icon="['far', 'handshake']" />Incorporation civile
        </button>
        <button
          v-if="peutRepasserEnRecrue && hasEditPermission"
          :disabled="isSubmitting"
          type="button"
          class="btn btn-outline-warning ms-2"
          @click="backToRecrue"
        >
          <font-awesome-icon class="me-1" :icon="['fas', 'person-circle-plus']" />Repasser en recrue
        </button>
      </div>
    </template>
    <template #body>
      <form role="form">
        <base-table :loading="loading" :fields="fields" :data="mutations" no-data="Aucune mutation">
          <template #actions="{ rowData }">
            <button
              v-if="hasEditPermission"
              aria-label="Modifier"
              type="button"
              class="btn btn-outline-primary border-0"
              @click="editMutation(rowData)"
            >
              <font-awesome-icon :icon="['far', 'edit']" />
            </button>
            <button
              aria-label="Supprimer"
              :disabled="isSubmitting"
              v-if="hasEditPermission && !isLastMutation"
              type="button"
              class="btn btn-outline-danger border-0"
              @click="removeMutation(rowData)"
            >
              <font-awesome-icon :icon="['far', 'trash-alt']" />
            </button>
          </template>
        </base-table>
      </form>
    </template>
  </base-card>
</template>
