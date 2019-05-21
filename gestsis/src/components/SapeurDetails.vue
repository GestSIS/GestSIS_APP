<template>
  <div>
    <nav>
      <div class="nav nav-tabs" id="nav-tab">
        <a
          v-for="tab in Object.keys(tabList)"
          :key="tab"
          class="nav-item nav-link"
          :class="{ active: activeTab === tabList[tab] }"
          href="#nav-general"
          @click="selectTab(tabList[tab])"
          >{{ tabList[tab] }}</a
        >
      </div>
    </nav>
    <div class="tab-content" id="nav-tabContent">
      <div class="tab-pane fade show active">
        <SapeurTabGeneral v-if="activeTab === tabList.GENERAL" />
        <SapeurTabPermis v-if="activeTab === tabList.PERMIS" />
        <div v-if="activeTab === tabList.EXERCICES">
          Exercice
        </div>
        <div v-if="activeTab === tabList.BANQUE">
          Banque
        </div>
      </div>
    </div>
  </div>
</template>

<script>
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
}

import SapeurTabGeneral from '@/components/SapeurTabGeneral'
import SapeurTabPermis from '@/components/SapeurTabPermis'

export default {
  name: 'SapeurDetails',
  components: { SapeurTabGeneral, SapeurTabPermis },
  data() {
    return {
      activeTab: tabList.GENERAL,
      tabList: tabList
    }
  },
  methods: {
    selectTab(tab) {
      this.activeTab = tab
    }
  }
}
</script>

<style scoped></style>
