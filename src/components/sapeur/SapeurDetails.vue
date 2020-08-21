<template>
  <div>
    <nav class="nav nav-tabs mb-3">
      <button
        v-for="tab in Object.keys(tabList)"
        :key="tab"
        class="btn btn-link nav-item nav-link"
        :class="{ active: activeTab === tabList[tab] }"
        @click="selectTab(tabList[tab])"
      >
        {{ tabList[tab] }}
      </button>
    </nav>
    <div class="tab-content" id="nav-tabContent">
      <div class="tab-pane fade show active" id="tab-sapeur-details">
        <div class="row">
          <div class="col-12">
            <SapeurTabGeneral v-if="activeTab === tabList.GENERAL" />
            <SapeurTabFonction v-if="activeTab === tabList.FONCTION" />
            <SapeurTabCours v-if="activeTab === tabList.COURS" />
            <SapeurTabPromotion v-if="activeTab === tabList.PROMOTION" />
            <SapeurTabMateriel v-if="activeTab === tabList.MATERIAL" />
            <SapeurTabOrganisation v-if="activeTab === tabList.ORGANISATION" />
            <SapeurTabPermis v-if="activeTab === tabList.PERMIS" />
            <SapeurTabBanque v-if="activeTab === tabList.BANQUE" />
            <SapeurTabExercice v-if="activeTab === tabList.EXERCICE" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import store from '@/store/index';

//TODO Add Mat
const tabList = {
  GENERAL: 'General',
  FONCTION: 'Fonctions',
  COURS: 'Cours',
  PROMOTION: 'Promotion',
  MATERIAL: 'Materiel',
  ORGANISATION: 'Organisation',
  PERMIS: 'Permis',
  BANQUE: 'Banque',
  EXERCICE: 'Exercice'
};

import SapeurTabGeneral from '@/components/sapeur/SapeurTabGeneral';
import SapeurTabFonction from '@/components/sapeur/SapeurTabFonction';
import SapeurTabCours from '@/components/sapeur/SapeurTabCours';
import SapeurTabPromotion from '@/components/sapeur/SapeurTabPromotion';
import SapeurTabMateriel from '@/components/sapeur/SapeurTabMateriel';
import SapeurTabOrganisation from '@/components/sapeur/SapeurTabOrganisation';
import SapeurTabPermis from '@/components/sapeur/SapeurTabPermis';
import SapeurTabBanque from '@/components/sapeur/SapeurTabBanque';
import SapeurTabExercice from '@/components/sapeur/SapeurTabExercice';

async function loadData(routeTo, next) {
  const sapeurId = parseInt(routeTo.params.id);
  await store.dispatch('selectSapeur', sapeurId);

  const loadTelephones = store.dispatch('fetchTelephoneTypes');
  const loadTelephonesType = store.dispatch('fetchSapeurTelephones');
  const loadSapeur = store.dispatch('fetchSapeur', sapeurId);

  Promise.all([loadSapeur, loadTelephones, loadTelephonesType]).then(() => {
    next();
  });
}

export default {
  name: 'SapeurDetails',
  components: {
    SapeurTabGeneral,
    SapeurTabFonction,
    SapeurTabCours,
    SapeurTabPromotion,
    SapeurTabMateriel,
    SapeurTabOrganisation,
    SapeurTabPermis,
    SapeurTabBanque,
    SapeurTabExercice
  },
  data() {
    return {
      activeTab: tabList.GENERAL,
      tabList: tabList
    };
  },
  props: {
    id: {
      type: [String, Number],
      required: true
    }
  },
  beforeRouteEnter(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  methods: {
    selectTab(tab) {
      this.activeTab = tab;
    }
  }
};
</script>

<style scoped></style>
