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
  <div>
    <div class="modal-header">
      <h5 class="modal-title">
        {{ activeItem.id ? 'Modifier' : 'Ajouter' }} un article
      </h5>
      <button type="button" class="btn-close" @click="closeModal"></button>
    </div>
    <div class="modal-body">
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
            v-if="!activeItem.id || activeItem.emplacement_id"
            v-model="activeItem.emplacement_id"
            :disabled="true"
            label="Emplacement"
            class="mb-3"
          />
          <div v-if="!activeItem.id || activeItem.emplacement_id" class="mb-3">
            <label for="compartiment">Compartiment</label>
            <input
              id="compartiment"
              v-model="activeItem.compartiment"
              disabled
              type="text"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['compartiment'] }"
            />
          </div>
          <base-checkbox
            v-model="activeItem.est_etiquete"
            :disabled="true"
            class="mb-3"
            label="Est étiquetté correctement"
          />
          <div v-if="type && type.est_numerote" class="mb-3">
            <label for="numero">Numéro</label>
            <input
              id="numero"
              v-model="activeItem.numero"
              disabled
              type="text"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['numero'] }"
            />
          </div>
          <div v-if="type && type.est_taillee" class="mb-3">
            <label for="taille">Taille</label>
            <input
              id="taille"
              v-model="activeItem.taille"
              disabled
              type="text"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['taille'] }"
            />
          </div>
          <div class="mb-3">
            <label for="achat">Achat</label>
            <input
              id="achat"
              v-model="activeItem.achat"
              disabled
              type="text"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['achat'] }"
            />
          </div>
          <div class="mb-3">
            <label for="remarque">Remarque</label>
            <input
              id="remarque"
              v-model="activeItem.remarque"
              disabled
              type="text"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['remarque'] }"
            />
          </div>
        </div>
        <div class="col-4">
          <base-table
            :fields="fields"
            :data="events"
            :selectable="true"
          ></base-table>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="closeModal">
        Fermer
      </button>
    </div>
  </div>
</template>
