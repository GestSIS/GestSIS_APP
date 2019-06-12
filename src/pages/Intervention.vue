<template>
  <div>
    <div class="container-fluid">
      <ol class="breadcrumb bg-white">
        <li class="breadcrumb-item">
          <router-link tag="a" to="/">
            Accueil
          </router-link>
        </li>
        <li class="breadcrumb-item">
          <router-link tag="a" to="/interventions">
            Interventions
          </router-link>
        </li>
        <li class="breadcrumb-item active" aria-current="page">
          {{ breadcrumbFinal }}
        </li>
      </ol>
      <div class="row">
        <div class="col-md-12">
          <nav v-if="!newMode">
            <div class="nav nav-tabs" id="nav-tab" role="tablist">
              <a
                class="nav-item nav-link"
                :class="{ active: activeTab === 'general' }"
                role="tab"
                href="#"
                @click.prevent="activeTab = 'general'"
                >Informations</a
              >
              <a
                class="nav-item nav-link"
                :class="{ active: activeTab === 'sapeurs' }"
                role="tab"
                href="#"
                @click.prevent="activeTab = 'sapeurs'"
                >Sapeurs</a
              >
              <a
                class="nav-item nav-link"
                :class="{ active: activeTab === 'materiels' }"
                role="tab"
                href="#"
                @click.prevent="activeTab = 'materiels'"
                >Matériel</a
              >
              <a
                class="nav-item nav-link"
                :class="{ active: activeTab === 'vehicules' }"
                role="tab"
                href="#"
                @click.prevent="activeTab = 'vehicules'"
                >Vehicules</a
              >
              <a
                class="nav-item nav-link"
                :class="{ active: activeTab === 'missions' }"
                role="tab"
                href="#"
                @click.prevent="activeTab = 'missions'"
                >Missions</a
              >
              <a
                class="nav-item nav-link"
                :class="{ active: activeTab === 'appels' }"
                role="tab"
                href="#"
                @click.prevent="activeTab = 'appels'"
                >Appels</a
              >
            </div>
          </nav>
          <div class="tab-content" id="nav-tabContent">
            <div class="tab-pane fade show active" role="tabpanel">
              <InterventionTabSapeurs
                v-if="activeTab === 'sapeurs'"
              ></InterventionTabSapeurs>
              <InterventionTabGeneral
                :newMode="newMode"
                v-if="activeTab === 'general'"
              ></InterventionTabGeneral>
              <div v-if="activeTab === 'missions'">Missions</div>
              <div v-if="activeTab === 'appels'">Appels</div>
              <div v-if="activeTab === 'vehicules'">Véhciules</div>
              <div v-if="activeTab === 'materiels'">Materiels</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import InterventionTabSapeurs from '@/components/InterventionTabSapeurs.vue'
import InterventionTabGeneral from '@/components/InterventionTabGeneral.vue'

export default {
  name: 'intervention',
  components: {
    InterventionTabSapeurs,
    InterventionTabGeneral
  },
  data() {
    return {
      activeTab: 'general'
    }
  },
  props: {
    id: {
      type: String
    }
  },
  computed: {
    ...mapGetters(['activeInterventionData', 'activeInterventionId']),
    newMode() {
      return this.id === 'new'
    },
    breadcrumbFinal() {
      return this.newMode
        ? 'Nouveau'
        : this.activeInterventionData.communication
    }
  },
  mounted() {
    this.$store.dispatch('fetchListSapeur')
    this.$store.dispatch('fetchLocalites')
    this.$store.dispatch('fetchInterventionTraitements')
    this.$store.dispatch('fetchStatFederals')

    let id = parseInt(this.id)

    if (this.newMode) {
      this.$store.dispatch('resetActiveIntervention')
    } else {
      this.$store.dispatch('selectIntervention', id)
      this.$store.dispatch('fetchIntervention', id)
    }
    this.tabPresence = !this.newMode
  },
  watch: {
    activeInterventionId() {
      let id = parseInt(this.id)

      this.$store.dispatch('selectIntervention', id)
      this.$store.dispatch('fetchIntervention', id)
    }
  }
}
</script>

<style lang="scss" scoped></style>
