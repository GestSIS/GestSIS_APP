<template>
  <div class="columns">
    <p>Bienvenue sur GestSIS</p>

    <div class="album text-muted">
      <div class="container">
        <h2 id="C1">Accèder à WebGestSIS</h2>
        <!-- <div>Loading {{ loading }}</div> -->
        <div class="row">
          <div
            class="card col-md-3 col-sm-6 col-xs-12"
            v-for="sis in availableSisListe"
            :key="sis.id"
          >
            <div class="align-vertical">
              <button @click="connectToSis(sis)" class="btn btn-primary">
                <!-- <img class="img-fetch" src="images/1.jpg" alt="SIS Haute-Sorne" /> -->
                {{ sis.nom }}
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
  created: function () {
    // console.log("--- Before create hook")
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
    connectToSis(sis) {
      this.$store.dispatch('selectSis', sis).then(() => {
        this.$router.push({ name: 'about' });
      });
    },
  },
};
</script>

<style lang="scss" scoped>
</style>