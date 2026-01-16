<script setup>
import { computed, ref, watchEffect } from 'vue';
import useNotification from '../../composables/useNotification.js';
import { useSapeurStore } from '../../stores/sapeur/Sapeur.js';
import { useExerciceStore } from '../../stores/exercice/Exercice.js';
import { useExerciceCategorieStore } from '../../stores/exercice/ExerciceCategorie.js';
import { useExerciceComptableStore } from '../../stores/comptabilite/ExerciceComptable.js';
import { useLocaliteStore } from '../../stores/common/Localite.js';
import { useModalStore } from '../../stores/common/Modal.js';
import { useAuthStore } from '../../stores/auth/Auth.js';
import { useConvocationParamStore } from '../../stores/exercice/ConvocationParam.js';
import permissions from '../../composables/permissions.js';

import ExerciceDetails from '/src/components/exercice/ExerciceDetails.vue';
import ExerciceService from '/src/services/ExerciceService.js';

import { exercicesToIcs } from '../../tools/exportExercices';
import useHasPermission from '../../composables/usePermission.js';

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
  await exerciceStore.fetchListeExercice(exerciceComptableStore.activeId);
  loading.value = false;
});

const selectedId = ref(null);
const selectExercice = (row) => (selectedId.value = row?.id);

const sisKey = computed(() => authStore.sis.activeKey);
const sisName = computed(
  () => authStore.sis.liste.find((s) => s.id == authStore.sis.activeId)?.nom,
);
const annee = computed(
  () =>
    exerciceComptableStore.liste.find(
      (e) => e.id == exerciceComptableStore.activeId,
    )?.annee,
);
const sapeurs = computed(() => sapeurStore.liste);
const exercices = computed(() =>
  exerciceStore.liste.sort((a, b) => a.date?.localeCompare(b.date)),
);
const categories = computed(() => exerciceCategorieStore.liste);
const localites = computed(() =>
  localiteStore.liste.sort((a, b) =>
    a.designation.localeCompare(b.designation),
  ),
);
const hasEditPermission = useHasPermission(permissions.EXERCICE.MODIFICATION);
const hasSmsEnvoiePermission = useHasPermission(permissions.SMS.ENVOIE);
const hasValidationPermission = useHasPermission(
  permissions.EXERCICE.VALIDATION,
);

const computedData = computed(() => {
  return exercices.value.map((e) => ({
    ...e,
    categorie: categories.value.find((c) => c.id == e.exercice_categorie_id)
      ?.designation,
    localite: localites.value.find((l) => l.id == e.localite_id)?.designation,
  }));
});
const filteredExercicesCategories = computed(() => {
  const ids = new Set(
    exercices.value.map((i) => parseInt(i.exercice_categorie_id)),
  );
  return categories.value.filter((t) => ids.has(t.id));
});
const filteredLocalites = computed(() => {
  const ids = new Set(exercices.value.map((i) => parseInt(i.localite_id)));
  return localites.value.filter((t) => ids.has(t.id));
});

const { closeModal, confirm, showModal } = useModalStore();
const awn = useNotification();
const convoquer = async () => {
  const convocationParamStore = useConvocationParamStore();
  await convocationParamStore.fetchParams();
  showModal({ component: 'ModalConvoquer', size: 1 });
};
const sms = ({ id }) => {
  if (!hasSmsEnvoiePermission.value) {
    awn.alert(
      "Permission manquante, vous n'avez pas les droits suffisant pour l'envoie de SMS",
    );
    return;
  }
  const exercice = exercices.value.find((e) => e.id == id);
  showModal({
    component: 'ModalSmsExercice',
    size: 2,
    data: exercice,
  });
};
const email = ({ id }) =>
  ExerciceService.getSapeurs(id).then((presences) => {
    const link = document.createElement('a');
    link.href =
      'mailto:?bcc=' +
      presences
        .map((p) => sapeurs.value.find((s) => s.id == p.sapeur_id)?.email)
        .filter((s) => s)
        .join(', ');
    link.click();
  });

const validerExercice = (id) => exerciceStore.validerExercice(id);
const annulerExercice = (id) => exerciceStore.annulerExercice(id);
const reactiverExercice = (id) => exerciceStore.reactiverExercice(id);

const removeExercice = (id) =>
  confirm(
    'Voulez-vous vraiment supprimer cet exercice ?',
    "Attention, la suppression d'un exercice est irréversible ! Toutes les données de cet exercice seront perdues !",
  ).then(() => exerciceStore.removeExercice(id));

const importExerciceComptable = () =>
  showModal({
    component: 'ModalImportExercice',
    size: 2,
  });

