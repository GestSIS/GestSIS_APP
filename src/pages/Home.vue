<template>
  <div class="columns">
    <div class="album text-muted">
      <div class="container">
<<<<<<< HEAD
        <div class="row mt-5">
          <h2 id="C1">Vos SIS</h2>
        </div>
=======
        <h2 id="C1">Accèder à WebGestSIS</h2>
>>>>>>> 14fe52e213d21035b15ba37d25fbe5f51445e80e
        <!-- <div>Loading {{ loading }}</div> -->
        <div class="row">
          <div
            class="card col-md-3 col-sm-6 col-xs-12"
            v-if="availableSisListe.length <= 0"
          >
            <div class="align-vertical">
              <p>Vous n'avez actuellement aucun droit, demandez des droits à votre SIS.</p>
            </div>
          </div>
          <div
            class="card col-md-3 col-sm-6 col-xs-12"
            v-for="sis in availableSisListe"
            :key="sis.id"
          >
            <div class="align-vertical">
<<<<<<< HEAD
							<button class="btn btn-link" @click="connectToSis(sis)">
                <img class="img-fetch" :src="require('@/assets/sis/'+sis.api_key+'.jpg')" />
							</button>
						</div>
=======
              <button @click="connectToSis(sis)" class="btn btn-primary">
                <!-- <img class="img-fetch" src="images/1.jpg" alt="SIS Haute-Sorne" /> -->
                {{ sis.nom }}
              </button>
            </div>
>>>>>>> 14fe52e213d21035b15ba37d25fbe5f51445e80e
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
<<<<<<< HEAD
        this.$router.push({ name: 'dashboard' });
=======
        this.$router.push({ name: 'about' });
>>>>>>> 14fe52e213d21035b15ba37d25fbe5f51445e80e
      });
    },
  },
};
</script>

<style lang="scss" scoped>
<<<<<<< HEAD
.img-fetch{
  height: auto;
  max-height: 220px;
  width: 100%;
  display: block;
}

.align-vertical{
  margin: auto;
}
=======
>>>>>>> 14fe52e213d21035b15ba37d25fbe5f51445e80e
</style>