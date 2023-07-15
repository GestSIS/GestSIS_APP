<template>
  <div class="row">
    <div class="col-md-3">
      <div class="card card-primary card-outline mb-2">
        <div class="card-header d-flex justify-content-between">
          <h5>Actions</h5>
        </div>
        <div class="card-body d-grid gap-2">
          <!-- <router-link
            v-slot="{ navigate }"
            custom
            :to="{ name: 'absence', params: { id: 'new' } }"
          >
            <button
              v-if="hasEditPermission"
              class="btn btn-outline-primary"
              @click="navigate"
            >
              Ajouter une absence
            </button>
          </router-link>
          <router-link
            v-slot="{ navigate }"
            custom
            :to="'/absences/' + selectedId"
          >
            <button
              :disabled="!selectedId"
              class="btn btn-outline-primary"
              @click="navigate"
            >
              {{ hasEditPermission ? 'Modifier' : 'Aperçu' }}
            </button>
          </router-link> -->
        </div>
      </div>
    </div>
    <div class="col-md-3">
      <div class="card card-primary card-outline mb-2">
        <div class="card-header d-flex justify-content-between">
          <h5>Impressions</h5>
        </div>
        <div class="card-body d-grid gap-2">
          <!-- <button
            class="btn btn-outline-primary"
            :disabled="!absences.length"
            @click="convoquer"
          >
            Convocations
          </button> -->
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
        <table class="table">
          <thead>
            <tr>
              <th rowspan="2">
                <base-select
                  v-model="displayKey"
                  :options="[
                    { designation: 'Fonctions', id: 'fonction_id' },
                    { designation: 'Permis', id: 'permis_id' },
                    { designation: 'Localité', id: 'localite_id' },
                  ]"
                />
              </th>
              <td
                v-for="({ jourSemaine }, i) in computedAbsences"
                :key="i"
                :class="{ 'table-secondary': jourSemaine in [6, 7] }"
              >
                {{
                  [
                    'Lundi',
                    'Mardi',
                    'Mercredi',
                    'Jeudi',
                    'Vendredi',
                    'Samedi',
                    'Dimanche',
                  ][jourSemaine]
                }}
              </td>
            </tr>
            <tr>
              <th
                v-for="({ date, jourSemaine }, i) in computedAbsences"
                :key="i"
                :class="{ 'table-secondary': jourSemaine in [6, 7] }"
              >
                {{ date }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="f in fonctions" :key="f.id">
              <th>{{ f.nom }}</th>
              <td
                v-for="({ jourSemaine, fonctions }, i) in computedAbsences"
                :key="i"
                :class="{ 'table-secondary': jourSemaine in [6, 7] }"
              >
                {{
                  (referenceData.fonctions[f.id] ?? 0) -
                  (fonctions[f.id] ?? new Set()).size
                }}
                / {{ referenceData.fonctions[f.id] ?? 0 }}
              </td>
            </tr>
          </tbody>
          <tbody>
            <tr v-for="p in permisTypes" :key="p.id">
              <th>{{ p.type }}</th>
              <td
                v-for="({ jourSemaine, permis }, i) in computedAbsences"
                :key="i"
                :class="{ 'table-secondary': jourSemaine in [6, 7] }"
              >
                {{
                  (referenceData.permis[p.id] ?? 0) -
                  (permis[p.id] ?? new Set()).size
                }}
                / {{ referenceData.permis[p.id] ?? 0 }}
              </td>
            </tr>
          </tbody>
          <tbody>
            <tr v-for="g in filteredGroupes" :key="g.id">
              <th>{{ g.no }} {{ g.designation }}</th>
              <td
                v-for="({ jourSemaine, groupes }, i) in computedAbsences"
                :key="i"
                :class="{ 'table-secondary': jourSemaine in [6, 7] }"
              >
                {{
                  (referenceData.groupes[g.id] ?? 0) -
                  (groupes[g.id] ?? new Set()).size
                }}
                / {{ referenceData.groupes[g.id] ?? 0 }}
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <th>Total</th>
              <th
                v-for="({ jourSemaine }, i) in computedAbsences"
                :key="i"
                :class="{ 'table-secondary': jourSemaine in [6, 7] }"
              >
                x/X
              </th>
            </tr>
          </tfoot>
        </table>
        <!-- <base-table
          v-show="!loading"
          ref="basetable_absences"
          :selectable="true"
          :fields="fieldsBase"
          :detail-row-column="true"
          :detail-row-component="detailRowComponent"
          detail-row-class="m-td-0"
          no-data="Aucun absence à afficher"
          :data="computedAbsences"
          :row-class="onRowClass"
          @selected="selectAbsence"
        /> -->
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import store from '/src/store/index';
import permissions from '../../store/permissions.js';

async function loadData(routeTo, next) {
  await store.dispatch('fetchExercicesComptables');

  const loadSapeurs = store.dispatch('fetchListeSapeur');
  const loadAbsences = store.dispatch(
    'fetchAbsences',
    store.state.exerciceComptable.activeId
  );
  const loadFonctions = store.dispatch('fetchFonctions');
  const loadPermis = store.dispatch('fetchPermisType');
  const loadGroupes = store.dispatch('fetchGroupes');
  const loadLocalites = store.dispatch('fetchLocalites');
  Promise.all([
    loadSapeurs,
    loadAbsences,
    loadFonctions,
    loadPermis,
    loadGroupes,
    loadLocalites,
  ]).then(() => {
    next();
  });
}

export default {
  name: 'AbsenceDashboard',
  beforeRouteEnter(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  data() {
    return {
      loading: true,
      displayKey: 'fonction_id',
      displayMonth: 7,
      tab: 'absence',
      selectedId: null,
      fieldsBase: [
        { title: 'Date', key: 'date', type: Date },
        { title: 'Categorie', key: 'categorie' },
      ],
    };
  },
  computed: {
    ...mapState({
      sapeurs: (state) => state.sapeur.liste,
      absences: (state) =>
        state.absence.liste.sort((a, b) => a.date.localeCompare(b.date)),
      localites: (state) =>
        state.localite.liste.sort((a, b) =>
          a.designation.localeCompare(b.designation)
        ),
      groupes: (state) =>
        state.groupe.liste
          .filter((g) => g.type && g.no)
          .sort((a, b) => a.no - b.no),
      fonctions: (state) =>
        state.fonction.liste
          .filter((f) => !f.cumulable)
          .sort((a, b) => b.tri - a.tri),
      permisTypes: (state) => state.baseData.permisTypes,
      activeExerciceComptableId: (state) => state.exerciceComptable.activeId,
      activeExerciceComptable: (state) =>
        state.exerciceComptable.liste.find(
          (e) => state.exerciceComptable.activeId === e.id
        ),
      hasEditPermission: (state) =>
        state.auth.admin ||
        state.auth.sis.permissions.includes(permissions.ABSENCE.MODIFICATION),
    }),
    computedSapeurs() {
      // TODO: Compute main fonction pour chaque sapeur
      return this.sapeurs.map((s) => ({
        ...s,
        mainFonctionId: null,
        mainGroupe: null,
      }));
    },
    indexedSapeurs() {
      const indexedSapeurs = {};
      this.sapeurs.forEach((s) => (indexedSapeurs[s.id] = s));
      return indexedSapeurs;
    },
    referenceData() {
      const data = {
        permis: {},
        groupes: {},
        fonctions: {},
        localites: {},
      };
      // TODO: Stats sapeurs
      this.sapeurs.forEach((s) => {
        s.permis.forEach(
          (permisId) =>
            (data.permis[permisId] = (data.permis[permisId] ?? 0) + 1)
        );
      });
      return data;
    },
    computedAbsences() {
      const year = this.activeExerciceComptable.annee;
      const nbDays = new Date(year, this.displayMonth, 0).getDate();
      const data = [...Array(nbDays).keys()].map((day) => ({
        jourSemaine: new Date(year, this.displayMonth - 1, 1 + day).getDay(),
        date:
          ('0' + (1 + day)).slice(-2) +
          '.' +
          ('0' + this.displayMonth).slice(-2),
        permis: {},
        groupes: {},
        fonctions: {},
        localites: {},
        total: 0,
      }));

      const absences = [
        { debut: '2020-07-02', fin: '2020-07-05', sapeur_id: 1 },
      ];

      const moisDebut = new Date(year, this.displayMonth - 1, 1);
      const moisFin = new Date(year, this.displayMonth, 0);

      absences
        .filter(
          (a) => new Date(a.debut) <= moisFin && new Date(a.fin) >= moisDebut
        )
        .forEach((a) => {
          let date = new Date(a.debut);
          const fin = new Date(a.fin);
          while (date <= fin) {
            if (date.getMonth() + 1 == this.displayMonth) {
              const sapeur = this.indexedSapeurs[a.sapeur_id];

              const record = data[date.getDate() - 1];
              record.total++;

              sapeur.permis.forEach(
                (permisId) =>
                  (record.permis[permisId] = (
                    record.permis[permisId] ?? new Set()
                  ).add(sapeur.id))
              );
              record.groupes[sapeur.mainGroupeId] = (
                record.groupes[sapeur.mainGroupeId] ?? new Set()
              ).add(sapeur.id);
              record.fonctions[sapeur.mainFonctionId] = (
                record.fonctions[sapeur.mainFonctionId] ?? new Set()
              ).add(sapeur.id);
              record.localites[sapeur.localite_id] = (
                record.localites[sapeur.localite_id] ?? new Set()
              ).add(sapeur.id);

              data[date.getDate() - 1] = record;
            }
            date.setDate(date.getDate() + 1);
          }
        });

      return data;
    },
    filteredSapeurs() {
      return this.sapeurs;
    },
    filteredLocalites() {
      const ids = new Set(this.sapeurs.map((s) => parseInt(s.localite_id)));
      return this.localites.filter((t) => ids.has(t.id));
    },
    filteredGroupes() {
      return this.groupes.filter((g) => g.type);
    },
  },
  watch: {
    activeExerciceComptableId() {
      this.loading = true;
      this.$store.dispatch('fetchListeAbsence').then(() => {
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
      const absence = this.absences.find((e) => e.id == id);
      this.SHOW_MODAL({
        component: 'ModalSmsAbsence',
        size: 2,
        data: absence,
      });
    },
    supprimerAbsence(id) {
      this.SHOW_MODAL({
        component: 'ModalConfirmation',
        data: {
          title: 'Voulez-vous vraiment supprimer cet absence ?',
          question:
            "Attention, la suppression d'un absence est irréversible ! Toutes les données de cet absence seront perdues !",
        },
        callback: (confirmed) => {
          if (confirmed) {
            this.$store.dispatch('supprimerAbsence', id);
          }
        },
      });
    },
    selectAbsence(row) {
      this.selectedId = row?.id;
    },
    onRowClass(dataItem, isSelected) {
      if (dataItem.statut == 0) {
        return 'text-danger';
      }
      if (isSelected) {
        return '';
      }

      const statutsClass = {
        0: '', //'Annulé',
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
