<template>
  <div class="row">
    <div class="col-sm-12 col-xl-12">
      <div class="card card-primary card-outline mb-3">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Exercices</h3>
          <button @click.prevent="save" class="btn btn-primary">
            Enregistrer
          </button>
        </div>
        <vuetable
          v-show="!loading"
          ref="vuetable_frais_exercices"
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
            <router-link
              tag="button"
              :to="'/exercices/' + props.rowData.id"
              class="btn btn-outline-primary border-0"
            >
              <font-awesome-icon :icon="['far', 'edit']" />
            </router-link>
          </div>
        </vuetable>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

import Vuetable from 'vuetable-2'
import CssForBootstrap4 from '@/assets/vuetableCssConfig.js'
import _ from 'lodash'

export default {
  name: 'FraisTabExercice',
  components: {
    Vuetable
  },
  watch: {
    currentExerciceComptableId() {
      this.loading = true
      this.$store.dispatch('fetchListExercice').then(() => {
        this.loading = false
        this.$refs.vuetable_frais_exercices.setData(this.computedData)
      })
    }
  },
  mounted() {
    this.$store.dispatch('fetchLocalites')
    this.$store.dispatch('fetchExerciceCategories')
    if (this.listExerciceComptable.length === 0) {
      //console.log('Warning')
    }
    if (this.listExercices.length === 0) {
      if (this.currentExerciceComptableId || 0 !== 0) {
        this.$store.dispatch('fetchListExercice').then(() => {
          this.loading = false
          this.$refs.vuetable_frais_exercices.setData(this.computedData)
        })
      }
    } else {
      this.loading = false
      this.$refs.vuetable_frais_exercices.setData(this.computedData)
    }
  },
  data() {
    return {
      css: CssForBootstrap4,
      toggles: {},
      fields: [
        {
          title: 'Date',
          name: 'date',
          sortField: 'date',
          dataClass: 'align-middle'
        },
        {
          title: 'Categorie',
          name: 'categorie',
          sortField: 'categorie',
          dataClass: 'align-middle'
        },
        {
          title: 'Heure',
          name: 'heure',
          dataClass: 'align-middle',
          formatter(value) {
            return value.slice(0, 5)
          }
        },
        {
          title: 'Duree',
          name: 'duree',
          dataClass: 'align-middle'
        },
        {
          title: 'Localité',
          name: 'localite',
          sortField: 'localite',
          dataClass: 'align-middle'
        },
        {
          title: 'Lieu',
          name: 'lieu',
          dataClass: 'align-middle'
        },
        {
          title: 'Designation',
          name: 'designation',
          sortField: 'designation',
          dataClass: 'align-middle'
        },
        {
          title: 'statut',
          name: 'statut',
          sortField: 'statut',
          dataClass: 'align-middle',
          formatter(value) {
            const statuts = {
              0: 'Annulé',
              1: 'A saisir',
              2: 'En attente de validation',
              3: 'A imputer',
              4: 'Imputée'
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
      listExercices: state => state.exercice.liste.filter(e => e.statut > 2)
    }),
    ...mapGetters([
      'activeExerciceId',
      'getExerciceCategorie',
      'getLocalite',
      'listExerciceComptable',
      'currentExerciceComptableId'
    ]),
    computedData() {
      return this.listExercices.map(s => {
        return {
          ...s,
          categorie: this.getExerciceCategorie(s.exercice_categorie_id)
            .designation,
          localite: this.getLocalite(s.localite_id).designation
        }
      })
    }
  },
  methods: {
    toggleDetails(id) {
      this.toggles = {
        ...this.toggles,
        [id]: !this.toggles[id]
      }
      this.$refs.vuetable_frais_exercices.toggleDetailRow(id)
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
    onRowClass(dataItem, index) {
      const statutsClass = {
        0: '', //'Annulé',
        1: '', //'A saisir',
        2: '', //'En attente de validation',
        3: 'table-warning', //'A imputer',
        4: 'table-success' //'Imputée'
      }
      return statutsClass[dataItem.statut]
    }
  }
}
</script>

<style scoped></style>
