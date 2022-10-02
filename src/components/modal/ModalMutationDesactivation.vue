<template>
  <div>
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">
        Suppression des groupes, exercices et fonctions
      </h5>
      <button type="button" class="btn-close" @click="HIDE_MODAL()"></button>
    </div>
    <div class="modal-body">
      <form v-if="fonctions.length" class="row g-3 align-items-center mb-2">
        <div class="col-auto">
          <label for="fin">Date</label>
        </div>
        <div class="col-auto">
          <input
            id="fin"
            v-model="mutationDate"
            type="date"
            class="form-control mx-sm-3"
            :class="{ 'is-invalid': erreurs.date }"
          />
        </div>
        <div class="col-auto">
          <small v-if="erreurs.date" class="invalid-feedback">
            Date requise
          </small>
        </div>
      </form>
      <table id="mutation-desactivation-table" class="table table-sm">
        <thead>
          <tr>
            <th>Sel</th>
            <th>Objet</th>
            <th>Info</th>
          </tr>
        </thead>
        <tbody v-if="exercices && exercices.length">
          <tr>
            <td>
              <input
                id="sel-exercices-mut"
                type="checkbox"
                name="exercices"
                :indeterminate.prop="exercicesSelectedState == undefined"
                :checked="exercicesSelectedState"
                @click="selectExercice($event.target.checked)"
              />
            </td>
            <td>Exercices</td>
            <td></td>
          </tr>
          <tr v-for="exercice in exercices" :key="exercice.id">
            <td>
              <input
                type="checkbox"
                :checked="selectedExercices[exercice.id]"
                @click="selectExercice($event.target.checked, exercice.id)"
              />
            </td>
            <td>{{ exercice.date }}</td>
            <td>{{ exercice.info }}</td>
          </tr>
        </tbody>
        <tbody v-if="sapGroupes && sapGroupes.length">
          <tr>
            <td>
              <input
                id="sel-groupes-mut"
                type="checkbox"
                name="groupes"
                :indeterminate.prop="groupesSelectedState == undefined"
                :checked="groupesSelectedState"
                @click="selectGroupe($event.target.checked)"
              />
            </td>
            <td>Groupes</td>
            <td></td>
          </tr>
          <tr v-for="groupe in sapGroupes" :key="groupe.id">
            <td>
              <input
                type="checkbox"
                :checked="selectedGroupes[groupe.id]"
                @click="selectGroupe($event.target.checked, groupe.id)"
              />
            </td>
            <td>{{ groupe.designation }}</td>
            <td>{{ groupe.no }}</td>
          </tr>
        </tbody>
        <tbody v-if="sapFonctions && sapFonctions.length">
          <tr>
            <td>
              <input
                id="sel-fonctions-mut"
                type="checkbox"
                name="fonctions"
                :indeterminate.prop="fonctionsSelectedState == undefined"
                :checked="fonctionsSelectedState"
                @click="selectFonction($event.target.checked)"
              />
            </td>
            <td>Fonctions</td>
            <td></td>
          </tr>
          <tr v-for="fonction in sapFonctions" :key="fonction.id">
            <td>
              <input
                type="checkbox"
                :checked="selectedFonctions[fonction.id]"
                @click="selectFonction($event.target.checked, fonction.id)"
              />
            </td>
            <td>{{ fonction.nom }}</td>
            <td>{{ fonction.info }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="HIDE_MODAL()">
        Fermer
      </button>
      <button type="button" class="btn btn-primary" @click="save()">
        Traitement
      </button>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';

export default {
  name: 'ModalMutationDesactivation',
  data() {
    return {
      selectedExercices: {},
      selectedGroupes: {},
      selectedFonctions: {},
      mutationDate: null,
      erreurs: {},
    };
  },
  computed: {
    ...mapState({
      categories: (state) => state.exerciceCategorie.liste,
      groupes: (state) => state.groupe.liste,
      fonctions: (state) => state.fonction.liste,
      localites: (state) => state.localite.liste,
      activeSapeurId: (state) => state.sapeur.id,
      activeSapeurExercice: (state) => state.sapeur.active.exercices,
      activeSapeurGroupe: (state) => state.sapeur.active.groupes,
      activeSapeurMutations: (state) => state.sapeur.active.mutations,
      activeSapeurFonction: (state) =>
        state.sapeur.active.fonctions.filter((f) => !f.fin),
    }),
    exercicesSelectedState() {
      return Object.values(this.selectedExercices).every((e) => e);
    },
    groupesSelectedState() {
      return Object.values(this.selectedGroupes).every((e) => e);
    },
    fonctionsSelectedState() {
      return Object.values(this.selectedFonctions).every((e) => e);
    },
    exercices() {
      return this.activeSapeurExercice
        .filter(
          (e) => e.statut <= 2 && e.statut > 0 && e.date > this.mutationDate // Saisie ou vide et pas annulé
        )
        .map((e) => ({
          ...e,
          info: `${
            this.categories.find((c) => c.id == e.exercice_categorie_id)
              .designation
          } : ${e.communications}`,
        }));
    },
    sapGroupes() {
      return this.activeSapeurGroupe.map((g) => ({
        ...this.groupes.find((f) => f.id == g.groupe_id),
        id: g.id,
      }));
    },
    sapFonctions() {
      return this.activeSapeurFonction.map((f) => ({
        ...this.fonctions.find((e) => e.id == f.fonction_id),
        debut: f.debut,
        id: f.id,
        info: `Début ${this.formatDate(new Date(f.debut))}`,
      }));
    },
  },
  mounted() {
    if (this.localites.length === 0) {
      this.$store.dispatch('fetchLocalites');
    }

    // Récupère la date de la dernière mutation
    if (this.activeSapeurMutations.length) {
      this.mutationDate = this.activeSapeurMutations.sort(
        (a, b) => new Date(b.sortie) - new Date(a.sortie)
      )[0].sortie;
    }

    this.selectGroupe(true);
    this.selectExercice(true);
    this.selectFonction(true);
  },
  methods: {
    ...mapMutations(['HIDE_MODAL']),
    formatDate(date) {
      var monthNames = [
        'janvier',
        'février',
        'mars',
        'avril',
        'mai',
        'juin',
        'juillet',
        'août',
        'septembre',
        'octobre',
        'novembre',
        'décembre',
      ];

      var day = date.getDate();
      var monthIndex = date.getMonth();
      var year = date.getFullYear();

      return day + ' ' + monthNames[monthIndex] + ' ' + year;
    },
    async save() {
      if (
        this.sapFonctions.length > 0 &&
        (!this.mutationDate ||
          this.sapFonctions.some(
            (f) => new Date(f.debut) >= new Date(this.mutationDate)
          ))
      ) {
        this.erreurs = {
          ...this.erreurs,
          date: 'Date requise',
        };
        return;
      }

      let mapToId = (e) => e.id;

      if (
        this.sapFonctions.filter((e) => this.selectedFonctions[e.id]).length
      ) {
        this.$store.dispatch('finFonctions', {
          fin: this.mutationDate,
          ids: this.sapFonctions
            .filter((e) => this.selectedFonctions[e.id])
            .map(mapToId),
        });
      }
      if (this.exercices.filter((e) => this.selectedExercices[e.id]).length) {
        this.$store.dispatch(
          'supprimerConvocation',
          this.exercices
            .filter((e) => this.selectedExercices[e.id])
            .map(mapToId)
        );
      }
      if (this.sapGroupes.filter((e) => this.selectedGroupes[e.id]).length) {
        this.$store.dispatch(
          'quitterGroupes',
          this.sapGroupes.filter((e) => this.selectedGroupes[e.id]).map(mapToId)
        );
      }

      this.errors = {};
      this.HIDE_MODAL();
    },
    selectGroupe(state, groupeId) {
      if (groupeId) {
        this.selectedGroupes[groupeId] = state;
      } else {
        this.selectedGroupes = Object.fromEntries(
          this.activeSapeurGroupe.map((g) => [g.id, state])
        );
      }
    },
    selectExercice(state, exerciceId) {
      if (exerciceId) {
        this.selectedExercices[exerciceId] = state;
      } else {
        this.selectedExercices = Object.fromEntries(
          this.activeSapeurExercice.map((g) => [g.id, state])
        );
      }
    },
    selectFonction(state, fonctionId) {
      if (fonctionId) {
        this.selectedFonctions[fonctionId] = state;
      } else {
        this.selectedFonctions = Object.fromEntries(
          this.activeSapeurFonction.map((g) => [g.id, state])
        );
      }
    },
  },
};
</script>

<style scoped>
#mutation-desactivation-table tbody tr td:first-child,
#mutation-desactivation-table thead tr th:first-child {
  width: 8px;
}

#mutation-desactivation-table tbody tr:nth-child(n + 2) td:nth-child(2) {
  padding-left: 2rem;
}

#mutation-desactivation-table tbody tr td {
  padding: 0.4rem 0.75rem;
}
</style>
