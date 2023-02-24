<template>
  <div class="card card-primary card-outline">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Mission</h3>
      <button type="button" class="btn btn-primary" @click="ajoutMission()">
        Ajouter une mission
      </button>
    </div>
    <div class="card-body table-responsive">
      <base-table
        :data="listeMission"
        :fields="fields"
        no-data="Aucune mission"
      >
        <template #actions="{ rowData }">
          <button
            type="button"
            class="btn btn-outline-primary border-0"
            @click="updateMission(rowData)"
          >
            <font-awesome-icon :icon="['far', 'edit']" />
          </button>
          <button
            type="button"
            class="btn btn-outline-danger border-0"
            @click="deleteMission(rowData)"
          >
            <font-awesome-icon :icon="['far', 'trash-alt']" />
          </button>
        </template>
      </base-table>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import store from '/src/store/index';

async function loadData(_, next) {
  const loadMission = store.dispatch('fetchMissions');

  Promise.all([loadMission]).then(() => {
    next();
  });
}

export default {
  name: 'ParametreMission',
  beforeRouteEnter(routeTo, _, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, _, next) {
    loadData(routeTo, next);
  },
  data() {
    return {
      fields: [
        { title: 'Titre', key: 'titre' },
        { title: 'Actions', slot: 'actions' },
      ],
    };
  },
  computed: {
    ...mapState({
      listeMission: (state) =>
        state.mission.liste.sort((a, b) => a.tri - b.tri),
    }),
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    ajoutMission() {
      this.SHOW_MODAL({ component: 'ModalMission', data: {} });
    },
    updateMission(mission) {
      this.SHOW_MODAL({ component: 'ModalMission', data: { ...mission } });
    },
    deleteMission(mission) {
      this.$store.dispatch('removeMission', mission.id);
    },
  },
};
</script>

<style scoped></style>
