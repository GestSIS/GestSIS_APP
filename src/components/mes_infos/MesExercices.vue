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
    <div class="card-body table-responsive">
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
        @selected="(elem) => (activeItemId = elem?.id)"
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

<script>
import { mapState, mapMutations } from 'vuex';
import store from '/src/store/index';
import { markRaw } from 'vue';
import MesHeuresSuppDetailRow from './MesHeuresSuppDetailRow.vue';
import { exercicesToIcs } from '../../tools/exportExercices';
import ExerciceService from '../../services/ExerciceService';

async function loadData(routeTo, next) {
  const loadMesExercices = store.dispatch('fetchMesExercices');
  const loadUnites = store.dispatch('fetchUnites');
  const loadLocalites = store.dispatch('fetchLocalites');
  const loadExerciceCategories = store.dispatch('fetchExerciceCategories');
  const loadExcuseTypes = store.dispatch('fetchExcuseTypes');
  const loadExcuseParams = store.dispatch('fetchExcuseParams');

  Promise.all([
    loadUnites,
    loadMesExercices,
    loadLocalites,
    loadExerciceCategories,
    loadExcuseTypes,
    loadExcuseParams,
  ]).then(() => {
    next();
  });
}

export default {
  name: 'MesExercices',
  beforeRouteEnter(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  data() {
    return {
      activeItemId: null,
      detailRowComponent: markRaw(MesHeuresSuppDetailRow),
      fields: [
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
      ],
    };
  },
  computed: {
    ...mapState({
      excuseParams: (state) => state.excuseParam.params,
      anneeComptableId: (state) => state.exerciceComptable.activeId,
      annee: (state) =>
        state.exerciceComptable.liste.find(
          (e) => e.id == state.exerciceComptable.activeId
        )?.annee,
      sisKey: (state) => state.auth.sis.activeKey,
      sisName: (state) =>
        state.auth.sis.liste.find((s) => s.id == state.auth.sis.activeId)?.nom,
      exercices: (state) =>
        state.mesInfos.exercices
          .map((e) => ({
            ...e.presence,
            ...e,
            excuse: state.excuseType.liste.find(
              (t) => t.id == e.presence.excuse_type_id
            )?.designation,
            localite: state.localite.liste.find((l) => l.id == e.localite_id)
              ?.designation,
            categorie: state.exerciceCategorie.liste.find(
              (c) => c.id == e.exercice_categorie_id
            )?.designation,
          }))
          .sort((e1, e2) => e1.date?.localeCompare(e2.date)),
    }),
  },
  watch: {
    anneeComptableId() {
      this.$store.dispatch('fetchMesExercices').then(() => {
        this.exercices.forEach((e) => {
          if (e.heures.length) {
            this.$refs.table.showDetailRow(e.id);
          } else {
            this.$refs.table.hideDetailRow(e.id);
          }
        });
      });
    },
  },
  mounted() {
    this.exercices
      ?.filter((e) => e.heures.length)
      ?.forEach((e) => this.$refs.table.showDetailRow(e.id));
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    download() {
      if (this.exercices.length <= 0) {
        this.$awn.alert('Aucun exercice à exporter');
      }
      exercicesToIcs(this.exercices, this.sisName, this.sisKey, this.annee);
    },
    addExcuse(exercice) {
      this.SHOW_MODAL({
        component: 'ModalSExcuser',
        data: {
          exercices: this.exercices,
          exerciceId: exercice?.id,
        },
      });
    },
    removeExcuse(exercice) {
      this.SHOW_MODAL({
        component: 'ModalConfirmation',
        data: {
          title: 'Voulez-vous vraiment supprimer votre excuse ?',
          question:
            "Attention, la suppression d'une excuse est irréversible ! Toutes les données relatives à celle-ci seront supprimées définitivement.",
        },
        callback: (confirmed) => {
          if (confirmed) {
            this.$store
              .dispatch('removeMonExcuse', exercice)
              .then(() => this.$awn.success('Excuse supprimée avec succès'))
              .catch((err) =>
                this.$awn.alert(
                  err?.message ?? "Impossible de supprimer l'excuse"
                )
              );
          }
        },
      });
    },
    // FIXME: detailExcuse fonction non existante
    downloadJustificatif(exercice) {
      ExerciceService.downloadMonExcuseJustificatif(
        exercice.exercice_id,
        'justificatif.pdf'
      ).catch((err) =>
        this.$awn.alert(
          err?.message ?? 'Erreur lors du chargement du justificatif'
        )
      );
    },
    onRowClass(dataItem) {
      return dataItem.statut == 0 ? 'table-danger' : '';
    },
  },
};
</script>

<style scoped></style>
