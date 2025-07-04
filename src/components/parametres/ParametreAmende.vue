<template>
  <div class="card card-primary card-outline">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Amendes</h3>
      <button type="button" class="btn btn-primary" @click="save()">
        Enregistrer
      </button>
    </div>
    <div class="card-body">
      <div class="row">
        <base-select
          v-model="params.compte_id"
          class="mb-3 col-6"
          :class="{ 'is-invalid': errors['compte_id'] }"
          label="Compte"
          :options="listeCompte.map((c) => ({ ...c, designation: c?.label }))"
        />
        <base-select
          v-model="params.ecriture_categorie_id"
          class="mb-3 col-6"
          :class="{ 'is-invalid': errors['ecriture_categorie_id'] }"
          label="Catégorie comptable"
          :options="listeCategorie"
        />
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
          <tr v-if="!params.amendes.length">
            <td colspan="3">Aucune amende</td>
          </tr>
          <tr v-for="(a, index) in params.amendes" :key="a.id">
            <td>{{ index + 1 }}</td>
            <td>
              <input
                class="form-control form-control-sm"
                type="text"
                :value="params.amendes[index].montant"
                @change="(e) => updateAmende(index, e)"
              />
            </td>
            <td class="align-middle text-center">
              <button
                type="button"
                class="btn btn-outline-danger border-0"
                @click="removeAmende(index)"
              >
                <font-awesome-icon :icon="['far', 'trash-alt']" />
              </button>
            </td>
          </tr>
        </tbody>
        <button class="btn btn-primary" @click="addAmende">+</button>
      </table>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import store from '/src/store/index';

async function loadData(_, next) {
  const loadAmendes = store.dispatch('fetchAmendes');
  const loadFonctions = store.dispatch('fetchFonctions');
  const loadComptes = store.dispatch('fetchComptes');
  const loadUnites = store.dispatch('fetchUnites');

  Promise.all([loadAmendes, loadFonctions, loadComptes, loadUnites]).then(
    () => {
      next();
    },
  );
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
  computed: {
    ...mapState({
      listeAmende: (state) =>
        state.amende.liste.sort((a, b) => a.order - b.order),
      listeCompte: (state) => state.compte.liste,
      listeCategorie: (state) => state.ecritureCategorie.liste,
    }),
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
  methods: {
    removeAmende(index) {
      this.params.amendes.splice(index, 1);
    },
    updateAmende(index, e) {
      this.params.amendes[index].montant = e.target.value;
    },
    addAmende() {
      this.params.amendes = [...this.params.amendes, { montant: 0 }];
    },
    async save() {
      this.$store
        .dispatch('updateAmendes', this.params)
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
