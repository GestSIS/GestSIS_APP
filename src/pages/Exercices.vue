<template>
  <div>
    <div class="container-fluid">
      <div class="row">
        <div class="col-md-12">
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
          <!-- /.card-header -->
          <div class="card card-primary card-outline mt-3 mb-5">
            <div class="card-header d-flex justify-content-between">
              <h3>Liste des exercices</h3>
              <button class="btn btn-outline-primary">
                Ajouter un exercice
              </button>
            </div>
            <div class="card-body d-flex justify-content-center" v-if="loading">
              <div class="spinner-border" role="status">
                <span class="sr-only">Loading...</span>
              </div>
            </div>
            <vuetable
              ref="vuetable"
              :api-mode="false"
              :fields="fields"
              :detail-row-component="detailRow"
              :css="css.table"
            >
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
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import ExerciceDetails from '@/components/ExerciceDetails'

import Vuetable from 'vuetable-2'
import CssForBootstrap4 from '@/assets/vuetableCssConfig.js'

export default {
  name: 'exercices',
  components: {
    Vuetable
  },
  mounted() {
    this.$store.dispatch('fetchLocalites')
    this.$store.dispatch('fetchExerciceCategories')
    if (this.listExercices.length === 0) {
      this.$store.dispatch('fetchListExercice').then(() => {
        this.loading = false
        this.$refs.vuetable.setData(this.listExercices.slice(0, 25))
      })
    } else {
      this.loading = false
      this.$refs.vuetable.setData(this.listExercices.slice(0, 25))
    }
  },
  data() {
    const self = this
    return {
      css: CssForBootstrap4,
      toggles: [],
      fields: [
        {
          title: '',
          name: 'details',
          dataClass: 'align-middle'
        },
        {
          title: 'Date',
          name: 'date',
          dataClass: 'align-middle'
        },
        {
          title: 'Categorie',
          name: 'exercice_categorie_id',
          dataClass: 'align-middle',
          formatter(value) {
            return self.getExerciceCategorie(value).designation
          }
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
          title: 'Communication',
          name: 'communication',
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
      'getLocalite'
    ])
  },
  methods: {
    toggleDetails(id) {
      this.toggles[id] = !this.toggles[id]
      this.$refs.vuetable.toggleDetailRow(id)
    }
  }
}
</script>

<style lang="scss" scoped></style>
