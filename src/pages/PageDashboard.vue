<template>
  <div class="columns">
    <div class="album text-muted">
      <div class="container">
        <div class="row mt-5">
          <h2>Tableau de bord {{ sis?.nom }}</h2>
        </div>
        <!-- <div>Loading {{ loading }}</div> -->
        <div class="row">
          <div
            v-for="m in filteredLinks"
            :key="m.nom"
            class="col-6 col-sm-4 col-md-3 p-1"
          >
            <div class="d-grid">
              <router-link v-slot="{ navigate }" :to="m.to" custom>
                <button class="card text-white bg-primary" @click="navigate">
                  <div class="card-body w-100">
                    <div
                      class="d-flex justify-content-center flex-column align-items-center"
                    >
                      <font-awesome-icon :icon="m.icon" size="2x" />
                      <h3 class="h4 card-title mt-3">{{ m.nom }}</h3>
                      {{ m.label }}
                    </div>
                  </div>
                </button>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import links from '@/router/menu.js';

export default {
  name: 'PageDashboard',
  data() {
    return {
      links,
    };
  },
  computed: {
    ...mapState({
      listeSis: (state) => state.auth.sis.liste,
      sisId: (state) => state.auth.sis.activeId,
      sisKey: (state) => state.auth.sis.activeKey,
      sis: (state) =>
        state.auth.sis.liste.find((s) => s.id == state.auth.sis.activeId),
      isAdmin: (state) => state.auth.admin,
      perms: (state) => state.auth.sis.permissions,
    }),
    ...mapGetters(['availableSisListe']),
    filteredLinks() {
      return this.links.filter(
        (l) =>
          !l.permission || this.perms.includes(l.permission) || this.isAdmin
      );
    },
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
