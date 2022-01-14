<template>
  <div class="card card-primary card-outline">
    <!-- /.card-header -->
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Fonctions</h3>
      <button type="button" class="btn btn-primary" @click="ajoutFonction()">
        Ajouter une fonction
      </button>
    </div>
    <div class="card-body">
      <table id="fonctions" class="table table-sm" cellspacing="0" width="100%">
        <thead>
          <tr>
            <th>Tri</th>
            <th>Abréviation</th>
            <th>Nom</th>
            <th class="text-center">Cumulable</th>
            <th class="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!listeFonction.length">
            <td colspan="5">Aucune fonction</td>
          </tr>
          <tr v-for="f in listeFonction" :key="f.id">
            <td>{{ f.tri }}</td>
            <td>{{ f.abreviation }}</td>
            <td>{{ f.nom }}</td>
            <td class="text-center">
              <input
                type="checkbox"
                class="form-check-input"
                id="en_cours"
                :checked="f.cumulable"
                disabled
              />
              <label class="form-check-label" for="en_cours"></label>
            </td>
            <td>
              <div class="d-flex justify-content-center">
                <button
                  type="button"
                  class="btn btn-outline-primary border-0"
                  @click="updateFonction(f)"
                >
                  <font-awesome-icon :icon="['far', 'edit']" />
                </button>
                <button
                  type="button"
                  class="btn btn-outline-danger border-0"
                  @click="deleteFonction(f)"
                >
                  <font-awesome-icon :icon="['far', 'trash-alt']" />
                </button>
              </div>
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
  let loadFonction = store.dispatch('fetchFonctions');

  Promise.all([loadFonction]).then(() => {
    next();
  });
}

export default {
  name: 'ParametreFonction',
  beforeRouteEnter(routeTo, _, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, _, next) {
    loadData(routeTo, next);
  },
  computed: {
    ...mapState({
      listeFonction: (state) =>
        state.fonction.liste.sort((a, b) => b.tri - a.tri),
    }),
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    ajoutFonction() {
      this.SHOW_MODAL({ component: 'ModalFonction', data: {} });
    },
    updateFonction(fonction) {
      this.SHOW_MODAL({ component: 'ModalFonction', data: { ...fonction } });
    },
    deleteFonction(fonction) {
      this.$store
        .dispatch('removeFonction', fonction.id)
        .catch((res) =>
          this.$awn.alert(res.message || 'Erreur lors de la suppression')
        );
    },
  },
};
</script>

<style scoped></style>
