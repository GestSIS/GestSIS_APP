<script setup>
import { computed, ref, watchEffect } from "vue";
import { useNotification } from "../../composables/useNotification.js";
import { useSapeurStore } from "../../stores/sapeur/Sapeur.js";
import { useExerciceStore } from "../../stores/exercice/Exercice.js";
import { useExerciceCategorieStore } from "../../stores/exercice/ExerciceCategorie.js";
import { useExerciceComptableStore } from "../../stores/comptabilite/ExerciceComptable.js";
import { useLocaliteStore } from "../../stores/common/Localite.js";
import { useModalStore } from "../../stores/common/Modal.js";
import { useAuthStore } from "../../stores/auth/Auth.js";
import { useConvocationParamStore } from "../../stores/exercice/ConvocationParam.js";
import permissions from "../../composables/permissions.js";
import { EXERCICE_STATUT, exerciceStatut, exerciceStatutOptions } from "../../tools/exercice.js";

import ExerciceDetails from "/src/components/exercice/ExerciceDetails.vue";
import ExerciceService from "/src/services/ExerciceService.js";

import { exercicesToIcs } from "../../tools/exportExercices";
import { exportFileName } from "../../tools/index.js";
import { useHasPermission } from "../../composables/useHasPermission.js";
import { useDownload } from "../../composables/useDownload.js";
import { useSubmit } from "../../composables/useSubmit.js";

const authStore = useAuthStore();
const sapeurStore = useSapeurStore();
const exerciceStore = useExerciceStore();
const exerciceCategorieStore = useExerciceCategorieStore();
const exerciceComptableStore = useExerciceComptableStore();
const localiteStore = useLocaliteStore();

await exerciceComptableStore.fetchExercicesComptables();

const loading = ref(true);
watchEffect(async () => {
  loading.value = true;
  await exerciceStore.fetchExercices(exerciceComptableStore.activeId);
  loading.value = false;
});

const selectedId = ref(null);
const selectExercice = (row) => (selectedId.value = row?.id);

const sisKey = computed(() => authStore.organisation.activeKey);
const sisName = computed(
  () => authStore.organisations.find((s) => s.id == authStore.organisation.activeId)?.nom,
);
const annee = computed(
  () => exerciceComptableStore.liste.find((e) => e.id == exerciceComptableStore.activeId)?.annee,
);
const sapeurs = computed(() => sapeurStore.liste);
const exercices = computed(() =>
  exerciceStore.liste.slice().sort((a, b) => a.date?.localeCompare(b.date)),
);
const categories = computed(() => exerciceCategorieStore.liste);
const localites = computed(() =>
  localiteStore.liste.slice().sort((a, b) => a.designation.localeCompare(b.designation)),
);
const hasEditPermission = useHasPermission(permissions.EXERCICE.MODIFICATION);
const hasSmsEnvoiePermission = useHasPermission(permissions.SMS.ENVOIE);
const hasValidationPermission = useHasPermission(permissions.EXERCICE.VALIDATION);

const computedData = computed(() => {
  return exercices.value.map((e) => ({
    ...e,
    categorie: categories.value.find((c) => c.id == e.exercice_categorie_id)?.designation,
    localite: localites.value.find((l) => l.id == e.localite_id)?.designation,
  }));
});
const filteredExercicesCategories = computed(() => {
  const ids = new Set(exercices.value.map((i) => parseInt(i.exercice_categorie_id)));
  return categories.value.filter((t) => ids.has(t.id));
});
const filteredLocalites = computed(() => {
  const ids = new Set(exercices.value.map((i) => parseInt(i.localite_id)));
  return localites.value.filter((t) => ids.has(t.id));
});

