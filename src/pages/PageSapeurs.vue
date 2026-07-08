<script setup>
import permissions from '../composables/permissions.js';
import { useModalStore } from '../stores/common/Modal';
import { useBaseDataStore } from '../stores/common/BaseData.js';
import { useSapeurStore } from '../stores/sapeur/Sapeur.js';
import { useFonctionStore } from '../stores/sapeur/Fonction.js';
import { useGradeStore } from '../stores/sapeur/Grade.js';
import { useLocaliteStore } from '../stores/common/Localite.js';
import ExerciceComptable from '/src/components/exercice_comptable/ExerciceComptable.vue';
import SapeurService from '/src/services/SapeurService';
import { useRoute, useRouter } from 'vue-router';
import useHasPermission from '../composables/usePermission.js';
import {
  computed,
  onMounted,
  ref,
  useTemplateRef,
  watch,
  watchEffect,
} from 'vue';
import useNotification from '../composables/useNotification.js';

const baseDataStore = useBaseDataStore();
const sapeurStore = useSapeurStore();
const fonctionStore = useFonctionStore();
const gradeStore = useGradeStore();
const localiteStore = useLocaliteStore();

const routes = [
  { texte: 'General', to: { name: 'sapeur-details' }, civil: true },
  { texte: 'Mutations', to: { name: 'sapeur-mutations' } },
  {
    texte: 'Contrôles médicaux',
    to: { name: 'sapeur-controles-medicaux' },
    permission: permissions.CONTROLE_MEDICAL.TOUT,
  },
  { texte: 'Fonctions', to: { name: 'sapeur-fonctions' }, civil: true },
  { texte: 'Cours', to: { name: 'sapeur-cours' } },
  { texte: 'Promotion', to: { name: 'sapeur-promotions' } },
  { texte: 'Materiel', to: { name: 'sapeur-materiels' }, civil: true },
  { texte: 'Organisation', to: { name: 'sapeur-organisation' }, civil: true },
  { texte: 'Permis', to: { name: 'sapeur-permis' } },
  { texte: 'Banque', to: { name: 'sapeur-banque' }, civil: true },
  { texte: 'Exercice', to: { name: 'sapeur-exercices' }, civil: true },
];

baseDataStore.fetchCivilites();
localiteStore.fetchLocalites();
gradeStore.fetchGrades();
fonctionStore.fetchFonctions();

await sapeurStore.fetchListeSapeur();

const route = useRoute();
const router = useRouter();

const activeSapeurId = computed(() => sapeurStore.active.id);
if (route.params.id == 0 || !route.params.id) {
  if (activeSapeurId.value > 0) {
    // Sapeur précédemment sélectionné
    router.push({
      name: 'sapeur-details',
      params: { id: activeSapeurId.value },
    });
  } else if (sapeurStore.liste.filter((s) => s.actif).length > 0) {
    // Sapeurs disponible
    router.push({
      name: 'sapeur-details',
      params: {
        id: sapeurStore.liste.filter((s) => s.actif)[0]?.id,
      },
    });
  }
}

// Select sapeur
// TODO: Refactor ????
watch(
  () => route.params.id,
  () => {
    sapeurStore.selectSapeur(route.params.id);
  },
  { immediate: true },
);

// Fetch sapeur Data
watchEffect(async () => {
  if (parseInt(sapeurStore.active.id) > 0) {
    await sapeurStore.fetchSapeur(sapeurStore.active.id);
  }
});

// Redirect civile vers route pertinentes
watchEffect(() => {
  const isCivil = sapeurStore.active.data?.type;
  const routeName = route.name;
  if (
    isCivil &&
    routes.find((r) => r.to.name == routeName && r.civil !== true)
  ) {
    router.push({
      name: 'sapeur-details',
      params: { id: sapeurStore.active.id },
    });
  }
});

const filter = ref('actif');
const filters = ref({
  actif: (s) => s.actif,
  inactif: (s) => !s.actif,
  all: () => true,
});
const eventListener = ref(null);

