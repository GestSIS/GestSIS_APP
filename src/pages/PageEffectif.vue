<template>
  <stateful-filter
    id="effectif"
    v-slot="{ setFilter, filters, filteredData, canReset, reset }"
    :data="computedData"
  >
    <div class="container-fluid">
      <div class="row">
        <div class="col-sm-6">
          <nav aria-label="breadcrumb">
            <ol class="breadcrumb m-3">
              <li class="breadcrumb-item">
                <router-link :to="{ name: 'accueil' }">Accueil</router-link>
              </li>
              <li class="breadcrumb-item active" aria-current="page">
                Effectif
              </li>
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
            <div class="card-body d-grid gap-2">
              <button
                class="btn btn-outline-primary"
                @click="vcard(filteredData)"
              >
                VCard tous
              </button>
              <!-- <button
                class="btn btn-outline-primary"
                @click="outlookCsv(filteredData)"
              >
                CSV Outlook
              </button> -->
              <a
                :disabled="filteredData.length == 0"
                :href="
                  'mailto:?bcc=' +
                  filteredData
                    .map((s) => s.email)
                    .filter((s) => s && s != null)
                    .join(';')
                "
                class="btn btn-outline-primary"
                >Email groupé</a
              >
              <button
                v-if="hasExerciceModificationPermission"
                class="btn btn-outline-primary"
                @click="sms(filteredData)"
              >
                SMS
              </button>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card card-primary card-outline mb-2">
            <div class="card-header d-flex justify-content-between">
              <h5>Impression</h5>
            </div>
            <div class="card-body d-grid gap-2">
              <button class="btn btn-outline-primary" @click="listeFssp">
                Liste FSSP
              </button>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card card-primary card-outline mb-2">
            <div class="card-header d-flex justify-content-between">
              <h5>Filtres</h5>
            </div>
            <div class="card-body">
              <div class="row">
                <base-select
                  class="col-md-6 mb-1"
                  :options="filteredLocalites"
                  base-option="<Localité>"
                  :model-value="filters.localite_id"
                  @update:model-value="
                    (value) => setFilter('localite_id', value)
                  "
                />
                <base-select
                  class="col-md-6 mb-1"
                  :options="filteredFonctions"
                  display-key="nom"
                  base-option="<Fonction>"
                  @update:model-value="
                    (value) =>
                      setFilter(
                        'fonctions',
                        parseInt(value)
                          ? (fonctions) =>
                              fonctions.find((f) => f.fonction_id == value) !=
                              undefined
                          : null
                      )
                  "
                />
                <base-select
                  class="col-md-6 mb-1"
                  :options="civilites"
                  base-option="<Civilité>"
                  :model-value="filters.civilite_id"
                  @update:model-value="
                    (value) => setFilter('civilite_id', value)
                  "
                />
                <base-select
                  class="col-md-6 mb-1"
                  :options="filteredGrades"
                  base-option="<Grade>"
                  :model-value="filters.grade_id"
                  @update:model-value="(value) => setFilter('grade_id', value)"
                />
                <base-select
                  class="col-md-6 mb-1"
                  :options="filteredGroupes"
                  display-key="label"
                  base-option="<Groupe>"
                  @update:model-value="
                    (value) =>
                      setFilter(
                        'groupes',
                        parseInt(value)
                          ? (groupes) =>
                              groupes.find((f) => f.groupe_id == value) !=
                              undefined
                          : undefined
                      )
                  "
                />
                <div v-if="canReset" class="col-md-6">
                  <button class="btn btn-sm btn-warning w-100" @click="reset">
                    Réinitialiser
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-md-12">
          <div class="card card-primary card-outline table-responsive mb-3">
            <div v-if="loading" class="card-body d-flex justify-content-center">
              <div class="spinner-border" role="status">
                <span class="visually-hidden">Chargement...</span>
              </div>
            </div>
            <base-table
              v-show="!loading"
              :selectable="true"
              :fields="fieldsBase"
              no-data="Aucun sapeur à afficher"
              :data="filteredData"
              @selected="selectSapeur"
            >
              <template #foot>
                <tr>
                  <th :colspan="fieldsBase.length">
                    Nombre sapeurs : {{ filteredData.length }} /
                    {{ computedData.length }}
                  </th>
                </tr>
              </template>
              <template #actions="{ rowData }">
                <router-link
                  v-if="hasSapeurModificationPermission"
                  v-slot="{ navigate }"
                  :to="'/sapeurs/' + rowData.id"
                  custom
                >
                  <button
                    class="btn btn-outline-primary border-0"
                    @click="navigate"
                  >
                    <font-awesome-icon :icon="['far', 'edit']" />
                  </button>
                </router-link>
                <a
                  class="btn btn-outline-primary border-0"
                  :href="'mailto:' + rowData.email"
                >
                  <font-awesome-icon :icon="['fas', 'envelope']" />
                </a>
                <button
                  class="btn btn-outline-primary border-0"
                  @click="vcard([rowData])"
                >
                  <font-awesome-icon :icon="['far', 'address-card']" />
                </button>
              </template>
            </base-table>
          </div>
        </div>
      </div>
    </div>
  </stateful-filter>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import store from '/src/store/index';
