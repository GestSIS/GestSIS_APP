<template>
  <div class="card card-primary card-outline mb-3">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Mes exercices</h3>
      <button
        type="button"
        class="btn btn-primary"
        :disabled="!activeItemId"
        @click="excuse(exercices.find((e) => e.id == activeItemId))"
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
        :fields="fields"
        :data="exercices"
        :selectable="true"
        :hide-download="true"
        no-data="Aucun exercice pour le moment"
        :detail-row-component="detailRowComponent"
        @selected="(elem) => (activeItemId = elem?.id)"
      >
        <template #actions="{ rowData }">
          <button
            title="S'excuser"
            type="button"
            class="btn btn-outline-primary border-0"
            @click="excuse(rowData)"
          >
            <font-awesome-icon :icon="['far', 'handshake']" />
          </button>
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

async function loadData(routeTo, next) {
  let loadMesExercices = store.dispatch('fetchMesExercices');
  let loadUnites = store.dispatch('fetchUnites');
  let loadLocalites = store.dispatch('fetchLocalites');
  let loadExerciceCategories = store.dispatch('fetchExerciceCategories');
  let loadExcuseTypes = store.dispatch('fetchExcuseTypes');

  Promise.all([
    loadUnites,
    loadMesExercices,
    loadLocalites,
    loadExerciceCategories,
    loadExcuseTypes,
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
        { title: 'Remplacé', type: Boolean, key: 'remplace' },
        { title: 'Excuse', type: Boolean, key: 'excuse_type_id' },
        { title: 'Amende', type: Boolean, key: 'amende' },
        { title: 'Actions', slot: 'actions' },
      ],
    };
  },
  computed: {
    ...mapState({
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
            excuse: state.excuseType.liste.find((t) => t.id == e.excuse_type_id)
              ?.designation,
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
    excuse(exercice) {
      this.SHOW_MODAL({
        component: 'ModalSExcuser',
        data: exercice,
      });
    },
  },
};
</script>

<style scoped></style>
