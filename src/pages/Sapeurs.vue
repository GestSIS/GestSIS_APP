<template>
  <div class="container-fluid overflow-hidden custom-container">
    <div class="row">
      <div class="col-sm-6">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb m-3">
            <li class="breadcrumb-item">
              <router-link :to="{ name: 'accueil' }">Accueil</router-link>
            </li>
            <li class="breadcrumb-item active" aria-current="page">Sapeurs</li>
          </ol>
        </nav>
      </div>
      <div class="col-sm-6 d-flex justify-content-end">
        <exercice-comptable />
      </div>
    </div>
    <div class="row overflow-hidden">
      <div class="col-md-3 custom-scroll-column">
        <!-- /.card-header -->
        <div class="card card-primary card-outline mb-3">
          <div class="card-header">
            <h3 class="card-title">Filtres</h3>
            <div class="card-body px-0">
              <div class="form-check form-check-inline">
                <input
                  type="radio"
                  id="statutActif"
                  name="actif"
                  class="form-check-input"
                  value="actif"
                  v-model="filter"
                />
                <label class="form-check-label" for="statutActif">Actif</label>
              </div>
              <div class="form-check form-check-inline">
                <input
                  type="radio"
                  id="statutInactif"
                  name="actif"
                  class="form-check-input"
                  value="inactif"
                  v-model="filter"
                />
                <label class="form-check-label" for="statutInactif">Inactif</label>
              </div>
              <div class="form-check form-check-inline">
                <input
                  type="radio"
                  id="statutTous"
                  name="actif"
                  class="form-check-input"
                  value="all"
                  v-model="filter"
                />
                <label class="form-check-label" for="statutTous">Tous</label>
              </div>
            </div>
          </div>
          <ul class="list-group list-group-flush" id="liste-sapeurs" ref="liste-sapeurs">
            <router-link
              custom
              v-slot="{ navigate }"
              v-for="sapeur in filteredSapeurs"
              :to="`/sapeurs/${sapeur.id}`"
              :key="sapeur.id"
            >
              <a
                class="list-group-item list-group-item-action"
                href="#"
                :class="{
                  active: activeSapeurId === sapeur.id,
                }"
                @click="navigate"
                role="link"
              >{{ sapeur.nom }} {{ sapeur.prenom }}</a>
            </router-link>
            <li v-if="filteredSapeurs.length === 0" class="list-group-item">Aucun sapeur</li>
            <button
              class="btn btn-primary"
              v-if="!filteredSapeurs.length && hasEditPermission"
              @click="addSapeur"
            >Ajouter un sapeur</button>
          </ul>
        </div>
      </div>
      <div class="col-md-9 custom-scroll-column">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script>
import store from '@/store/index';
import permissions from '@/store/permissions.js';
import { mapState, mapMutations } from 'vuex';
import ExerciceComptable from '@/components/exercice_comptable/ExerciceComptable';

const redirectToLastestOpennedSapeur = (routeTo, routeFrom, next) => {
  store.dispatch('fetchCivilites');
  store.dispatch('fetchLocalites');
  store.dispatch('fetchGrades');
  store.dispatch('fetchFonctions');

  if (
    (!('id' in routeTo.params) || !routeTo.params.id) &&
    store.state.sapeur.active.id > 0
  ) {
    // Redirection dans le cas ou on a déjà sélectionné un sapeur
    next({
      name: 'sapeurs-details',
      params: { id: store.state.sapeur.active.id },
    });
  } else if (
    (!('id' in routeTo.params) || !routeTo.params.id) &&
    store.state.sapeur.liste.length > 0
  ) {
    // Sélection du premier sapeur
    store.dispatch('selectSapeur', store.state.sapeur.liste[0].id);
    next({
      name: 'sapeurs-details',
      params: { id: store.state.sapeur.liste[0].id },
    });
  } else {
    next();
  }
};

export default {
  components: {
    ExerciceComptable,
  },
  beforeRouteEnter(routeTo, routeFrom, next) {
    redirectToLastestOpennedSapeur(routeTo, routeFrom, next);
  },
  beforeRouteUpdate(routeTo, routeFrom, next) {
    redirectToLastestOpennedSapeur(routeTo, routeFrom, next);
  },
  beforeCreate() {
    this.$store.dispatch('fetchListeSapeur').then(() => {
      if (
        store.state.sapeur.active.id <= 0 &&
        store.state.sapeur.liste.length > 0
      ) {
        store.dispatch('selectSapeur', store.state.sapeur.liste[0].id);
        this.$router.push({
          name: 'sapeurs-details',
          params: { id: store.state.sapeur.liste[0].id },
        });
      }
    });
  },
  data() {
    return {
      filter: 'actif',
      filters: {
        actif: (s) => parseInt(s.actif) === 1,
        inactif: (s) => parseInt(s.actif) === 0,
        all: () => true,
      },
      eventListener: null,
    };
  },
  mounted() {
    this.eventListener = (e) => {
      if (e.key == "ArrowDown" || e.key == "ArrowUp") {
        e.preventDefault();
      }
    }
    this.$refs['liste-sapeurs'].addEventListener('keydown', this.eventListener);
    this.$refs['liste-sapeurs'].addEventListener('keyup', this.navigationEventListener);
  },
  computed: {
    ...mapState({
      sapeurs: (state) => state.sapeur.liste,
      activeSapeurId: (state) => state.sapeur.active.id,
      hasEditPermission: (state) => state.auth.sis.permissions.includes(
        permissions.SAPEUR.MODIFICATION
      ),
    }),
    filteredSapeurs() {
      return this.sapeurs.filter(this.filters[this.filter]);
    },
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    async navigationEventListener(e) {
      const ids = this.filteredSapeurs.map(s => s.id);
      const i = ids.indexOf(this.activeSapeurId);
      if (e.key == "ArrowDown") {
        if (i < ids.length - 1) {
          this.$router.push({ name: 'sapeurs-details', params: { id: ids[i + 1] } })
        }
      } else if (e.key == "ArrowUp") {
        if (i > 0) {
          this.$router.push({ name: 'sapeurs-details', params: { id: ids[i - 1] } })
        }
      }
    },
    addSapeur() {
      this.SHOW_MODAL({
        component: 'ModalSapeur',
        size: 2,
        callback: (sapeurId) => {
          this.$store.dispatch('selectSapeur', sapeurId).then(() => {
            this.$router.push({
              name: 'sapeurs-details',
              params: { id: sapeurId },
            });
          });
          //TODO
        },
      });
    },
  },
};
</script>

<style lang="scss" scoped>
#liste-sapeurs {
  li {
    padding: 0.25rem 0.75rem;
  }
}

.custom-container {
  display: flex;
  flex-flow: column;
}

.custom-scroll-column {
  height: 100%;
  overflow-y: scroll;
}
</style>
