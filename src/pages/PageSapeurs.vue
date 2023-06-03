<template>
  <div class="container-fluid custom-container">
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
    <div class="row nested-container">
      <div class="col-3 d-none d-sm-block custom-scroll-column">
        <div class="card card-primary card-outline mb-3">
          <div class="card-header">
            <h3 class="card-title">Filtres</h3>
            <div class="card-body px-0">
              <div class="form-check form-check-inline">
                <input
                  id="statutActif"
                  v-model="filter"
                  type="radio"
                  name="actif-md"
                  class="form-check-input"
                  value="actif"
                />
                <label class="form-check-label" for="statutActif">Actif</label>
              </div>
              <div class="form-check form-check-inline">
                <input
                  id="statutInactif"
                  v-model="filter"
                  type="radio"
                  name="actif-md"
                  class="form-check-input"
                  value="inactif"
                />
                <label class="form-check-label" for="statutInactif"
                  >Inactif</label
                >
              </div>
              <div class="form-check form-check-inline">
                <input
                  id="statutTous"
                  v-model="filter"
                  type="radio"
                  name="actif-md"
                  class="form-check-input"
                  value="all"
                />
                <label class="form-check-label" for="statutTous">Tous</label>
              </div>
            </div>
          </div>
          <ul
            id="liste-sapeurs"
            ref="liste-sapeurs"
            class="list-group list-group-flush"
          >
            <router-link
              v-for="sapeur in filteredSapeurs"
              v-slot="{ navigate }"
              :key="sapeur.id"
              custom
              :to="{
                name: currentRouteName,
                params: { id: sapeur.id },
              }"
            >
              <a
                class="list-group-item list-group-item-action sapeur-item"
                href="#"
                :class="{
                  active: activeSapeurId == sapeur.id,
                }"
                role="link"
                @click="navigate"
                >{{ sapeur.nom_prenom }}
                <font-awesome-icon
                  v-if="sapeur.type !== 0"
                  :icon="['far', 'handshake']"
                />
              </a>
            </router-link>
            <li v-if="filteredSapeurs.length === 0" class="list-group-item">
              Aucun sapeur
            </li>
            <button
              v-if="!filteredSapeurs.length && hasEditPermission"
              class="btn btn-primary"
              @click="addSapeur"
            >
              Ajouter un sapeur
            </button>
          </ul>
        </div>
      </div>
      <div class="col-12 col-sm-9 custom-scroll-column">
        <div class="card card-primary card-outline mb-3 d-sm-none">
          <div class="card-header">
            <h3 class="card-title">Filtres</h3>
            <div class="card-body p-0">
              <div class="form-check form-check-inline">
                <input
                  id="statutActif"
                  v-model="filter"
                  type="radio"
                  name="actif-sm"
                  class="form-check-input"
                  value="actif"
                />
                <label class="form-check-label" for="statutActif">Actif</label>
              </div>
              <div class="form-check form-check-inline">
                <input
                  id="statutInactif"
                  v-model="filter"
                  type="radio"
                  name="actif-sm"
                  class="form-check-input"
                  value="inactif"
                />
                <label class="form-check-label" for="statutInactif"
                  >Inactif</label
                >
              </div>
              <div class="form-check form-check-inline">
                <input
                  id="statutTous"
                  v-model="filter"
                  type="radio"
                  name="actif-sm"
                  class="form-check-input"
                  value="all"
                />
                <label class="form-check-label" for="statutTous">Tous</label>
              </div>
            </div>
          </div>
          <base-select
            base-option="&lt;Sapeur&gt;"
            :options="filteredSapeurs"
            display-key="nom_prenom"
            :model-value="activeSapeurId"
            @update:model-value="(value) => selectSapeur(value)"
          />
          <!-- <li v-if="filteredSapeurs.length === 0" class="list-group-item">
              Aucun sapeur
            </li> -->
        </div>
        <div class="card card-primary card-outline mb-3">
          <div class="card-body d-flex flex-row-reverse">
            <button
              type="button"
              class="btn btn-outline-primary ms-2 d-none"
              disabled
            >
              Exporter
            </button>
            <button
              type="button"
              class="btn btn-outline-primary ms-2 d-none"
              disabled
            >
              Importer
            </button>
            <button
              type="button"
              class="btn btn-outline-primary ms-2 d-none"
              disabled
            >
              Fiche sapeur
            </button>
            <button
              v-if="activeSapeur?.id && hasEditPermission"
              class="btn btn-outline-danger ms-2"
              @click="deleteSapeur"
            >
              Supprimer le sapeur
            </button>
            <button
              v-if="hasEditPermission"
              type="button"
              class="btn btn-outline-primary ms-2"
              @click="addSapeur"
            >
              Ajouter un sapeur/civil
            </button>
          </div>
        </div>
        <nav>
          <nav class="nav nav-tabs mb-3">
            <router-link
              v-for="(link, index) in links.filter(
                (link) =>
                  hasPermission(link?.permission) &&
                  (link.civil || activeSapeur.type == 0)
              )"
              :key="index"
              :to="{ name: link.urlName, params: { id: activeSapeurId } }"
              class="nav-link"
              active-class="active"
            >
              {{ link.title }}
            </router-link>
          </nav>
        </nav>
        <div id="nav-tabContent" class="tab-content">
          <div id="tab-sapeur-details" class="tab-pane fade show active">
            <div class="row">
              <div class="col-12">
                <router-view />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import store from '../store/index';
