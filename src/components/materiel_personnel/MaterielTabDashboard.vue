<template>
  <div class="row">
    <div class="col-3">
      <div class="card card-primary card-outline mb-2 table-responsive">
        <div class="card-header">
          <h5>Filtre matériel type</h5>
        </div>
        <materiel-type-categorie-select @change="selectedTypes" />
      </div>
    </div>
    <div class="col-9">
      <div class="row">
        <div class="col-md-12">
          <div class="card card-primary card-outline mb-2">
            <div class="card-header d-flex justify-content-between">
              <h5>Filtres</h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-4">
                  <select
                    class="form-select form-select-sm"
                    @change="
                      (event) => onFilter('localite_id', event.target.value)
                    "
                  >
                    <option>&lt;Localité&gt;</option>
                    <option
                      v-for="loc in filteredLocalites"
                      :key="loc.id"
                      :value="loc.id"
                    >
                      {{ loc.designation }}
                    </option>
                  </select>
                </div>
                <div class="col-md-4">
                  <select
                    class="form-select form-select-sm"
                    @change="
                      (event) =>
                        onFilter(
                          'fonctions',
                          parseInt(event.target.value)
                            ? (fonctions) =>
                                fonctions.find(
                                  (f) => f.fonction_id == event.target.value
                                ) != undefined
                            : null
                        )
                    "
                  >
                    <option>&lt;Fonction&gt;</option>
                    <option
                      v-for="f in filteredFonctions"
                      :key="f.id"
                      :value="f.id"
                    >
                      {{ f.nom }}
                    </option>
                  </select>
                </div>
                <div class="col-md-4">
                  <select
                    class="form-select form-select-sm"
                    @change="
                      (event) => onFilter('grade_id', event.target.value)
                    "
                  >
                    <option>&lt;Grade&gt;</option>
                    <option
                      v-for="f in filteredGrades"
                      :key="f.id"
                      :value="f.id"
                    >
                      {{ f.designation }}
                    </option>
                  </select>
                </div>
                <div class="col-md-4">
                  <select
                    class="form-select form-select-sm"
                    @change="
                      (event) =>
                        onFilter(
                          'groupes',
                          parseInt(event.target.value)
                            ? (groupes) =>
                                groupes.find(
                                  (f) => f.groupe_id == event.target.value
                                ) != undefined
                            : undefined
                        )
                    "
                  >
                    <option :value="undefined">&lt;Groupe&gt;</option>
                    <option
                      v-for="f in filteredGroupes"
                      :key="f.id"
                      :value="f.id"
                    >
                      {{ (f.no ? f.no + ' ' : '') + f.designation }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-6">
          <materiel-alertes />
        </div>
        <div class="col-6">
          <materiel-a-recuperer />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import permissions from '@/store/permissions.js';

import MaterielARecuperer from '@/components/materiel_personnel/MaterielARecuperer.vue';
import MaterielAlertes from '@/components/materiel_personnel/MaterielAlertes.vue';
import SapeurService from '../../services/SapeurService.js';
import MaterielTypeCategorieSelect from '@/components/materiel_personnel/MaterielTypeCategorieSelect.vue';

export default {
  name: 'PageMaterielPersonnel',
  components: {
    MaterielARecuperer,
    MaterielAlertes,
    MaterielTypeCategorieSelect,
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
      fieldsBase: [
        {
          title: 'Nom Prénom',
          key: 'nom_prenom',
          sortKey: 'nom_prenom',
        },
        {
          title: 'Fonction principale',
          key: 'fonction',
          sortKey: 'fonction_tri',
        },
        {
          title: 'Localité',
          key: 'localite',
          sortKey: 'localite',
        },
        {
          title: 'PAR',
          key: 'porteur',
          sortKey: 'porteur',
          slot: 'checkbox',
          titleClass: 'text-center',
          columnClass: 'align-middle text-center',
        },
        {
          title: 'B',
          key: 'b',
          sortKey: 'b',
          slot: 'checkbox',
          titleClass: 'text-center',
          columnClass: 'align-middle text-center',
        },
        {
          title: 'C1',
          key: 'c1',
          sortKey: 'c1',
          slot: 'checkbox',
          titleClass: 'text-center',
          columnClass: 'align-middle text-center',
        },
        {
          title: 'C1 118',
          key: 'c1_118',
          sortKey: 'c1_118',
          slot: 'checkbox',
          titleClass: 'text-center',
          columnClass: 'align-middle text-center',
        },
        {
          title: 'Grade',
          key: 'grade',
          sortKey: 'grade_tri',
        },
        {
          title: 'Groupes',
          key: 'formatedGroupes',
          sortKey: 'formatedGroupes',
        },
        {
          title: 'Tel n°1',
          key: 'tels',
          formatter: (t) => (t.length >= 1 ? t[0] : ''),
        },
        {
          title: 'Tel n°2',
          key: 'tels',
          formatter: (t) => (t.length >= 2 ? t[1] : ''),
        },
        {
          title: 'Tel n°3',
          key: 'tels',
          formatter: (t) => (t.length >= 3 ? t[2] : ''),
        },
        {
          title: 'Naissance',
          key: 'date_naissance',
          sortKey: 'date_naissance',
          formatter(value) {
            return new Date(value).toLocaleDateString();
          },
        },
        {
          title: 'Actions',
          key: 'actions',
          slot: 'actions',
          titleClass: 'align-middle text-center',
          columnClass: 'align-middle text-center',
        },
      ],
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
