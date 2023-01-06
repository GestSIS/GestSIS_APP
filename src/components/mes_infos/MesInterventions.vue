<template>
  <div class="card card-primary card-outline mb-3">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Mes interventions</h3>
    </div>
    <div class="card-body table-responsive">
      <base-table
        ref="table"
        :fields="fields"
        :data="computedInterventions"
        :selectable="true"
        :hide-download="true"
        :detail-row-options="detailRowOptions"
        :detail-row-component="detailRowComponent"
        no-data="Aucune intervention pour le moment"
      />
    </div>
  </div>
</template>

<script>
import { markRaw } from 'vue';
import { mapState } from 'vuex';
import store from '/src/store/index';

import InterventionPresenceDetails from '/src/components/mes_infos/InterventionPresenceDetails.vue';

async function loadData(routeTo, next) {
  let loadMesInterventions = store.dispatch('fetchMesInterventions');
  let loadlocalites = store.dispatch('fetchLocalites');
  let loadTypeInterventions = store.dispatch('fetchTypeInterventions');

  Promise.all([
    loadMesInterventions,
    loadlocalites,
    loadTypeInterventions,
  ]).then(() => {
    next();
  });
}

export default {
  name: 'MesInterventions',
  beforeRouteEnter(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  data() {
    return {
      fields: [
        { title: 'Date', key: 'inter_debut', type: 'datetime' },
        { title: 'Type', key: 'type' },
        { title: 'Localite', key: 'localite' },
        { title: 'Lieu', key: 'lieu' },
        { title: 'Objet', key: 'objet' },
      ],
      detailRowComponent: markRaw(InterventionPresenceDetails),
      detailRowOptions: {
        fields: [
          {
            title: 'Début',
            key: 'debut',
            type: 'datetime',
            columnClass: 'col-2',
          },
          { title: 'Fin', key: 'fin', type: 'datetime', columnClass: 'col-2' },
          { title: 'Durée [heure]', key: 'duree', columnClass: 'col-2' },
          {
            title: 'Piquet',
            key: 'piquet',
            type: Boolean,
            titleClass: 'text-center',
            columnClass: 'text-center col-2',
          },
          {}, // Pour que la table soit compressée, ne pas supprimer
        ],
      },
    };
  },
  computed: {
    ...mapState({
      anneeComptableId: (state) => state.exerciceComptable.activeId,
      interventions: (state) =>
        state.mesInfos.interventions
          .map((i) => ({
            ...i,
            inter_debut: i.date_debut + ' ' + i.heure_debut,
            inter_fin: i.date_fin + ' ' + i.heure_fin,
            duree: Math.abs(new Date(i.debut) - new Date(i.fin)) / 36e5,
            localite: state.localite.liste.find((l) => l.id == i.localite_id)
              ?.designation,
            type: state.typeIntervention.liste.find(
              (c) => c.id == i.type_intervention_id
            )?.designation,
          }))
          .sort((i1, i2) => i1.debut.localeCompare(i2.debut)),
    }),
    computedInterventions() {
      const interventions = {};
      this.interventions.forEach((i) => {
        if (!interventions[i.intervention_id]) {
          interventions[i.intervention_id] = { ...i, presences: [i] };
        } else {
          interventions[i.intervention_id].presences.push(i);
        }
      });
      return Object.values(interventions);
    },
  },
  watch: {
    anneeComptableId() {
      this.$store
        .dispatch('fetchMesInterventions')
        .then(() => this.$refs.table.showAllDetailRow());
    },
  },
  mounted() {
    this.$refs.table.showAllDetailRow();
  },
};
</script>

<style scoped></style>