import permissions from '../store/permissions.js';
import { mapState, mapMutations } from 'vuex';
import ExerciceComptable from '/src/components/exercice_comptable/ExerciceComptable.vue';

//TODO Implémenter Matériel personnel
const links = [
  { title: 'General', urlName: 'sapeur-details', civil: true },
  { title: 'Mutations', urlName: 'sapeur-mutations' },
  {
    title: 'Contrôles médicaux',
    urlName: 'sapeur-controles-medicaux',
    permission: permissions.CONTROLE_MEDICAL.TOUT,
  },
  { title: 'Fonctions', urlName: 'sapeur-fonctions' },
  { title: 'Cours', urlName: 'sapeur-cours' },
  { title: 'Promotion', urlName: 'sapeur-promotions' },
  { title: 'Materiel', urlName: 'sapeur-materiels' },
  { title: 'Organisation', urlName: 'sapeur-organisation', civil: true },
  { title: 'Permis', urlName: 'sapeur-permis' },
  { title: 'Banque', urlName: 'sapeur-banque', civil: true },
  { title: 'Exercice', urlName: 'sapeur-exercices', civil: true },
];

const redirectToLastestOpennedSapeur = async (routeTo, routeFrom, next) => {
  store.dispatch('fetchCivilites');
  store.dispatch('fetchLocalites');
  store.dispatch('fetchGrades');
  store.dispatch('fetchFonctions');

  if (store.state.sapeur.liste.length <= 0) {
    // Load sapeurs liste
    await store.dispatch('fetchListeSapeur');
  }

  if (routeTo.params.id == 0 || !routeTo.params.id) {
    // Ancien sapeur sélectionné
    if (store.state.sapeur.active.id > 0) {
      // Rediction vers le sapeur précédemment sélectionné
      next({
        name: 'sapeur-details',
        params: { id: store.state.sapeur.active.id },
      });
      return;
    }
    // Sapeurs disponible
    if (store.state.sapeur.liste.filter((s) => s.actif).length > 0) {
      await store.dispatch(
        'selectSapeur',
        store.state.sapeur.liste.filter((s) => s.actif)[0]?.id
      );
      next({
        name: 'sapeur-details',
        params: { id: store.state.sapeur.liste.filter((s) => s.actif)[0]?.id },
      });
      return;
    }

    // Aucun sapeur de disponible
    next();
    return;
  } else {
    // Sélection du sapeur
    await store.dispatch('selectSapeur', routeTo.params.id);
  }

  if (!store.state.sapeur.active.id) {
    // Aucun sapeur
    next();
    return;
  }

  // Load sapeur data
  if (store.state.sapeur.active.id) {
    // Check civil status
    await store.dispatch('fetchSapeur', store.state.sapeur.active.id);
    const isCivil = store.state.sapeur.active.data.type != 0;

    if (isCivil) {
      // Civil détecté
      if (links.find((r) => r.urlName == routeTo.name && r.civil == true)) {
        next();
      } else {
        // Redirection pour onglet valable
        next({
          name: 'sapeur-details',
          params: { id: store.state.sapeur.active.id },
        });
      }
    } else {
      next();
    }
    return;
  }

  next();
};

