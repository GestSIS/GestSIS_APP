<template>
  <div>
    <div class="container-fluid">
      <h1>Exercices</h1>
      <div class="row">
        <div class="col-md-12">
          <!-- /.card-header -->
          <div class="card card-primary card-outline">
            <div class="card-header">
              <h3 class="card-title">Exercices</h3>
              <div class="card-body px-0"></div>
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
                ></e-column>
                <e-column
                  field="heure"
                  headerText="Heure"
                  width="80"
                ></e-column>
                <e-column
                  field="duree"
                  headerText="Durée"
                  width="80"
                ></e-column>
                <e-column field="lieu" headerText="Lieu"></e-column>
                <e-column
                  field="localite_id"
                  headerText="Localite"
                  :valueAccessor="localiteAccessor"
                ></e-column>
                <e-column
                  field="communication"
                  headerText="Communication"
                ></e-column>
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
    }
  },
  provide: {
    grid: [DetailRow, Sort]
  }
}
</script>

<style lang="scss" scoped></style>
