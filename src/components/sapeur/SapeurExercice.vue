<template>
  <!-- general form elements -->
  <div class="card card-primary card-outline">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Exercices</h3>
      <button
        v-if="hasPresencePermission"
        class="btn btn-primary"
        @click.prevent="edit"
      >
        Modifier
      </button>
    </div>
    <div class="card-body table-responsive">
      <table id="sap-fonctions" class="table table-sm">
        <thead>
          <tr>
            <th>Date</th>
            <th>heure</th>
            <th>Catégorie</th>
            <th>Localité</th>
            <th>Désignation</th>
            <th class="text-center">Convoqué</th>
            <th class="text-center">Présent</th>
            <th class="text-center">Remplacé</th>
            <th class="text-center">Excusé</th>
            <th class="text-center">Amende</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="exerciceDisplay.length <= 0">
            <td colspan="9">Aucun exercice à afficher</td>
          </tr>
          <tr v-for="e in exerciceDisplay" :key="e.id">
            <td>
              <component :is="e.canceled ? 'del' : 'span'">
                {{ e.date.toLocaleDateString() }}
              </component>
            </td>
            <td>
              <component :is="e.canceled ? 'del' : 'span'">
                {{ e.heure }}
              </component>
            </td>
            <td>
              <component :is="e.canceled ? 'del' : 'span'">
                {{ e.categorie }}
              </component>
            </td>
            <td>
              <component :is="e.canceled ? 'del' : 'span'">
                {{ e.localite }}
              </component>
            </td>
            <td>
              <component :is="e.canceled ? 'del' : 'span'">
                {{ e.designation }}
              </component>
            </td>
            <td class="text-center">
              <input
                type="checkbox"
                class="form-check-input"
                :checked="e.convoque"
                :true-value="1"
                :false-value="0"
                disabled
              />
            </td>
            <td class="text-center">
              <input
                type="checkbox"
                class="form-check-input"
                :checked="e.present"
                :true-value="1"
                :false-value="0"
                disabled
              />
            </td>
            <td class="text-center">
              <input
                type="checkbox"
                class="form-check-input"
                :checked="e.remplace"
                :true-value="1"
                :false-value="0"
                disabled
              />
            </td>
            <td class="text-center">
              <input
                type="checkbox"
                class="form-check-input"
                :checked="e.excuse_type_id"
                disabled
              />
              <label v-if="e.excuse_type_id" class="form-check-label ms-1">
                {{
                  e.excuse_type_id
                    ? excusesType.find((a) => a.id == e.excuse_type_id)
                        ?.designation
                    : ''
                }}
              </label>
            </td>
            <td class="text-center">
              <input
                type="checkbox"
                class="form-check-input"
                :checked="e.amende"
                disabled
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import permissions from '@/store/permissions.js';

export default {
  name: 'SapeurExercice',
  computed: {
    ...mapState({
      excusesType: (state) => state.excuseType.liste,
      localites: (state) => state.localite.liste,
      categories: (state) => state.exerciceCategorie.liste,
      activeSapeurId: (state) => state.sapeur.active.id,
      activeSapeurExercice: (state) => state.sapeur.active.exercices,
      currentExerciceComptableId: (state) => state.exerciceComptable.activeId,
      hasPresencePermission: (state) =>
        state.auth.admin ||
        state.auth.sis.permissions.includes(permissions.EXERCICE.PRESENCE),
    }),
    exerciceDisplay() {
      return this.activeSapeurExercice
        .map((exercice) => ({
          ...exercice,
          canceled: exercice.statut == 0,
          date: new Date(exercice.date),
          heure: exercice.heure.substr(0, 5),
          categorie: this.categories.find(
            (e) => e.id == exercice.exercice_categorie_id
          )?.designation,
          localite: this.localites.find((l) => l.id == exercice.localite_id)
            ?.designation,
        }))
        .sort((a, b) => a.date - b.date);
    },
  },
  watch: {
    activeSapeurId(id) {
      this.$store.dispatch('fetchSapeurExercices', id);
    },
    currentExerciceComptableId() {
      this.$store.dispatch('fetchSapeurExercices', this.activeSapeurId);
    },
  },
  mounted() {
    //TODO: Load before any display
    this.$store.dispatch('fetchExcuseTypes', this.activeSapeurId);
    this.$store.dispatch('fetchExerciceCategories', this.activeSapeurId);
    this.$store.dispatch('fetchSapeurExercices', this.activeSapeurId);
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    edit() {
      this.SHOW_MODAL({
        component: 'ModalPresenceExercice',
        size: 2,
      });
    },
  },
};
</script>

<style scoped></style>
