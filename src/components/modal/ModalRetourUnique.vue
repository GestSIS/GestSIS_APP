<template>
  <div>
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">Retour matériel</h5>
      <button type="button" class="btn-close" @click="HIDE_MODAL()"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label for="date">Date du retour</label>
        <input
          id="date"
          v-model="activeAttribution.date"
          type="date"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['attributions.0.date'] }"
        />
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="HIDE_MODAL()">
        Fermer
      </button>
      <button type="button" class="btn btn-primary" @click="save()">
        Valider
      </button>
    </div>
  </div>
</template>

<script>
import { mapMutations } from 'vuex';

export default {
  name: 'ModalRetourSimple',
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
      },
    };
  },
  mounted() {
    this.activeAttribution = {
      ...this.activeAttribution,
      id: this.data?.id,
    };
  },
  methods: {
    ...mapMutations(['HIDE_MODAL']),
    async save() {
      this.$store
        .dispatch('retourMatPerso', {
          date: this.activeAttribution.date,
          materielIds: [this.activeAttribution.id],
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
