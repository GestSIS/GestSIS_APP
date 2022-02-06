<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-sm-6">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb m-3">
            <li class="breadcrumb-item">
              <router-link :to="{ name: 'accueil' }">Accueil</router-link>
            </li>
            <li class="breadcrumb-item active" aria-current="page">Effectif</li>
          </ol>
        </nav>
      </div>
    </div>
    <div class="row">
      <div class="col-md-3">
        <div class="card card-primary card-outline mb-2">
          <div class="card-header d-flex justify-content-between">
            <h5>Actions</h5>
          </div>
          <form class="card-body d-grid gap-2">
            <button @click="vcard(filteredSapeurs)" class="btn btn-outline-primary">VCard tous</button>
            <a
              :disabled="filteredSapeurs.length == 0"
              :href="'mailto:?bcc=' + filteredSapeurs.map(s => s.email).filter(s => s && s != null).join(',')"
              class="btn btn-outline-primary"
            >Email groupé</a>
          </form>
        </div>
      </div>
      <div class="col-md-9">
        <div class="card card-primary card-outline mb-2">
          <div class="card-header d-flex justify-content-between">
            <h5>Filtres</h5>
          </div>
          <form class="card-body">
            <!-- <div class="row">
              <div class="col-md-4">
                <select
                  class="form-select form-select-sm"
                  id="filterLocalite"
                  @change="
                    (event) => onFilter('localite_id', event.target.value)
                  "
                >
                  <option>&lt;Localité&gt;</option>
                  <option
                    v-for="loc in filteredLocalites"
                    :key="loc.id"
                    :value="loc.id"
                  >{{ loc.designation }}</option>
                </select>
              </div>
              <div class="col-md-4">
                <select
                  class="form-select form-select-sm"
                  id="filterCategorie"
                  @change="
                    (event) =>
                      onFilter('exercice_categorie_id', event.target.value)
                  "
                >
                  <option>&lt;Catégorie&gt;</option>
                  <option
                    v-for="categorie in filteredExercicesCategories"
                    :key="categorie.id"
                    :value="categorie.id"
                  >{{ categorie.designation }}</option>
                </select>
              </div>
              <div class="col-md-4">
                <select
                  class="form-select form-select-sm"
                  id="filterStatus"
                  @change="
                    (event) => onFilter('statut', parseInt(event.target.value))
                  "
                >
                  <option value="-1">&lt;Statut&gt;</option>
                  <option value="0">Annulé</option>
                  <option value="1">Sapeurs à ajouter</option>
                  <option value="2">En attente de validation</option>
                  <option value="3">A imputer</option>
                  <option value="4">Imputée</option>
                </select>
              </div>
            </div>-->
          </form>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-md-12">
        <div class="card card-primary card-outline mb-5 table-responsive">
          <div class="card-body d-flex justify-content-center" v-if="loading">
            <div class="spinner-border" role="status">
              <span class="sr-only">Chargement...</span>
            </div>
          </div>
          <base-table
            v-show="!loading"
            :selectable="true"
            selectKey="id"
            row-selected-class="table-primary"
            @selected="selectSapeur"
            :fields="fieldsBase"
            no-data="Aucun sapeur à afficher"
            :data="filteredSapeurs"
            :row-class="onRowClass"
          >
            <template v-slot:checkbox="{ key, value, rowData }">
              <input
                type="checkbox"
                class="form-check-input"
                :id="key + '-' + rowData.id"
                :checked="value"
                disabled
              />
            </template>
            <template v-slot:actions="props">
              <router-link
                v-if="hasSapeurModificationPermission"
                :to="'/sapeurs/' + props.rowData.id"
                custom
                v-slot="{ navigate }"
              >
                <button class="btn btn-outline-primary border-0" @click="navigate">
                  <font-awesome-icon :icon="['far', 'edit']" />
                </button>
              </router-link>
              <a class="btn btn-outline-primary border-0" :href="'mailto:' + props.rowData.email">
                <font-awesome-icon :icon="['fas', 'envelope']" />
              </a>
              <button class="btn btn-outline-primary border-0" @click="vcard([props.rowData])">
                <font-awesome-icon :icon="['far', 'address-card']" />
              </button>
            </template>
          </base-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import store from '@/store/index';
import permissions from '@/store/permissions.js';

import BaseTable from '@/components/table/BaseTable.vue';
import SapeurService from '../services/SapeurService';

async function loadData(routeTo, next) {
  let loadLocalites = store.dispatch('fetchLocalites');
  let loadGrades = store.dispatch('fetchGrades');
  let loadFonctions = store.dispatch('fetchFonctions');
  let loadGroupes = store.dispatch('fetchGroupes');

  Promise.all([loadLocalites, loadFonctions, loadGrades, loadGroupes]).then(
    () => {
      next();
    }
  );
}

