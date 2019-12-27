<template>
  <div>
    <div v-if="(id || 0) !== 0">
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
        <div class="tab-pane fade show active">
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
    <div v-if="(id || 0) === 0">
      Selectionnez un sapeur
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

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

import SapeurTabGeneral from '@/components/SapeurTabGeneral';
import SapeurTabFonction from '@/components/SapeurTabFonction';
import SapeurTabCours from '@/components/SapeurTabCours';
import SapeurTabPromotion from '@/components/SapeurTabPromotion';
import SapeurTabMateriel from '@/components/SapeurTabMateriel';
import SapeurTabOrganisation from '@/components/SapeurTabOrganisation';
import SapeurTabPermis from '@/components/SapeurTabPermis';
import SapeurTabBanque from '@/components/SapeurTabBanque';
import SapeurTabExercice from '@/components/SapeurTabExercice';

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
      type: Number,
      default: 0
    }
  },
  mounted() {
    if (this.id || 0) {
      this.loadDetails();
    }
  },
  computed: {
    ...mapGetters(['activeSapeurId'])
  },
  methods: {
    selectTab(tab) {
      this.activeTab = tab;
    },
    loadDetails() {
      this.$store.dispatch('selectSapeur', this.id);
    }
  },
  watch: {
    id() {
      this.loadDetails();
    }
  }
};
</script>

<style scoped></style>
