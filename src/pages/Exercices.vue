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
            <ejs-grid
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
                <e-column>
                  <button>Modifier</button>
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

import Vue from 'vue'
import { GridPlugin, DetailRow, Sort } from '@syncfusion/ej2-vue-grids'
import ExerciceDetails from '@/components/ExerciceDetails'

Vue.use(GridPlugin)

export default {
  name: 'exercices',
  mounted() {
    this.$store.dispatch('fetchLocalites')
    this.$store.dispatch('fetchExerciceCategories')
    this.$store.dispatch('fetchListExercice').then(() => {
      if (this.activeExerciceId === 0 && this.listExercices.length > 0) {
        this.selectExercice(this.listExercices[0].id)
      }
    })
  },
  data() {
    return {
      detailTemplate: function() {
        return {
          template: ExerciceDetails
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
