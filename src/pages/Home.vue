<template>
  <div class="columns">
    <div class="album text-muted">
      <div class="container">
        <div class="row mt-5">
          <h2 id="C1">Vos SIS</h2>
        </div>
        <!-- <div>Loading {{ loading }}</div> -->
        <div class="row">
          <div
            class="card col-md-3 col-sm-6 col-xs-12"
            v-if="availableSisListe.length <= 0"
          >
            <div class="align-vertical">
              <p>
                Vous n'avez actuellement aucun droit, demandez des droits à
                votre SIS.
              </p>
            </div>
          </div>
          <div
            class="card col-md-3 col-sm-6 col-xs-12"
            v-for="sis in availableSisListe"
            :key="sis.id"
          >
            <div class="align-vertical">
              <button class="btn btn-link" @click="connectToSis(sis)">
                <img class="img-fetch" :src="getImageUrl(sis)" />
              </button>
            </div>
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
      loading: false,
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
      available: (state) => state.auth.sis.available,
      sisId: (state) => state.auth.sis.activeId,
      sisKey: (state) => state.auth.sis.activeKey,
    }),
    ...mapGetters(['availableSisListe']),
  },
  methods: {
    getImageUrl(sis) {
      return new URL(`../assets/sis/${sis.api_key}.jpg`, import.meta.url).href;
    },
    connectToSis(sis) {
      this.$store.dispatch('selectSis', sis).then(() => {
        this.$router.push({ name: 'dashboard' });
      });
    },
  },
};
</script>

<style scoped>
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
