<script setup>
import { computed, ref } from 'vue';
import { useModalStore } from '../../stores/common/Modal.js';
import { useUniteStore } from '../../stores/common/Unite';

const { data } = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
});

const uniteStore = useUniteStore();
await uniteStore.fetchUnites();

const errors = ref({});
const emplacement = ref({
  statut: 1,
  ...data,
  type_unite_id: data.type_unite_id ?? 0,
});

const listeUnite = computed(() => uniteStore.liste);

const { closeModal } = useModalStore();
const save = async () => {
  if ((emplacement.id || 0) === 0) {
    store
      .dispatch('addVehicule', emplacement)
      .then(() => {
        errors = {};
        closeModal;
      })
      .catch(
        (errors) =>
          (errors = {
            ...errors,
          }),
      );
  } else {
    store
      .dispatch('updateVehicule', emplacement)
      .then(() => {
        errors = {};
        closeModal;
      })
      .catch((errors) => {
        errors = {
          ...errors,
        };
      });
  }
};
</script>

<template>
  <div>
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">
        {{ emplacement.id ? 'Modifier' : 'Ajouter' }} un emplacement
      </h5>
      <button type="button" class="btn-close" @click="closeModal"></button>
    </div>
    <div class="modal-body">
      <!-- <div class="mb-3">
        <label for="tri">Tri</label>
        <input
          id="tri"
          v-model="emplacement.tri"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['tri'] }"
        />
      </div> -->
      <div class="mb-3">
        <label for="designation">Désignation</label>
        <input
          id="designation"
          v-model="emplacement.designation"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['designation'] }"
        />
      </div>
      <div class="mb-3">
        <label for="forfait">Forfait</label>
        <input
          id="forfait"
          v-model="emplacement.forfait"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['forfait'] }"
        />
      </div>
      <div class="mb-3">
        <label for="unite">Unité</label>
        <input
          id="unite"
          v-model="emplacement.unite"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['unite'] }"
        />
      </div>
      <base-select
        v-model="emplacement.type_unite_id"
        class="mb-3"
        :class="{ 'is-invalid': errors['type_unite_id'] }"
        label="Unité type"
        base-option="-"
        base-value="0"
        display-key="unite"
        :options="listeUnite"
      />
      <div class="mb-3">
        <div class="form-check">
          <input
            id="vehicule-status-modal"
            v-model="emplacement.statut"
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
      <button type="button" class="btn btn-secondary" @click="closeModal">
        Fermer
      </button>
      <button type="button" class="btn btn-primary" @click="save">
        {{ emplacement.id ? 'Modifier' : 'Ajouter' }}
      </button>
    </div>
  </div>
</template>

<style scoped></style>