export default {
  name: 'effectif',
  components: {
    BaseTable,
  },
  beforeRouteEnter(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  beforeMount() {
    SapeurService.getEffectif().then(effectif => {
      this.sapeurs = effectif;
    })
  },
  mounted() {
    this.loading = false;
  },
  data() {
    return {
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
          key: 'groupes',
          sortKey: 'groupes',
        },
        {
          title: 'Tel n°1',
          key: 'tels',
          formatter: (t) => t.length >= 1 ? t[0] : ''
        },
        {
          title: 'Tel n°2',
          key: 'tels',
          formatter: (t) => t.length >= 2 ? t[1] : ''
        },
        {
          title: 'Tel n°3',
          key: 'tels',
          formatter: (t) => t.length >= 3 ? t[2] : ''
        },
        {
          title: 'Naissance',
          key: 'date_naissance',
          sortKey: 'date_naissance',
        },
        {
          title: 'Actions',
          key: 'actions',
          slot: 'actions',
          titleClass: 'align-middle text-center',
          columnClass: 'align-middle text-center'
        },
      ],
    };
  },
  computed: {
    ...mapState({
      localites: (state) =>
        state.localite.liste.sort((a, b) =>
          a.designation.localeCompare(b.designation)
        ),
      groupes: (state) => state.groupe.liste,
      fonctions: (state) => state.fonction.liste,
      grades: (state) => state.grade.liste,
      hasSapeurModificationPermission: (state) =>
        state.auth.sis.permissions.includes(permissions.SAPEUR.MODIFICATION),
    }),
    computedData() {
      const idReducer = (map, e) => {
        map.set(e.id, e)
        return map;
      };

      const indexedLocalite = this.localites.reduce(idReducer, new Map());
      const indexedGrades = this.grades.reduce(idReducer, new Map());
      const indexedFonctions = this.fonctions.reduce(idReducer, new Map());
      const indexedGroupes = this.groupes.reduce(idReducer, new Map());

      const porteurIds = new Set(this.fonctions.filter(f => f.nom.toLowerCase().includes("porteur")).map(f => f.id));
      const b_id = 3;
      const c1_id = 6;
      const c1_118_id = 7;

      return this.sapeurs.map((s) => ({
        ...s,
        nom_prenom: s.nom + ' ' + s.prenom,
        porteur: s.fonctions.map(f => porteurIds.has(f.fonction_id)).reduce((acc, e) => acc || e, false),
        b: s.permis.find(p => p.permis_type_id == b_id) != undefined,
        c1: s.permis.find(p => p.permis_type_id == c1_id) != undefined,
        c1_118: s.permis.find(p => p.permis_type_id == c1_118_id) != undefined,
        fonction: indexedFonctions.get(s.fonction_id)?.nom || '',
        localite: indexedLocalite.get(s.localite_id)?.designation || '',
        fonction_tri: indexedFonctions.get(s.fonction_id)?.tri || 0,
        grade: indexedGrades.get(s.grade_id)?.designation || '',
        grade_tri: indexedGrades.get(s.grade_id)?.tri || 0,
        tels: s.telephones
          .map(t => t.numero),
        groupes: s.groupes
          .map(g => indexedGroupes.get(g.groupe_id))
          .filter(g => g.type == 1)
          .sort((a, b) => a.tri - b.tri)
          .map(g => g.no)
          .join(', ')
      })).sort((a, b) => b.fonction_tri - a.fonction_tri);
    },
    filteredLocalites() {
      // const ids = new Set(this.exercices.map((i) => parseInt(i.localite_id)));
      // return this.localites.filter((t) => ids.has(t.id));
      return this.localites;
    },
    filteredSapeurs() {
      return this.computedData.filter(
        Object.entries(this.filters)
          .filter(([, val]) => val >= 0)
          .map(
            ([key, value]) =>
              (x) =>
                x[key] == value
          )
          .reduce(
            (f, g) => (x) => f(x) && g(x),
            () => true
          )
      );
    },
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    selectSapeur(id) {
      this.selectedId = id;
    },
    vcard(sapeurs) {
      const telephoneTypeMapping = {
        1: 'HOME',
        2: 'WORK',
        3: 'CELL',
      }
      const civiliteMapping = {
        1: 'Mr.',
        2: 'Mme.',
      }
      const genderMapping = {
        1: 'M',
        2: 'F',
      }

      const idReducer = (map, e) => {
        map.set(e.id, e)
        return map;
      };
      const indexedLocalite = this.localites.reduce(idReducer, new Map());

      const contacts = sapeurs.map(s => `BEGIN:VCARD
VERSION:4.0
N:${s.nom};${s.prenom};;${civiliteMapping[s.civilite_id]};
FN:${s.prenom} ${s.nom}
LANG:fr-ch
GENDER:${genderMapping[s.civilite_id]}
${s.telephones.map(t => "TEL;TYPE=" + telephoneTypeMapping[t.telephone_type_id] + ";VALUE=uri:" + t.numero).join('\n')}
ADR;TYPE=HOME:;;${s.rue} ${s.no_rue};${indexedLocalite.get(s.localite_id)?.designation};${indexedLocalite.get(s.localite_id)?.npa};Suisse
EMAIL:${s.email}
BDAY:${s.date_naissance}
CATEGORIES:SIS
SOURCE:GestSIS2.0
END:VCARD`
      ).join('\n')

      //TODO: V-Card for all
      const file = new Blob([contacts], { type: 'text/plain' });
      const a = document.createElement("a");
      const url = URL.createObjectURL(file);

      a.href = url;
      a.download = 'sis_vcard.vcf';

      document.body.appendChild(a);

      a.click();
      setTimeout(function () {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 0);
    },
    emailTo() {
      //TODO:
    },
    onRowClass(dataItem, isSelected) {
      if (isSelected) {
        return '';
      }

      const statutsClass = {
        0: 'text-danger', //'Annulé',
        1: '', //'A saisir',
        2: '', //'En attente de validation',
        3: '', //'A imputer',
        4: 'table-success', //'Imputée'
      };
      return statutsClass[dataItem.statut];
    },
    onFilter(key, value) {
      this.filters = { ...this.filters, [key]: parseInt(value) };
    },
  },
};
</script>

<style>
table button.btn {
  padding-top: 0;
  padding-bottom: 0;
}
.m-td-0 > td {
  padding: 0 !important;
}
</style>