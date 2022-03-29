<template>
  <div>
    <div class="modal-header">
      <h5 class="modal-title" id="exampleModalLabel">Imputer l'exercice</h5>
      <button type="button" class="btn-close" @click="cancel"></button>
    </div>
    <div class="modal-body">
      <multi-step :steps="['Type de frais', 'Résultat']" :activeIndex="phase - 1" />
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
                <th>Désignation</th>
                <th>Unité</th>
                <th>Solde</th>
                <!-- <th>Solde min</th>
                <th>Pour</th>-->
                <th>Compte</th>
                <th>Indemnité</th>
                <!-- <th>Indemnité min</th>
                <th>Pour</th>-->
                <th>Compte</th>
                <th>Par fonction</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!computedIndemnites.length">
                <td colspan="10">Aucune indemnité</td>
              </tr>
              <tr
                v-for="(i, index) in computedIndemnites"
                :key="index"
                @click="selectIndemnite(index)"
                :class="{
                  'table-primary': index === activeIndemniteIndex,
                }"
              >
                <td>{{ i.designation }}</td>
                <td>{{ formatUnite(i.type_unite_id) }}</td>
                <!-- <td v-if="!i.solde_undefined && i.min_solde == NaN">NaN</td> -->
                <td v-if="!i.solde_undefined">{{ i.total_solde }}</td>
                <td v-else>-</td>
                <!-- <td v-if="!i.solde_undefined && i.min_solde != NaN">{{ i.min_solde }}</td>
                <td v-else>-</td>
                <td v-if="!i.solde_undefined && i.min_solde != NaN">{{ i.min_solde_pour }}</td>
                <td v-else>-</td>-->
                <td v-if="!i.solde_undefined">
                  {{
                  i.compte_solde_id ? formatCompte(i.compte_solde_id) : 'Plus d\'un compte'
                  }}
                </td>
                <td v-else>-</td>
                <!-- <td v-if="!i.indemnite_undefined && i.min_indemnite == NaN">NaN</td> -->
                <td v-if="!i.indemnite_undefined">{{ i.total_indemnite }}</td>
                <td v-else>-</td>
                <!--<td v-if="!i.indemnite_undefined && i.min_indemnite != NaN">{{ i.min_indemnite }}</td>
                <td v-else>-</td>
                <td
                  v-if="!i.indemnite_undefined && i.min_indemnite != NaN"
                >{{ i.min_indemnite_pour }}</td>
                <td v-else>-</td>-->
                <td v-if="!i.indemnite_undefined">
                  {{
                  i.compte_indemnite_id ? formatCompte(i.compte_indemnite_id) : 'Plus d\'un compte'
                  }}
                </td>
                <td v-else>-</td>
                <td class="text-center">
                  <input
                    type="checkbox"
                    class="form-check-input"
                    id="par_fonction"
                    :checked="i.par_fonction"
                    disabled
                  />
                  <label class="form-check-label" for="par_fonction"></label>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="col-4" v-if="activeIndemniteHasFonction">
          <table class="table table-sm">
            <thead>
              <tr>
                <th>Type</th>
                <th v-for="(column, i) in columns" :key="i">{{ formatType(column.type) }}</th>
              </tr>
              <tr>
                <th>Compte</th>
                <th v-for="(column, i) in columns" :key="i">{{ formatCompte(column.compte_id) }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!filteredFonctions.length">
                <td colspan="3">Aucune fonction paramétrée</td>
              </tr>
              <tr v-for="f in filteredFonctions" :key="f.id">
                <td>{{ f.nom }}</td>
                <td
                  v-for="(column, i) in columns"
                  :key="i"
                >{{ column.fonctions[parseInt(f.id)] || 0.0 }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div v-if="phase === 2">
        <div class="alert alert-dismissible alert-success" v-if="successMessageVisibility">
          <button type="button" class="btn-close" @click="successMessageVisibility = false"></button>
          Imputations effectuées avec
          <strong>succès</strong>!
        </div>
        <table class="table table-sm">
          <thead>
            <tr>
              <th>Designation</th>
              <th>Sapeur</th>
              <th>Quantité</th>
              <th>Tarif</th>
              <th>Tarif min</th>
              <th>Pour</th>
              <th>Total</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ecriture in ecritures" :key="ecriture.id">
              <td>{{ ecriture.designation }}</td>
              <td>
                {{
                formatSapeur(sapeurs.find((f) => f.id == ecriture.sapeur_id))
                }}
              </td>
              <td>{{ ecriture.quantite }}</td>
              <td>{{ ecriture.tarif }}</td>
              <td>{{ ecriture.tarif_min }}</td>
              <td>{{ ecriture.tarif_min_pour }}</td>
              <td>{{ ecriture.total }}</td>
              <td>{{ formatType(ecriture.type) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="modal-footer">
      <button
        type="button"
        class="btn btn-secondary"
        @click="cancel"
      >{{ phase === 1 ? 'Annuler' : 'Fermer' }}</button>
      <button
        type="button"
        class="btn btn-primary"
        @click="imputer()"
        v-if="phase === 1"
        :disabled="activeIndemnite === null"
      >Imputer</button>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex';
import MultiStep from '@/components/MultiStep.vue';

export default {
  name: 'ModalImputerExercice',
  components: { MultiStep },
  props: {
    data: {
      type: Object,
    },
    callback: {
      type: Function,
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
      indemnitesTypes: (state) => state.imputation.fraisIndemnites.exercices,
      fonctions: (state) => state.fonction.liste,
      sapeurs: (state) => state.sapeur.liste,
      comptes: (state) => state.compte.liste,
      unites: (state) => state.unite.liste,
    }),
    activeIndemniteHasFonction() {
      return this.activeIndemnite !== null && this.activeIndemnite.par_fonction;
    },
    columns() {
      const configurations = new Set(this.activeIndemnite?.fonctions?.filter(f => f.fonction_id)?.map(f => f.type + ' ' + f.compte_id) || []);
      const columns = Object.fromEntries([...configurations]
        .map(e => [e, e.split(' ')])
        .map(([index, e]) => ([index, {
          type: parseInt(e[0]),
          compte_id: parseInt(e[1]),
          fonctions: {},
        }])));

      this.activeIndemnite?.fonctions?.filter(f => f.fonction_id)?.forEach(f => {
        columns[f.type + ' ' + f.compte_id].fonctions[f.fonction_id] = f.tarif;
      })
      return columns;
    },
    filteredFonctions() {
      const fonctionsIds = new Set([...Object.values(this.columns)
        .map(e => new Set(Object.keys(e.fonctions)))
        .reduce((acc, b) => new Set([...acc, ...b]))
      ]
        .map(a => parseInt(a)));
      return this.fonctions.filter(f => fonctionsIds.has(parseInt(f.id)));
    },
    computedIndemnites() {
      return this.indemnitesTypes.map(e => {
        const indemniteBase = e.fonctions.filter(f => !f.fonction_id);
        const soldes = indemniteBase.filter(e => e.type == 1)
        const indemnites = indemniteBase.filter(e => e.type == 2)

        const sumReducer = (acc, a) => acc + parseFloat(a);

        return {
          ...e,
          total_solde: soldes.map(e => e.tarif).reduce(sumReducer, 0.0),
          solde_undefined: soldes.length == 0,
          // min_solde: soldes.length == 0 ? 0 : soldes.length == 1 ? (soldes[0].tarif_min || 0) : NaN,
          // min_solde_pour: soldes.length == 0 ? 0 : soldes.length == 1 ? (soldes[0].tarif_min_pour || 0) : NaN,
          compte_solde_id: soldes.length == 0 ? null : soldes.length == 1 ? soldes[0].compte_id : NaN,
          total_indemnite: indemnites.map(e => e.tarif).reduce(sumReducer, 0.0),
          indemnite_undefined: indemnites.length == 0,
          // min_indemnite: indemnites.length == 0 ? 0 : indemnites.length == 1 ? (indemnites[0].tarif_min || 0) : NaN,
          // min_indemnite_pour: indemnites.length == 0 ? 0 : indemnites.length == 1 ? (indemnites[0].tarif_min_pour || 0) : NaN,
          compte_indemnite_id: indemnites.length == 0 ? null : indemnites.length == 1 ? indemnites[0].compte_id : NaN,
        }
      })
    }
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
      this.activeIndemnite = this.computedIndemnites[index];
    },
    cancel() {
      //TODO Cancel depending on state
      this.callback();
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
          : ++this.activeIndemniteIndex % this.indemnitesTypes.length
      );
    },
    onKeyUp() {
      // consolelog('Key up');
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
    formatFonction(fonctionId) {
      return this.fonctions.find(f => f.id = fonctionId)?.designation || '';
    },
    formatUnite(uniteId) {
      return this.unites.find(f => f.id = uniteId)?.designation || '';
    },
    formatCompte(compteId) {
      const compte = this.comptes.find((f) => parseInt(f.id) == parseInt(compteId))
      return compte ? compte?.numero + ' - ' + compte?.designation : '';
    },
    formatType(type) {
      const mapping = {
        0: 'Autre',
        1: 'Solde',
        2: 'Indemnité',
        3: 'Frais forfaitaire',
        4: 'Frais effectif',
        5: 'Charges AVS/AC',
      }
      return mapping[type] || '';
    },
  },
};
</script>

<style scoped></style>
