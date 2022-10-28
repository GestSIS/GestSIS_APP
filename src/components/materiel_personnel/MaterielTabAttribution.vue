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
    <div class="col-md-9">
      <div class="row">
        <div class="col-md-12">
          <div class="card card-primary card-outline mb-2">
            <div class="card-header d-flex justify-content-between">
              <h5>Filtres</h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-4">
                  <input
                    v-model="filtreSapeur"
                    type="text"
                    placeholder="Sapeur"
                    class="form-control form-control-sm"
                  />
                </div>
                <div class="col-md-4">
                  <input
                    v-model="filtreNumero"
                    type="text"
                    placeholder="Numéro"
                    class="form-control form-control-sm"
                  />
                </div>
                <div class="col-md-4">
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
              select-key="id"
              row-selected-class="table-primary"
              :fields="fieldsNumerote"
              no-data="Aucun sapeur à afficher"
              :data="computedMaterielNumerote"
            >
              <!-- <template #actions="props">
              <router-link
                v-if="hasSapeurModificationPermission"
                v-slot="{ navigate }"
                :to="'/sapeurs/' + props.rowData.id"
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
                :href="'mailto:' + props.rowData.email"
              >
                <font-awesome-icon :icon="['fas', 'envelope']" />
              </a>
              <button
                class="btn btn-outline-primary border-0"
                @click="vcard([props.rowData])"
              >
                <font-awesome-icon :icon="['far', 'address-card']" />
              </button>
            </template> -->
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
              select-key="id"
              row-selected-class="table-primary"
              :fields="fieldsGeneric"
              no-data="Aucun sapeur à afficher"
              :data="computedMaterielGeneric"
              @selected="selectSapeur"
            >
              <!-- <template #actions="props">
              <router-link
                v-if="hasSapeurModificationPermission"
                v-slot="{ navigate }"
                :to="'/sapeurs/' + props.rowData.id"
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
                :href="'mailto:' + props.rowData.email"
              >
                <font-awesome-icon :icon="['fas', 'envelope']" />
              </a>
              <button
                class="btn btn-outline-primary border-0"
                @click="vcard([props.rowData])"
              >
                <font-awesome-icon :icon="['far', 'address-card']" />
              </button>
            </template> -->
            </base-table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import permissions from '@/store/permissions.js';

import BaseTable from '@/components/table/BaseTable.vue';
import MaterielTypeCategorieSelect from '@/components/materiel_personnel/MaterielTypeCategorieSelect.vue';

export default {
  name: 'MaterielTabAttribution',
  components: {
    BaseTable,
    MaterielTypeCategorieSelect,
  },
  data() {
    return {
      filtreSapeur: '',
      filtreTaille: '',
      filtreNumero: '',
      selectedIds: {
        type: {},
        categorie: {},
      },
      loading: true,
      selectedId: null,
      filters: {},
      fieldsNumerote: [
        {
          title: 'Materiel type',
          key: 'type',
          sortKey: 'type',
        },
        {
          title: 'Sapeur',
          key: 'sapeur',
          sortKey: 'sapeur',
        },
        {
          title: 'Taille',
          key: 'taille',
          sortKey: 'taille',
        },
        {
          title: 'Numéro',
          key: 'numero',
          sortKey: 'numero',
        },
        {
          title: 'Remarque',
          key: 'remarque',
          sortKey: 'remarque',
        },
        // {
        //   title: 'Nb lavages',
        //   key: 'lavage',
        //   sortKey: 'lavage',
        // },
        {
          title: 'Actions',
          key: 'actions',
          slot: 'actions',
          titleClass: 'align-middle text-center',
          columnClass: 'align-middle text-center',
        },
      ],
      fieldsGeneric: [
        {
          title: 'Materiel type',
          key: 'type',
          sortKey: 'type',
        },
        {
          title: 'Sapeur',
          key: 'sapeur',
          sortKey: 'sapeur',
        },
        {
          title: 'Taille',
          key: 'taille',
          sortKey: 'taille',
        },
        {
          title: 'Quantité',
          key: 'quantite',
          sortKey: 'quantite',
        },
        {
          title: 'Remarque',
          key: 'remarque',
          sortKey: 'remarque',
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
      sapeurs: (state) => state.sapeur.liste,
      types: (state) =>
        state.matPersoType.liste.sort((a, b) => a.designation - b.designation),
      materiels: (state) =>
        state.matPersoMateriel.liste.filter(
          (m) => m.retour == null && m.sapeur_id != null
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
          sapeur: this.indexedSapeurs[m.sapeur_id],
          type: this.indexedMaterielType[m.materiel_type_id]?.designation,
        }))
        .filter((m) => this.selectedIds.type[m.materiel_type_id])
        .filter((m) =>
          m.sapeur
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .includes(
              this.filtreSapeur
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .toLowerCase()
            )
        )
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
          sapeur: this.indexedSapeurs[m.sapeur_id],
          type: this.indexedMaterielType[m.materiel_type_id]?.designation,
        }))
        .filter((m) => this.selectedIds.type[m.materiel_type_id])
        .filter((m) =>
          m.sapeur
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .includes(
              this.filtreSapeur
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .toLowerCase()
            )
        )
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
    indexedSapeurs() {
      let index = {};
      this.sapeurs.forEach((s) => (index[s.id] = `${s.nom} ${s.prenom}`));
      return index;
    },
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
