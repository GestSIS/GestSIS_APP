<template>
  <div>
    <div id="nav-tabContent" class="tab-content">
      <div id="tab-sapeur-details" class="tab-pane fade show active">
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
              Ajouter un sapeur/politique
            </button>
          </div>
        </div>
      </div>
    </div>
    <nav>
      <nav class="nav nav-tabs mb-3">
        <a
          v-for="[key, label] in Object.entries(tabList).filter(
            ([key]) =>
              !requiredPermission[key] ||
              hasPermission(requiredPermission[key]) ||
              isAdmin
          )"
          :key="key"
          class="nav-item nav-link"
          :class="{ active: activeTab === label }"
          href="#"
          @click.prevent="selectTab(label)"
          >{{ label }}</a
        >
      </nav>
    </nav>
    <div id="nav-tabContent" class="tab-content">
      <div id="tab-sapeur-details" class="tab-pane fade show active">
        <div class="row">
          <div class="col-12">
            <SapeurTabGeneral v-if="activeTab === tabList.GENERAL" />
            <SapeurMutations v-if="activeTab === tabList.MUTATION" />
            <SapeurControlesMedicaux
              v-if="activeTab === tabList.CONTROLE_MEDICAL"
            />
            <SapeurFonction v-if="activeTab === tabList.FONCTION" />
            <SapeurCours v-if="activeTab === tabList.COURS" />
            <SapeurPromotion v-if="activeTab === tabList.PROMOTION" />
            <SapeurMateriel v-if="activeTab === tabList.MATERIAL" />
            <SapeurOrganisation v-if="activeTab === tabList.ORGANISATION" />
            <SapeurPermis v-if="activeTab === tabList.PERMIS" />
            <SapeurBanque v-if="activeTab === tabList.BANQUE" />
            <SapeurExercice v-if="activeTab === tabList.EXERCICE" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex';
import store from '@/store/index';
import permissions from '../../store/permissions.js';

//TODO Implémenter Matériel personnel
const sapeurTabList = {
  GENERAL: 'General',
  MUTATION: 'Mutations',
  CONTROLE_MEDICAL: 'Contrôles médicaux',
  FONCTION: 'Fonctions',
  COURS: 'Cours',
  PROMOTION: 'Promotion',
  MATERIAL: 'Materiel',
  ORGANISATION: 'Organisation',
  PERMIS: 'Permis',
  BANQUE: 'Banque',
  EXERCICE: 'Exercice',
};

const politiqueTabList = {
  GENERAL: 'General',
  ORGANISATION: 'Organisation',
  BANQUE: 'Banque',
  EXERCICE: 'Exercice',
};

const requiredPermission = {
  CONTROLE_MEDICAL: permissions.CONTROLE_MEDICAL.TOUT,
};

import SapeurTabGeneral from '@/components/sapeur/SapeurTabGeneral.vue';
import SapeurFonction from '@/components/sapeur/SapeurFonction.vue';
import SapeurCours from '@/components/sapeur/SapeurCours.vue';
import SapeurPromotion from '@/components/sapeur/SapeurPromotion.vue';
import SapeurMateriel from '@/components/sapeur/SapeurMateriel.vue';
import SapeurOrganisation from '@/components/sapeur/SapeurOrganisation.vue';
import SapeurPermis from '@/components/sapeur/SapeurPermis.vue';
import SapeurBanque from '@/components/sapeur/SapeurBanque.vue';
import SapeurExercice from '@/components/sapeur/SapeurExercice.vue';
import SapeurMutations from '@/components/sapeur/SapeurMutations.vue';
import SapeurControlesMedicaux from '@/components/sapeur/SapeurControlesMedicaux.vue';

async function loadData(routeTo, next) {
  if (routeTo.params.id == 'ajout') {
    next();
  } else {
    const sapeurId = parseInt(routeTo.params.id);
    await store.dispatch('selectSapeur', sapeurId);

    const loadTelephones = store.dispatch('fetchTelephoneTypes');
    const loadTelephonesType = store.dispatch('fetchSapeurTelephones');
    const loadSapeur = store.dispatch('fetchSapeur', sapeurId);

    Promise.all([loadSapeur, loadTelephones, loadTelephonesType]).then(() => {
      next();
    });
  }
}

export default {
  name: 'SapeurDetails',
  components: {
    SapeurTabGeneral,
    SapeurFonction,
    SapeurCours,
    SapeurPromotion,
    SapeurMateriel,
    SapeurOrganisation,
    SapeurPermis,
    SapeurBanque,
    SapeurExercice,
    SapeurMutations,
    SapeurControlesMedicaux,
  },
  beforeRouteEnter(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  props: {
    id: {
      type: [String, Number],
      required: true,
    },
  },
  data() {
    return {
      activeTab: sapeurTabList.GENERAL,
      requiredPermission,
    };
  },
  computed: {
    ...mapState({
      sapeurs: (state) => state.sapeur.liste,
      activeSapeur: (state) => state.sapeur.active.data,
      permissions: (state) => state.auth.sis.permissions,
      hasEditPermission: (state) =>
        state.auth.admin ||
        state.auth.sis.permissions.includes(permissions.SAPEUR.MODIFICATION),
      isAdmin: (state) => state.auth.admin,
    }),
    tabList() {
      return this.activeSapeur.type == 0 ? sapeurTabList : politiqueTabList;
    },
    modeAjout() {
      return this.id == 'ajout';
    },
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    hasPermission(permission) {
      return this.permissions.includes(permission);
    },
    selectTab(tab) {
      this.activeTab = tab;
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
                      name: 'sapeurs-details',
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

<style scoped></style>
