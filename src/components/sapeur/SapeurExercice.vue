<script setup>
import { computed, ref, watchEffect } from 'vue';
import useNotification from '../../composables/useNotification.js';
import { useSapeurStore } from '../../stores/sapeur/Sapeur.js';
import { useExerciceComptableStore } from '../../stores/comptabilite/ExerciceComptable.js';
import { useLocaliteStore } from '../../stores/common/Localite.js';
import { useExcuseTypeStore } from '../../stores/exercice/ExcuseType.js';
import { useExerciceCategorieStore } from '../../stores/exercice/ExerciceCategorie.js';
import { useModalStore } from '../../stores/common/Modal.js';
import permissions from '/src/composables/permissions.js';
import MesHeuresSuppDetailRow from '../mes_infos/MesHeuresSuppDetailRow.vue';
import ExerciceService from '../../services/ExerciceService';
import useHasPermission from '../../composables/usePermission.js';

const sapeurStore = useSapeurStore();
const exerciceComptableStore = useExerciceComptableStore();
const localiteStore = useLocaliteStore();
const excuseTypeStore = useExcuseTypeStore();
const exerciceCategorieStore = useExerciceCategorieStore();
const loading = ref(true);
await exerciceComptableStore.fetchExercicesComptables();

watchEffect(async () => {
  loading.value = true;
  await sapeurStore.fetchSapeurExercices({
    sapeurId: sapeurStore.active.id,
    exerciceComptableId: exerciceComptableStore.activeId,
  });
  loading.value = false;
});

await Promise.all([
  excuseTypeStore.fetchExcuseTypes(),
  exerciceCategorieStore.fetchExerciceCategories(),
]);

const hasPresencePermission = useHasPermission(permissions.EXERCICE.PRESENCE);
const exercices = computed(() =>
  sapeurStore.active.exercices
    .map((e) => ({
      ...e.presence,
      ...e,
      excuse: excuseTypeStore.liste.find(
        (t) => t.id == e.presence?.excuse_type_id,
      )?.designation,
      localite: localiteStore.liste.find((l) => l.id == e.localite_id)
        ?.designation,
      categorie: exerciceCategorieStore.liste.find(
        (c) => c.id == e.exercice_categorie_id,
      )?.designation,
    }))
    .sort((e1, e2) => e1.date?.localeCompare(e2.date)),
);

const { showModal } = useModalStore();

const edit = () =>
  showModal({
    component: 'ModalPresenceExercice',
    size: 2,
  });

const awn = useNotification();
const downloadJustificatif = (exercice) =>
  ExerciceService.downloadExcuseJustificatif(
    exercice.exercice_id,
    exercice.sapeur_id,
    'justificatif_' + sapeur.justificatif_filename,
  ).catch((err) =>
    awn.alert(err?.message ?? 'Erreur lors du chargement du justificatif'),
  );

const fields = [
  { title: 'Date', key: 'date', type: Date },
  { title: 'Heure', key: 'heure', formatter: (h) => h.slice(0, 5) },
  { title: 'Categorie', key: 'categorie' },
  { title: 'Exercice', key: 'designation' },
  { title: 'Durée [min]', key: 'duree' },
  { title: 'Localité', key: 'localite' },
  { title: 'Lieu', key: 'lieu' },
  { title: 'Communications', key: 'communications' },
  { title: 'Convoqué', type: Boolean, key: 'convoque' },
  { title: 'Présent', type: Boolean, key: 'present' },
  { title: 'Absent', type: Boolean, key: 'absent' },
  { title: 'Remplacé', type: Boolean, key: 'remplace' },
  { title: 'Excuse', slot: 'excuse', key: 'excuse_type_id' },
  { title: 'Statut', slot: 'statut', key: 'excuse_statut' },
];
</script>

<template>
  <div class="card card-primary card-outline">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Exercices</h3>
      <button
        v-if="hasPresencePermission"
        class="btn btn-primary"
        @click.prevent="edit"
      >
        Modifier
      </button>
    </div>
    <div class="card-body table-responsive p-0">
      <base-table
        :loading="loading"
        :fields="fields"
        :data="exercices"
        :selectable="true"
        no-data="Aucun exercice"
      >
        <template #detail-row="{ rowData }">
          <mes-heures-supp-detail-row
            :options="detailRowOptions"
            :row-data="rowData"
          />
        </template>
        <template #excuse="{ rowData }">
          <div class="text-center">
            <span
              v-if="rowData.excuse_type_id && rowData.excuse_type_id !== true"
              class="badge rounded-pill"
              :class="{
                'text-bg-danger': rowData.excuse_statut == -2,
                'text-bg-warning': rowData.excuse_statut == -1,
                'text-bg-secondary': rowData.excuse_statut == 0,
                'text-bg-success': rowData.excuse_statut == 1,
              }"
              >{{ rowData?.excuse }}</span
            >
            <button
              v-if="rowData.justificatif_filename"
              class="btn"
              @click="downloadJustificatif(rowData)"
            >
              <font-awesome-icon :icon="['far', 'file-pdf']" />
            </button>
          </div>
        </template>
        <template #statut="{ rowData }">
          <div class="text-center">
            <span
              v-if="!rowData.present && !rowData.remplace"
              class="badge rounded-pill"
              :class="{
                'text-bg-danger': rowData.excuse_statut == -2,
                'text-bg-warning': rowData.excuse_statut == -1,
                'text-bg-secondary': rowData.excuse_statut == 0,
                'text-bg-success': rowData.excuse_statut == 1,
              }"
              >{{
                {
                  '-2': 'Amendée',
                  '-1': 'Refusée',
                  '0': 'A traiter',
                  '1': 'Validée',
                }[rowData.excuse_statut]
              }}</span
            >
            <button
              v-if="rowData.justificatif_filename"
              class="btn"
              @click="downloadJustificatif(rowData)"
            >
              <font-awesome-icon :icon="['far', 'file-pdf']" />
            </button>
          </div>
        </template>
      </base-table>
    </div>
  </div>
</template>
