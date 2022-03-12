<template>
  <div class="row">
    <InterventionTabGroupe />
    <div class="col-xs-12 col-md-6">
      <!-- general form elements -->
      <div class="card card-primary card-outline mb-3">
        <!-- /.card-header -->
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Phases de l'intervention</h3>
          <button type="button" class="btn btn-primary" @click="newPhase">Nouvelle phase</button>
        </div>
        <div class="card-body">
          <table class="table table-sm">
            <thead>
              <tr>
                <th>Début</th>
                <th>Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="phases.length <= 0">
                <td colspan="3">
                  Erreur, une phase est nécessaire pour chaque intervention,
                  veuillez contacter l'administrateur du système.
                </td>
              </tr>
              <tr v-for="phase in phases" :key="phase.id">
                <td>
                  {{
                  phase.debut === null
                  ? `${data.date_debut} ${data.heure_debut}`
                  : phase.debut.slice(0, 16)
                  }}
                </td>
                <td>
                  {{
                  phasesType.find((p) => p.id == phase.phase_type_id)
                  .designation
                  }}
                </td>
                <td>
                  <button
                    type="button"
                    class="btn btn-outline-primary border-0 ms-2"
                    @click="editPhase(phase)"
                    v-if="phase.debut !== null"
                  >
                    <font-awesome-icon :icon="['far', 'edit']" />
                  </button>
                  <button
                    type="button"
                    class="btn btn-outline-danger border-0"
                    @click="removePhase(phase.id)"
                    v-if="phase.debut !== null"
                  >
                    <font-awesome-icon :icon="['far', 'trash-alt']" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <div class="col-sm-12 col-md-12 col-xl-12">
      <!-- general form elements -->
      <div class="card card-primary card-outline mb-3">
        <!-- /.card-header -->
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Présences</h3>
          <button type="button" class="btn btn-primary" @click="addPresences">Ajouter des présences</button>
        </div>
        <div class="card-body">
          <div class="badge-wrapper">
            <span class="badge bg-secondary me-2">Intervention</span>
            <span class="badge bg-primary me-2">Entretient</span>
            <span class="badge bg-success me-2">Piquet</span>
          </div>
          <div class="table-wrapper" ref="wrapper">
            <table class="table table-sm table-bordered">
              <thead>
                <tr>
                  <th rowspan="2">Sapeurs</th>
                  <th rowspan="2">Quittance</th>
                  <th
                    colspan="4"
                    v-for="(col, i) in columns"
                    :key="i"
                    class="text-center ps-3 pe-3"
                  >{{ col }}h</th>
                </tr>
                <tr>
                  <th v-for="(col, i) in columns" :key="'1' + i" class="ps-3 pe-3"></th>
                  <th v-for="(col, i) in columns" :key="'2' + i" class="ps-3 pe-3"></th>
                  <th v-for="(col, i) in columns" :key="'3' + i" class="ps-3 pe-3"></th>
                  <th v-for="(col, i) in columns" :key="'4' + i" class="ps-3 pe-3"></th>
                </tr>
              </thead>
              <tbody v-if="sortedSapeurs.length <= 0">
                <tr>
                  <td colspan="2">Aucun sapeur présent pour l'instant</td>
                </tr>
              </tbody>
              <tbody v-for="s in sortedSapeurs" :key="s.id" class="no-wrap">
                <tr>
                  <th class="ms-0 ps-1">
                    <button class="btn btn-link border-0" @click="expandSap(s.id)">
                      <font-awesome-icon
                        v-if="toggles[s.id] || false"
                        :icon="['fas', 'angle-down']"
                      />
                      <font-awesome-icon
                        v-if="!(toggles[s.id] || false)"
                        :icon="['fas', 'angle-right']"
                      />
                    </button>
                    {{ formatSapeur(s) }}
                  </th>
                  <td class="text-center">
                    <input
                      type="checkbox"
                      class="form-check-input"
                      :id="s.id"
                      :checked="
                        quittances.filter(
                          (q) => q.sapeur_id === parseInt(s.id)
                        ).length === 1
                      "
                      @click="(e) => editQuittance(e, s.id)"
                    />
                    <label class="form-check-label" :for="s.id"></label>
                  </td>
                  <td
                    v-for="i in Array(columns.length * 4).keys()"
                    :key="s.id + '-' + i"
                    :class="{
                      'bg-secondary': computedPresences[s.id][i] === 1,
                      'bg-primary': computedPresences[s.id][i] === 2,
                      'bg-success': computedPresences[s.id][i] === 3,
                    }"
                    class="ps-3 pe-3"
                  ></td>
                </tr>
                <template v-if="toggles[s.id]">
                  <tr
                    v-for="p in sortedPresences(s.id)"
                    :key="p.id"
                    :class="{
                      'alert-success': !!p.piquet === true,
                    }"
                  >
                    <td :colspan="2 + columns.length * 4">
                      {{ formatDatePresence(p.debut) }} -
                      {{ formatDatePresence(p.fin) }}
                      <button
                        type="button"
                        class="btn btn-outline-primary border-0 ms-2"
                        @click="editPresence(p)"
                      >
                        <font-awesome-icon :icon="['far', 'edit']" />
                      </button>
                      <button
                        type="button"
                        class="btn btn-outline-danger border-0"
                        @click="removePresence(p.id)"
                      >
                        <font-awesome-icon :icon="['far', 'trash-alt']" />
                      </button>
                    </td>
                  </tr>
                </template>
              </tbody>
              <tfoot>
                <tr>
                  <th :colspan="4 + 4 * columns.length">Nombre sapeurs : {{ sortedSapeurs.length }}</th>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import InterventionTabGroupe from '@/components/intervention/InterventionTabGroupe.vue';

