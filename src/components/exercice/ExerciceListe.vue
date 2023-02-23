<template>
  <stateful-filter
    id="exercices"
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
                Exercices
              </li>
            </ol>
          </nav>
        </div>
        <div class="col-sm-6 d-flex justify-content-end">
          <exercice-comptable />
        </div>
      </div>
      <div class="row">
        <div class="col-md-12">
          <nav id="nav-tab" class="nav nav-tabs mb-3" role="tablist">
            <a
              class="nav-item nav-link"
              role="tab"
              :class="{ active: tab == 'exercice' }"
              @click="tab = 'exercice'"
              >Exercices</a
            >
            <a
              class="nav-item nav-link"
              role="tab"
              :class="{ active: tab == 'excuse' }"
              @click="tab = 'excuse'"
              >Excuses</a
            >
          </nav>
        </div>
      </div>
      <div class="row">
        <div class="col-md-3">
          <!-- /.card-header -->
          <div class="card card-primary card-outline mb-2">
            <div class="card-header d-flex justify-content-between">
              <h5>Actions</h5>
            </div>
            <div class="card-body d-grid gap-2">
              <router-link
                v-slot="{ navigate }"
                custom
                :to="{ name: 'exercice', params: { id: 'new' } }"
              >
                <button
                  v-if="hasEditPermission"
                  class="btn btn-outline-primary"
                  @click="navigate"
                >
                  Ajouter un exercice
                </button>
              </router-link>
              <router-link
                v-slot="{ navigate }"
                custom
                :to="'/exercices/' + selectedId"
              >
                <button
                  :disabled="!selectedId"
                  class="btn btn-outline-primary"
                  @click="navigate"
                >
                  {{ hasEditPermission ? 'Modifier' : 'Aperçu' }}
                </button>
              </router-link>
              <!-- <button v-if="hasValidationPermission" :disabled="!selectedId" @click="annuler({ id: selectedId })"
                class="btn btn-outline-primary">
                Annuler
              </button>
              <button v-if="hasValidationPermission" :disabled="!selectedId" @click="annuler({ id: selectedId })"
                class="btn btn-outline-primary">
                Annuler
              </button> -->
              <div class="row">
                <div class="col-6">
                  <button
                    :disabled="!selectedId"
                    class="btn btn-outline-primary col-12"
                    @click="sms({ id: selectedId })"
                  >
                    SMS
                  </button>
                </div>
                <div class="col-6">
                  <button
                    :disabled="!selectedId"
                    class="btn btn-outline-primary col-12"
                    @click="email({ id: selectedId })"
                  >
                    Email
                  </button>
                </div>
              </div>
              <button
                class="btn btn-outline-primary"
                @click="downloadIcs(filteredData)"
              >
                Fichier <em>Icalc</em>
              </button>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <!-- /.card-header -->
          <div class="card card-primary card-outline mb-2">
            <div class="card-header d-flex justify-content-between">
              <h5>Impressions</h5>
            </div>
            <div class="card-body d-grid gap-2">
              <button
                class="btn btn-outline-primary"
                :disabled="!exercices.length"
                @click="convoquer"
              >
                Convocations
              </button>
              <button
                :disabled="!selectedId"
                class="btn btn-outline-primary"
                @click="listePresences({ id: selectedId })"
              >
                Liste de présences
              </button>
              <button
                :disabled="!selectedId"
                class="btn btn-outline-primary"
                @click="listeAppel({ id: selectedId })"
              >
                Liste d'appel
              </button>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <!-- /.card-header -->
          <div class="card card-primary card-outline mb-2">
            <div class="card-header d-flex justify-content-between">
              <h5>Filtres</h5>
            </div>
            <div class="card-body">
              <div class="row">
                <base-select
                  class="col-md-4"
                  :options="filteredLocalites"
                  base-option="<Localité>"
                  :model-value="filters.localite_id"
                  @update:model-value="
                    (value) => setFilter('localite_id', value)
                  "
                />
                <base-select
                  class="col-md-4"
                  :options="filteredExercicesCategories"
                  base-option="<Catégorie>"
                  :model-value="filters.exercice_categorie_id"
                  @update:model-value="
                    (value) => setFilter('exercice_categorie_id', value)
                  "
                />
                <base-select
                  class="col-md-4"
                  base-option="<Statut>"
                  :options="[
                    { id: 0, designation: 'Annulé' },
                    { id: 1, designation: 'Sapeurs à ajouter' },
                    { id: 2, designation: 'En attente de validation' },
                    { id: 3, designation: 'Validé' },
                    { id: 4, designation: 'Imputé' },
                  ]"
                  :model-value="filters.statut"
                  @update:model-value="(value) => setFilter('statut', value)"
                />
                <div v-if="canReset" class="col-md-4 mt-1">
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
          <div class="card card-primary card-outline table-responsive">
            <div v-if="loading" class="card-body d-flex justify-content-center">
              <div class="spinner-border" role="status">
                <span class="visually-hidden">Chargement...</span>
              </div>
            </div>
            <base-table
              v-show="!loading"
              ref="basetable_exercices"
              :selectable="true"
              :fields="fieldsBase"
              :detail-row-column="true"
              :detail-row-component="detailRowComponent"
              detail-row-class="m-td-0"
              no-data="Aucun exercice/séance à afficher"
              :data="filteredData"
              :row-class="onRowClass"
              @selected="selectExercice"
            >
              <template #actions="{ rowData }">
                <router-link
                  v-slot="{ navigate }"
                  :to="'/exercices/' + rowData.id"
                  custom
                >
                  <button
                    title="modifier"
                    class="btn btn-outline-primary border-0"
                    @click="navigate"
                  >
                    <font-awesome-icon :icon="['far', 'edit']" />
                  </button>
                </router-link>
                <button
                  v-if="hasValidationPermission && rowData.statut == 2"
                  title="valider"
                  class="btn btn-outline-primary border-0"
                  @click="validerExercice(rowData.id)"
                >
                  <font-awesome-icon :icon="['fas', 'check']" />
                </button>
                <button
                  v-if="
                    hasValidationPermission &&
                    rowData.statut <= 3 &&
                    rowData.statut > 0
                  "
                  title="annuler"
                  class="btn btn-outline-warning border-0"
                  @click="annulerExercice(rowData.id)"
                >
                  <font-awesome-icon :icon="['fas', 'ban']" />
                </button>
                <button
                  v-if="hasValidationPermission && rowData.statut == 0"
                  title="réactiver"
                  class="btn btn-outline-success border-0"
                  @click="reactiverExercice(rowData.id)"
                >
                  <font-awesome-icon :icon="['fas', 'check']" />
                </button>
                <button
                  v-if="hasValidationPermission && rowData.statut <= 3"
                  title="supprimer"
                  class="btn btn-outline-danger border-0"
                  @click="supprimerExercice(rowData.id)"
                >
                  <font-awesome-icon :icon="['far', 'trash-alt']" />
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
import { markRaw } from 'vue';
import store from '/src/store/index';
import permissions from '../store/permissions.js';

