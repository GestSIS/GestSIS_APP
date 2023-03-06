<template>
  <div class="row">
    <div class="col-12 col-xl-6">
      <div class="card card-primary card-outline mb-2">
        <div class="card-header d-flex justify-content-between">
          <h4>Filtres</h4>
        </div>
        <form class="card-body p-2 pb-0">
          <div class="row">
            <base-multi-unselect
              v-model="unselectedCategories"
              class="col-md-4"
              label="Catégorie :"
              :options="categorieExercices"
            />
            <base-multi-unselect
              v-model="unselectedSapeurDe"
              class="col-md-4"
              label="Sapeur de :"
              :options="localiteSapeurs"
            />
            <base-multi-unselect
              v-model="unselectedExerciceA"
              class="col-md-4"
              label="Exercice à :"
              :options="localiteExercices"
            />
          </div>
        </form>
      </div>
    </div>
    <div class="col-12 col-xl-6">
      <div class="card card-primary card-outline mb-2">
        <div class="card-header d-flex justify-content-between">
          <h4>Légende</h4>
        </div>
        <div id="legend-container" class="d-flex mt-2">
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
          <div id="legend-excuse" class="col-6">
            <table class="table table-sm">
              <thead>
                <tr>
                  <th>Abr</th>
                  <th>Excuse</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="excuse in excuses" :key="excuse.id">
                  <td>{{ excuse.abreviation }}</td>
                  <td>{{ excuse.designation }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    <div class="col-12">
      <div class="card card-primary card-outline">
        <div class="card-header d-flex justify-content-between">
          <h3>Stats Présences aux exercices</h3>
        </div>
        <div>
          <table class="table table-sm table-header-rotated">
            <thead>
              <tr>
                <th></th>
                <th></th>
                <th></th>
                <!-- <th class="text-center">Groupes</th> -->
                <th v-for="e in displayExercice" :key="e.id" class="rotate">
                  <div>
                    <span>{{ e.designation }}</span>
                  </div>
                </th>
                <th></th>
                <th></th>
                <th></th>
                <th></th>
                <th></th>
              </tr>
            </thead>
            <thead class="table-bordered">
              <tr>
                <th>Sapeur</th>
                <th>Localité</th>
                <th>Fonction</th>
                <!-- <th class="text-center">Groupes</th> -->
                <th
                  v-for="e in displayExercice"
                  :key="e.id"
                  class="fs-6 fw-normal text-center ps-0 pe-0 border border-1"
                >
                  {{ new Date(e.date).toLocaleDateString('fr-CH').slice(0, 5) }}
                </th>
                <th class="text-center">Nb Cvq</th>
                <th class="text-center">Nb Pre</th>
                <th class="text-center">Nb Abs</th>
                <th class="text-center">Nb Rpl</th>
                <th class="text-center">Nb Exc</th>
                <th class="text-center">Nb Abs</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td
                  v-if="!computedData.length"
                  :colspan="displayExercice.length + 8"
                >
                  Aucun sapeur à afficher
                </td>
              </tr>
              <tr
                v-for="s in computedData"
                :key="s.id"
                :class="{ 'table-primary': selectedSapeurId == s.id }"
                @click="selectedSapeurId = s.id"
              >
                <td>{{ s.nom_prenom }}</td>
                <td>{{ s.localite }}</td>
                <td>{{ s.fonction }}</td>
                <td
                  v-for="(p, index) in s.presences"
                  :key="index"
                  class="text-center table-border"
                  :class="formatPresenceClass(p)"
                >
                  {{ formatPresence(p) }}
                </td>
                <td class="text-center">{{ s.stats.convoque }}</td>
                <td class="text-center">{{ s.stats.present }}</td>
                <td class="text-center">{{ s.stats.absent }}</td>
                <td class="text-center">{{ s.stats.remplace }}</td>
                <td class="text-center">{{ s.stats.excuse }}</td>
                <td class="text-center">{{ s.stats.amende }}</td>
              </tr>
            </tbody>
            <thead>
              <tr>
                <th colspan="3">Total : {{ exercices.length }}</th>
                <th
                  v-if="displayExercice.length"
                  :colspan="displayExercice.length"
                ></th>
                <th class="text-center">{{ computedStats.convoque }}</th>
                <th class="text-center">{{ computedStats.present }}</th>
                <th class="text-center">{{ computedStats.absent }}</th>
                <th class="text-center">{{ computedStats.remplace }}</th>
                <th class="text-center">{{ computedStats.excuse }}</th>
                <th class="text-center">{{ computedStats.amende }}</th>
              </tr>
            </thead>
          </table>
          <div class="d-grid gap-2 d-md-block m-2">
            <button class="btn" title="Export CSV" @click="toCvs">
              <font-awesome-icon :icon="['fas', 'file-csv']" size="xl" />
            </button>
          </div>
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
import ExerciceService from '../../services/ExerciceService';
import store from '/src/store/index';

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
    store.dispatch('fetchListeExercice');
    store.dispatch('fetchStatistiquePresence');
    next();
  });
}

