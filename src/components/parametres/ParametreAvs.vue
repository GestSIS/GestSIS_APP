<template>
  <div class="row">
    <div class="col-12">
      <div class="card card-primary card-outline">
        <!-- /.card-header -->
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">AVS</h3>
          <button type="button" class="btn btn-primary" @click="save">
            Enregistrer
          </button>
        </div>
        <div class="card-body">
          <div class="mb-3">
            <label for="taux_avs">Taux AVS</label>
            <input
              id="taux_avs"
              v-model="params.taux_avs"
              type="text"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['taux_avs'] }"
            />
          </div>
          <div class="mb-3">
            <label for="taux_ac">Taux AC</label>
            <input
              id="taux_ac"
              v-model="params.taux_ac"
              type="text"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['taux_ac'] }"
            />
          </div>
          <div class="mb-3">
            <label for="franchise_avs">Franchise AVS</label>
            <input
              id="franchise_avs"
              v-model="params.franchise_avs"
              type="text"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['franchise_avs'] }"
            />
          </div>
          <div class="mb-3">
            <label for="franchise_imposition"
              >Franchise imposition fédéral</label
            >
            <input
              id="franchise_imposition"
              v-model="params.franchise_imposition"
              type="text"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['franchise_imposition'] }"
            />
          </div>
          <div class="mb-3">
            <label for="compte_id">Compte</label>
            <select
              id="compte_id"
              v-model="params.compte_id"
              class="form-select form-select-sm"
              :class="{ 'is-invalid': errors['compte_id'] }"
            >
              <option v-for="c in listeCompte" :key="c.id" :value="c.id">
                {{ compte(c) }}
              </option>
            </select>
          </div>
          <div class="mb-3">
            <label for="compte_id">Ecriture catégorie</label>
            <select
              id="ecriture_categorie_id"
              v-model="params.ecriture_categorie_id"
              class="form-select form-select-sm"
              :class="{ 'is-invalid': errors['ecriture_categorie_id'] }"
            >
              <option v-for="c in listeCategorie" :key="c.id" :value="c.id">
                {{ c.designation }}
              </option>
            </select>
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
  const loadIndemnites = store.dispatch('fetchFraisIndemnitesTypes');

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
      params: {
        taux_avs: null,
        taux_ac: null,
        franchise: null,
        compte_id: null,
      },
    };
  },
  computed: {
    ...mapState({
      listeCompte: (state) => state.compte.liste,
      listeCategorie: (state) => state.ecritureCategorie.liste,
      avsParams: (state) => state.avsParam.params,
    }),
  },
  mounted() {
    this.params = this.avsParams ? this.avsParams : this.params;
  },
  methods: {
    compte(compte) {
      return `${compte.numero} ${compte.designation}`;
    },
    ...mapMutations(['SHOW_MODAL']),
    async save() {
      this.$store
        .dispatch('updateAvsParams', this.params)
        .then((res) => {
          this.errors = {};
          this.$awn.success(res?.message || 'Modifications enregistrées');
        })
        .catch((e) => {
          this.errors = { ...e };
          this.$awn.alert(e?.message || "Erreur lors de l'enregistrement");
        });
    },
  },
};
</script>

<style scoped></style>
