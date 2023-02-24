<template>
  <div class="row">
    <div class="col-sm-12 col-xl-6">
      <div class="card card-primary card-outline">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Type d'intervention</h3>
          <button type="button" class="btn btn-primary" @click="ajoutType()">
            Ajouter un type
          </button>
        </div>
        <div class="card-body">
          <base-table
            :data="listeType"
            :fields="fieldsType"
            no-data="Aucun type"
          >
            <template #actions="{ rowData }">
              <button
                type="button"
                class="btn btn-outline-primary border-0"
                @click="updateType(rowData)"
              >
                <font-awesome-icon :icon="['far', 'edit']" />
              </button>
              <button
                type="button"
                class="btn btn-outline-danger border-0"
                @click="deleteType(rowData)"
              >
                <font-awesome-icon :icon="['far', 'trash-alt']" />
              </button>
            </template>
          </base-table>
        </div>
      </div>
    </div>
    <div class="col-sm-12 col-xl-6">
      <div class="card card-primary card-outline">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Statistiques</h3>
          <button type="button" class="btn btn-primary" @click="ajoutStat()">
            Ajouter un type de statistique
          </button>
        </div>
        <div class="card-body">
          <base-table
            :data="listeStat"
            :fields="fieldsStat"
            no-data="Aucune statistique"
          >
            <template #actions="{ rowData }">
              <button
                type="button"
                class="btn btn-outline-primary border-0"
                @click="updateStat(rowData)"
              >
                <font-awesome-icon :icon="['far', 'edit']" />
              </button>
              <button
                type="button"
                class="btn btn-outline-danger border-0"
                @click="deleteStat(rowData)"
              >
                <font-awesome-icon :icon="['far', 'trash-alt']" />
              </button>
            </template>
          </base-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import store from '/src/store/index';

async function loadData(_, next) {
  const loadStatIntervention = store.dispatch('fetchStatInterventions');
  const loadTypeIntervention = store.dispatch('fetchTypeInterventions');

  Promise.all([loadStatIntervention, loadTypeIntervention]).then(() => {
    next();
  });
}

export default {
  name: 'ParametreTypeIntervention',
  beforeRouteEnter(routeTo, _, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, _, next) {
    loadData(routeTo, next);
  },
  data() {
    return {
      fieldsType: [
        { title: 'Tri', key: 'tri' },
        { title: "Type d'intervention", key: 'designation' },
        { title: 'Statistique', key: 'statistique' },
        { title: 'Actions', slot: 'actions' },
      ],
      fieldsStat: [
        { title: 'Tri', key: 'tri' },
        { title: 'Désignation', key: 'designation' },
        { title: 'Actions', slot: 'actions' },
      ],
    };
  },
  computed: {
    ...mapState({
      listeType: (state) =>
        state.typeIntervention.liste
          .map((t) => ({
            ...t,
            statistique: state.statIntervention.liste.find(
              (s) => s.id == t.stat_intervention_id
            )?.designation,
          }))
          .sort((a, b) => a.tri - b.tri),
      listeStat: (state) =>
        state.statIntervention.liste.sort((a, b) => a.tri - b.tri),
    }),
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    ajoutType() {
      this.SHOW_MODAL({ component: 'ModalTypeIntervention', data: {} });
    },
    updateType(type) {
      this.SHOW_MODAL({
        component: 'ModalTypeIntervention',
        data: { ...type },
      });
    },
    deleteType(type) {
      this.$store
        .dispatch('removeTypeIntervention', type.id)
        .catch((res) =>
          this.$awn.alert(res.message || 'Erreur lors de la suppression')
        );
    },
    ...mapMutations(['SHOW_MODAL']),
    ajoutStat() {
      this.SHOW_MODAL({ component: 'ModalStatIntervention', data: {} });
    },
    updateStat(stat) {
      this.SHOW_MODAL({
        component: 'ModalStatIntervention',
        data: { ...stat },
      });
    },
    deleteStat(stat) {
      this.$store
        .dispatch('removeStatIntervention', stat.id)
        .catch((res) =>
          this.$awn.alert(res.message || 'Erreur lors de la suppression')
        );
    },
  },
};
</script>

<style scoped></style>