const sapeurs = computed(() => sapeurStore.liste);
const activeSapeur = computed(() => sapeurStore.active.data);
const hasEditPermission = useHasPermission(permissions.SAPEUR.MODIFICATION);

const filteredSapeurs = computed(() =>
  sapeurs.value.filter(filters.value[filter.value]),
);

const currentRouteName = computed(() => route.name);

const listeSapeurComponent = useTemplateRef('liste-sapeurs');
eventListener.value = (e) => {
  if (e.key == 'ArrowDown' || e.key == 'ArrowUp') {
    e.preventDefault();
  }
};

onMounted(() => {
  listeSapeurComponent.value.addEventListener('keydown', eventListener.value);
  listeSapeurComponent.value.addEventListener('keyup', navigationEventListener);
});

const { confirm, showModal, closeModal } = useModalStore();
const awn = useNotification();

const ficheSapeur = () => {
  showModal({ component: 'ModalChargement' });
  SapeurService.downloadFicheSapeur(
    activeSapeurId.value,
    'fiche-sapeur.pdf',
  ).then(closeModal);
};
const navigationEventListener = async (e) => {
  const ids = filteredSapeurs.value.map((s) => s.id);
  const i = ids.indexOf(parseInt(route.params?.id));
  let nextId = null;
  if (e.key == 'ArrowDown' && i < ids.length - 1) {
    nextId = i + 1;
  } else if (e.key == 'ArrowUp' && i > 0) {
    nextId = i - 1;
  }
  if (nextId != null) {
    router.push({
      name: route.name,
      params: { id: ids[nextId] },
    });
  }
};
const selectSapeur = (sapeurId) => {
  if (sapeurId != null && sapeurId != activeSapeurId.value) {
    router.push({
      name: route.name,
      params: { id: sapeurId },
    });
  }
};
const addSapeur = () => {
  showModal({
    component: 'ModalSapeur',
    size: 2,
    callback: (sapeurId) => {
      sapeurStore.selectSapeur(sapeurId);
      router.push({
        name: 'sapeur-details',
        params: { id: sapeurId },
      });
      return true;
    },
  });
};
const deleteSapeur = () =>
  confirm(
    'Voulez-vous vraiment supprimer ce sapeur ?',
    "Attention, la suppression d'un sapeur est irréversible ! Toutes les données de ce sapeur seront perdues !",
  ).then(() =>
    sapeurStore
      .deleteSapeur(activeSapeur.value.id)
      .then(() => {
        const newSelectedSapeurId = filteredSapeurs.value[0]?.id;
        sapeurStore.selectSapeur(newSelectedSapeurId).then(() => {
          router.push({
            name: 'sapeur-details',
            params: { id: newSelectedSapeurId },
          });
        });
        awn.success('Sapeur supprimé avec succès');
      })
      .catch((err) => {
        awn.alert(err?.message ?? 'Impossible de supprimer ce sapeur');
      }),
  );
</script>

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
            <button
              v-if="activeSapeur?.id"
              type="button"
              class="btn btn-outline-primary ms-2 me-auto"
              @click="ficheSapeur"
            >
              <font-awesome-icon :icon="['fas', 'id-card-clip']" />
              Fiche sapeur
            </button>
          </div>
        </div>
        <base-navigation-tab
          v-if="activeSapeur?.id"
          :routes="
            routes
              .filter((route) => route.civil || activeSapeur.type == 0)
              .map((r) => ({
                ...r,
                to: { ...r.to, params: { id: activeSapeurId } },
              }))
          "
        />
        <div id="nav-tabContent" class="tab-content">
          <div id="tab-sapeur-details" class="tab-pane fade show active">
            <div class="row">
              <div v-if="activeSapeur?.id" class="col-12">
                <router-view />
              </div>
              <div v-else class="col-12">
                <div class="card">
                  <div class="card-body">Commencez par ajouter un sapeur</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/utilities';
@import 'bootstrap/scss/mixins/breakpoints';

#liste-sapeurs {
  a {
    padding: 0.25rem 0.75rem;
  }
}

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
