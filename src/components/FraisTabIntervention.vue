<template>
  <div class="row">
    <div class="col-sm-12 col-xl-12">
      <div class="card card-primary card-outline mb-3">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Interventions</h3>
          <button @click.prevent="save" class="btn btn-primary">
            Enregistrer
          </button>
        </div>
        <div class="card-body d-flex justify-content-center" v-if="loading">
          <div class="spinner-border" role="status">
            <span class="sr-only">Loading...</span>
          </div>
        </div>
        <vuetable
          v-show="!loading"
          ref="vuetable_frais_interventions"
          :api-mode="false"
          :fields="fields"
          :css="css.table"
          :data-manager="dataManager"
          :row-class="onRowClass"
        >
          <!--            <template slot="tableHeader">-->
          <!--              <template>-->
          <!--                <tr>-->
          <!--                  <th colspan="2">Basic Info</th>-->
          <!--                  <th colspan="6">Details</th>-->
          <!--                </tr>-->
          <!--              </template>-->
          <!--              <vuetable-row-header></vuetable-row-header>-->
          <!--            </template>-->
          <div slot="actions" slot-scope="props">
            <button
              class="btn btn-outline-primary border-0"
              v-if="props.rowData.statut === 2"
              @click="imputerIntervention(props.rowData.id)"
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
  name: 'FraisTabIntervention',
  components: {
    Vuetable
  },
  watch: {
    currentExerciceComptableId() {
      this.loading = true
      this.$store.dispatch('fetchListIntervention').then(() => {
        this.loading = false
        this.$refs.vuetable_frais_interventions.setData(this.computedData)
      })
    },
    listInterventions() {
      this.loading = true
      this.$refs.vuetable_frais_interventions.setData(this.computedData)
      this.loading = false
    }
  },
  mounted() {
    this.$store.dispatch('fetchLocalites')
    this.$store.dispatch('fetchStatFederals')
    this.$store.dispatch('fetchTypeInterventions')
    this.$store.dispatch('fetchInterventionTraitements')
    if (this.listExerciceComptable.length === 0) {
      //console.log('Warning')
    }
    if (this.currentExerciceComptableId || 0 !== 0) {
      this.$store.dispatch('fetchListIntervention').then(() => {
        this.loading = false
        this.$refs.vuetable_frais_interventions.setData(this.computedData)
      })
    }
  },
  data() {
    let self = this
    return {
      css: CssForBootstrap4,
      toggles: {},
      fields: [
        // {
        //   title: '',
        //   name: 'details',
        //   dataClass: 'align-middle'
        // },
        {
          title: 'Date',
          name: 'date_debut',
          dataClass: 'align-middle'
        },
        {
          title: 'Heure',
          name: 'heure_debut',
          dataClass: 'align-middle',
          formatter(value) {
            return value.slice(0, 5)
          }
        },
        {
          title: "Type d'intervention",
          name: 'type_intervention',
          dataClass: 'align-middle',
          sortField: 'type_intervention'
        },
        {
          title: 'Localité',
          name: 'localite_id',
          dataClass: 'align-middle',
          formatter(value) {
            return self.getLocalite(value).designation
          }
        },
        {
          title: 'Lieu',
          name: 'lieu',
          dataClass: 'align-middle'
        },
        {
          title: 'Stat fédéral',
          name: 'stat_federal_id',
          dataClass: 'align-middle',
          formatter(value) {
            return self.getStatFederal(value).designation
          }
        },
        {
          title: 'Traitement',
          name: 'intervention_traitement_id',
          dataClass: 'align-middle',
          formatter(value) {
            return self.getInterventionTraitement(value).designation
          }
        },
        {
          title: 'Étendue',
          name: 'degre',
          dataClass: 'align-middle',
          formatter(value) {
            const degre = {
              1: 'Fausse-alarme',
              2: 'Petite',
              3: 'Moyenne',
              4: 'Grande'
            }
            return degre[value]
          }
        },
        {
          title: 'Statut',
          name: 'statut',
          dataClass: 'align-middle',
          formatter(value) {
            const statuts = {
              0: 'A saisir',
              1: 'A valider',
              2: 'A imputer',
              3: 'Imputée'
            }
            return statuts[value]
          }
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
      listInterventions: state =>
        state.intervention.liste.filter(e => e.statut > 1),
      listExerciceComptable: state => state.exerciceComptable.liste,
      currentExerciceComptableId: state => state.exerciceComptable.activeId
    }),
    ...mapGetters([
      'activeInterventionId',
      'getTypeIntervention',
      'getLocalite',
      'getStatFederal',
      'getInterventionTraitement'
    ]),
    computedData() {
      let svm = this
      return this.listInterventions.map(i => ({
        ...i,
        type_intervention: svm.getTypeIntervention(i.type_intervention_id)
          .designation,
        localite: svm.getLocalite(i.localite_id).designation
      }))
    }
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    toggleDetails(id) {
      this.toggles = {
        ...this.toggles,
        [id]: !this.toggles[id]
      }
      this.$refs.vuetable_frais_interventions.toggleDetailRow(id)
    },
    imputerIntervention(interventionId) {
      //TODO

      this.SHOW_MODAL({
        component: 'ModalImputerIntervention',
        data: { id: interventionId },
        size: 2
      })
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
        0: '', //'A saisir',
        1: '', //'A valider',
        2: 'table-warning', //'A imputer',
        3: 'table-success' //'Imputée'
      }
      return statutsClass[dataItem.statut]
    }
  }
}
</script>

<style scoped></style>
