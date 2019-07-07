<template>
  <div>
    <div class="modal-header">
      <h5 class="modal-title" id="exampleModalLabel">Imputer l'intervention</h5>
      <button type="button" class="close" @click="cancel">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="modal-body">
      <div class="alert alert-dismissible alert-primary" v-if="phase === 1">
        <button type="button" class="close" data-dismiss="alert">
          &times;
        </button>
        <h4 class="alert-heading">Aide</h4>
        <p class="mb-0">
          Les frais et indemnités annuels ci-dessous seront imputé
          automatiquement à <strong>tous</strong> les sapeurs selon leur
          <strong>fonction principale</strong>. Pour effectuer l'imputation,
          cliquer sur le bouton <strong>Imputer</strong> en bas de la fenêtre.
        </p>
      </div>
      <div class="d-inline-flex justify-content-between">
        <div>1. Type de frais</div>
        <div>2. Final</div>
      </div>
      <div v-if="phase === 1" class="row">
        <div class="col-12">
          <table class="table" @keydown.down="onKeyDown" @keydown.up="onKeyUp">
            <thead>
              <tr>
                <th>Fonction</th>
                <th>Designation</th>
                <th>Type</th>
                <th>Compte</th>
                <th>Montant</th>
                <th>Quantite</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="charge in listDisplay"
                :key="charge.id + '-' + charge.type"
              >
                <td>{{ charge.fonction }}</td>
                <td>{{ charge.designation }}</td>
                <td>{{ charge.type }}</td>
                <td>{{ charge.compte }}</td>
                <td class="text-right">{{ charge.montant }}</td>
                <td class="text-right">{{ parseInt(charge.quantite) }}</td>
                <td class="text-right">
                  {{ (charge.montant * charge.quantite).toFixed(2) }}
                </td>
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
        <table class="table">
          <thead>
            <tr>
              <th>Sapeur</th>
              <th>Designation</th>
              <th>Tarif</th>
              <th>Quantité</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ecriture in ecritures" :key="ecriture.id">
              <td>{{ getSapeur(ecriture.sapeur_id) | sapeur }}</td>
              <td>{{ ecriture.designation }}</td>
              <td class="text-right">{{ ecriture.tarif }}</td>
              <td class="text-right">{{ ecriture.quantite }}</td>
              <td class="text-right">{{ ecriture.total }}</td>
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
      >
        Imputer
      </button>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapState, mapGetters } from 'vuex'

export default {
  name: 'ModalImputerAnnuel',
  props: ['data'],
  data() {
    return {
      phase: 1,
      ecritures: [],
      successMessageVisibility: true
    }
  },
  computed: {
    ...mapState({
      fraisAnnuel: state => state.comptabilite.frais.annuels,
      indemnitesAnnuel: state => state.comptabilite.indemnites.annuels
    }),
    ...mapGetters(['getFonction', 'getCompte', 'getSapeur']),
    listDisplay() {
      let svm = this
      return [
        ...this.fraisAnnuel.map(f => ({
          ...f,
          type: 'Frais'
        })),
        ...this.indemnitesAnnuel.map(f => ({
          ...f,
          type: 'Indemnite'
        }))
      ]
        .map(c => ({
          ...c,
          ...[svm.getFonction(c.fonction_id)].map(f => ({
            fonction: f.nom,
            tri: f.tri
          }))[0],
          compte: [svm.getCompte(c.compte_id)].map(
            c => `${c.numero} ${c.designation}`
          )[0]
        }))
        .sort((c1, c2) => c2.tri - c1.tri)
    }
  },
  mounted() {
    //TODO
  },
  methods: {
    ...mapMutations(['HIDE_MODAL']),
    cancel() {
      //TODO Cancel depending on state
      this.HIDE_MODAL()
    },
    imputer() {
      this.$store.dispatch('imputerAnnuel').then(data => {
        this.phase = 2
        this.ecritures = [...data.frais, ...data.indemnites].sort(
          (e1, e2) => e2.sapeur_id - e1.sapeur_id
        )
      })
    }
  }
}
</script>

<style scoped></style>
