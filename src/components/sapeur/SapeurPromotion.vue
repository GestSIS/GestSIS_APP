<script setup>
import { computed, ref, watchEffect } from "vue";
import { useSapeurStore } from "../../stores/sapeur/Sapeur.js";
import { useGradeStore } from "../../stores/sapeur/Grade.js";
import useHasPermission from "../../composables/usePermission.js";
import { useModalStore } from "../../stores/common/Modal.js";
import permissions from "/src/composables/permissions.js";

const sapeurStore = useSapeurStore();
const gradeStore = useGradeStore();
const loading = ref(true);

watchEffect(async () => {
  loading.value = true;
  await sapeurStore.fetchSapeurGrades(sapeurStore.active.id);
  loading.value = false;
});
await gradeStore.fetchGrades();

const activeSapeurGrades = computed(() =>
  sapeurStore.active.grades
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((g) => ({
      ...g,
      designation: gradeStore.liste.find((grade) => grade.id == g.grade_id)?.designation,
    })),
);
const hasEditPermission = useHasPermission(permissions.SAPEUR.MODIFICATION);

const { showModal, confirm } = useModalStore();
const newGrade = () => showModal("ModalSapeurPromotion");
const editGrade = (grade) => showModal({ component: "ModalSapeurPromotion", data: grade });
const supprimerGrade = (grade) =>
  confirm(
    "Voulez-vous vraiment supprimer ce grade ?",
    "Attention, la suppression d'un grade est irréversible ! Toutes les données de ce grade seront perdues !",
  ).then(() => sapeurStore.removeSapeurGrade(grade?.id));

const fields = [
  { title: "Date", key: "date", type: Date },
  { title: "Désignation", key: "designation" },
  { title: "Remarques", key: "remarque" },
  { title: "Actions", slot: "actions" },
];
</script>

<template>
  <div class="card card-primary card-outline">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Promotions</h3>
      <button v-if="hasEditPermission" type="button" class="btn btn-primary" @click="newGrade">
        Ajouter une promotion
      </button>
    </div>
    <div class="card-body table-responsive p-0">
      <base-table
        :loading="loading"
        :fields="fields"
        :data="activeSapeurGrades"
        no-data="Aucun grade"
      >
        <template #actions="{ rowData }">
          <button
            v-if="hasEditPermission"
            type="button"
            class="btn btn-outline-primary border-0"
            @click="editGrade(rowData)"
          >
            <font-awesome-icon :icon="['far', 'edit']" />
          </button>
          <button
            v-if="hasEditPermission"
            type="button"
            class="btn btn-outline-danger border-0"
            @click="supprimerGrade(rowData)"
          >
            <font-awesome-icon :icon="['far', 'trash-alt']" />
          </button>
        </template>
      </base-table>
    </div>
  </div>
</template>
