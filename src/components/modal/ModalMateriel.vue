<template>
  <div>
    <div class="modal-header">
      <h5 class="modal-title" id="exampleModalLabel">
        {{ activeMateriel.id ? 'Modifier' : 'Ajouter' }} du matériel
      </h5>
      <button type="button" class="close" @click="HIDE_MODAL()">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="modal-body">
      <div class="form-group">
        <label for="tri">Tri</label>
        <input
          type="text"
          v-model="activeMateriel.tri"
          class="form-control"
          :class="{ 'is-invalid': errors['tri'] }"
          id="tri"
        />
      </div>
      <div class="form-group">
        <label for="designation">Désignation</label>
        <input
          type="text"
          v-model="activeMateriel.designation"
          class="form-control"
          :class="{ 'is-invalid': errors['designation'] }"
          id="designation"
        />
      </div>
      <div class="form-group">
        <label for="forfait">Forfait</label>
        <input
          type="text"
          v-model="activeMateriel.forfait"
          class="form-control"
          :class="{ 'is-invalid': errors['forfait'] }"
          id="forfait"
        />
      </div>
      <div class="form-group">
        <label for="unite">Unité</label>
        <input
          type="text"
          v-model="activeMateriel.unite"
          class="form-control"
          :class="{ 'is-invalid': errors['unite'] }"
          id="unite"
        />
      </div>
      <div class="form-group">
        <label for="type_unite_id">Unité type</label>
        <select
          id="type_unite_id"
          v-model="activeMateriel.type_unite_id"
          class="custom-select"
          :class="{ 'is-invalid': errors['type_unite_id'] }"
        >
          <option :value="0">-</option>
          <option v-for="u in listeUnite" :key="u.id" :value="u.id">
            {{ u.unite }}
          </option>
        </select>
      </div>
      <div class="form-group">
        <div class="custom-control custom-checkbox">
          <input
            type="checkbox"
            class="custom-control-input"
            id="medecin-status-modal"
            v-model="activeMateriel.status"
          />
          <label class="custom-control-label" for="medecin-status-modal"
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
        {{ activeMateriel.id ? 'Modifier' : 'Ajouter' }}
      </button>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';

export default {
  name: 'ModalMateriel',
  props: {
    data: {
      type: Object,
    },
  },
  data() {
    return {
      errors: {},
      activeMateriel: {
        actif: 1,
      },
    };
  },
  computed: {
    ...mapState({
      listeUnite: (state) => state.unite.liste,
    }),
  },
  mounted() {
    this.activeMateriel = {
      ...this.activeMateriel,
      ...this.data,
    };
    if (this.data.type_unite_id === null) {
      this.activeMateriel.type_unite_id = 0;
    }
  },
  methods: {
    ...mapMutations(['HIDE_MODAL']),
    localite(localite) {
      return localite?.designation;
    },
    save() {
      if ((this.activeMateriel.id || 0) === 0) {
        this.$store
          .dispatch('addMateriel', this.activeMateriel)
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
          .dispatch('updateMateriel', this.activeMateriel)
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
