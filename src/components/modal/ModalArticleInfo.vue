<script setup>
import { computed, ref } from 'vue';
import { useModalStore } from '../../stores/common/Modal.js';
import { useMaterielTypeStore } from '../../stores/materiel/Type';
import SelectEmplacement from '../materiel/SelectEmplacement.vue';

const { data } = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
});

const errors = ref({});
const activeItem = ref({ ...data });

const typeStore = useMaterielTypeStore();
await typeStore.fetchMaterielTypes();

const type = computed(() =>
  typeStore.liste.find((t) => t.id == activeItem.value.materiel_type_id),
);

const { closeModal } = useModalStore();

const events = computed(() => [
  ...(data?.lavages ?? []).map((l) => ({
    evenement: 'Lavage',
    date: l.date,
    id: l.id,
  })),
  { evenement: 'Création', date: data.created_at?.slice(0, 10), id: 0 },
]);

const fields = [
  { title: 'Date', key: 'date', type: Date },
  { title: 'Evénement', key: 'evenement' },
];
</script>

<template>
  <div class="overflow-visible">
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">
        {{ activeItem.id ? 'Modifier' : 'Ajouter' }} un article
      </h5>
      <button type="button" class="btn-close" @click="closeModal"></button>
    </div>
    <div class="modal-body overflow-visible">
      <div class="row">
        <div class="col-8">
          <base-select
            v-model="activeItem.materiel_type_id"
            :disabled="true"
            class="mb-3"
            :class="{ 'is-invalid': errors['materiel_type_id'] }"
            label="Matériel type"
            display-key="designation"
            :options="typeStore.liste"
          />
          <select-emplacement
            :disabled="true"
            label="Emplacement"
            v-if="!activeItem.id || activeItem.emplacement_id"
            class="mb-3"
            v-model="activeItem.emplacement_id"
          />
          <div class="mb-3" v-if="!activeItem.id || activeItem.emplacement_id">
            <label for="compartiment">Compartiment</label>
            <input
              id="compartiment"
              disabled
              v-model="activeItem.compartiment"
              type="text"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['compartiment'] }"
            />
          </div>
          <base-checkbox
            :disabled="true"
            class="mb-3"
            label="Est étiquetté correctement"
            v-model="activeItem.est_etiquete"
          />
          <div v-if="type && type.est_numerote" class="mb-3">
            <label for="numero">Numéro</label>
            <input
              id="numero"
              disabled
              v-model="activeItem.numero"
              type="text"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['numero'] }"
            />
          </div>
          <div v-if="type && type.est_taillee" class="mb-3">
            <label for="taille">Taille</label>
            <input
              id="taille"
              disabled
              v-model="activeItem.taille"
              type="text"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['taille'] }"
            />
          </div>
          <div class="mb-3">
            <label for="achat">Achat</label>
            <input
              id="achat"
              disabled
              v-model="activeItem.achat"
              type="text"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['achat'] }"
            />
          </div>
          <div class="mb-3">
            <label for="remarque">Remarque</label>
            <input
              id="remarque"
              disabled
              v-model="activeItem.remarque"
              type="text"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['remarque'] }"
            />
          </div>
        </div>
        <div class="col-4">
          <base-table :fields="fields" :data="events"></base-table>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="ModalModal">
        Fermer
      </button>
    </div>
  </div>
</template>

<style scoped></style>