export default {
  name: 'PageSapeurs',
  components: {
    ExerciceComptable,
  },
  beforeRouteEnter(routeTo, routeFrom, next) {
    redirectToLastestOpennedSapeur(routeTo, routeFrom, next);
  },
  beforeRouteUpdate(routeTo, routeFrom, next) {
    redirectToLastestOpennedSapeur(routeTo, routeFrom, next);
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
      links: links,
    };
  },
  computed: {
    ...mapState({
      sapeurs: (state) => state.sapeur.liste,
      activeSapeurId: (state) => state.sapeur.active.id,
      activeSapeur: (state) => state.sapeur.active.data,
      permissions: (state) => state.auth.sis.permissions,
      isAdmin: (state) => state.auth.admin,
      hasEditPermission: (state) =>
        state.auth.admin ||
        state.auth.sis.permissions.includes(permissions.SAPEUR.MODIFICATION),
    }),
    filteredSapeurs() {
      return this.sapeurs.filter(this.filters[this.filter]);
    },
    currentRouteName() {
      return this.$route.name;
    },
  },
  mounted() {
    const svm = this;
    this.eventListener = (e) => {
      if (e.key == 'ArrowDown' || e.key == 'ArrowUp') {
        e.preventDefault();
      }
    };
    this.$refs['liste-sapeurs'].addEventListener('keydown', this.eventListener);
    this.$refs['liste-sapeurs'].addEventListener(
      'keyup',
      svm.navigationEventListener
    );
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    hasPermission(permission) {
      return (
        !permission || this.permissions.includes(permission) || this.isAdmin
      );
    },
    async navigationEventListener(e) {
      const ids = this.filteredSapeurs.map((s) => s.id);
      const i = ids.indexOf(parseInt(this.$route.params?.id));
      let nextId = null;
      if (e.key == 'ArrowDown' && i < ids.length - 1) {
        nextId = i + 1;
      } else if (e.key == 'ArrowUp' && i > 0) {
        nextId = i - 1;
      }
      if (nextId != null) {
        this.$router.push({
          name: this.$route.name,
          params: { id: ids[nextId] },
        });
      }
    },
    selectSapeur(sapeurId) {
      if (sapeurId != null && sapeurId != this.activeSapeurId) {
        this.$router.push({
          name: this.$route.name,
          params: { id: sapeurId },
        });
      }
    },
    addSapeur() {
      this.SHOW_MODAL({
        component: 'ModalSapeur',
        size: 2,
        callback: (sapeurId) => {
          this.$store.dispatch('selectSapeur', sapeurId).then(() => {
            this.$router.push({
              name: 'sapeur-details',
              params: { id: sapeurId },
            });
          });
        },
      });
    },
    deleteSapeur() {
      const svm = this;
      this.SHOW_MODAL({
        component: 'ModalConfirmation',
        data: {
          title: 'Voulez-vous vraiment supprimer ce sapeur ?',
          question:
            "Attention, la suppression d'un sapeur est irréversible ! Toutes les données de ce sapeur seront perdues !",
        },
        callback: (confirmed) => {
          if (confirmed) {
            svm.$store
              .dispatch('deleteSapeur', this.activeSapeur.id)
              .then(() => {
                const newSelectedSapeurId = svm.sapeurs[0].id;
                svm.$store
                  .dispatch('selectSapeur', newSelectedSapeurId)
                  .then(() => {
                    svm.$router.push({
                      name: 'sapeur-details',
                      params: { id: newSelectedSapeurId },
                    });
                  });
                svm.$awn.success('Sapeur supprimé avec succès');
              })
              .catch((err) => {
                svm.$awn.alert(
                  err?.message ?? 'Impossible de supprimer ce sapeur'
                );
              });
          }
        },
      });
    },
  },
};
</script>

<style lang="scss" scoped>
#liste-sapeurs {
  a {
    padding: 0.25rem 0.75rem;
  }
}

@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/utilities';
@import 'bootstrap/scss/mixins/breakpoints';
@include media-breakpoint-up(md) {
  .custom-container {
    display: flex;
    flex-flow: column;
    overflow: hidden;
  }

  .nested-container {
    overflow: hidden;
  }

  .custom-scroll-column {
    height: 100%;
    overflow-y: scroll;
  }
}
</style>