import permissions from '../store/permissions.js';

import SapeurService from '../services/SapeurService.js';
import { DateTime } from 'luxon';

import { downloadOutlookCsv, downloadVcard } from '../tools/exportSapeurs';

async function loadData(routeTo, next) {
  const loadLocalites = store.dispatch('fetchLocalites');
  const loadCivilites = store.dispatch('fetchCivilites');
  const loadGrades = store.dispatch('fetchGrades');
  const loadFonctions = store.dispatch('fetchFonctions');
  const loadGroupes = store.dispatch('fetchGroupes');

  Promise.all([
    loadLocalites,
    loadCivilites,
    loadFonctions,
    loadGrades,
    loadGroupes,
  ]).then(() => {
    next();
  });
}

export default {
  name: 'PageEffectif',
  beforeRouteEnter(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  data() {
    return {
      loading: true,
      selectedId: null,
      sapeurs: [],
      fieldsBase: [
        { title: 'Nom Prénom', key: 'nom_prenom' },
        {
          title: 'Fonction principale',
          key: 'fonction',
          sortKey: 'fonction_tri',
        },
        { title: 'Localité', key: 'localite' },
        { title: "Année d'incorporation", key: 'annee_incorporation' },
        { title: 'PAR', key: 'porteur', type: Boolean },
        { title: 'B', key: 'b', type: Boolean },
        { title: 'C1', key: 'c1', type: Boolean },
        { title: 'C1 118', key: 'c1_118', type: Boolean },
        { title: 'Grade', key: 'grade', sortKey: 'grade_tri' },
        { title: 'Groupes', key: 'formatedGroupes' },
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
        { title: 'Naissance', key: 'date_naissance', type: Date },
        {
          title: 'Actions',
          slot: 'actions',
          titleClass: 'align-middle text-center',
          columnClass: 'align-middle text-center',
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
      civilites: (state) => state.baseData.civilites,
      groupes: (state) => state.groupe.liste,
      fonctions: (state) => state.fonction.liste.filter((f) => f.actif),
      grades: (state) => state.grade.liste,
      hasSapeurModificationPermission: (state) =>
        state.auth.admin ||
        state.auth.sis.permissions.includes(permissions.SAPEUR.MODIFICATION),
      hasSmsEnvoiePermission: (state) =>
        state.auth.admin ||
        state.auth.sis.permissions.includes(permissions.SMS.ENVOIE),
      hasExerciceModificationPermission: (state) =>
        state.auth.admin ||
        state.auth.sis.permissions.includes(permissions.EXERCICE.MODIFICATION),
    }),
    computedData() {
      const idReducer = (map, e) => {
        map.set(e.id, e);
        return map;
      };

      const indexedLocalite = this.localites.reduce(idReducer, new Map());
      const indexedGrades = this.grades.reduce(idReducer, new Map());
      const indexedFonctions = this.fonctions.reduce(idReducer, new Map());
      const indexedGroupes = this.groupes.reduce(idReducer, new Map());

      const porteurIds = new Set(
        this.fonctions
          .filter((f) => f.nom.toLowerCase().includes('porteur'))
          .map((f) => f.id)
      );
      const b_id = 3;
      const c1_id = 6;
      const c1_118_id = 7;

      return this.sapeurs
        .map((s) => ({
          ...s,
          porteur: s.fonctions
            .map((f) => porteurIds.has(f.fonction_id))
            .reduce((acc, e) => acc || e, false),
          b: s.permis.find((p) => p.permis_type_id == b_id) != undefined,
          c1: s.permis.find((p) => p.permis_type_id == c1_id) != undefined,
          c1_118:
            s.permis.find((p) => p.permis_type_id == c1_118_id) != undefined,
          fonctions: s.fonctions.filter(
            (f) =>
              f.fin == null || DateTime.fromSQL(f.fin).diff(DateTime.now()) >= 0
          ),
          fonction: indexedFonctions.get(s.fonction_id)?.nom || '',
          localite: indexedLocalite.get(s.localite_id)?.designation || '',
          fonction_tri: indexedFonctions.get(s.fonction_id)?.tri || 0,
          grade: indexedGrades.get(s.grade_id)?.designation || '',
          grade_tri: indexedGrades.get(s.grade_id)?.tri || 0,
          tels: s.telephones.map((t) => t.numero),
          groupes: s.groupes,
          formatedGroupes: s.groupes
            .map((g) => indexedGroupes.get(g.groupe_id))
            .sort((a, b) => a.no - b.no)
            .filter((g) => g.type)
            .map((g) => g.no)
            .filter((g) => g)
            .join(', '),
        }))
        .sort((a, b) => b.fonction_tri - a.fonction_tri);
    },
    filteredLocalites() {
      const ids = new Set(this.sapeurs.map((s) => parseInt(s.localite_id)));
      return this.localites.filter((t) => ids.has(t.id));
    },
    // filteredCours() {
    //   const ids = new Set(this.sapeurs.map((s) => parseInt(s.localite_id)));
    //   return this.localites.filter((t) => ids.has(t.id));
    // },
    filteredFonctions() {
      const ids = new Set(
        this.sapeurs
          .map((s) => s.fonctions.map((f) => parseInt(f.fonction_id)))
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
      return this.groupes
        .filter((t) => ids.has(t.id))
        .map((e) => ({
          ...e,
          label: (e.no ? e.no + ' ' : '') + e.designation,
        }));
    },
  },
  beforeMount() {
    SapeurService.getEffectif().then((effectif) => {
      this.sapeurs = effectif.map((s) => ({
        ...s,
        nom_prenom: `${s.nom} ${s.prenom}`,
      }));
      this.loading = false;
    });
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    selectSapeur(id) {
      this.selectedId = id;
    },
    listeFssp() {
      this.SHOW_MODAL({
        component: 'ModalListeFssp',
      });
    },
    sms(sapeurs) {
      if (!this.hasSmsEnvoiePermission) {
        this.$awn.alert(
          "Permission manquante, vous n'avez pas les droits suffisant pour l'envoie de SMS"
        );
        return;
      }
      this.SHOW_MODAL({
        component: 'ModalSms',
        size: 1,
        data: sapeurs,
      });
    },
    vcard(sapeurs) {
      downloadVcard(sapeurs, this.localites);
    },
    outlookCsv(sapeurs) {
      downloadOutlookCsv(sapeurs, this.localites);
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
