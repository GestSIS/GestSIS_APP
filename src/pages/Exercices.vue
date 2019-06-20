<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-md-8">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb bg-white">
            <li class="breadcrumb-item">
              <router-link tag="a" to="/">
                Accueil
              </router-link>
            </li>
            <li class="breadcrumb-item active" aria-current="page">
              Exercices
            </li>
          </ol>
        </nav>
      </div>
      <div class="col-md-4 d-flex justify-content-end">
        <exercice-comptable />
      </div>
    </div>
    <div class="row">
      <div class="col-md-12">
        <!-- /.card-header -->
        <div class="card card-primary card-outline mb-5">
          <div class="card-header d-flex justify-content-between">
            <h3>Liste des exercices</h3>
            <router-link
              tag="button"
              to="/exercices/new"
              class="btn btn-outline-primary"
            >
              Ajouter un exercice
            </router-link>
          </div>
          <div class="card-body d-flex justify-content-center" v-if="loading">
            <div class="spinner-border" role="status">
              <span class="sr-only">Loading...</span>
            </div>
          </div>
          <vuetable
            v-show="!loading"
            ref="vuetable_exercices"
            :api-mode="false"
            :fields="fields"
            :detail-row-component="detailRow"
            :css="css.table"
            :data-manager="dataManager"
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
            <div slot="details" slot-scope="props">
              <button
                class="btn btn-link border-0"
                @click="toggleDetails(props.rowData.id)"
              >
                <font-awesome-icon
                  v-if="toggles[props.rowData.id] || false"
                  :icon="['fas', 'angle-down']"
                />
                <font-awesome-icon
                  v-if="!(toggles[props.rowData.id] || false)"
                  :icon="['fas', 'angle-right']"
                />
              </button>
            </div>
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
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import ExerciceDetails from '@/components/ExerciceDetails'
import ExerciceComptable from '@/components/ExerciceComptable'

import Vuetable from 'vuetable-2'
// import VuetableRowHeader from 'vuetable-2/src/components/VuetableRowHeader.vue'
import CssForBootstrap4 from '@/assets/vuetableCssConfig.js'
import _ from 'lodash'

export default {
  name: 'exercices',
  components: {
    Vuetable,
    ExerciceComptable
  },
  watch: {
    currentExerciceComptableId() {
      this.loading = true
      this.$store.dispatch('fetchListExercice').then(() => {
        this.loading = false
        this.$refs.vuetable_exercices.setData(this.computedData)
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
          this.$refs.vuetable_exercices.setData(this.computedData)
        })
      }
    } else {
      this.loading = false
      this.$refs.vuetable_exercices.setData(this.computedData)
    }
  },
  data() {
    return {
      css: CssForBootstrap4,
      toggles: {},
      fields: [
        {
          title: '',
          name: 'details',
          dataClass: 'align-middle'
        },
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
          title: 'Actions',
          name: 'actions',
          dataClass: 'align-middle'
        }
      ],
      loading: true,
      detailRow: ExerciceDetails
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
    ...mapGetters([
      'listExercices',
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
      this.$refs.vuetable_exercices.toggleDetailRow(id)
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
    }
  }
}
</script>

<style lang="scss" scoped></style>