const { confirm, showModal } = useModalStore();
const { isSubmitting, submit } = useSubmit();
const { download } = useDownload();
const awn = useNotification();
const convoquer = async () => {
  const convocationParamStore = useConvocationParamStore();
  const { ok } = await submit(
    () => convocationParamStore.fetchParams(),
    "Erreur lors du chargement des paramètres de convocation.",
  );
  if (!ok) {
    return;
  }
  showModal({ component: "ModalConvoquer", size: 1 });
};
const sms = ({ id }) => {
  if (!hasSmsEnvoiePermission.value) {
    awn.alert("Permission manquante, vous n'avez pas les droits suffisant pour l'envoie de SMS");
    return;
  }
  const exercice = exercices.value.find((e) => e.id == id);
  showModal({
    component: "ModalSmsExercice",
    size: 2,
    data: exercice,
  });
};
const email = async ({ id }) => {
  const { ok, data: presences } = await submit(
    () => ExerciceService.getSapeurs(id),
    "Erreur lors de la récupération des convocations.",
  );
  if (!ok) {
    return;
  }
  const link = document.createElement("a");
  link.href =
    "mailto:?bcc=" +
    presences
      .map((p) => sapeurs.value.find((s) => s.id == p.sapeur_id)?.email)
      .filter((s) => s)
      .join(", ");
  link.click();
};

const validerExercice = async (id) => {
  await submit(
    () => exerciceStore.validerExercice(id),
    "Erreur lors de la validation de l'exercice.",
    "Exercice validé.",
  );
};
const annulerExercice = async (id) => {
  await submit(
    () => exerciceStore.annulerExercice(id),
    "Erreur lors de l'annulation de l'exercice.",
    "Exercice annulé.",
  );
};
// Symétrique de "valider" : un exercice validé (pas encore imputé) repasse en saisie
const devaliderExercice = async (id) => {
  if (
    await confirm(
      "Annuler la validation ?",
      `L'exercice repassera au statut « ${exerciceStatut(EXERCICE_STATUT.A_VALIDER).label} » et redeviendra modifiable. Voulez-vous continuer ?`,
    )
  ) {
    await submit(
      () => exerciceStore.devaliderExercice(id),
      "Erreur lors de l'annulation de la validation.",
      "Validation annulée.",
    );
  }
};
const reactiverExercice = async (id) => {
  await submit(
    () => exerciceStore.reactiverExercice(id),
    "Erreur lors de la réactivation de l'exercice.",
    "Exercice réactivé.",
  );
};

const removeExercice = async (id) => {
  if (
    await confirm(
      "Voulez-vous vraiment supprimer cet exercice ?",
      "Attention, la suppression d'un exercice est irréversible ! Toutes les données de cet exercice seront perdues !",
    )
  ) {
    await submit(
      () => exerciceStore.removeExercice(id),
      "Erreur lors de la suppression de l'exercice.",
      "Exercice supprimé.",
    );
  }
};

const importExerciceComptable = () =>
  showModal({
    component: "ModalImportExercice",
    size: 2,
  });

const exerciceFileName = (sujet, id) => {
  const exercice = exercices.value.find((e) => e.id == id);
  return exportFileName([sujet, exercice?.designation, exercice?.date], "pdf");
};
const listePresences = ({ id }) => {
  download(
    () => ExerciceService.downloadListPresence(id, exerciceFileName("liste-presence", id)),
    "Erreur lors de la génération du fichier pdf, contactez l'administrateur système",
  );
};
const listeAppel = ({ id }) => {
  download(
    () => ExerciceService.downloadListAppel(id, exerciceFileName("liste-appel", id)),
    "Erreur lors de la génération du fichier pdf, contactez l'administrateur système",
  );
};
const downloadIcs = (filteredExercices) => {
  if (filteredExercices.length <= 0) {
    awn.alert("Aucun exercice à exporter");
    return;
  }
  exercicesToIcs(filteredExercices, sisName.value, sisKey.value, annee.value);
};
const onRowClass = (dataItem, isSelected) => {
  if (dataItem.statut == EXERCICE_STATUT.ANNULE) {
    return "table-danger";
  }
  if (isSelected) {
    return "";
  }

  const statutsClass = {
    [EXERCICE_STATUT.ANNULE]: "", //'Annulé',
    [EXERCICE_STATUT.A_SAISIR]: "", //'A saisir',
    [EXERCICE_STATUT.A_VALIDER]: "", //'Saisie',
    [EXERCICE_STATUT.VALIDE]: "table-info", //'Validé',
    [EXERCICE_STATUT.IMPUTE]: "table-success", //'Imputée'
  };
  return statutsClass[dataItem.statut];
};

