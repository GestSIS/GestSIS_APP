<script setup>
import { useLocaliteStore } from "../../stores/common/Localite.js";
import { useSapeurStore } from "../../stores/sapeur/Sapeur.js";
import permissions from "../../composables/permissions.js";
import { computed, ref, watchEffect } from "vue";
import useHasPermission from "../../composables/usePermission.js";
import { useModalStore } from "../../stores/common/Modal.js";
import { useExerciceComptableStore } from "../../stores/comptabilite/ExerciceComptable.js";
import { useAbsenceStore } from "../../stores/absence/Absence.js";

const localiteStore = useLocaliteStore();
const sapeurStore = useSapeurStore();
const exerciceComptableStore = useExerciceComptableStore();
const absenceStore = useAbsenceStore();

await exerciceComptableStore.fetchExercicesComptables();

const loadSapeurs = sapeurStore.fetchListeSapeur();
const loadLocalites = localiteStore.fetchLocalites();
const loading = ref(true);
watchEffect(async () => {
  loading.value = true;
  await absenceStore.fetchAbsences(exerciceComptableStore.activeId);
  loading.value = false;
});
await Promise.all([loadSapeurs, loadLocalites]);

const sapeurs = computed(() => sapeurStore.liste);
const absences = computed(() =>
  absenceStore.liste.slice().sort((a, b) => (a.debut ?? "").localeCompare(b.debut ?? "")),
);
const hasEditPermission = useHasPermission(permissions.ABSENCE.MODIFICATION);

const computedData = computed(() => {
  return absences.value.map((a) => ({
    ...a,
    nom_prenom: sapeurs.value.find((s) => s.id === a.sapeur_id)?.nom_prenom,
  }));
});

const { showModal, confirm } = useModalStore();
const addAbsence = () => showModal({ component: "ModalAbsence" });

const modifierAbsence = (absence) => showModal({ component: "ModalAbsence", data: absence });

const removeAbsence = (id) =>
  confirm(
    "Voulez-vous vraiment supprimer cette absence ?",
    "Attention, la suppression d'un absence est irréversible ! Toutes les données de cette absence seront perdues !",
  ).then(() => absenceStore.removeAbsence(id));

const onRowClass = (dataItem, isSelected) => {
  if (dataItem.statut == 0) {
    return "text-danger";
  }
  if (isSelected) {
    return "";
  }

  const statutsClass = {
    0: "", //'Annulé',
    1: "", //'A saisir',
    2: "", //'Saisie',
    3: "", //'Validé',
    4: "table-success", //'Imputée'
  };
  return statutsClass[dataItem.statut];
};

const fields = [
  { title: "Sapeur", key: "nom_prenom" },
  { title: "Départ", key: "debut", type: Date },
  { title: "Retour", key: "fin", type: Date },
  {
    title: "Actions",
    slot: "actions",
    titleClass: "align-middle text-center",
    columnClass: "align-middle text-center",
  },
];
</script>

<template>
  <stateful-filter id="absences" v-slot="{ filteredData }" :data="computedData">
    <div class="row">
      <div class="col-md-3">
        <div class="card card-primary card-outline mb-2">
          <div class="card-header d-flex justify-content-between">
            <h5>Actions</h5>
          </div>
          <div class="card-body d-grid gap-2">
            <button v-if="hasEditPermission" class="btn btn-outline-primary" @click="addAbsence">
              Ajouter une absence
            </button>
          </div>
        </div>
      </div>
      <!-- <div class="col-md-6">
        <div class="card card-primary card-outline mb-2">
          <div class="card-header d-flex justify-content-between">
            <h5>Filtres</h5>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-6">// TODO: Affichage par</div>
              <div class="col-6">// TODO: Mois à afficher</div>
            </div>
          </div>
        </div>
      </div> -->
    </div>
    <div class="row">
      <div class="col-md-12">
        <div class="card card-primary card-outline mb-3">
          <div class="card-body table-responsive p-0">
            <base-table
              ref="basetable_absences"
              :loading="loading"
              :selectable="true"
              :fields="fields"
              no-data="Aucune absence"
              :data="filteredData"
              :row-class="onRowClass"
            >
              <template #actions="{ rowData }">
                <button
                  v-if="hasEditPermission"
                  title="modifier"
                  class="btn btn-outline-primary border-0"
                  @click="modifierAbsence(rowData)"
                >
                  <font-awesome-icon :icon="['far', 'edit']" />
                </button>
                <button
                  v-if="hasEditPermission"
                  title="supprimer"
                  class="btn btn-outline-danger border-0"
                  @click="removeAbsence(rowData.id)"
                >
                  <font-awesome-icon :icon="['far', 'trash-alt']" />
                </button>
              </template>
            </base-table>
          </div>
        </div>
      </div>
    </div>
  </stateful-filter>
</template>
