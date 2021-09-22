<template>
  <div class="card card-primary card-outline">
    <!-- /.card-header -->
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Comptes</h3>
      <button type="button" class="btn btn-primary" @click="save()">
        Enregistrer
      </button>
    </div>
    <div class="card-body">
      <div class="row">
        <div class="form-group col-6">
          <label for="compte_id">Compte</label>
          <select
            id="compte_id"
            v-model="params.compte_id"
            class="custom-select"
            :class="{ 'is-invalid': errors['compte_id_id'] }"
          >
            <option v-for="c in listeCompte" :key="c.id" :value="c.id">
              {{ compte(c) }}
            </option>
          </select>
        </div>
        <div class="form-group col-6">
          <label for="ecriture_categorie_id">Catégorie d'écriture</label>
          <select
            id="ecriture_categorie_id"
            v-model="params.ecriture_categorie_id"
            class="custom-select"
            :class="{ 'is-invalid': errors['ecriture_categorie_id_id'] }"
          >
            <option v-for="c in listeCategorie" :key="c.id" :value="c.id">
              {{ c.designation }}
            </option>
          </select>
        </div>
      </div>
      <table id="indemnites-anuelles" class="table table-sm">
        <thead>
          <tr>
            <th>#</th>
            <th>Montant</th>
            <th class="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(a, index) in params.amendes" :key="a.id">
            <td>{{ index + 1 }}</td>
            <td>
              <input
                class="form-control form-control-sm"
                type="text"
                @change="(e) => updateAmende(index, e)"
                :value="params.amendes[index].montant"
              />
            </td>
            <td>
              <div class="d-flex justify-content-center">
                <button
                  type="button"
                  class="btn btn-outline-danger border-0"
                  @click="removeAmende(index)"
                >
                  <font-awesome-icon :icon="['far', 'trash-alt']" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
        <button class="btn btn-primary" @click="addAmende">+</button>
      </table>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import store from '@/store/index';

async function loadData(_, next) {
  const loadAmendes = store.dispatch('fetchAmendes');
  const loadFonctions = store.dispatch('fetchFonctions');
  const loadComptes = store.dispatch('fetchComptes');
  const loadUnites = store.dispatch('fetchUnites');

  Promise.all([
    loadAmendes,
    loadFrais,
    loadIndemnites,
    loadFonctions,
    loadComptes,
    loadUnites,
  ]).then(() => {
    next();
  });
}

export default {
  name: 'ParametreAmende',
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
        compte_id: null,
        ecriture_categorie_id: null,
        amendes: [],
      },
    };
  },
  mounted() {
    if (this.listeAmende.length > 0) {
      this.params.compte_id = this.listeAmende[0]?.compte_id;
      this.params.ecriture_categorie_id =
        this.listeAmende[0]?.ecriture_categorie_id;
      this.params.amendes = this.listeAmende.map((a) => ({
        montant: a.montant,
      }));
    }
  },
  computed: {
    ...mapState({
      listeAmende: (state) =>
        state.amende.liste.sort((a, b) => a.order - b.order),
      listeCompte: (state) => state.compte.liste,
      listeCategorie: (state) => state.ecritureCategorie.liste,
    }),
  },
  methods: {
    removeAmende(index) {
      this.params.amendes.splice(index, 1);
      this.params.amendes = this.params.amendes;
    },
    updateAmende(index, e) {
      this.params.amendes[index].montant = e.target.value;
    },
    addAmende() {
      this.params.amendes = [...this.params.amendes, { montant: 0 }];
    },
    compte(compte) {
      return `${compte.numero} ${compte.designation}`;
    },
    save() {
      this.$store
        .dispatch('updateAmendes', this.params)
        .then(() => (this.errors = {}))
        .catch((e) => (this.errors = { ...e }));
    },
  },
};
</script>

<style scoped></style>