import ExerciceDetails from '/src/components/exercice/ExerciceDetails.vue';
import ExerciceComptable from '/src/components/exercice_comptable/ExerciceComptable.vue';

import ExerciceService from '/src/services/ExerciceService.js';

import { exercicesToIcs } from '../tools/exportExercices';

async function loadData(routeTo, next) {
  let loadLocalities = store.dispatch('fetchLocalites');
  let loadExerciceCategories = store.dispatch('fetchExerciceCategories');
  let loadSapeurs = store.dispatch('fetchListeSapeur');

  await store.dispatch('fetchExercicesComptables');

  let loadExercices = store.dispatch('fetchListeExercice');
  let loadAbsences = store.dispatch('fetchExerciceAbsences');
  Promise.all([
    loadSapeurs,
    loadAbsences,
    loadExercices,
    loadLocalities,
    loadExerciceCategories,
  ]).then(() => {
    next();
  });
}

export default {
  name: 'PageExercices',
  components: {
    ExerciceComptable,
  },
  beforeRouteEnter(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  data() {
    return {
      loading: true,
      tab: 'exercice',
      selectedId: null,
      detailRowComponent: markRaw(ExerciceDetails),
      fieldsBase: [
        { title: 'Date', key: 'date', type: Date },
        { title: 'Categorie', key: 'categorie' },
        {
          title: 'Heure',
          key: 'heure',
          formatter(value) {
            return value.slice(0, 5);
          },
        },
        { title: 'Duree', key: 'duree' },
        { title: 'Localité', key: 'localite' },
        { title: 'Lieu', key: 'lieu' },
        { title: 'Designation', key: 'designation' },
        {
          title: 'Statut',
          key: 'statut',
          formatter(value) {
            const statuts = {
              0: 'Annulé',
              1: 'A saisir',
              2: 'En attente de validation',
              3: 'Validé',
              4: 'Imputé',
            };
            return statuts[value];
          },
        },
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
      sisKey: (state) => state.auth.sis.activeKey,
      sisName: (state) =>
        state.auth.sis.liste.find((s) => s.id == state.auth.sis.activeId)?.nom,
      annee: (state) =>
        state.exerciceComptable.liste.find(
          (e) => e.id == state.exerciceComptable.activeId
        )?.annee,
      sapeurs: (state) => state.sapeur.liste,
      exercices: (state) =>
        state.exercice.liste.sort((a, b) => a.date.localeCompare(b.date)),
      categories: (state) => state.exerciceCategorie.liste,
      localites: (state) =>
        state.localite.liste.sort((a, b) =>
          a.designation.localeCompare(b.designation)
        ),
      activeExerciceId: (state) => state.exercice.active.id,
      activeExerciceComptableId: (state) => state.exerciceComptable.activeId,
      hasEditPermission: (state) =>
        state.auth.admin ||
        state.auth.sis.permissions.includes(permissions.EXERCICE.MODIFICATION),
      hasSmsEnvoiePermission: (state) =>
        state.auth.admin ||
        state.auth.sis.permissions.includes(permissions.SMS.ENVOIE),
      hasValidationPermission: (state) =>
        state.auth.admin ||
        state.auth.sis.permissions.includes(permissions.EXERCICE.VALIDATION),
    }),
    computedData() {
      return this.exercices.map((e) => ({
        ...e,
        categorie: this.categories.find((c) => c.id == e.exercice_categorie_id)
          ?.designation,
        localite: this.localites.find((l) => l.id == e.localite_id)
          ?.designation,
      }));
    },
    filteredExercicesCategories() {
      const ids = new Set(
        this.exercices.map((i) => parseInt(i.exercice_categorie_id))
      );
      return this.categories.filter((t) => ids.has(t.id));
    },
    filteredLocalites() {
      const ids = new Set(this.exercices.map((i) => parseInt(i.localite_id)));
      return this.localites.filter((t) => ids.has(t.id));
    },
  },
  watch: {
    activeExerciceComptableId() {
      this.loading = true;
      this.$store.dispatch('fetchListeExercice').then(() => {
        this.loading = false;
      });
    },
  },
  mounted() {
    this.loading = false;
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    convoquer() {
      this.SHOW_MODAL({ component: 'ModalConvoquer', size: 1 });
    },
    sms({ id }) {
      if (!this.hasSmsEnvoiePermission) {
        this.$awn.alert(
          "Permission manquante, vous n'avez pas les droits suffisant pour l'envoie de SMS"
        );
        return;
      }
      const exercice = this.exercices.find((e) => e.id == id);
      this.SHOW_MODAL({
        component: 'ModalSmsExercice',
        size: 2,
        data: exercice,
      });
    },
    email({ id }) {
      ExerciceService.getSapeurs(id).then((presences) => {
        const link = document.createElement('a');
        link.href =
          'mailto:?bcc=' +
          presences
            .map((p) => this.sapeurs.find((s) => s.id == p.sapeur_id)?.email)
            .filter((s) => s)
            .join(', ');
        link.click();
      });
    },
    validerExercice(id) {
      this.$store.dispatch('validerExercice', id);
    },
    annulerExercice(id) {
      this.$store.dispatch('annulerExercice', id);
    },
    reactiverExercice(id) {
      this.$store.dispatch('reactiverExercice', id);
    },
    supprimerExercice(id) {
      this.SHOW_MODAL({
        component: 'ModalConfirmation',
        data: {
          title: 'Voulez-vous vraiment supprimer cet exercice ?',
          question:
            "Attention, la suppression d'un exercice est irréversible ! Toutes les données de cet exercice seront perdues !",
        },
        callback: (confirmed) => {
          if (confirmed) {
            this.$store.dispatch('supprimerExercice', id);
          }
        },
      });
    },
    selectExercice(row) {
      this.selectedId = row?.id;
    },
    listePresences({ id }) {
      ExerciceService.downloadListPresence(id, 'liste-presence.pdf');
    },
    listeAppel({ id }) {
      ExerciceService.downloadListAppel(id, 'liste-appel.pdf');
    },
    downloadIcs(filteredExercices) {
      if (filteredExercices.length <= 0) {
        this.$awn.alert('Aucun exercice à exporter');
      }
      exercicesToIcs(filteredExercices, this.sisName, this.sisKey, this.annee);
    },
    onRowClass(dataItem, isSelected) {
      if (isSelected) {
        return '';
      }

      const statutsClass = {
        0: 'text-danger', //'Annulé',
        1: '', //'A saisir',
        2: '', //'Saisie',
        3: '', //'Validé',
        4: 'table-success', //'Imputée'
      };
      return statutsClass[dataItem.statut];
    },
  },
};
</script>

<style></style>
