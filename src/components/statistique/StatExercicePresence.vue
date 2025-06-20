<script setup>
import { computed, ref, watchEffect } from 'vue';
import { useStore } from 'vuex';

const store = useStore();

store.dispatch('fetchLocalites');
store.dispatch('fetchFonctions');
store.dispatch('fetchListeSapeur');
store.dispatch('fetchExcuseTypes');
store.dispatch('fetchExerciceCategories');
await store.dispatch('fetchExercicesComptables');

const loading = ref(true);
watchEffect(async () => {
  loading.value = true;
  await store.dispatch(
    'fetchListeExercice',
    store.state.exerciceComptable.activeId,
  );
  store.dispatch(
    'fetchStatistiquePresenceExercice',
    store.state.exerciceComptable.activeId,
  );
  loading.value = false;
});

const selectedSapeurId = ref(null);
const unselectedCategories = ref([]);
const unselectedSapeurDe = ref([]);
const unselectedExerciceA = ref([]);

const sapeurs = computed(() => store.state.sapeur.liste);
const indexedSapeursLocaliteId = computed(() =>
  store.state.sapeur.liste.reduce((map, e) => {
    map.set(e.id, e.localite_id);
    return map;
  }, new Map()),
);
const fonctions = computed(() => store.state.fonction.liste);
const exercices = computed(() =>
  store.state.exercice.liste.sort(
    (a, b) => new Date(a.date) - new Date(b.date),
  ),
);
const indexedExercices = computed(() =>
  store.state.exercice.liste.reduce((map, e) => {
    map.set(e.id, e);
    return map;
  }, new Map()),
);
const categories = computed(() => store.state.exerciceCategorie.liste);
const presences = computed(() =>
  store.state.statistique.presencesExercice.map((e) => ({
    ...e,
    sapeur_id: parseInt(e.sapeur_id),
    exercice_id: parseInt(e.exercice_id),
    convoque: parseInt(e.convoque),
    present: parseInt(e.present),
    absent: parseInt(e.absent),
    remplace: parseInt(e.remplace),
    excuse_type_id: parseInt(e.excuse_type_id),
    excuse_statut: parseInt(e.excuse_statut),
  })),
);
const excuses = computed(() => store.state.excuseType.liste);
const localites = computed(() =>
  store.state.localite.liste.sort((a, b) =>
    a.designation.localeCompare(b.designation),
  ),
);
const localiteExercices = computed(() => {
  const loc = new Set(exercices.value.map((e) => e.localite_id));
  return localites.value.filter((l) => loc.has(l.id));
});
const localiteSapeurs = computed(() => {
  const loc = new Set(sapeurs.value.map((e) => e.localite_id));
  return localites.value.filter((l) => loc.has(l.id));
});
const categorieExercices = computed(() => {
  const cat = new Set(exercices.value.map((e) => e.exercice_categorie_id));
  return categories.value.filter((c) => cat.has(c.id));
});
const filteredSapeurs = computed(() => {
  const sapeurIds = new Set(presences.value.map((s) => s.sapeur_id));
  return sapeurs.value.filter((s) => sapeurIds.has(s.id));
});
const displayExercice = computed(() => {
  const unselectedCat = new Set(unselectedCategories.value);
  const unselectedLoc = new Set(unselectedExerciceA.value);
  return exercices.value.filter(
    (e) =>
      !unselectedCat.has(e.exercice_categorie_id) &&
      !unselectedLoc.has(e.localite_id),
  );
});

