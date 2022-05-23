<template>
  <!-- general form elements -->
  <div class="card card-primary card-outline">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Exercices</h3>
    </div>
    <div class="card-body table-responsive">
      <table
        id="sap-fonctions"
        class="table table-sm"
        cellspacing="0"
        width="100%"
      >
        <thead>
          <tr>
            <th>Date</th>
            <th>heure</th>
            <th>Catégorie</th>
            <th>Localité</th>
            <th>Désignation</th>
            <th class="text-center">Convoqué</th>
            <th class="text-center">Présent</th>
            <th class="text-center">Excusé</th>
            <th class="text-center">Amende</th>
            <!-- <th>Solde</th> -->
          </tr>
        </thead>
        <tbody>
          <tr v-if="exerciceDisplay.length <= 0">
            <td colspan="9">Aucun exercice à afficher</td>
          </tr>
          <tr v-for="e in exerciceDisplay" :key="e.id">
            <td>{{ e.date }}</td>
            <td>{{ e.heure }}</td>
            <td>{{ e.categorie }}</td>
            <td>{{ e.localite }}</td>
            <td>{{ e.designation }}</td>
            <td class="text-center">
              <input
                type="checkbox"
                class="form-check-input"
                id="convoque"
                :checked="e.convoque"
                disabled
              />
              <label class="form-check-label" for="convoque"></label>
            </td>
            <td class="text-center">
              <input
                type="checkbox"
                class="form-check-input"
                id="present"
                :checked="e.present"
                disabled
              />
              <label class="form-check-label" for="present"></label>
            </td>
            <td class="text-center">
              <input
                type="checkbox"
                class="form-check-input"
                id="excuse"
                :checked="e.excuse_type_id"
                disabled
              />
              <label class="form-check-label" for="excuse">
                {{
                  e.excuse_type_id
                    ? excusesType.find((a) => a.id == e.excuse_type_id)
                        .designation
                    : ''
                }}
              </label>
            </td>
            <td class="text-center">
              <input
                type="checkbox"
                class="form-check-input"
                id="amende"
                :checked="e.amende_id"
                disabled
              />
              <label class="form-check-label" for="amende"></label>
            </td>
            <!-- <td>0.0</td> -->
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

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
    }),
    exerciceDisplay() {
      return this.activeSapeurExercice
        .map((exercice) => {
          let localite = this.localites.find(
            (l) => l.id == exercice.localite_id
          );
          return {
            ...exercice,
            categorie: this.categories.find(
              (e) => e.id == exercice.exercice_categorie_id
            )?.designation,
            localite: `${localite.npa} ${localite.designation}`,
            heure: exercice.heure.substr(0, 5),
          };
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    },
  },
  mounted() {
    //TODO: Load before any display
    //TODO: Affichage solde ? Droits ?
    this.$store.dispatch('fetchExcuseTypes', this.activeSapeurId);
    this.$store.dispatch('fetchExerciceCategories', this.activeSapeurId);
    this.$store.dispatch('fetchSapeurExercices', this.activeSapeurId);
  },
  watch: {
    activeSapeurId(id) {
      this.$store.dispatch('fetchSapeurExercices', id);
    },
    currentExerciceComptableId() {
      this.$store.dispatch('fetchSapeurExercices', this.activeSapeurId);
    },
  },
};
</script>

<style scoped></style>
