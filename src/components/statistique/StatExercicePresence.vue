<template>
  <div class="row">
    <div class="col-12 col-xl-6">
      <!-- /.card-header -->
      <div class="card card-primary card-outline mb-2">
        <div class="card-header d-flex justify-content-between">
          <h4>Filtres</h4>
        </div>
        <form class="card-body p-2 pb-0">
          <div class="row">
            <base-multi-unselect class="col-md-4" label="Catégorie :" valueKey="id" displayKey="designation"
              :options="categorieExercices" v-model="unselectedCategories" />
            <base-multi-unselect class="col-md-4" label="Sapeur de :" valueKey="id" displayKey="designation"
              :options="localiteSapeurs" v-model="unselectedSapeurDe" />
            <base-multi-unselect class="col-md-4" label="Exercice à :" valueKey="id" displayKey="designation"
              :options="localiteExercices" v-model="unselectedExerciceA" />
          </div>
        </form>
      </div>
    </div>
    <div class="col-12 col-xl-6">
      <!-- /.card-header -->
      <div class="card card-primary card-outline mb-2">
        <div class="card-header d-flex justify-content-between">
          <h4>Légende</h4>
        </div>
        <div class="d-flex mt-2" id="legend-container">
          <div class="col-6">
            <table class="table table-sm">
              <tr>
                <td class="table-danger">Amende</td>
              </tr>
              <tr>
                <td class="table-secondary">Pour information</td>
              </tr>
              <tr>
                <td class="table-primary">Remplacé</td>
              </tr>
              <tr>
                <td class="table-success">Excusé</td>
              </tr>
            </table>
          </div>
          <div class="col-6" id="legend-excuse">
            <table class="table table-sm">
              <tr>
                <th>Abr</th>
                <th>Excuse</th>
              </tr>
              <tr v-for="excuse in excuses" :key="excuse.id">
                <td>{{ excuse.abreviation }}</td>
                <td>{{ excuse.designation }}</td>
              </tr>
            </table>
          </div>
        </div>
      </div>
    </div>
    <div class="col-12">
      <!-- /.card-header -->
      <div class="card card-primary card-outline mb-5">
        <div class="card-header d-flex justify-content-between">
          <h3>Stats Présences aux exercices</h3>
        </div>
        <div class="table-responsive">
          <table class="table table-sm">
            <thead>
              <tr>
                <th>Sapeur</th>
                <th>Localité</th>
                <th>Fonction</th>
                <!-- <th class="text-center">Groupes</th> -->
                <th v-for="(e, index) in displayExercice" :key="e.id" class="text-center">
                  {{ index + 1 }}
                </th>
                <th>Nb Cvq</th>
                <th>Nb Pre</th>
                <th>Nb Rpl</th>
                <th>Nb Exc</th>
                <th>Nb Abs</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td v-if="!computedData.length" :colspan="displayExercice.length + 8">
                  Aucun sapeur à afficher
                </td>
              </tr>
              <tr v-for="s in computedData" :key="s.id">
                <td>{{ s.nom }} {{ s.prenom }}</td>
                <td>{{ formatLocalite(s.localite_id) }}</td>
                <td>{{ formatFonction(s.fonction_id) }}</td>
                <td v-for="(p, index) in s.presences" :key="index" class="text-center" :class="formatPresenceClass(p)">
                  {{ formatPresence(p) }}
                </td>
                <td class="text-center">{{ s.stats.convoque }}</td>
                <td class="text-center">{{ s.stats.present }}</td>
                <td class="text-center">{{ s.stats.remplace }}</td>
                <td class="text-center">{{ s.stats.excuse }}</td>
                <td class="text-center">{{ s.stats.amende }}</td>
              </tr>
            </tbody>
            <thead>
              <tr>
                <th colspan="3">Total : {{ exercices.length }}</th>
                <th v-if="displayExercice.length" :colspan="displayExercice.length"></th>
                <th class="text-center">{{ computedStats.convoque }}</th>
                <th class="text-center">{{ computedStats.present }}</th>
                <th class="text-center">{{ computedStats.remplace }}</th>
                <th class="text-center">{{ computedStats.excuse }}</th>
                <th class="text-center">{{ computedStats.amende }}</th>
              </tr>
            </thead>
          </table>
          <!-- <h4>TODO:</h4>
          <ul>
            <li>Exporter dans Excel</li>
            <li>Graphique d'un simple tableau</li>
          </ul>-->
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import store from '@/store/index';