const computeStats = (presences) => {
  const stats = presences
    .map((p) => [
      p.convoque ? 1 : 0,
      p.present ? 1 : 0,
      p.absent ? 1 : 0,
      p.remplace ? 1 : 0,
      p.excuse_type_id ? 1 : 0,
      p.excuse_statut === -2 ? 1 : 0,
    ])
    .reduce(
      (accumulator, p) => accumulator.map((v, i) => v + p[i]),
      [0, 0, 0, 0, 0],
    );
  return {
    convoque: stats[0],
    present: stats[1],
    absent: stats[2],
    remplace: stats[3],
    excuse: stats[4],
    amende: stats[5],
  };
};
const computedData = computed(() => {
  const unselectedLocaliteSapeur = new Set(unselectedSapeurDe.value);
  const unselectedLocaliteExercice = new Set(unselectedExerciceA.value);
  const unselectedExerciceCategorie = new Set(unselectedCategories.value);

  const filteredPresences = presences.value.filter((p) => {
    const exercice = indexedExercices.value.get(p.exercice_id);
    return (
      !unselectedLocaliteExercice.has(exercice?.localite_id) &&
      !unselectedExerciceCategorie.has(exercice?.exercice_categorie_id) &&
      !unselectedLocaliteSapeur.has(
        indexedSapeursLocaliteId.value.get(p.sapeur_id),
      )
    );
  });
  const sapeurIndexedPresence = filteredPresences.reduce((map, e) => {
    const sapeurList = map[e.sapeur_id] || [];
    map[e.sapeur_id] = [...sapeurList, e];
    return map;
  }, {});

  const sapeurExerciceIndexedPresence = filteredPresences.reduce((map, e) => {
    const sapeurMap = map.get(e.sapeur_id) || new Map();
    sapeurMap.set(e.exercice_id, e);
    map.set(e.sapeur_id, sapeurMap);
    return map;
  }, new Map());

  return filteredSapeurs.value
    .filter((s) => !unselectedLocaliteSapeur.has(s.localite_id))
    .map((s) => ({
      ...s,
      presences: displayExercice.value.map((e) =>
        sapeurExerciceIndexedPresence.get(s.id)?.get(e.id),
      ),
      stats: computeStats(sapeurIndexedPresence[s.id] || []),
      temp: sapeurIndexedPresence[s.id] || [],
      localite: localites.value.find((l) => l.id == s.localiteId)?.designation,
      fonction: fonctions.value.find((f) => f.id == s.fonction_id)?.nom || '-',
    }));
});

const computedStats = computed(() => {
  const unselectedLocaliteSapeur = new Set(unselectedSapeurDe.value);
  const unselectedLocaliteExercice = new Set(unselectedExerciceA.value);
  const unselectedExerciceCategorie = new Set(unselectedCategories.value);

  return computeStats(
    presences.value?.filter((p) => {
      const exercice = indexedExercices.value.get(p.exercice_id);
      return (
        !unselectedLocaliteExercice.has(exercice?.localite_id) &&
        !unselectedExerciceCategorie.has(exercice?.exercice_categorie_id) &&
        !unselectedLocaliteSapeur.has(
          indexedSapeursLocaliteId.value.get(p.sapeur_id),
        )
      );
    }),
  );
});

const formatPresence = (presence) => {
  if (!presence) {
    return '';
  }
  if (presence.present) {
    return '✓';
  }
  if (presence.remplace) {
    return 'Rpl';
  }
  if (presence.excuse_type_id) {
    const excuse = excuses.value.find((e) => e.id == presence.excuse_type_id);
    return excuse?.abreviation;
  }
  return '✕';
};
const formatPresenceExport = (presence) => {
  if (!presence) {
    return '';
  }
  let prefix = '';
  if (!presence.convoque) {
    prefix = 'A';
  }
  if (presence.present) {
    return prefix + 'Présent';
  }
  if (presence.remplace) {
    return prefix + 'Remplacé';
  }
  if (presence.excuse_type_id) {
    const excuse = excuses.value.find((e) => e.id == presence.excuse_type_id);
    return prefix + excuse?.designation;
  }
  return prefix + '-';
};
const formatPresenceClass = (presence) => {
  if (!presence) {
    return '';
  }
  if (presence.excuse_statut == 1 || presence.present || presence.remplace) {
    return 'text-bg-success';
  }
  if (presence.excuse_statut == -2) {
    return 'text-bg-danger';
  }
  if (presence.excuse_statut == -1) {
    return 'text-bg-warning';
  }
  if (presence.excuse_statut == 0) {
    return 'text-bg-secondary';
  }
  if (presence.remplace || presence.statut == 1) {
    return 'text-bg-success';
  }
};
const toCvs = () => {
  // TODO: Migrate to BaseTable and remove duplicates
  const data =
    'data:text/csv;charset=utf-8,\ufeff' +
    [
      'Sapeur',
      'Localité',
      'Fonction',
      ...displayExercice.value.map((e) => e.designation),
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
      ...displayExercice.value.map((e) =>
        new Date(e.date).toLocaleDateString('fr-CH'),
      ),
      '',
      '',
      '',
      '',
      '',
    ].join(';') +
    '\n' +
    computedData.value
      .map((s) =>
        [
          s.nom_prenom,
          s.localite,
          s.fonction,
          ...s.presences.map((p) => formatPresenceExport(p)),
          s.stats.convoque,
          s.stats.present,
          s.stats.absent,
          s.stats.remplace,
          s.stats.excuse,
          s.stats.amende,
        ].join(';'),
      )
      .join('\n') +
    '\n' +
    [
      `Total : ${exercices.value.length}`,
      '',
      '',
      ...displayExercice.value.map(() => ''),
      computedStats.value.convoque,
      computedStats.value.present,
      computedStats.value.absent,
      computedStats.value.remplace,
      computedStats.value.excuse,
      computedStats.value.amende,
    ].join(';');

  // V2
  var encodedUri = encodeURI(data);
  var link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', 'statistiques_presences.csv');
  document.body.appendChild(link); // Required for FF

  link.click();
};
</script>

