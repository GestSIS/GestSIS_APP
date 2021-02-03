<template>
  <div>
    <div class="modal-header">
      <h5 class="modal-title" id="exampleModalLabel">Imputer l'exercice</h5>
      <button type="button" class="close" @click="cancel">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="modal-body">
      <div class="d-inline-flex justify-content-between">
        <div>1. Type de frais</div>
        <div>2. Final</div>
      </div>
      <div v-if="phase === 1" class="row">
        <div
          :class="{
            'col-12': !activeIndemniteHasFonction,
            'col-8': activeIndemniteHasFonction,
          }"
        >
          <table class="table table-sm" @keydown.down="onKeyDown" @keydown.up="onKeyUp">
            <thead>
              <tr>
                <th>Designation</th>
                <th>Solde</th>
                <th>Indemnite</th>
                <th>Solde min</th>
                <th>Pour</th>
                <th>Unité</th>
                <th>Compte</th>
                <th>Par fonction</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(indemnite, index) in listeIndemnitesTypes"
                :key="indemnite.id"
                class=""
                @click="selectIndemnite(index)"
                :class="{
                  'table-primary': index === activeIndemniteIndex,
                }"
              >
                <td>{{ indemnite.designation }}</td>
                <td>{{ indemnite.solde }}</td>
                <td>{{ indemnite.indemnite }}</td>
                <td>{{ indemnite.solde_min }}</td>
                <td>{{ indemnite.solde_min_pour }}</td>
                <td>{{ indemnite.unite_id }}</td>
                <td>{{ getCompte(indemnite.compte_id) | compte }}</td>
                <td>
                  <div class="custom-control custom-checkbox">
                    <input
                      type="checkbox"
                      class="custom-control-input"
                      id="customCheck2"
                      :checked="indemnite.par_fonction"
                      disabled=""
                    />
                    <label
                      class="custom-control-label"
                      for="customCheck2"
                    ></label>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="col-4" v-if="activeIndemniteHasFonction">
          <table class="table table-sm">
            <thead>
              <tr>
                <th>Fonction</th>
                <th>Solde</th>
                <th>Indemnité</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="fonction in activeIndemnite.fonctions"
                :key="fonction.id"
              >
                <td>{{ getFonction(fonction.id).nom }}</td>
                <td>{{ fonction.solde }}</td>
                <td>{{ fonction.indemnite }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div v-if="phase === 2">
        <div
          class="alert alert-dismissible alert-success"
          v-if="successMessageVisibility"
        >
          <button
            type="button"
            class="close"
            @click="successMessageVisibility = false"
          >
            &times;
          </button>
          Imputations effectuées avec <strong>succès</strong>!
        </div>
        <table class="table table-sm">
          <thead>
            <tr>
              <th>Fonction</th>
              <th>Solde</th>
              <th>Indemnité</th>
              <th>Solde</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ecriture in ecritures" :key="ecriture.id">
              <td>{{ getSapeur(ecriture.sapeur_id) | sapeur }}</td>
              <td>{{ ecriture.solde }}</td>
              <td>{{ ecriture.indemnite }}</td>
              <td>{{ ecriture.total }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="HIDE_MODAL()">
        {{ phase === 1 ? 'Annuler' : 'Fermer' }}
      </button>
      <button
        type="button"
        class="btn btn-primary"
        @click="imputer()"
        v-if="phase === 1"
        :disabled="activeIndemnite === null"
      >
        Imputer
      </button>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapState, mapGetters } from 'vuex';

export default {
  name: 'ModalImputerExercice',
  props: ['data'],
  data() {
    return {
      phase: 1,
      activeIndemniteIndex: null,
      activeIndemnite: null,
      ecritures: [],
      successMessageVisibility: true,
    };
  },
  computed: {
    ...mapState({
      listeIndemnitesTypes: (state) => state.comptabilite.indemnites.exercices,
      listeFonctions: (state) => state.fonction.liste,
      listComptes: (state) => state.comptabilite.comptes,
    }),
    ...mapGetters(['getFonction', 'getSapeur', 'getCompte']),
    activeIndemniteHasFonction() {
      return this.activeIndemnite !== null && this.activeIndemnite.par_fonction;
    },
  },
  mounted() {
    if (this.listeFonctions.length === 0) {
      this.$store.dispatch('fetchFonctions');
    }
  },
  methods: {
    ...mapMutations(['HIDE_MODAL']),
    selectIndemnite(index) {
      this.activeIndemniteIndex = index;
      this.activeIndemnite = this.listeIndemnitesTypes[index];
    },
    cancel() {
      //TODO Cancel depending on state
      this.HIDE_MODAL();
    },
    imputer() {
      if (this.indemniteType === null) {
        return;
      }

      //TODO
      this.$store
        .dispatch('imputerExercice', {
          exercice_id: this.data.id,
          indemnite_exercice_type_id: this.activeIndemnite.id,
        })
        .then((data) => {
          this.phase = 2;
          this.ecritures = data.ecritures;
        });
    },
    onKeyDown() {
      // console.log('Key down');
      this.selectIndemnite(
        this.activeIndemniteIndex === null
          ? 1
          : ++this.activeIndemniteIndex % this.listeIndemnitesTypes.length
      );
    },
    onKeyUp() {
      // consolelog('Key up');
      this.selectIndemnite(
        this.activeIndemniteIndex === null
          ? 1
          : --this.activeIndemniteIndex % this.listeIndemnitesTypes.length
      );
    },
  },
};
</script>

<style scoped></style>
