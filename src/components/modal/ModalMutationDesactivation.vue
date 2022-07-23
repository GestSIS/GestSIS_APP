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
        <tbody v-if="exercices.length">
          <tr>
            <td>
              <input
                id="sel-exercices-mut"
                type="checkbox"
                name="exercices"
                :indeterminate.prop="exercicesSelectedState == undefined"
                :checked="exercicesSelectedState"
                @click="selectExercice"
              />
            </td>
            <td>Exercices</td>
            <td></td>
          </tr>
          <tr v-for="exercice in exercices" :key="exercice.id">
            <td>
              <input
                type="checkbox"
                :checked="exercice.selected"
                @click="(e) => selectExercice(e, exercice.id)"
              />
            </td>
            <td>{{ exercice.date }}</td>
            <td>{{ exercice.info }}</td>
          </tr>
        </tbody>
        <tbody v-if="sapGroupes.length">
          <tr>
            <td>
              <input
                id="sel-groupes-mut"
                type="checkbox"
                name="groupes"
                :indeterminate.prop="groupesSelectedState == undefined"
                :checked="groupesSelectedState"
                @click="selectGroupe"
              />
            </td>
            <td>Groupes</td>
            <td></td>
          </tr>
          <tr v-for="groupe in sapGroupes" :key="groupe.id">
            <td>
              <input
                type="checkbox"
                :checked="groupe.selected"
                @click="(e) => selectGroupe(e, groupe.id)"
              />
            </td>
            <td>{{ groupe.designation }}</td>
            <td>{{ groupe.no }}</td>
          </tr>
        </tbody>
        <tbody v-if="sapFonctions.length">
          <tr>
            <td>
              <input
                id="sel-fonctions-mut"
                type="checkbox"
                name="fonctions"
                :indeterminate.prop="fonctionsSelectedState == undefined"
                :checked="fonctionsSelectedState"
                @click="selectFonction"
              />
            </td>
            <td>Fonctions</td>
            <td></td>
          </tr>
          <tr v-for="fonction in sapFonctions" :key="fonction.id">
            <td>
              <input
                type="checkbox"
                :checked="fonction.selected"
                @click="(e) => selectFonction(e, fonction.id)"
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
      exercices: [],
      sapGroupes: [],
      sapFonctions: [],
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
      return this.exercices.length
        ? this.exercices
            .map((e) => e.selected)
            .reduce((v, e) => (v === e ? v : undefined))
        : true;
    },
    groupesSelectedState() {
      return this.groupes.length
        ? this.groupes
            .map((g) => g.selected)
            .reduce((v, g) => (v === g ? v : undefined))
        : true;
    },
    fonctionsSelectedState() {
      return this.fonctions.length
        ? this.fonctions
            .map((f) => f.selected)
            .reduce((v, f) => (v === f ? v : undefined))
        : true;
    },
  },
  mounted() {
    if (this.localites.length === 0) {
      this.$store.dispatch('fetchLocalites');
    }

    this.exercices = this.activeSapeurExercice.map((e) => ({
      ...e,
      info: `${
        this.categories.find((c) => c.id == e.exercice_categorie_id).designation
      } : ${e.communications}`,
      selected: true,
    }));
    this.sapGroupes = this.activeSapeurGroupe.map((g) => ({
      ...this.groupes.find((f) => f.id == g.groupe_id),
      id: g.id,
      selected: true,
    }));
    this.sapFonctions = this.activeSapeurFonction.map((f) => ({
      ...this.fonctions.find((e) => e.id == f.fonction_id),
      debut: f.debut,
      id: f.id,
      info: `Début ${this.formatDate(new Date(f.debut))}`,
      selected: true,
    }));

    // Récupère la date de la dernière mutation
    if (this.sapFonctions.length) {
      this.mutationDate = this.activeSapeurMutations.sort(
        (a, b) => new Date(b.sortie) - new Date(a.sortie)
      )[0].sortie;
    }
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

      let isSelected = (e) => e.selected;
      let mapToId = (e) => e.id;

      if (this.sapFonctions.filter(isSelected).length) {
        this.$store.dispatch('finFonctions', {
          fin: this.mutationDate,
          ids: this.sapFonctions.filter(isSelected).map(mapToId),
        });
      }
      if (this.exercices.filter(isSelected).length) {
        this.$store.dispatch(
          'supprimerConvocation',
          this.exercices.filter(isSelected).map(mapToId)
        );
      }
      if (this.sapGroupes.filter(isSelected).length) {
        this.$store.dispatch(
          'quitterGroupes',
          this.sapGroupes.filter(isSelected).map(mapToId)
        );
      }

      this.errors = {};
      this.HIDE_MODAL();
    },
    selectGroupe(event, groupeId) {
      let state = event.target.checked;
      if (groupeId) {
        this.sapGroupes.find((g) => g.id == groupeId).selected = state;
      } else {
        this.sapGroupes.forEach((e) => (e.selected = state));
      }
    },
    selectExercice(event, exerciceId) {
      let state = event.target.checked;
      if (exerciceId) {
        this.exercices.find((g) => g.id == exerciceId).selected = state;
      } else {
        this.exercices.forEach((e) => (e.selected = state));
      }
    },
    selectFonction(event, fonctionId) {
      let state = event.target.checked;
      if (fonctionId) {
        this.sapFonctions.find((g) => g.id == fonctionId).selected = state;
      } else {
        this.sapFonctions.forEach((e) => (e.selected = state));
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
