<template>
  <div class="row">
    <div class="col-6">
      <div class="card card-primary card-outline">
        <!-- /.card-header -->
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">AVS</h3>
          <button type="button" class="btn btn-primary" @click="saveAVS">
            Enregistrer
          </button>
        </div>
        <div class="card-body">
          <div class="form-group">
            <label for="taux_avs">Taux AVS</label>
            <input
              type="text"
              v-model="activeIndemnite.taux_avs"
              class="form-control"
              :class="{ 'is-invalid': errors['taux_avs'] }"
              id="taux_avs"
            />
          </div>
          <div class="form-group">
            <label for="taux_ac">Taux AC</label>
            <input
              type="text"
              v-model="activeIndemnite.taux_ac"
              class="form-control"
              :class="{ 'is-invalid': errors['taux_ac'] }"
              id="taux_ac"
            />
          </div>
          <div class="form-group">
            <label for="taux_ac">Franchise AVS</label>
            <input
              type="text"
              v-model="activeIndemnite.taux_ac"
              class="form-control"
              :class="{ 'is-invalid': errors['taux_ac'] }"
              id="taux_ac"
            />
          </div>
        </div>
      </div>
    </div>
    <div class="col-6">
      <div class="card card-primary card-outline">
        <!-- /.card-header -->
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Facturation</h3>
          <button
            type="button"
            class="btn btn-primary"
            @click="saveFacturation"
          >
            Enregistrer
          </button>
        </div>
        <div class="card-body">
          <div class="form-group">
            <label for="iban">IBAN du SIS</label>
            <input
              type="text"
              v-model="activeIndemnite.iban"
              class="form-control"
              :class="{ 'is-invalid': errors['iban'] }"
              id="iban"
            />
          </div>
          <div class="form-group">
            <label for="bic">BIC</label>
            <input
              type="text"
              v-model="activeIndemnite.bic"
              class="form-control"
              :class="{ 'is-invalid': errors['bic'] }"
              id="bic"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import store from '@/store/index';

async function loadData(_, next) {
  const loadIndemnites = store.dispatch('fetchIndemnitesTypes');

  Promise.all([loadIndemnites]).then(() => {
    next();
  });
}

export default {
  name: 'ParametreAvs',
  beforeRouteEnter(routeTo, _, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, _, next) {
    loadData(routeTo, next);
  },
  data() {
    return {
      errors: {},
      activeIndemnite: {},
    };
  },
  computed: {
    ...mapState({
      listeCompte: (state) => state.compte.liste,
    }),
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    saveFacturation() {},
    saveAVS() {},
  },
};
</script>

<style scoped></style>
