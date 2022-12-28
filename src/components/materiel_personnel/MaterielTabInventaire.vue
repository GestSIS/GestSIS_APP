<template>
  <div class="row">
    <div class="col-md-12">
      <div class="card card-primary card-outline mb-2">
        <div class="card-header d-flex justify-content-between">
          <h5>Filtres</h5>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <input
                v-model="filtreNumero"
                type="text"
                placeholder="Numéro"
                class="form-control form-control-sm"
              />
            </div>
            <div class="col-md-6">
              <input
                v-model="filtreTaille"
                type="text"
                placeholder="Taille"
                class="form-control form-control-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="col-md-6">
      <div class="card card-primary card-outline mb-2 table-responsive">
        <div class="card-header">
          <h4>Matériel numéroté</h4>
        </div>
        <div v-if="loading" class="card-body d-flex justify-content-center">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Chargement...</span>
          </div>
        </div>
        <base-table
          v-show="!loading"
          :selectable="true"
          :fields="fieldsNumerote"
          no-data="Aucun sapeur à afficher"
          :data="computedMaterielNumerote"
        >
          <template #actions="{ rowData }">
            <button
              title="Info"
              class="btn btn-outline-primary border-0"
              @click="info(rowData)"
            >
              <font-awesome-icon :icon="['fas', 'info-circle']" />
            </button>
            <button
              title="Attribuer"
              class="btn btn-outline-primary border-0"
              @click="attribuerSimple(rowData)"
            >
              <font-awesome-icon :icon="['fas', 'person-circle-plus']" />
            </button>
          </template>
        </base-table>
      </div>
    </div>
    <div class="col-md-6">
      <div class="card card-primary card-outline mb-2 table-responsive">
        <div class="card-header">
          <h4>Matériel générique</h4>
        </div>
        <div v-if="loading" class="card-body d-flex justify-content-center">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Chargement...</span>
          </div>
        </div>
        <base-table
          v-show="!loading"
          :selectable="true"
          :fields="fieldsGeneric"
          no-data="Aucun sapeur à afficher"
          :data="computedMaterielGeneric"
          @selected="selectSapeur"
        >
          <template #actions="{ rowData }">
            <button
              title="Attribuer"
              class="btn btn-outline-primary border-0"
              @click="attribuerSimple(rowData)"
            >
              <font-awesome-icon :icon="['fas', 'person-circle-plus']" />
            </button>
          </template>
        </base-table>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import permissions from '/src/store/permissions.js';
import store from '/src/store/index';

async function loadData(routeTo, next) {
  let loadMateriel = store.dispatch('fetchMatPerso');

  Promise.all([loadMateriel]).then(() => {
    next();
  });
}

export default {
  name: 'MaterielTabInventaire',
  beforeRouteEnter(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  props: {
    selectedIds: {
      required: false,
      type: Object,
      default: () => ({
        type: {},
        categorie: {},
      }),
    },
  },
  data() {
    return {
      filtreTaille: '',
      filtreNumero: '',
      loading: true,
      selectedId: null,
      fieldsNumerote: [
        { title: 'Materiel type', key: 'type' },
        { title: 'Taille', key: 'taille' },
        { title: 'Numéro', key: 'numero' },
        { title: 'Remarque', key: 'remarque' },
        // { title: 'Nb lavages', key: 'lavage' },
        {
          title: 'Actions',
          slot: 'actions',
          titleClass: 'align-middle text-center',
          columnClass: 'align-middle text-center',
        },
      ],
      fieldsGeneric: [
        { title: 'Materiel type', key: 'type' },
        { title: 'Taille', key: 'taille' },
        { title: 'Quantité', key: 'quantite' },
        { title: 'Remarque', key: 'remarque' },
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
      categories: (state) =>
        state.matPersoCategorie.liste.sort(
          (a, b) => a.designation - b.designation
        ),
      types: (state) =>
        state.matPersoType.liste.sort((a, b) => a.designation - b.designation),
      materiels: (state) =>
        state.matPersoMateriel.liste.filter(
          (m) =>
            m.sapeur_id == null ||
            (m.retour != null &&
              m.sapeur_id != null &&
              m.materiel?.quantite == null)
        ),
      hasSapeurModificationPermission: (state) =>
        state.auth.admin ||
        state.auth.sis.permissions.includes(permissions.SAPEUR.MODIFICATION),
    }),
    computedMaterielGeneric() {
      return this.materiels
        .filter((m) => m.materiel?.uuid == null)
        .map((m) => ({
          ...m.materiel,
          ...m,
          type: this.indexedMaterielType[m.materiel_type_id]?.designation,
        }))
        .filter((m) => this.selectedIds.type[m.materiel_type_id])
        .filter((m) =>
          m.taille.toLowerCase().includes(this.filtreTaille.toLowerCase())
        )
        .sort((m1, m2) => m1.type.localeCompare(m2.type));
    },
    computedMaterielNumerote() {
      return this.materiels
        .filter((m) => m.materiel?.numero != null)
        .map((m) => ({
          ...m.materiel,
          ...m,
          type: this.indexedMaterielType[m.materiel_type_id]?.designation,
        }))
        .filter((m) => this.selectedIds.type[m.materiel_type_id])
        .filter((m) =>
          m.taille.toLowerCase().includes(this.filtreTaille.toLowerCase())
        )
        .filter((m) =>
          m.numero.toLowerCase().includes(this.filtreNumero.toLowerCase())
        )
        .sort((m1, m2) => m1.type.localeCompare(m2.type));
    },
    indexedMaterielType() {
      let index = {};
      this.types.forEach((t) => (index[t.id] = t));
      return index;
    },
  },
  mounted() {
    this.loading = false;
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    info(materiel) {
      this.SHOW_MODAL({
        component: 'ModalMatPersoMateriel',
        size: 1,
        data: materiel,
      });
    },
    attribuerSimple(materiel) {
      this.SHOW_MODAL({
        component: 'ModalAttributionUnique',
        data: materiel,
      });
    },
    selectSapeur(id) {
      this.selectedId = id;
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