const fields = [
  { title: "Date", key: "date", type: Date },
  { title: "Categorie", key: "categorie" },
  {
    title: "Heure",
    key: "heure",
    formatter: (value) => value?.slice(0, 5),
  },
  { title: "Durée", key: "duree" },
  { title: "Localité", key: "localite" },
  { title: "Lieu", key: "lieu" },
  { title: "Designation", key: "designation" },
  {
    title: "Statut",
    key: "statut",
    slot: "statut",
    formatter: (value) => exerciceStatut(value).label,
    titleClass: "text-center",
    columnClass: "text-center",
  },
  {
    title: "Actions",
    slot: "actions",
    titleClass: "align-middle text-center",
    columnClass: "align-middle text-center",
  },
];
</script>

<template>
  <stateful-filter
    id="exercices"
    v-slot="{ setFilter, filters, filteredData, canReset, reset }"
    :data="computedData"
  >
    <div class="row">
      <div class="col-md-3">
        <div class="card card-primary card-outline mb-2">
          <div class="card-header d-flex justify-content-between">
            <h5>Actions</h5>
          </div>
          <div class="card-body d-grid gap-2">
            <router-link
              v-slot="{ navigate }"
              custom
              :to="{ name: 'exercice-details', params: { id: 'new' } }"
            >
              <button v-if="hasEditPermission" class="btn btn-outline-primary" @click="navigate">
                Ajouter un exercice
              </button>
            </router-link>
            <router-link
              v-slot="{ navigate }"
              custom
              :to="'/exercices/' + selectedId + '/presence'"
            >
              <button :disabled="!selectedId" class="btn btn-outline-primary" @click="navigate">
                {{ hasEditPermission ? "Modifier" : "Aperçu" }}
              </button>
            </router-link>
            <div class="row">
              <div class="col-6">
                <button
                  :disabled="!selectedId"
                  class="btn btn-outline-primary col-12"
                  @click="sms({ id: selectedId })"
                >
                  SMS
                </button>
              </div>
              <div class="col-6">
                <button
                  :disabled="isSubmitting || !selectedId"
                  class="btn btn-outline-primary col-12"
                  @click="email({ id: selectedId })"
                >
                  Email
                </button>
              </div>
            </div>
            <button class="btn btn-outline-primary" @click="downloadIcs(filteredData)">
              Fichier <em>Icalc</em>
            </button>
            <button class="btn btn-outline-primary" @click="importExerciceComptable">
              Importer depuis année précédente
            </button>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card card-primary card-outline mb-2">
          <div class="card-header d-flex justify-content-between">
            <h5>Impressions</h5>
          </div>
          <div class="card-body d-grid gap-2">
            <button
              class="btn btn-outline-primary"
              :disabled="isSubmitting || !exercices.length"
              @click="convoquer"
            >
              Convocations
            </button>
            <button
              :disabled="!selectedId"
              class="btn btn-outline-primary"
              @click="listePresences({ id: selectedId })"
            >
              Liste de présences
            </button>
            <button
              :disabled="!selectedId"
              class="btn btn-outline-primary"
              @click="listeAppel({ id: selectedId })"
            >
              Liste d'appel
            </button>
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="card card-primary card-outline mb-2">
          <div class="card-header d-flex justify-content-between">
            <h5>Filtres</h5>
          </div>
          <div class="card-body">
            <div class="row">
              <base-select
                class="col-md-4"
                :options="filteredLocalites"
                base-option="<Localité>"
                :model-value="filters.localite_id"
                @update:model-value="(value) => setFilter('localite_id', value)"
              />
              <base-select
                class="col-md-4"
                :options="filteredExercicesCategories"
                base-option="<Catégorie>"
                :model-value="filters.exercice_categorie_id"
                @update:model-value="(value) => setFilter('exercice_categorie_id', value)"
              />
              <base-select
                class="col-md-4"
                base-option="<Statut>"
                :options="exerciceStatutOptions"
                :model-value="filters.statut"
                @update:model-value="(value) => setFilter('statut', value)"
              />
              <div v-if="canReset" class="col-md-4 mt-1">
                <button class="btn btn-sm btn-warning w-100" @click="reset">Réinitialiser</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-md-12">
        <div class="card card-primary card-outline mb-3">
          <div class="card-body table-responsive p-0">
            <base-table
              ref="basetable_exercices"
              :loading="loading"
              :selectable="true"
              :fields="fields"
              :detail-row-column="true"
              no-data="Aucun exercice/séance à afficher"
              :data="filteredData"
              show-count
              :row-class="onRowClass"
              @selected="selectExercice"
            >
              <template #detail-row="{ rowData }">
                <exercice-details :row-data="rowData" />
              </template>
              <template #statut="{ value }">
                <status-badge :status="exerciceStatut(value)" />
              </template>
              <template #actions="{ rowData }">
                <button
                  title="SMS"
                  class="btn btn-outline-primary border-0"
                  @click="sms({ id: rowData.id })"
                >
                  <font-awesome-icon :icon="['fas', 'comment-sms']" />
                </button>
                <router-link
                  aria-label="Modifier"
                  v-slot="{ navigate }"
                  :to="'/exercices/' + rowData.id + '/presence'"
                  custom
                >
                  <button
                    title="modifier"
                    class="btn btn-outline-primary border-0"
                    @click="navigate"
                  >
                    <font-awesome-icon :icon="['far', 'edit']" />
                  </button>
                </router-link>
                <button
                  v-if="hasValidationPermission && rowData.statut == EXERCICE_STATUT.A_VALIDER"
                  :disabled="isSubmitting"
                  title="valider"
                  class="btn btn-outline-success border-0"
                  @click="validerExercice(rowData.id)"
                >
                  <font-awesome-icon :icon="['fas', 'check']" />
                </button>
                <button
                  :disabled="isSubmitting"
                  v-if="hasValidationPermission && rowData.statut == EXERCICE_STATUT.VALIDE"
                  title="Annuler la validation"
                  class="btn btn-outline-warning border-0"
                  @click="devaliderExercice(rowData.id)"
                >
                  <font-awesome-icon :icon="['fas', 'rotate-left']" />
                </button>
                <button
                  v-if="
                    hasValidationPermission &&
                    rowData.statut < EXERCICE_STATUT.VALIDE &&
                    rowData.statut > EXERCICE_STATUT.ANNULE
                  "
                  :disabled="isSubmitting"
                  title="annuler"
                  class="btn btn-outline-warning border-0"
                  @click="annulerExercice(rowData.id)"
                >
                  <font-awesome-icon :icon="['fas', 'ban']" />
                </button>
                <button
                  v-if="hasValidationPermission && rowData.statut == EXERCICE_STATUT.ANNULE"
                  :disabled="isSubmitting"
                  title="réactiver"
                  class="btn btn-outline-success border-0"
                  @click="reactiverExercice(rowData.id)"
                >
                  <font-awesome-icon :icon="['fas', 'check']" />
                </button>
                <button
                  :disabled="isSubmitting"
                  v-if="hasValidationPermission && rowData.statut <= EXERCICE_STATUT.VALIDE"
                  title="supprimer"
                  class="btn btn-outline-danger border-0"
                  @click="removeExercice(rowData.id)"
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
