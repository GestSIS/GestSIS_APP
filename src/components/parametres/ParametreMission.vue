<template>
  <div class="card card-primary card-outline">
    <!-- /.card-header -->
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Mission</h3>
      <button type="button" class="btn btn-primary" @click="ajoutMission()">
        Ajouter une mission
      </button>
    </div>
    <div class="card-body table-responsive">
      <table id="missions" class="table table-sm">
        <thead>
          <tr>
            <th>Titre</th>
            <th class="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!listeMission.length">
            <td colspan="2">Aucune mission</td>
          </tr>
          <tr v-for="m in listeMission" :key="m.id">
            <td>{{ m.titre }}</td>
            <td class="align-middle text-center">
              <button
                type="button"
                class="btn btn-outline-primary border-0"
                @click="updateMission(m)"
              >
                <font-awesome-icon :icon="['far', 'edit']" />
              </button>
              <button
                type="button"
                class="btn btn-outline-danger border-0"
                @click="deleteMission(m)"
              >
                <font-awesome-icon :icon="['far', 'trash-alt']" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import store from '@/store/index';

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
