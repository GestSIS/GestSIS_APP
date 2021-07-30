<template>
  <div class="columns">
    <div class="album text-muted">
      <div class="container">
        <div class="row mt-5">
          <h2>Tableau de bord {{ sis.nom }}</h2>
        </div>
        <!-- <div>Loading {{ loading }}</div> -->
        <div class="row">
          <div v-for="m in modules" :key="m.name" class="col-6 col-sm-4 col-md-3 p-1">
            <router-link tag="button" :to="m.to" class="card text-white bg-primary btn-block">
              <div class="card-body">
                <div class="d-flex justify-content-center flex-column align-items-center">
                  <font-awesome-icon :icon="m.icon" size="2x"/>
                  <h3 class="h4 card-title mt-3">{{ m.name }}</h3>
                  {{ m.nom }}
                </div>
              </div>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';

export default {
  data() {
    return {
      modules: [
        {
          to: { name: 'sapeurs' },
          name: 'Sapeurs',
          icon: 'user',
        },
        {
          to: { name: 'interventions' },
          icon: 'fire-extinguisher',
          name: 'Interventions',
        },
        {
          to: { name: 'exercices' },
          icon: ['fas', 'calendar-alt'],
          name: 'Exercices & Séances',
        },
        {
          to: '/organisation',
          icon: 'sitemap',
          name: 'Organisation',
        },
        {
          to: { name: 'comptabilite-decompte' },
          icon: 'calculator',
          name: 'Comptabilité',
        },
        { to: '/publipostage', icon: 'envelope', name: 'Publipostage' },
        {
          to: '/statistique',
          icon: ['far', 'chart-bar'],
          name: 'Statistiques',
          actif: false,
        },
        {
          to: '/matériel',
          icon: 'toolbox',
          name: 'Matériel personel',
          actif: false,
        },
        {
          to: { name: 'controles-medicaux' },
          icon: 'file-medical-alt',
          name: 'Contrôles médicaux',
        },
        {
          to: '/impressions',
          icon: 'sitemap',
          name: 'Impressions',
          actif: false,
        },
        { to: { name: 'users' }, icon: 'user', name: 'Utilisateurs' },
        {
          to: { name: 'param-general' },
          icon: 'sliders-h',
          name: 'Configuration',
        },
        {
          to: '/rta',
          icon: 'globe-europe',
          name: 'Exportation RTA',
          actif: false,
        },
        { to: { name: 'about' }, icon: 'info-circle', name: 'A propos' },
      ],
    };
  },
  created() {
    if (this.listeSis.length <= 0) {
      const self = this;
      this.loading = true;
      this.$store.dispatch('loadSisListe').then(() => {
        self.loading = false;
      });
    }
  },
  computed: {
    ...mapState({
      listeSis: (state) => state.auth.sis.liste,
      sisId: (state) => state.auth.sis.activeId,
      sisKey: (state) => state.auth.sis.activeKey,
      sis: (state) =>
        state.auth.sis.liste.find((s) => s.id == state.auth.sis.activeId),
    }),
    ...mapGetters(['availableSisListe']),
  },
};
</script>

<style lang="scss" scoped>
.img-fetch {
  height: auto;
  max-height: 220px;
  width: 100%;
  display: block;
}

.align-vertical {
  margin: auto;
}
</style>