<template>
  <div class="row">
    <div class="col-12 col-xl-6 mb-3">
      <div class="card card-primary card-outline">
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
    <div class="col-12 col-xl-6 mb-3">
      <div class="card card-primary card-outline">
        <div class="card-header d-flex justify-content-between">
          <h4>Légende</h4>
        </div>
        <div id="legend-container" class="d-flex mt-2">
          <div class="col-6">
            <table class="table table-sm">
              <tr>
                <td>
                  <span class="badge rouded-pill text-bg-danger">Amendée</span>
                </td>
              </tr>
              <tr>
                <td>
                  <span class="badge rouded-pill text-bg-warning">Refusée</span>
                </td>
              </tr>
              <tr>
                <td>
                  <span class="badge rouded-pill text-bg-secondary"
                    >A traiter</span
                  >
                </td>
              </tr>
              <tr>
                <td>
                  <span class="badge rouded-pill text-bg-success"
                    >Acceptée</span
                  >
                </td>
              </tr>
            </table>
          </div>
          <div id="legend-excuse" class="col-6">
            <table class="table table-sm">
              <thead>
                <tr>
                  <th>Abr</th>
                  <th>Designation</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>✓</td>
                  <td>Présent</td>
                </tr>
                <tr>
                  <td>Rpl</td>
                  <td>Remplacé</td>
                </tr>
                <tr>
                  <td>✕</td>
                  <td>Absent (non excusé)</td>
                </tr>
                <tr v-for="excuse in excuses" :key="excuse.id">
                  <td>{{ excuse.abreviation }}</td>
                  <td>Excusé, {{ excuse.designation }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    <div class="col-12 mb-3">
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
                <th v-for="e in displayExercice" :key="e.id" class="rotate">
                  <div>
                    <span
                      :class="{
                        'text-decoration-line-through text-danger':
                          e.statut === 0,
                      }"
                    >
                      {{ e.designation }}
                    </span>
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
                <th
                  v-for="e in displayExercice"
                  :key="e.id"
                  class="fs-6 fw-normal text-center ps-0 pe-0 border border-1"
                  :class="{ 'bg-danger-subtle': e.statut === 0 }"
                >
                  {{ new Date(e.date).toLocaleDateString('fr-CH').slice(0, 5) }}
                </th>
                <th class="text-center">Nb Cvq</th>
                <th class="text-center">Nb Pre</th>
                <th class="text-center">Nb Abs</th>
                <th class="text-center">Nb Rpl</th>
                <th class="text-center">Nb Exc</th>
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
                  :class="{
                    'bg-danger-subtle': displayExercice[index].statut === 0,
                  }"
                >
                  <span
                    class="badge rouded-pill"
                    :class="formatPresenceClass(p)"
                    ><font-awesome-icon
                      v-if="p && !p.convoque"
                      v-tooltip.bottom="'Pour information'"
                      class="me-1"
                      :icon="['fas', 'info-circle']"
                    />{{ formatPresence(p) }}</span
                  >
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
