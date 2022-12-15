<template>
  <div class="row">
    <div class="col-6">
      <materiel-alertes />
    </div>
    <div class="col-6">
      <materiel-a-recuperer />
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import permissions from '@/store/permissions.js';

import MaterielARecuperer from '@/components/materiel_personnel/MaterielARecuperer.vue';
import MaterielAlertes from '@/components/materiel_personnel/MaterielAlertes.vue';
import SapeurService from '../../services/SapeurService.js';
import store from '@/store/index';

async function loadData(routeTo, next) {
  let loadMaterielARecuperer = store.dispatch('fetchMatPersoARecuperer');
  let loadMaterielAlertes = store.dispatch('fetchMatPersoAlertes');

  Promise.all([loadMaterielARecuperer, loadMaterielAlertes]).then(() => {
    next();
  });
}

export default {
  name: 'PageMaterielPersonnel',
  components: {
    MaterielARecuperer,
    MaterielAlertes,
  },
  beforeRouteEnter(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  data() {
    return {
      selectedIds: {
        type: {},
        categorie: {},
      },
      loading: true,
      selectedId: null,
      filters: {},
      sapeurs: [],
    };
  },
  computed: {
    ...mapState({
      categories: (state) =>
        state.matPersoCategorie.liste.sort(
          (a, b) => a.designation - b.designation
        ),
      types: (state) =>
        state.matPersoType.liste.sort((a, b) => a.designation - b.designation),
      localites: (state) =>
        state.localite.liste.sort((a, b) =>
          a.designation.localeCompare(b.designation)
        ),
      groupes: (state) => state.groupe.liste,
      fonctions: (state) => state.fonction.liste,
      grades: (state) => state.grade.liste,
      hasSapeurModificationPermission: (state) =>
        state.auth.admin ||
        state.auth.sis.permissions.includes(permissions.SAPEUR.MODIFICATION),
    }),
    computedCategories() {
      let indexedTypes = {};
      this.types.forEach((t) => {
        if (!indexedTypes[t.materiel_categorie_id])
          indexedTypes[t.materiel_categorie_id] = [t];
        else indexedTypes[t.materiel_categorie_id].push(t);
      });
      let indexedCategories = {};
      this.categories.forEach((c) => {
        if (!indexedCategories[c.pere_id]) indexedCategories[c.pere_id] = [c];
        else indexedCategories[c.pere_id].push(c);
      });

      let data = [];

      const recursive = (categories, level) => {
        categories.forEach((c) => {
          data.push({
            ...c,
            globalId: 'c' + c.id,
            type: 'categorie',
            level: level,
            tag: 'tag',
          });

          if (indexedCategories[c.id])
            recursive(indexedCategories[c.id], level + 1);

          indexedTypes[c.id]?.forEach((t) => {
            data.push({
              ...t,
              globalId: 't' + t.id,
              type: 'type',
              level: level + 1,
              tag: 'shirt',
            });
          });
        });
      };

      recursive(
        this.categories.filter((c) => !c.pere_id),
        0
      );
      return data;
    },
    computedData() {
      return [];
    },
    filteredLocalites() {
      const ids = new Set(this.sapeurs.map((s) => parseInt(s.localite_id)));
      return this.localites.filter((t) => ids.has(t.id));
    },
    filteredFonctions() {
      const ids = new Set(
        this.sapeurs
          .map((s) => s.fonctions.map((f) => f.fonction_id))
          .reduce((acc, e) => [...acc, ...e], [])
      );
      return this.fonctions.filter((e) => ids.has(e.id));
    },
    filteredGrades() {
      const ids = new Set(this.sapeurs.map((s) => parseInt(s.grade_id)));
      return this.grades.filter((t) => ids.has(t.id));
    },
    filteredGroupes() {
      const ids = new Set(
        this.sapeurs
          .map((s) => s.groupes.map((f) => f.groupe_id))
          .reduce((acc, e) => [...acc, ...e], [])
      );
      return this.groupes.filter((t) => ids.has(t.id));
    },
    filteredSapeurs() {
      return this.computedData.filter(
        Object.entries(this.filters)
          .filter(([, val]) => val && (val >= 0 || typeof val == 'function'))
          .map(([key, value]) => {
            if (typeof value == 'function') {
              return (x) => value(x[key]);
            } else {
              return (x) => x[key] == value;
            }
          })
          .reduce(
            (f, g) => (x) => f(x) && g(x),
            () => true
          )
      );
    },
  },
  beforeMount() {
    SapeurService.getEffectif().then((effectif) => {
      this.sapeurs = effectif;
    });
  },
  mounted() {
    this.loading = false;
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    selectSapeur(id) {
      this.selectedId = id;
    },
    selectedTypes(selectedIds) {
      this.selectedIds = selectedIds;
    },
    onFilter(key, value) {
      this.filters = { ...this.filters, [key]: value };
    },
  },
};
</script>

<style>
table button.btn {
  padding-top: 0;
  padding-bottom: 0;
}

table a.btn {
  padding-top: 0;
  padding-bottom: 0;
}

.m-td-0 > td {
  padding: 0 !important;
}
</style>
