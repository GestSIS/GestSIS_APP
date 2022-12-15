<template>
  <div>
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">Attribuer du matériel</h5>
      <button type="button" class="btn-close" @click="HIDE_MODAL()"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label for="date">Date attribution</label>
        <input
          id="date"
          v-model="activeAttribution.date"
          type="date"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['attributions.0.date'] }"
        />
      </div>
      <div v-if="data?.materiel?.quantite !== null" class="mb-3">
        <label for="quantite">Quantité</label>
        <input
          id="quantite"
          v-model="activeAttribution.quantite"
          type="number"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['attributions.0.quantite'] }"
          min="1"
          @focusout="quantiteChange"
        />
      </div>
      <base-select
        v-model="activeAttribution.sapeur_id"
        class="mb-3"
        label="Sapeur"
        display-key="nom_prenom"
        :options="sapeurs"
        :select-class="{ 'is-invalid': errors['attributions.0.sapeur_id'] }"
      />
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="HIDE_MODAL()">
        Fermer
      </button>
      <button type="button" class="btn btn-primary" @click="save()">
        Attribuer
      </button>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex';

export default {
  name: 'ModalAttributionSimple',
  props: {
    data: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      errors: {},
      activeAttribution: {
        date: new Date().toISOString().slice(0, 10),
        sapeur_id: null,
      },
    };
  },
  computed: {
    ...mapState({
      sapeurs: (state) => state.sapeur.liste,
    }),
  },
  mounted() {
    this.activeAttribution = {
      ...this.activeAttribution,
      id: this.data?.id,
      quantite: this.data?.materiel?.quantite ?? null,
    };
  },
  methods: {
    ...mapMutations(['HIDE_MODAL']),
    async save() {
      this.$store
        .dispatch('attribuerMatPerso', {
          depuisInventaire: true,
          attributions: [this.activeAttribution],
        })
        .then(() => {
          this.errors = {};
          this.HIDE_MODAL();
        })
        .catch((errors) => (this.errors = errors));
    },
  },
};
</script>

<style scoped></style>
