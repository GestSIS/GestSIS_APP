<template>
  <div>
    <div class="tab-content" id="nav-tabContent">
      <div class="tab-pane fade show active" id="tab-sapeur-details">
        <div class="card card-primary card-outline mb-3">
          <div class="card-body d-flex flex-row-reverse">
            <button type="button" class="btn btn-outline-primary ms-2 d-none" disabled>Exporter</button>
            <button type="button" class="btn btn-outline-primary ms-2 d-none" disabled>Importer</button>
            <button type="button" class="btn btn-outline-primary ms-2 d-none" disabled>Fiche sapeur</button>
            <button
              type="button"
              class="btn btn-outline-primary ms-2"
              @click="addSapeur"
<<<<<<< HEAD
=======
              v-if="hasEditPermission"
>>>>>>> a5f44e0b78627550c479a925e47ae51945f85458
            >Ajouter un sapeur</button>
          </div>
        </div>
      </div>
    </div>
    <nav>
      <nav class="nav nav-tabs mb-3">
        <a
          v-for="tab in Object.keys(tabList)"
          :key="tab"
          class="nav-item nav-link"
          :class="{ active: activeTab === tabList[tab] }"
          @click.prevent="selectTab(tabList[tab])"
          href="#"
        >{{ tabList[tab] }}</a>
      </nav>
    </nav>
    <div class="tab-content" id="nav-tabContent">
      <div class="tab-pane fade show active" id="tab-sapeur-details">
        <div class="row">
          <div class="col-12">
            <SapeurTabGeneral v-if="activeTab === tabList.GENERAL" />
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
import permissions from '@/store/permissions.js';

//TODO Implémenter Matériel personnel
const tabList = {
  GENERAL: 'General',
  FONCTION: 'Fonctions',
  COURS: 'Cours',
  PROMOTION: 'Promotion',
  // MATERIAL: 'Materiel',
  ORGANISATION: 'Organisation',
  PERMIS: 'Permis',
  BANQUE: 'Banque',
  EXERCICE: 'Exercice',
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
  },
  data() {
    return {
      activeTab: tabList.GENERAL,
      tabList: tabList,
    };
  },
  props: {
    id: {
      type: [String, Number],
      required: true,
    },
  },
  beforeRouteEnter(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  computed: {
    ...mapState({
      hasEditPermission: (state) => state.auth.sis.permissions.includes(
        permissions.SAPEUR.MODIFICATION
      ),
    }),
    modeAjout() {
      return this.id == 'ajout';
    },
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
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
          //TODO
        },
      });
      // this.activeTab = tabList.GENERAL;
    },
  },
};
</script>

<style scoped></style>
