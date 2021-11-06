<template>
  <div>
    <div class="modal-header">
      <h5 class="modal-title" id="exampleModalLabel">
        Suppression des groupes, exercices et fonctions
      </h5>
      <button type="button" class="btn-close" @click="HIDE_MODAL()"></button>
    </div>
    <div class="modal-body">
      <form class="row g-3 align-items-center mb-2" v-if="fonctions.length">
        <div class="col-auto">
          <label for="fin">Date</label>
        </div>
        <div class="col-auto">
          <input
            type="date"
            class="form-control mx-sm-3"
            :class="{ 'is-invalid': erreurs.date }"
            id="fin"
            v-model="mutationDate"
          />
        </div>
        <div class="col-auto">
          <small class="invalid-feedback" v-if="erreurs.date">
            Date requise
          </small>
        </div>
      </form>
      <table class="table table-sm" id="mutation-desactivation-table">
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
                type="checkbox"
                id="sel-exercices-mut"
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
        <tbody v-if="groupes.length">
          <tr>
            <td>
              <input
                type="checkbox"
                id="sel-groupes-mut"
                name="groupes"
                :indeterminate.prop="groupesSelectedState == undefined"
                :checked="groupesSelectedState"
                @click="selectGroupe"
              />
            </td>
            <td>Groupes</td>
            <td></td>
          </tr>
          <tr v-for="groupe in groupes" :key="groupe.id">
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
        <tbody v-if="fonctions.length">
          <tr>
            <td>
              <input
                type="checkbox"
                id="sel-fonctions-mut"
                name="fonctions"
                :indeterminate.prop="fonctionsSelectedState == undefined"
                :checked="fonctionsSelectedState"
                @click="selectFonction"
              />
            </td>
            <td>Fonctions</td>
            <td></td>
          </tr>
          <tr v-for="fonction in fonctions" :key="fonction.id">
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
import { mapGetters, mapState, mapMutations } from 'vuex';

export default {
  name: 'ModalMutationDesactivation',
  data() {
    return {
      exercices: [],
      groupes: [],
      fonctions: [],
      mutationDate: null,
      erreurs: {},
    };
  },
  computed: {
    ...mapState({
      activeSapeurId: (state) => state.sapeur.id,
      activeSapeurExercice: (state) => state.sapeur.active.exercices,
      activeSapeurGroupe: (state) => state.sapeur.active.groupes,
      activeSapeurMutations: (state) => state.sapeur.active.mutations,
      activeSapeurFonction: (state) =>
        state.sapeur.active.fonctions.filter((f) => !f.fin),
    }),
    ...mapGetters([
      'listeLocalitesSis',
      'getGroupe',
      'getFonction',
      'getExerciceCategorie',
    ]),
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
    if (this.listeLocalitesSis.length === 0) {
      this.$store.dispatch('fetchLocalites');
    }

    this.exercices = this.activeSapeurExercice.map((e) => ({
      ...e,
      info: `${
        this.getExerciceCategorie(e.exercice_categorie_id).designation
      } : ${e.communications}`,
      selected: true,
    }));
    this.groupes = this.activeSapeurGroupe.map((g) => ({
      ...this.getGroupe(g.groupe_id),
      id: g.id,
      selected: true,
    }));
    this.fonctions = this.activeSapeurFonction.map((f) => ({
      ...this.getFonction(f.fonction_id),
      debut: f.debut,
      id: f.id,
      info: `Début ${this.formatDate(new Date(f.debut))}`,
      selected: true,
    }));

    // Récupère la date de la dernière mutation
    if (this.fonctions.length) {
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
    save() {
      if (
        this.fonctions.length > 0 &&
        (!this.mutationDate ||
          this.fonctions.some(
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

      if (this.fonctions.filter(isSelected).length) {
        this.$store.dispatch('finFonctions', {
          fin: this.mutationDate,
          ids: this.fonctions.filter(isSelected).map(mapToId),
        });
      }
      if (this.exercices.filter(isSelected).length) {
        this.$store.dispatch(
          'supprimerConvocation',
          this.exercices.filter(isSelected).map(mapToId)
        );
      }
      if (this.groupes.filter(isSelected).length) {
        this.$store.dispatch(
          'quitterGroupes',
          this.groupes.filter(isSelected).map(mapToId)
        );
      }

      this.errors = {};
      this.HIDE_MODAL();
    },
    selectGroupe(event, groupeId) {
      let state = event.target.checked;
      if (groupeId) {
        this.groupes.find((g) => g.id == groupeId).selected = state;
      } else {
        this.groupes.forEach((e) => (e.selected = state));
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
        this.fonctions.find((g) => g.id == fonctionId).selected = state;
      } else {
        this.fonctions.forEach((e) => (e.selected = state));
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