async function loadData(_, next) {
  const loadLocalites = store.dispatch('fetchLocalites');
  const loadFonctions = store.dispatch('fetchFonctions');
  const loadSapeurs = store.dispatch('fetchListeSapeur');
  const loadExcuses = store.dispatch('fetchExcuseTypes');
  const loadCategories = store.dispatch('fetchExerciceCategories');
  const loadExercicesComptables = store.dispatch('fetchExercicesComptables');

  Promise.all([
    loadLocalites,
    loadFonctions,
    loadSapeurs,
    loadExcuses,
    // loadExercies,
    loadCategories,
    // loadPresences,
    loadExercicesComptables,
  ]).then(() => {
    const loadExercies = store.dispatch('fetchListeExercice');
    store.dispatch('fetchStatistiquePresence');
    next();
  });
}

export default {
  name: 'stat-exercice-presences',
  data() {
    return {
      unselectedCategories: [],
      unselectedSapeurDe: [],
      unselectedExerciceA: [],
    };
  },
  beforeRouteEnter(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  mounted() {
    loadData("", () => { });
  },
  watch: {
    activeExerciceComptableId(newValue, _) {
      this.$store.dispatch('fetchListeExercice');
      this.$store.dispatch('fetchStatistiquePresence').then();
    },
  },
  computed: {
    ...mapState({
      sapeurs: (state) => state.sapeur.liste,
      indexedSapeursLocaliteId: (state) =>
        state.sapeur.liste.reduce((map, e) => {
          map.set(e.id, e.localite_id);
          return map;
        }, new Map()),
      fonctions: (state) => state.fonction.liste,
      localites: (state) => state.localites.liste,
      exercices: (state) =>
        state.exercice.liste.sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        ),
      indexedExercices: (state) =>
        state.exercice.liste.reduce((map, e) => {
          map.set(e.id, e);
          return map;
        }, new Map()),
      categories: (state) => state.exerciceCategorie.liste,
      presences: (state) => state.statistique.presences,
      excuses: (state) => state.excuseType.liste,
      localites: (state) =>
        state.localite.liste.sort((a, b) =>
          a.designation.localeCompare(b.designation)
        ),
      activeExerciceComptableId: (state) => state.exerciceComptable.activeId,
    }),
    localiteExercices() {
      const localites = new Set(this.exercices.map((e) => e.localite_id));
      return this.localites.filter((l) => localites.has(l.id));
    },
    localiteSapeurs() {
      const localites = new Set(this.sapeurs.map((e) => e.localite_id));
      return this.localites.filter((l) => localites.has(l.id));
    },
    categorieExercices() {
      const categories = new Set(
        this.exercices.map((e) => e.exercice_categorie_id)
      );
      return this.categories.filter((c) => categories.has(c.id));
    },
    categoriesOccurence() {
      return this.exercices
        .map((e) => e.exercice_categorie_id)
        .reduce((prev, id) => ((prev[id] = ++prev[id] || 1), prev), {});
    },
    filteredSapeurs() {
      const sapeurIds = new Set(this.presences.map((s) => s.sapeur_id));
      return this.sapeurs.filter((s) => sapeurIds.has(s.id));
    },
    displayExercice() {
      const unselectedCategories = new Set(this.unselectedCategories);
      const unselectedLocalites = new Set(this.unselectedExerciceA);
      return this.exercices.filter(
        (e) =>
          !unselectedCategories.has(e.exercice_categorie_id) &&
          !unselectedLocalites.has(e.localite_id)
      );
    },
    computedData() {
      const unselectedLocaliteSapeur = new Set(this.unselectedSapeurDe);
      const unselectedLocaliteExercice = new Set(this.unselectedExerciceA);
      const unselectedExerciceCategorie = new Set(this.unselectedCategories);

      const filteredPresences = this.presences.filter((p) => {
        const exercice = this.indexedExercices.get(p.exercice_id);
        return (
          !unselectedLocaliteExercice.has(exercice?.localite_id) &&
          !unselectedExerciceCategorie.has(exercice?.exercice_categorie_id) &&
          !unselectedLocaliteSapeur.has(
            this.indexedSapeursLocaliteId.get(p.sapeur_id)
          )
        );
      });
      const sapeurIndexedPresence = filteredPresences.reduce((map, e) => {
        const sapeurList = map[e.sapeur_id] || [];
        map[e.sapeur_id] = [...sapeurList, e];
        return map;
      }, {});

      const sapeurExerciceIndexedPresence = filteredPresences.reduce(
        (map, e) => {
          const sapeurMap = map.get(e.sapeur_id) || new Map();
          sapeurMap.set(e.exercice_id, e);
          map.set(e.sapeur_id, sapeurMap);
          return map;
        },
        new Map()
      );

      return this.filteredSapeurs
        .filter((s) => !unselectedLocaliteSapeur.has(s.localite_id))
        .map((s) => ({
          ...s,
          presences: this.displayExercice.map((e) =>
            sapeurExerciceIndexedPresence.get(s.id)?.get(e.id)
          ),
          stats: this.computeStats(sapeurIndexedPresence[s.id] || []),
          temp: sapeurIndexedPresence[s.id] || [],
        }));
    },
    computedStats() {
      const unselectedLocaliteSapeur = new Set(this.unselectedSapeurDe);
      const unselectedLocaliteExercice = new Set(this.unselectedExerciceA);
      const unselectedExerciceCategorie = new Set(this.unselectedCategories);

      return this.computeStats(
        this.presences?.filter((p) => {
          const exercice = this.indexedExercices.get(p.exercice_id);
          return (
            !unselectedLocaliteExercice.has(exercice?.localite_id) &&
            !unselectedExerciceCategorie.has(exercice?.exercice_categorie_id) &&
            !unselectedLocaliteSapeur.has(
              this.indexedSapeursLocaliteId.get(p.sapeur_id)
            )
          );
        })
      );
    },
  },
  methods: {
    computeStats(presences) {
      const stats = presences
        .map((p) => [
          p.convoque ? 1 : 0,
          p.present ? 1 : 0,
          p.remplace ? 1 : 0,
          p.excuse_type_id ? 1 : 0,
          p.amende ? 1 : 0,
        ])
        .reduce(
          (accumulator, p) => accumulator.map((v, i) => v + p[i]),
          [0, 0, 0, 0, 0]
        );
      return {
        convoque: stats[0],
        present: stats[1],
        remplace: stats[2],
        excuse: stats[3],
        amende: stats[4],
      };
    },
    formatPresence(presence) {
      if (!presence) {
        return '';
      }
      let prefix = '';
      if (!presence.convoque) {
        prefix = 'i';
      }
      if (presence.present) {
        return prefix + 'P';
      }
      if (presence.remplace) {
        return prefix + 'Rpl';
      }
      if (presence.excuse_type_id) {
        const excuse = this.excuses.find(
          (e) => e.id == presence.excuse_type_id
        );
        return prefix + excuse?.abreviation;
      }
      return prefix + '-';
    },
    formatPresenceClass(presence) {
      if (!presence) {
        return '';
      }
      if (presence.amende) {
        return 'table-danger';
      }
      if (!presence.convoque) {
        return 'table-secondary';
      }
      if (presence.remplace) {
        return 'table-primary';
      }
      if (presence.excuse_type_id) {
        return 'table-success';
      }
    },
    formatFonction(fonctionId) {
      return this.fonctions.find((f) => f.id == fonctionId)?.nom || '-';
    },
    formatLocalite(localiteId) {
      return this.localites.find((l) => l.id == localiteId)?.designation;
    },
  },
};
</script>

<style lang="scss" scoped>
#legend-container {
  max-height: 140px;
}

#legend-excuse {
  overflow-y: scroll;
}
</style>
