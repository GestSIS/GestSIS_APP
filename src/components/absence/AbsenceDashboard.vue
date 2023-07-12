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
        <table class="table table-primary">
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
              <th>Lundi</th>
              <th>Mardi</th>
              <th>Mercredi</th>
              <th>Jeudi</th>
              <th>Vendredi</th>
              <th>Samedi</th>
              <th>Dimanche</th>
            </tr>
            <tr>
              <th v-for="({ jour }, i) in computedData" :key="i">{{ jour }}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>CDT</th>
              <td>1/1</td>
              <td>1/1</td>
              <td>1/1</td>
              <td>1/1</td>
              <td>1/1</td>
              <td>1/1</td>
              <td>1/1</td>
            </tr>
            <tr>
              <th>CI1</th>
              <td>1/7</td>
              <td>1/7</td>
              <td>1/7</td>
              <td>1/7</td>
              <td>1/7</td>
              <td>1/7</td>
              <td>1/7</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <th>x/X</th>
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
          :data="computedData"
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

  const loadAbsences = store.dispatch(
    'fetchAbsences',
    store.state.exerciceComptable.activeId
  );
  Promise.all([loadAbsences]).then(() => {
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
      activeExerciceComptableId: (state) => state.exerciceComptable.activeId,
      activeExerciceComptable: (state) =>
        state.exerciceComptable.liste.find(
          (e) => state.exerciceComptable.activeId === e.id
        ),
      hasEditPermission: (state) =>
        state.auth.admin ||
        state.auth.sis.permissions.includes(permissions.ABSENCE.MODIFICATION),
    }),
    indexedSapeurs() {
      const indexedSapeurs = {};
      this.sapeurs.forEach((s) => (indexedSapeurs[s.id] = s));
      return indexedSapeurs;
    },
    referenceData() {
      const data = {
        permis: {},
        permisSapeursAbsent: [],
        fonction: {},
        fonctionSapeursAbsent: [],
        localite: {},
        localiteSapeursAbsent: [],
      };
      // TODO: Stats sapeurs
      // this.sapeurs.foreach()
      return data;
    },
    computedData() {
      const year = this.activeExerciceComptable.annee;
      const nbDays = new Date(year, this.displayMonth, 0).getDate();
      const data = [...Array(nbDays).keys()].map((day) => ({
        jour:
          ('0' + (1 + day)).slice(-2) +
          '.' +
          ('0' + this.displayMonth).slice(-2),
        totalAbsent: 0,
        permis: {},
        permisSapeursAbsent: [],
        fonction: {},
        fonctionSapeursAbsent: [],
        localite: {},
        localiteSapeursAbsent: [],
      }));

      const absences = [{ debut: '2020-07-02', fin: '2020-07-05' }];

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
              data[date.getDate() - 1].totalAbsent++;
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
