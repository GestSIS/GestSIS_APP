<template>
  <div>
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">
        {{ activeVehicule.id ? 'Modifier' : 'Ajouter' }} un véhicule
      </h5>
      <button type="button" class="btn-close" @click="HIDE_MODAL()"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label for="tri">Tri</label>
        <input
          id="tri"
          v-model="activeVehicule.tri"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['tri'] }"
        />
      </div>
      <div class="mb-3">
        <label for="designation">Désignation</label>
        <input
          id="designation"
          v-model="activeVehicule.designation"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['designation'] }"
        />
      </div>
      <div class="mb-3">
        <label for="forfait">Forfait</label>
        <input
          id="forfait"
          v-model="activeVehicule.forfait"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['forfait'] }"
        />
      </div>
      <div class="mb-3">
        <label for="unite">Unité</label>
        <input
          id="unite"
          v-model="activeVehicule.unite"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['unite'] }"
        />
      </div>
      <div class="mb-3">
        <label for="type_unite_id">Unité type</label>
        <select
          id="type_unite_id"
          v-model="activeVehicule.type_unite_id"
          class="form-select form-select-sm"
          :class="{ 'is-invalid': errors['type_unite_id'] }"
        >
          <option :value="0">-</option>
          <option v-for="u in listeUnite" :key="u.id" :value="u.id">
            {{ u.unite }}
          </option>
        </select>
      </div>
      <div class="mb-3">
        <div class="form-check">
          <input
            id="vehicule-status-modal"
            v-model="activeVehicule.statut"
            type="checkbox"
            class="form-check-input"
            :true-value="1"
          />
          <label class="form-check-label" for="vehicule-status-modal"
            >Actif</label
          >
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="HIDE_MODAL()">
        Fermer
      </button>
      <button type="button" class="btn btn-primary" @click="save()">
        {{ activeVehicule.id ? 'Modifier' : 'Ajouter' }}
      </button>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';

export default {
  name: 'ModalVehicule',
  props: {
    data: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      errors: {},
      activeVehicule: {
        statut: 1,
        type_unite_id: 0,
      },
    };
  },
  computed: {
    ...mapState({
      listeUnite: (state) => state.unite.liste,
    }),
  },
  mounted() {
    this.activeVehicule = {
      ...this.activeVehicule,
      ...this.data,
    };
    if (this.data.type_unite_id === null) {
      this.activeVehicule.type_unite_id = 0;
    }
  },
  methods: {
    ...mapMutations(['HIDE_MODAL']),
    async save() {
      if ((this.activeVehicule.id || 0) === 0) {
        this.$store
          .dispatch('addVehicule', this.activeVehicule)
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
          .dispatch('updateVehicule', this.activeVehicule)
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