export default {
  name: 'InterventionTabSapeurs',
  components: {
    InterventionTabGroupe,
  },
  data() {
    return {
      columns: [],
      toggles: {},
    };
  },
  computed: {
    ...mapState({
      id: (state) => state.intervention.active.id,
      data: (state) => state.intervention.active.data,
      quittances: (state) => state.intervention.active.quittances,
      presences: (state) => state.intervention.active.sapeurs,
      phases: (state) => state.intervention.active.phases,
      sapeurs: (state) => state.sapeur.liste,
      phasesType: (state) => state.phaseType.liste,
    }),
    listSapeurs() {
      return Array.from(
        new Set([
          ...this.presences.map((s) => s.sapeur_id),
          ...this.quittances.map((s) => s.sapeur_id),
        ])
      ).map((id) => this.sapeurs.find((s) => s.id == id));
    },
    sortedSapeurs() {
      return [
        ...Object.keys(this.computedPresences)
          .map((s) => this.sapeurs.find((sapeur) => sapeur.id == parseInt(s)))
          .sort((s1, s2) => (s1.nom + s1.prenom).localeCompare(s2.nom + s2.prenom)),
      ];
    },
    computedPresences() {
      let temp = [];
      this.listSapeurs.forEach(
        (s) =>
        (temp = {
          ...temp,
          [s.id]: this.computeSapeur(s.id),
        })
      );
      return temp;
    },
  },
  mounted() {
    this.$store.dispatch('fetchPhaseTypes');
    this.$store.dispatch('fetchInterventionQuittances', this.id);
    this.$store.dispatch('fetchInterventionPhases', this.id);
    this.$store.dispatch('fetchInterventionSapeurs', this.id);

    let startFloored = new Date(this.data.date_debut + ' ' + this.data.heure_debut);
    let end = new Date(this.data.date_fin + ' ' + this.data.heure_fin);

    startFloored.setMinutes(0);
    let diff = Math.abs(startFloored - end) / 3600000;

    // Génère une colonne par heure
    let min = startFloored.getHours();
    for (let i = 0; i < Math.ceil(diff); ++i) {
      this.columns.push((min + i) % 24);
    }

    if (this.$refs.wrapper.addEventListener) {
      // IE9, Chrome, Safari, Opera
      this.$refs.wrapper.addEventListener(
        'mousewheel',
        this.scrollHorizontally,
        false
      );
      // Firefox
      this.$refs.wrapper.addEventListener(
        'DOMMouseScroll',
        this.scrollHorizontally,
        false
      );
    } else {
      // IE 6/7/8
      this.$refs.wrapper.attachEvent('onmousewheel', this.scrollHorizontally);
    }
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    formatSapeur(sapeur) {
      if (!sapeur) return '';
      return sapeur.nom + ' ' + sapeur.prenom;
    },
    formatDatePresence(d) {
      return d.slice(-8, -3);
    },
    scrollHorizontally(e) {
      e = window.event || e;
      var delta = Math.max(-1, Math.min(1, e.wheelDelta || -e.detail));
      this.$refs.wrapper.scrollLeft -= delta * 40; // Multiplied by 40
      e.preventDefault();
    },
    addPresences() {
      this.SHOW_MODAL({
        component: 'ModalPresence',
        callback: () => { },
        data: {
          mode: 'add',
          id: this.data.id,
          min: this.data.date_debut + ' ' + this.data.heure_debut,
          max: this.data.date_fin + ' ' + this.data.heure_fin,
        },
      });
    },
    editPresence(presence) {
      let clone = {};
      Object.assign(clone, presence);
      this.SHOW_MODAL({
        component: 'ModalPresence',
        callback: () => { },
        data: {
          mode: 'edit',
          sapeurs: [clone.sapeur_id],
          presence: clone,
          min: this.data.date_debut + ' ' + this.data.heure_debut,
          max: this.data.date_fin + ' ' + this.data.heure_fin,
        },
      });
    },
    removePresence(id) {
      this.$store.dispatch('removePresence', id);
    },
    newPhase() {
      this.$store.dispatch('resetActivePhase');
      this.SHOW_MODAL({
        component: 'ModalPhase',
        callback: () => { },
        data: {
          min: this.data.date_debut + ' ' + this.data.heure_debut,
          max: this.data.date_fin + ' ' + this.data.heure_fin,
        },
      });
    },
    editPhase(phase) {
      let clone = {};
      Object.assign(clone, phase);
      this.$store.dispatch('updateActivePhase', clone);
      this.SHOW_MODAL({
        component: 'ModalPhase',
        callback: () => { },
        data: {
          min: this.data.date_debut + ' ' + this.data.heure_debut,
          max: this.data.date_fin + ' ' + this.data.heure_fin,
        },
      });
    },
    removePhase(id) {
      this.$store.dispatch('removePhase', id);
    },
    editQuittance(e, id) {
      let quittances = this.quittances.filter(
        (q) => q.sapeur_id === parseInt(id)
      );
      if (quittances.length === 1) {
        //remove quittance
        this.$store.dispatch('removeQuittance', quittances[0].id);
      } else {
        //add quittance
        this.$store.dispatch('addQuittance', id);
      }
    },
    computeSapeur(id) {
      let res = {};
      let start = new Date(this.data.date_debut + ' ' + this.data.heure_debut);
      start.setMinutes(0)

      this.presences
        .filter((s) => s.sapeur_id === id)
        .forEach((q) => {
          // Offset calculé à partir de l'heure de début d'intervention arrondi
          let offset = ((new Date(q.debut) - start) / 3600000.0) * 4.0;
          // Durée de la présence en quart d'heures
          let duree = ((new Date(q.fin) - new Date(q.debut)) / 3600000.0) * 4.0;

          for (let i = 0; i < duree; ++i) {
            let code = null;
            if (q.piquet) {
              // Piquet
              code = 3;
            } else {
              // DetectPhase
              let currentDate = new Date(q.debut);
              currentDate.setMinutes(currentDate.getMinutes() + i * 15);
              code = this.getPhaseTypeAt(currentDate);
            }
            res = {
              ...res,
              [offset + i]: code,
            };
          }
        });
      return res;
    },
    getPhaseTypeAt(date) {
      let res = this.phases
        .filter((p) => new Date(p.debut) <= date)
        .sort((d1, d2) => new Date(d1.debut) < new Date(d2.debut));
      if (res.length > 0) {
        return res[0].phase_type_id;
      }
      return 1;
    },
    expandSap(id) {
      this.toggles = {
        ...this.toggles,
        [id]: !this.toggles[id],
      };
    },
    sortedPresences(id) {
      return this.presences
        .filter((p) => p.sapeur_id === id)
        .sort((p1, p2) => new Date(p1.debut) > new Date(p2.debut));
    },
  },
};
</script>

<style scoped>
.no-wrap {
  white-space: nowrap;
}

.badge-wrapper {
  font-size: 16px;
  margin-bottom: 1rem;
}

.table-wrapper {
  overflow-x: scroll;
  overflow-y: visible;
  position: relative;
}

td,
th {
  padding: 5px 20px;
  width: 100px;
}

th:first-child {
  position: relative;
  left: 5px;
}
</style>
