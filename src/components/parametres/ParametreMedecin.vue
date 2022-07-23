<template>
  <div class="card card-primary card-outline">
    <!-- /.card-header -->
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Médecins</h3>
      <button type="button" class="btn btn-primary" @click="ajoutMedecin">
        Ajouter un médecin
      </button>
    </div>
    <div class="card-body table-responsive">
      <table id="excuses-types" class="table table-sm">
        <thead>
          <tr>
            <th>Désignation</th>
            <th>Adresse</th>
            <th>Localité</th>
            <th class="text-center">Actif</th>
            <th class="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!listeMedecin.length">
            <td colspan="5">Aucun médecin</td>
          </tr>
          <tr v-for="m in listeMedecin" :key="m.id">
            <td>{{ m.designation }}</td>
            <td>{{ m.adresse }}</td>
            <td>{{ localite(m.localite_id) }}</td>
            <td class="text-center">
              <input
                :id="`actif-${m.id}`"
                type="checkbox"
                class="form-check-input"
                :checked="m.actif"
                disabled
              />
              <label class="form-check-label" :for="`actif-${m.id}`"></label>
            </td>
            <td class="align-middle text-center">
              <button
                type="button"
                class="btn btn-outline-primary border-0"
                @click="updateMedecin(m)"
              >
                <font-awesome-icon :icon="['far', 'edit']" />
              </button>
              <button
                type="button"
                class="btn btn-outline-danger border-0"
                @click="deleteMedecin(m)"
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
  const loadMedecin = store.dispatch('fetchMedecins');

  Promise.all([loadMedecin]).then(() => {
    next();
  });
}

export default {
  name: 'ParametreMedecin',
  beforeRouteEnter(routeTo, _, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, _, next) {
    loadData(routeTo, next);
  },
  computed: {
    ...mapState({
      listeMedecin: (state) =>
        state.medecin.liste.sort((a, b) =>
          a.designation.localeCompare(b.designation)
        ),
      listeLocalite: (state) =>
        state.localite.liste.sort((a, b) =>
          a.designation.localeCompare(b.designation)
        ),
    }),
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    ajoutMedecin() {
      this.SHOW_MODAL({ component: 'ModalMedecin', data: {} });
    },
    updateMedecin(medecin) {
      this.SHOW_MODAL({ component: 'ModalMedecin', data: { ...medecin } });
    },
    deleteMedecin(medecin) {
      this.$store
        .dispatch('removeMedecin', medecin.id)
        .catch((res) =>
          this.$awn.alert(res.message || 'Erreur lors de la suppression')
        );
    },
    localite(id) {
      return id ? this.listeLocalite.find((l) => l.id === id)?.designation : '';
    },
  },
};
</script>

<style scoped></style>
