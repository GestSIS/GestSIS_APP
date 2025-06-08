<script setup>
import { useModalStore } from '../../stores/common/Modal.js';
import { computed, inject, markRaw, watch } from 'vue';
import MesHeuresSuppDetailRow from './MesHeuresSuppDetailRow.vue';
import { exercicesToIcs } from '../../tools/exportExercices';
import ExerciceService from '../../services/ExerciceService';
import { useStore } from 'vuex';
import { useMesInfosStore } from '../../stores/mesinfos/MesInfos.js';
import useConfirmation from '../../hooks/useConfirmation.js';

const store = useStore();
const infosStore = useMesInfosStore();
await store.dispatch('fetchExercicesComptables');

const anneeComptableId = computed(() => store.state.exerciceComptable.activeId);
watch(anneeComptableId, () =>
  infosStore.fetchMesExercices(anneeComptableId.value),
);

Promise.all([
  infosStore.fetchMesExercices(anneeComptableId.value),
  store.dispatch('fetchUnites'),
  store.dispatch('fetchLocalites'),
  store.dispatch('fetchExerciceCategories'),
  store.dispatch('fetchExcuseTypes'),
  store.dispatch('fetchExcuseParams'),
]);

const excuseParams = computed(() => store.state.excuseParam.params);
const annee = computed(
  () =>
    store.state.exerciceComptable.liste.find(
      (e) => e.id == store.state.exerciceComptable.activeId,
    )?.annee,
);
const sisKey = computed(() => store.state.auth.sis.activeKey);
const sisName = computed(
  () =>
    store.state.auth.sis.liste.find(
      (s) => s.id == store.state.auth.sis.activeId,
    )?.nom,
);
const exercices = computed(() =>
  infosStore.exercices
    .map((e) => ({
      ...e.presence,
      ...e,
      excuse: store.state.excuseType.liste.find(
        (t) => t.id == e.presence.excuse_type_id,
      )?.designation,
      localite: store.state.localite.liste.find((l) => l.id == e.localite_id)
        ?.designation,
      categorie: store.state.exerciceCategorie.liste.find(
        (c) => c.id == e.exercice_categorie_id,
      )?.designation,
    }))
    .sort((e1, e2) => e1.date?.localeCompare(e2.date)),
);

const { showModal } = useModalStore();
const { confirm } = useConfirmation();
const awn = inject('awn');

const download = () => {
  if (exercices.value.length <= 0) {
    awn.value.alert('Aucun exercice à exporter');
  }
  exercicesToIcs(exercices.value, sisName.value, sisKey.value, annee.value);
};
const addExcuse = (exercice) => {
  showModal({
    component: 'ModalSExcuser',
    data: {
      exercices: exercices.value,
      exerciceId: exercice?.id,
    },
  });
};
const removeExcuse = (exercice) =>
  confirm(
    'Voulez-vous vraiment supprimer votre excuse ?',
    "Attention, la suppression d'une excuse est irréversible ! Toutes les données relatives à celle-ci seront supprimées définitivement.",
  ).then(() =>
    infosStore
      .removeMonExcuse(exercice)
      .then(() => awn.success('Excuse supprimée avec succès'))
      .catch((err) =>
        awn.alert(err?.message ?? "Impossible de supprimer l'excuse"),
      ),
  );

// FIXME: detailExcuse fonction non existante
const downloadJustificatif = (exercice) => {
  ExerciceService.downloadMonExcuseJustificatif(
    exercice.exercice_id,
    'justificatif.pdf',
  ).catch((err) =>
    awn.alert(err?.message ?? 'Erreur lors du chargement du justificatif'),
  );
};
const onRowClass = (dataItem) => (dataItem.statut == 0 ? 'table-danger' : '');

const detailRowComponent = markRaw(MesHeuresSuppDetailRow);
const fields = [
  { title: 'Date', key: 'date', type: Date },
  { title: 'Heure', key: 'heure', formatter: (h) => h?.slice(0, 5) },
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
  { title: 'Amende', type: Boolean, key: 'amende' },
];
</script>

<template>
  <div class="card card-primary card-outline mb-3">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Mes exercices</h3>
      <button
        v-if="excuseParams?.actif"
        type="button"
        class="btn btn-primary"
        @click="addExcuse"
      >
        S'excuser
      </button>
      <button type="button" class="btn btn-primary" @click="download">
        Télécharger fichier <em>iCalendrier</em>
      </button>
    </div>
    <div class="card-body table-responsive p-0">
      <base-table
        ref="table"
        class="table-striped"
        :fields="fields"
        :data="exercices"
        :selectable="true"
        :hide-download="true"
        no-data="Aucun exercice pour le moment"
        :detail-row-component="detailRowComponent"
        :row-class="onRowClass"
      >
        <template #excuse="{ rowData }">
          <div class="text-center">
            <span
              v-if="rowData.excuse_type_id && rowData.excuse_type_id !== true"
              class="badge rounded-pill text-bg-primary"
              :class="{
                'text-bg-danger': rowData.excuse_statut == -1,
                'text-bg-secondary': rowData.excuse_statut == 0,
                'text-bg-success': rowData.excuse_statut == 1,
              }"
              @click="detailExcuse(rowData)"
              >{{ rowData?.excuse }}</span
            >
            <button
              v-if="rowData.justificatif_filename"
              class="btn"
              @click="downloadJustificatif(rowData)"
            >
              <font-awesome-icon :icon="['far', 'file-pdf']" />
            </button>
            <button
              v-if="
                excuseParams.actif &&
                !rowData.excuse_type_id &&
                rowData.statut != 0
              "
              class="btn btn-outline-primary border-0"
              @click="addExcuse(rowData)"
            >
              <font-awesome-icon :icon="['fas', 'plus']" />
            </button>
            <button
              v-else-if="excuseParams.actif && rowData.statut != 0"
              class="btn btn-outline-danger border-0"
              @click="removeExcuse(rowData)"
            >
              <font-awesome-icon :icon="['far', 'trash-alt']" />
            </button>
          </div>
        </template>
      </base-table>
    </div>
  </div>
</template>

<style scoped></style>
