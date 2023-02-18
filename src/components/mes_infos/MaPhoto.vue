<template>
  <div class="card card-primary card-outline mb-3">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Photo</h3>
      <button
        v-if="hasEditPermission"
        class="ms-auto me-2 btn btn-outline-danger"
        @click="supprimerPhoto"
      >
        Supprimer
      </button>
      <button
        v-if="hasEditPermission"
        class="btn btn-outline-primary"
        @click="editPhoto"
      >
        Modifier
      </button>
    </div>
    <div class="card-body text-center">
      <font-awesome-icon v-if="!photo" :icon="['fas', 'user']" size="10x" />
      <img v-else class="img img-responsive" :src="photo" />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'MesDonneesPerso',
  props: {
    modelValue: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      activeSapeur: { ...this.modelValue },
      hasEditPermission: false,
      errors: {},
      defaultPhoto: '',
      photo: null, //'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=128',
    };
  },
  computed: {
    ...mapState({
      localites: (state) => state.localite.liste,
      civilites: (state) => state.baseData.civilites,
    }),
  },
};
</script>

<style scoped>
img {
  max-width: 128px;
}
</style>
