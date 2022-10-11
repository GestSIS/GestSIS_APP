<template>
  <div>
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">Imputer l'intervention</h5>
      <button type="button" class="btn-close" @click="cancel"></button>
    </div>
    <div class="modal-body">
      <!-- fieldsets -->
      <multi-step
        :steps="['Type de frais', 'Résultat']"
        :active-index="phase - 1"
      />
      <div v-if="phase === 1" class="row">
        <div
          :class="{
            'col-12': !activeIndemniteHasFonction,
            'col-8': activeIndemniteHasFonction,
          }"
        >
          <table
            class="table table-sm"
            @keydown.down="onKeyDown"
            @keydown.up="onKeyUp"
          >
            <thead>
              <tr>
                <th>Designation</th>
                <th>Tarif</th>
                <th>Tarif min</th>
                <th>Pour</th>
                <th class="text-center">Pro-rata</th>
                <th>Taux nuit</th>
                <th>Taux weekend</th>
                <th>Unité</th>
                <th>Compte</th>
                <th class="text-center">Par fonction</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="indemnitesTypes.length == 0">
                <td colspan="10">
                  Aucune indemnité type pour intervention de configuré
                </td>
              </tr>
              <tr
                v-for="(indemnite, index) in indemnitesTypes"
                :key="indemnite.id"
                class
                :class="{
                  'table-primary': index === activeIndemniteIndex,
                }"
                @click="selectIndemnite(index)"
              >
                <td>{{ indemnite.designation }}</td>
                <td>{{ indemnite.tarif }}</td>
                <td>{{ indemnite.tarif_min }}</td>
                <td>{{ indemnite.tarif_min_pour }}</td>
                <td class="text-center">
                  <input
                    v-model="indemnite.tarif_min_pro_rata"
                    type="checkbox"
                    class="form-check-input"
                  />
                </td>
                <td>{{ indemnite.taux_nuit }}</td>
                <td>{{ indemnite.taux_weekend }}</td>
                <td>
                  {{
                    unites.find((u) => u.id == indemnite.type_unite_id)
                      ?.abreviation
                  }}
                </td>
                <td>
                  {{
                    formatCompte(
                      comptes.find((f) => f.id == indemnite.compte_id)
                    )
                  }}
                </td>
                <td class="text-center">
                  <input
                    id="checkbox-fonction"
                    type="checkbox"
                    class="form-check-input"
                    :checked="indemnite.par_fonction"
                    disabled
                  />
                  <label
                    class="form-check-label"
                    for="checkbox-fonction"
                  ></label>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-if="activeIndemniteHasFonction" class="col-4">
          <table class="table table-sm">
            <thead>
              <tr>
                <th>Fonction</th>
                <th>Tarif</th>
                <th>Indemnité</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="fonction in activeIndemnite.fonctions"
                :key="fonction.id"
              >
                <td>{{ fonctions.find((f) => f.id == fonction.id).nom }}</td>
                <td>{{ fonction.tarif }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div v-if="phase === 2">
        <div
          v-if="successMessageVisibility"
          class="alert alert-dismissible alert-success"
        >
          <button
            type="button"
            class="btn-close"
            @click="successMessageVisibility = false"
          ></button>
          Imputations effectuées avec
          <strong>succès</strong>!
        </div>
        <table class="table table-sm">
          <thead>
            <tr>
              <th>Sapeur</th>
              <th>Quantité</th>
              <th>Unité</th>
              <th>Tarif</th>
              <th>Tarif min</th>
              <th>Pour</th>
              <th class="text-center">Pro-rata</th>
              <th>Taux</th>
              <th>Taux description</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ecriture in ecritures" :key="ecriture.id">
              <td>
                {{
                  formatSapeur(sapeurs.find((f) => f.id == ecriture.sapeur_id))
                }}
              </td>
              <td>{{ ecriture.quantite }}</td>
              <td>
                {{
                  unites.find((u) => u.id == ecriture.type_unite_id)
                    ?.abreviation
                }}
              </td>
              <td>{{ ecriture.tarif }}</td>
              <td>{{ ecriture.tarif_min }}</td>
              <td>{{ ecriture.tarif_min_pour }}</td>
              <td class="text-center">
                <input
                  v-model="ecriture.tarif_min_pro_rata"
                  type="checkbox"
                  class="form-check-input"
                />
              </td>
              <td>{{ ecriture.taux }}</td>
              <td>{{ ecriture.taux_description }}</td>
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
        v-if="phase === 1"
        type="button"
        class="btn btn-primary"
        :disabled="activeIndemnite === null"
        @click="imputer()"
      >
        Imputer
      </button>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex';
import MultiStep from '@/components/MultiStep.vue';

export default {
  name: 'ModalImputerIntervention',
  components: { MultiStep },
  props: {
    data: {
      type: Object,
      default: () => {},
    },
  },
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
      sapeurs: (state) => state.sapeur.liste,
      indemnitesTypes: (state) =>
        state.imputation.fraisIndemnites.interventions,
      fonctions: (state) => state.fonction.liste,
      comptes: (state) => state.compte.liste,
      unites: (state) => state.unite.liste,
    }),
    activeIndemniteHasFonction() {
      return this.activeIndemnite !== null && this.activeIndemnite.par_fonction;
    },
  },
  mounted() {
    if (this.fonctions.length === 0) {
      this.$store.dispatch('fetchFonctions');
    }
  },
  methods: {
    ...mapMutations(['HIDE_MODAL']),
    selectIndemnite(index) {
      this.activeIndemniteIndex = index;
      this.activeIndemnite = this.indemnitesTypes[index];
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
        .dispatch('imputerIntervention', {
          intervention_id: this.data.id,
          indemnite_intervention_type_id: this.activeIndemnite.id,
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
          : ++this.activeIndemniteIndex % this.indemnitesTypes.length
      );
    },
    onKeyUp() {
      // console.log('Key up');
      this.selectIndemnite(
        this.activeIndemniteIndex === null
          ? 1
          : --this.activeIndemniteIndex % this.indemnitesTypes.length
      );
    },
    formatSapeur(sapeur) {
      if (!sapeur) return '';
      return sapeur.nom + ' ' + sapeur.prenom;
    },
    formatCompte(compte) {
      if (!compte) return '';
      return compte?.numero + ' - ' + compte?.designation;
    },
  },
};
</script>

<style scoped></style>
