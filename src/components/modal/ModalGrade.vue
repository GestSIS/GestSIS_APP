<template>
  <div>
    <div class="modal-header">
      <h5 class="modal-title" id="exampleModalLabel">
        {{ activeGrade.id ? 'Modifier' : 'Ajouter' }} un grade
      </h5>
      <button type="button" class="btn-close" @click="HIDE_MODAL()"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label for="tri">Tri</label>
        <input
          type="text"
          v-model="activeGrade.tri"
          class="form-control"
          :class="{ 'is-invalid': errors['tri'] }"
          id="tri"
        />
      </div>
      <div class="mb-3">
        <label for="abreviation">Abréviation</label>
        <input
          type="text"
          v-model="activeGrade.abreviation"
          class="form-control"
          :class="{ 'is-invalid': errors['abreviation'] }"
          id="abreviation"
        />
      </div>
      <div class="mb-3">
        <label for="designation">Désignation</label>
        <input
          type="text"
          v-model="activeGrade.designation"
          class="form-control"
          :class="{ 'is-invalid': errors['designation'] }"
          id="designation"
        />
      </div>
      <div class="mb-3">
        <label for="cours-precedent">Grade précédent</label>
        <select id="groupe" v-model="activeGrade.groupe" class="form-select">
          <option value="1">Officier</option>
          <option value="2">Sous-Officier</option>
          <option value="3">Spécialiste</option>
        </select>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="HIDE_MODAL()">
        Fermer
      </button>
      <button type="button" class="btn btn-primary" @click="save()">
        {{ activeGrade.id ? 'Modifier' : 'Ajouter' }}
      </button>
    </div>
  </div>
</template>

<script>
import { mapMutations } from 'vuex';

export default {
  name: 'ModalGrade',
  props: {
    data: {
      type: Object,
    },
  },
  data() {
    return {
      errors: {},
      activeGrade: {
        groupe: 1,
      },
    };
  },
  mounted() {
    this.activeGrade = {
      ...this.activeGrade,
      ...this.data,
    };
  },
  methods: {
    ...mapMutations(['HIDE_MODAL']),
    save() {
      if ((this.activeGrade.id || 0) === 0) {
        this.$store
          .dispatch('addGrade', this.activeGrade)
          .then(() => {
            this.errors = {};
            this.HIDE_MODAL();
          })
          .catch(
            (errors) =>
              (this.errors = {
                ...errors,
              })
          );
      } else {
        this.$store
          .dispatch('updateGrade', this.activeGrade)
          .then(() => {
            this.errors = {};
            this.HIDE_MODAL();
          })
          .catch((errors) => {
            this.errors = {
              ...errors,
            };
          });
      }
    },
  },
};
</script>

<style scoped></style>
