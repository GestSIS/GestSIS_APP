<template>
  <!-- general form elements -->
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
    <div class="card-body table-responsive">
      <base-table
        ref="table"
        :fields="fields"
        :data="exercices"
        :selectable="true"
        :hide-download="true"
        no-data="Aucun exercice pour le
      moment"
        :detail-row-component="detailRowComponent"
      />
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import permissions from '@/store/permissions.js';

import { markRaw } from 'vue';
import MesHeuresSuppDetailRow from '../mes_infos/MesHeuresSuppDetailRow.vue';

export default {
  name: 'SapeurExercice',
  data() {
    return {
      detailRowComponent: markRaw(MesHeuresSuppDetailRow),
      fields: [
        {
          title: 'Date',
          key: 'date',
          sortKey: 'date',
          type: 'date',
        },
        {
          title: 'Heure',
          key: 'heure',
          sortKey: 'heure',
          formatter: (h) => h.slice(0, 5),
        },
        {
          title: 'Categorie',
          key: 'categorie',
          sortKey: 'categorie',
        },
        {
          title: 'Exercice',
          key: 'designation',
          sortKey: 'designation',
        },
        {
          title: 'Durée [min]',
          key: 'duree',
          sortKey: 'duree',
        },
        {
          title: 'Localité',
          key: 'localite',
          sortKey: 'localite',
        },
        {
          title: 'Lieu',
          key: 'lieu',
          sortKey: 'lieu',
        },
        {
          title: 'Communications',
          key: 'communications',
          sortKey: 'communications',
        },
        {
          title: 'Convoqué',
          type: Boolean,
          key: 'convoque',
          sortKey: 'convoque',
        },
        {
          title: 'Présent',
          type: Boolean,
          key: 'present',
          sortKey: 'present',
        },
        {
          title: 'Remplacé',
          type: Boolean,
          key: 'remplace',
          sortKey: 'remplace',
        },
        {
          title: 'Excuse',
          type: Boolean,
          key: 'excuse_type_id',
          sortKey: 'excuse_type_id',
        },
        {
          title: 'Amende',
          type: Boolean,
          key: 'amende',
          sortKey: 'amende',
        },
      ],
    };
  },
  computed: {
    ...mapState({
      activeSapeurId: (state) => state.sapeur.active.id,
      activeExerciceComptableId: (state) => state.exerciceComptable.activeId,
      hasPresencePermission: (state) =>
        state.auth.admin ||
        state.auth.sis.permissions.includes(permissions.EXERCICE.PRESENCE),
      exercices: (state) =>
        state.sapeur.active.exercices
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
          .sort((e1, e2) => e1.date.localeCompare(e2.date)),
    }),
  },
  watch: {
    activeSapeurId(id) {
      this.$store.dispatch('fetchSapeurExercices', id);
    },
    activeExerciceComptableId() {
      this.$store.dispatch('fetchSapeurExercices', this.activeSapeurId);
    },
  },
  mounted() {
    //TODO: Load before any display
    this.$store.dispatch('fetchExcuseTypes', this.activeSapeurId);
    this.$store.dispatch('fetchExerciceCategories', this.activeSapeurId);
    this.$store
      .dispatch('fetchSapeurExercices', this.activeSapeurId)
      .then(() => {
        this.exercices
          .filter((e) => e.heures.length)
          .forEach((e) => this.$refs.table.showDetailRow(e.id));
      });
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    edit() {
      this.SHOW_MODAL({
        component: 'ModalPresenceExercice',
        size: 2,
      });
    },
  },
};
</script>

<style scoped></style>
