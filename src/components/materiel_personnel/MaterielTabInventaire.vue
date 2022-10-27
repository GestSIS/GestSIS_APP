<template>
  <div class="row">
    <div class="col-md-3">
      <div class="card card-primary card-outline mb-2">
        <div class="card-header d-flex justify-content-between">
          <h5>Actions</h5>
        </div>
        <div class="card-body d-grid gap-2">
          <button class="btn btn-outline-primary">
            <!-- @click="vcard(filteredSapeurs)" -->
            VCard tous
          </button>
        </div>
      </div>
    </div>
    <div class="col-md-9">
      <div class="card card-primary card-outline mb-2">
        <div class="card-header d-flex justify-content-between">
          <h5>Filtres</h5>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-4">
              <!-- <select
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
              </select> -->
            </div>
            <div class="col-md-4">
              <!-- <select
                class="form-select form-select-sm"
                @change="(event) => onFilter('grade_id', event.target.value)"
              >
                <option>&lt;Grade&gt;</option>
                <option v-for="f in filteredGrades" :key="f.id" :value="f.id">
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
                <option v-for="f in filteredGroupes" :key="f.id" :value="f.id">
                  {{ (f.no ? f.no + ' ' : '') + f.designation }}
                </option>
              </select> -->
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="row">
    <div class="col-2">
      <div class="card card-primary card-outline mb-5 table-responsive">
        <div class="card-header">
          <h5>Filtre Matériel type</h5>
        </div>
        <table class="table table-sm table-hover table-striped">
          <thead>
            <tr>
              <th></th>
              <th>Designation</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="computedCategories.length <= 0">
              <td colspan="3">Aucune catégorie</td>
            </tr>
            <tr v-for="item in computedCategories" :key="item.globalId">
              <!-- @click="select(item.globalId)" -->
              <td class="text-center">
                <input
                  v-model="selectedIds[item.type][item.id]"
                  type="checkbox"
                  class="form-check-input"
                  @change="select(item, $event)"
                />
              </td>
              <td :style="{ 'padding-left': item.level * 25 + 'px' }">
                <font-awesome-icon
                  class="me-2 ms-2"
                  :icon="['fas', item.tag]"
                />
                {{ item.designation }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="col-md-5">
      <div class="card card-primary card-outline mb-5 table-responsive">
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
          <template #checkbox="{ key, value, rowData }">
            <input
              :id="key + '-' + rowData.id"
              type="checkbox"
              class="form-check-input"
              :checked="value"
              disabled
            />
          </template>
          <template #actions="props">
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
          </template>
        </base-table>
      </div>
    </div>
    <div class="col-md-5">
      <div class="card card-primary card-outline mb-5 table-responsive">
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
          <template #checkbox="{ key, value, rowData }">
            <input
              :id="key + '-' + rowData.id"
              type="checkbox"
              class="form-check-input"
              :checked="value"
              disabled
            />
          </template>
          <template #actions="props">
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
          </template>
        </base-table>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import permissions from '@/store/permissions.js';

import BaseTable from '@/components/table/BaseTable.vue';
import SapeurService from '../../services/SapeurService.js';

export default {
  name: 'PageMaterielPersonnel',
  components: {
    BaseTable,
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
      fieldsNumerote: [
        {
          title: 'Materiel type',
          key: 'type',
          sortKey: 'type',
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
      materiels: (state) =>
        state.matPersoMateriel.liste.filter(
          (m) => m.retour == null || m.retour.sapeur_id == null
        ),
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
    computedMaterielGeneric() {
      return this.materiels
        .filter((m) => m.materiel?.uuid == null)
        .map((m) => ({
          ...m.materiel,
          ...m,
          type: this.indexedMaterielType[m.materiel_type_id]?.designation,
        }))
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
        .sort((m1, m2) => m1.type.localeCompare(m2.type));
    },
    indexedMaterielType() {
      let index = {};
      this.types.forEach((t) => (index[t.id] = t));
      return index;
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
