<template>
  <div>
    <div class="container-fluid">
      <div class="row">
        <div class="col-md-12">
          <!-- /.card-header -->
          <div class="card card-primary card-outline mt-3">
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
            >
              <div slot="details" slot-scope="props">
                <button
                  class="btn btn-link border-0"
                  @click="toggleDetails(props.rowData.id)"
                >
                  <font-awesome-icon :icon="['fas', 'angle-right']" />
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
import ExerciceActions from '@/components/ExerciceActions'

import Vuetable from 'vuetable-2'

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
      fields: [
        'details',
        'date',
        {
          title: 'Categorie',
          name: 'exercice_categorie_id',
          formatter(value) {
            return self.getExerciceCategorie(value).designation
          }
        },
        {
          title: 'Heure',
          name: 'heure',
          formatter(value) {
            return value.slice(0,5)
          }
        },
        'duree',
        {
          title: 'Localité',
          name: 'localite_id',
          formatter(value) {
            return self.getLocalite(value).designation
          }
        },
        'lieu',
        'communication',
        'actions'
      ],
      loading: true,
      detailRow: ExerciceDetails,
      actionTemplate: ExerciceActions
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
      this.$refs.vuetable.toggleDetailRow(id)
    }
  }
}
</script>

<style lang="scss" scoped></style>