export default {
  name: 'StatExercicePresences',
  beforeRouteEnter(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  data() {
    return {
      selectedSapeurId: null,
      unselectedCategories: [],
      unselectedSapeurDe: [],
      unselectedExerciceA: [],
    };
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
      presences: (state) =>
        state.statistique.presences.map((e) => ({
          ...e,
          sapeur_id: parseInt(e.sapeur_id),
          exercice_id: parseInt(e.exercice_id),
          convoque: parseInt(e.convoque),
          present: parseInt(e.present),
          absent: parseInt(e.absent),
          remplace: parseInt(e.remplace),
          excuse_type_id: parseInt(e.excuse_type_id),
          amende: parseInt(e.amende),
        })),
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
          localite: this.localites.find((l) => l.id == s.localiteId)
            ?.designation,
          fonction:
            this.fonctions.find((f) => f.id == s.fonction_id)?.nom || '-',
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
  watch: {
    activeExerciceComptableId() {
      this.$store.dispatch('fetchListeExercice');
      this.$store.dispatch('fetchStatistiquePresence').then();
    },
  },
  mounted() {
    loadData('', () => {});
  },
  methods: {
    computeStats(presences) {
      const stats = presences
        .map((p) => [
          p.convoque ? 1 : 0,
          p.present ? 1 : 0,
          p.absent ? 1 : 0,
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
        absent: stats[2],
        remplace: stats[3],
        excuse: stats[4],
        amende: stats[5],
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
    formatPresenceExport(presence) {
      if (!presence) {
        return '';
      }
      let prefix = '';
      if (!presence.convoque) {
        prefix = 'Pour information';
      }
      if (presence.present) {
        return prefix + 'Présent';
      }
      if (presence.remplace) {
        return prefix + 'Remplacé';
      }
      if (presence.excuse_type_id) {
        const excuse = this.excuses.find(
          (e) => e.id == presence.excuse_type_id
        );
        return prefix + excuse?.designation;
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
    toCvs() {
      // TODO: Migrate to BaseTable and remove duplicates
      const data =
        'data:text/csv;charset=utf-8,\ufeff' +
        [
          'Sapeur',
          'Localité',
          'Fonction',
          ...this.displayExercice.map((e) => e.designation),
          'Nombre Convoqué',
          'Nombre Présent',
          'Nombre Remplacé',
          'Nombre excusé',
          'Nombre absent',
        ].join(';') +
        '\n' +
        [
          '',
          '',
          '',
          ...this.displayExercice.map((e) =>
            new Date(e.date).toLocaleDateString('fr-CH')
          ),
          '',
          '',
          '',
          '',
          '',
        ].join(';') +
        '\n' +
        this.computedData
          .map((s) =>
            [
              s.nom_prenom,
              s.localite,
              s.fonction,
              ...s.presences.map((p) => this.formatPresenceExport(p)),
              s.stats.convoque,
              s.stats.present,
              s.stats.absent,
              s.stats.remplace,
              s.stats.excuse,
              s.stats.amende,
            ].join(';')
          )
          .join('\n') +
        '\n' +
        [
          `Total : ${this.exercices.length}`,
          '',
          '',
          ...this.displayExercice.map(() => ''),
          this.computedStats.convoque,
          this.computedStats.present,
          this.computedStats.absent,
          this.computedStats.remplace,
          this.computedStats.excuse,
          this.computedStats.amende,
        ].join(';');

      // V2
      var encodedUri = encodeURI(data);
      var link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', 'statistiques_presences.csv');
      document.body.appendChild(link); // Required for FF

      link.click();
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

.table-header-rotated {
  border-collapse: collapse;
}

.table-header-rotated th.rotate {
  height: 250px;
  min-width: 40px;
  white-space: nowrap;
}

.table-header-rotated th {
  white-space: nowrap;
}

.table-border {
  border-width: 1px;
}

.table-header-rotated th.rotate > div {
  -webkit-transform: translate(25px, 1px) rotate(315deg);
  -ms-transform: translate(25px, 1px) rotate(315deg);
  transform: translate(25px, 1px) rotate(315deg);
  width: 10px;
}

.table-header-rotated th.rotate > div > span {
  border-bottom: 1px solid #000;
  padding: 5px 10px 5px 0px;
}

.table-header-rotated th.row-header {
  padding: 0 10px;
  border-bottom: 1px solid #ccc;
}

thead {
  position: sticky;
  top: 0;
  z-index: 12;
  background-color: white;
}
</style>