const listePresences = ({ id }) => {
  showModal({ component: 'ModalChargement' });
  ExerciceService.downloadListPresence(id, 'liste-presence.pdf')
    .catch((err) => {
      awn.alert(
        err?.message ||
          "Erreur lors de la génération du fichier pdf, contactez l'administrateur système",
      );
    })
    .then(closeModal);
};
const listeAppel = ({ id }) => {
  showModal({ component: 'ModalChargement' });
  ExerciceService.downloadListAppel(id, 'liste-appel.pdf')
    .catch((err) => {
      awn.alert(
        err?.message ||
          "Erreur lors de la génération du fichier pdf, contactez l'administrateur système",
      );
    })
    .then(closeModal);
};
const downloadIcs = (filteredExercices) => {
  if (filteredExercices.length <= 0) {
    awn.alert('Aucun exercice à exporter');
  }
  exercicesToIcs(filteredExercices, sisName.value, sisKey.value, annee.value);
};
const onRowClass = (dataItem, isSelected) => {
  if (dataItem.statut == 0) {
    return 'table-danger';
  }
  if (isSelected) {
    return '';
  }

  const statutsClass = {
    0: '', //'Annulé',
    1: '', //'A saisir',
    2: '', //'Saisie',
    3: '', //'Validé',
    4: 'table-success', //'Imputée'
  };
  return statutsClass[dataItem.statut];
};

const fieldsBase = [
  { title: 'Date', key: 'date', type: Date },
  { title: 'Categorie', key: 'categorie' },
  {
    title: 'Heure',
    key: 'heure',
    formatter: (value) => value?.slice(0, 5),
  },
  { title: 'Durée', key: 'duree' },
  { title: 'Localité', key: 'localite' },
  { title: 'Lieu', key: 'lieu' },
  { title: 'Designation', key: 'designation' },
  {
    title: 'Statut',
    key: 'statut',
    formatter: (value) => {
      const statuts = {
        0: 'Annulé',
        1: 'A saisir',
        2: 'En attente de validation',
        3: 'Validé',
        4: 'Imputé',
      };
      return statuts[value];
    },
  },
  {
    title: 'Actions',
    slot: 'actions',
    titleClass: 'align-middle text-center',
    columnClass: 'align-middle text-center',
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
              <button
                v-if="hasEditPermission"
                class="btn btn-outline-primary"
                @click="navigate"
              >
                Ajouter un exercice
              </button>
            </router-link>
            <router-link
              v-slot="{ navigate }"
              custom
              :to="'/exercices/' + selectedId + '/presence'"
            >
              <button
                :disabled="!selectedId"
                class="btn btn-outline-primary"
                @click="navigate"
              >
                {{ hasEditPermission ? 'Modifier' : 'Aperçu' }}
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
                  :disabled="!selectedId"
                  class="btn btn-outline-primary col-12"
                  @click="email({ id: selectedId })"
                >
                  Email
                </button>
              </div>
            </div>
            <button
              class="btn btn-outline-primary"
              @click="downloadIcs(filteredData)"
            >
              Fichier <em>Icalc</em>
            </button>
            <button
              class="btn btn-outline-primary"
              @click="importExerciceComptable"
            >
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
              :disabled="!exercices.length"
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
                @update:model-value="
                  (value) => setFilter('exercice_categorie_id', value)
                "
              />
              <base-select
                class="col-md-4"
                base-option="<Statut>"
                :options="[
                  { id: 0, designation: 'Annulé' },
                  { id: 1, designation: 'A saisir' },
                  { id: 2, designation: 'En attente de validation' },
                  { id: 3, designation: 'Validé' },
                  { id: 4, designation: 'Imputé' },
                ]"
                :model-value="filters.statut"
                @update:model-value="(value) => setFilter('statut', value)"
              />
              <div v-if="canReset" class="col-md-4 mt-1">
                <button class="btn btn-sm btn-warning w-100" @click="reset">
                  Réinitialiser
                </button>
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
              :fields="fieldsBase"
              :detail-row-column="true"
              no-data="Aucun exercice/séance à afficher"
              :data="filteredData"
              :row-class="onRowClass"
              @selected="selectExercice"
            >
              <template #detail-row="{ rowData }">
                <exercice-details :row-data="rowData" />
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
                  v-if="hasValidationPermission && rowData.statut == 2"
                  title="valider"
                  class="btn btn-outline-primary border-0"
                  @click="validerExercice(rowData.id)"
                >
                  <font-awesome-icon :icon="['fas', 'check']" />
                </button>
                <button
                  v-if="
                    hasValidationPermission &&
                    rowData.statut <= 3 &&
                    rowData.statut > 0
                  "
                  title="annuler"
                  class="btn btn-outline-warning border-0"
                  @click="annulerExercice(rowData.id)"
                >
                  <font-awesome-icon :icon="['fas', 'ban']" />
                </button>
                <button
                  v-if="hasValidationPermission && rowData.statut == 0"
                  title="réactiver"
                  class="btn btn-outline-success border-0"
                  @click="reactiverExercice(rowData.id)"
                >
                  <font-awesome-icon :icon="['fas', 'check']" />
                </button>
                <button
                  v-if="hasValidationPermission && rowData.statut <= 3"
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
