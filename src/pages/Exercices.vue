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
            <ejs-grid
              v-if="!loading"
              :dataSource="listExercices"
              :allowSorting="true"
              :detailTemplate="detailTemplate"
            >
              <e-columns>
                <e-column field="date" headerText="Date" width="100"></e-column>
                <e-column
                  field="exercice_categorie_id"
                  headerText="Categorie"
                  :valueAccessor="categorieAccessor"
                  width="150"
                ></e-column>
                <e-column
                  field="heure"
                  headerText="Heure"
                  width="80"
                  :valueAccessor="timeAccessor"
                ></e-column>
                <e-column
                  field="duree"
                  headerText="Durée"
                  width="80"
                ></e-column>
                <e-column field="lieu" headerText="Lieu" width="150"></e-column>
                <e-column
                  field="localite_id"
                  headerText="Localite"
                  :valueAccessor="localiteAccessor"
                  width="120"
                ></e-column>
                <e-column
                  field="communication"
                  headerText="Communication"
                ></e-column>
                <e-column
                  headerText="Actions"
                  textAlign="center"
                  class="text-center"
                  :template="actionTemplate"
                >
                </e-column>
              </e-columns>
            </ejs-grid>
            <!--            <table class="table">-->
            <!--              <tr v-for="exercice in listExercices" :key="exercice.id">-->
            <!--                <td>{{ exercice.date }}</td>-->
            <!--                <td>{{ exercice.communication }}</td>-->
            <!--                <td>-->
            <!--                  {{-->
            <!--                    getExerciceCategorie(exercice.exercice_categorie_id)-->
            <!--                      .designation-->
            <!--                  }}-->
            <!--                </td>-->
            <!--                <td>-->
            <!--                  <router-link-->
            <!--                    tag="li"-->
            <!--                    :to="`/exercices/${exercice.id}`"-->
            <!--                    class="list-group-item list-group-item-action"-->
            <!--                    :class="{-->
            <!--                      active: parseInt(id) === exercice.id-->
            <!--                    }"-->
            <!--                  >-->
            <!--                    {{ edit }}-->
            <!--                  </router-link>-->
            <!--                </td>-->
            <!--              </tr>-->
            <!--            </table>-->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import { DetailRow, Sort } from '@syncfusion/ej2-vue-grids'
import ExerciceDetails from '@/components/ExerciceDetails'
import ExerciceActions from '@/components/ExerciceActions'

export default {
  name: 'exercices',
  mounted() {
    this.$store.dispatch('fetchLocalites')
    this.$store.dispatch('fetchExerciceCategories')
    if (this.listExercices.length === 0) {
      this.$store.dispatch('fetchListExercice').then(() => {
        this.loading = false
      })
    } else {
      this.loading = false
    }
  },
  data() {
    return {
      loading: true,
      detailTemplate: () => {
        return {
          template: ExerciceDetails
        }
      },
      actionTemplate: () => {
        return {
          template: ExerciceActions
        }
      }
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
    categorieAccessor(field, data) {
      return this.getExerciceCategorie(data.exercice_categorie_id).designation
    },
    localiteAccessor(field, data) {
      return this.getLocalite(data.localite_id).designation
    },
    timeAccessor(field, data) {
      return data.heure.slice(0, 5)
    }
  },
  provide: {
    grid: [DetailRow, Sort]
  }
}
</script>

<style lang="scss" scoped></style>
