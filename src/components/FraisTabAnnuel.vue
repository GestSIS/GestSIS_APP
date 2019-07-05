<template>
  <div class="row">
    <div class="col-sm-12 col-xl-12">
      <div class="card card-primary card-outline mb-3">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Indemnités et Frais annuels</h3>
          <button @click.prevent="save" class="btn btn-primary">
            Générer
          </button>
        </div>
        <div class="card-body d-flex justify-content-center" v-if="loading">
          <div class="spinner-border" role="status">
            <span class="sr-only">Loading...</span>
          </div>
        </div>
        <vuetable
          v-show="!loading"
          ref="vuetable_frais_annuels"
          :api-mode="false"
          :fields="fields"
          :css="css.table"
          :data-manager="dataManager"
          :row-class="onRowClass"
        >
          <div slot="actions" slot-scope="props">
            <button
              class="btn btn-outline-primary border-0"
              v-if="props.rowData.statut === 3"
              @click="imputerExercice(props.rowData.id)"
            >
              <font-awesome-icon :icon="['fas', 'file-invoice-dollar']" />
            </button>
          </div>
        </vuetable>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations } from 'vuex'

import Vuetable from 'vuetable-2'
import CssForBootstrap4 from '@/assets/vuetableCssConfig.js'
import _ from 'lodash'

export default {
  name: 'FraisTabAnnuel',
  components: {
    Vuetable
  },
  watch: {
    currentExerciceComptableId() {
      this.loading = true
      this.$store.dispatch('fetchListExercice').then(() => {
        this.loading = false
        this.$refs.vuetable_frais_annuels.setData(this.computedData)
      })
    }
  },
  mounted() {
    this.$store.dispatch('fetchListSapeur')
    if (this.listExerciceComptable.length === 0) {
      //console.log('Warning')
    }
    if (this.currentExerciceComptableId || 0 !== 0) {
      this.$store.dispatch('fetchEcrituresAnnuels').then(() => {
        this.loading = false
        this.$refs.vuetable_frais_annuels.setData(this.computedData)
      })
    }
  },
  data() {
    return {
      css: CssForBootstrap4,
      toggles: {},
      fields: [
        {
          title: 'Nom Prénom',
          name: 'nomPrenom',
          sortField: 'nomPrenom',
          dataClass: 'align-middle'
        },
        {
          title: 'Total',
          name: 'total',
          sortField: 'montant',
          dataClass: 'align-middle'
        },
        {
          title: 'Actions',
          name: 'actions',
          dataClass: 'align-middle'
        }
      ],
      loading: true
    }
  },
  props: {
    propName: {
      type: Number,
      default: 0
    },
    id: {
      type: String
    }
  },
  computed: {
    ...mapState({
      listeEcritures: state => state.comptabilite.ecritures.annuels
    }),
    ...mapGetters([
      'activeExerciceId',
      'getExerciceCategorie',
      'getLocalite',
      'getSapeur',
      'listExerciceComptable',
      'currentExerciceComptableId'
    ]),
    computedData() {
      let sapeurs = []
      this.listeEcritures.forEach(e => {
        if (sapeurs.filter(s => s.id === e.sapeur_id).length === 0) {
          let sapeur = this.getSapeur(e.sapeur_id)
          sapeurs = [
            ...sapeurs,
            {
              ...sapeur,
              nomPrenom: sapeur.nom + ' ' + sapeur.prenom,
              ecritures: [e],
              total: parseFloat(e.total)
            }
          ]
        } else {
          sapeurs = [
            ...sapeurs.filter(s => s.id !== e.sapeur_id),
            {
              ...sapeurs.filter(s => s.id === e.sapeur_id)[0],
              ecritures: [
                ...sapeurs.filter(s => s.id === e.sapeur_id)[0].ecritures,
                e
              ],
              total:
                (sapeurs.filter(s => s.id === e.sapeur_id)[0].total | 0) +
                parseFloat(e.total)
            }
          ]
        }
      })
      return sapeurs
    }
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    toggleDetails(id) {
      this.toggles = {
        ...this.toggles,
        [id]: !this.toggles[id]
      }
      this.$refs.vuetable_frais_annuels.toggleDetailRow(id)
    },
    dataManager(sortOrder) {
      if (this.computedData.length < 1) return

      let local = this.computedData

      // sortOrder can be empty, so we have to check for that as well
      if (sortOrder.length > 0) {
        console.log('orderBy:', sortOrder[0].sortField, sortOrder[0].direction)
        local = _.orderBy(local, sortOrder[0].sortField, sortOrder[0].direction)
      }

      return {
        data: local
      }
    },
    onRowClass(dataItem) {
      const statutsClass = {
        0: 'text-danger', //'inactif',
        1: '' //'Actif',
      }
      return statutsClass[dataItem.actif]
    }
  }
}
</script>

<style scoped></style>
