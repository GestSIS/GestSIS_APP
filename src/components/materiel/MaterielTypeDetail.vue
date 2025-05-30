<script setup>
import { computed } from 'vue';
import { useMaterielTypeStore } from '../../stores/materiel/Type';
import { useModalStore } from '../../stores/common/Modal';

const { id } = defineProps({
  id: {
    type: String,
    required: true,
  },
});

const materielTypeStore = useMaterielTypeStore();

await Promise.all([materielTypeStore.fetchMaterielTypes()]);

const materielType = computed(() =>
  materielTypeStore.liste.find((m) => m.id === parseInt(id)),
);

const formatEmptyString = (str) => (str === '' ? '-' : str);

const { showModal } = useModalStore();
const editMateriel = () =>
  showModal({
    component: 'ModalMaterielType',
    data: { ...materielType.value },
  });
</script>

<template>
  <div class="card mb-2">
    <div class="card-header d-flex justify-content-between align-items-center">
      <h5 class="m-0">Description du matériel</h5>
      <button
        type="button"
        class="btn btn-primary btn-sm"
        @click="editMateriel"
      >
        <font-awesome-icon :icon="['far', 'edit']" />
      </button>
    </div>
    <div class="card-body">
      <table class="table">
        <tr>
          <th>Nom</th>
          <td>{{ materielType.designation }}</td>
        </tr>
        <tr>
          <th>Fournisseur</th>
          <td>{{ formatEmptyString(materielType.fournisseur) }}</td>
        </tr>
        <tr>
          <th>Réparateur</th>
          <td>{{ formatEmptyString(materielType.reparateur) }}</td>
        </tr>
        <tr>
          <th>Prix</th>
          <td>{{ materielType.prix || 'Inconnu' }}</td>
        </tr>
        <tr>
          <th>Remarque</th>
          <td>{{ formatEmptyString(materielType.remarque) }}</td>
        </tr>
        <tr>
          <th>
            Numérotation préfixe
            <font-awesome-icon
              v-tooltip.bottom="{
                content: 'Préfixe pour l\'étiquettage individuel',
              }"
              class="ms-1 p-0"
              :icon="['far', 'question-circle']"
            />
          </th>
          <td>
            <span v-if="materielType.est_numerote" class="p-0">{{
              materielType.prefix === '' ? 'Aucun préfixe' : materielType.prefix
            }}</span>
            <span v-else class="p-0">(Pas d'étiquettage individuel)</span>
          </td>
        </tr>
      </table>
      <!-- <div class="form-check">
        <input
          class="form-check-input"
          type="checkbox"
          disabled
          :checked="materielType.est_taillee"
        />
        <label class="form-check-label">Est taillé</label>
      </div>
      <div class="form-check">
        <input
          class="form-check-input"
          type="checkbox"
          disabled
          :checked="materielType.est_attribuable"
        />
        <label class="form-check-label">Est attribuable</label>
      </div>
      <div class="form-check">
        <input
          class="form-check-input"
          type="checkbox"
          disabled
          :checked="materielType.est_lavable"
        />
        <label class="form-check-label">Suivi des lavages</label>
      </div>
      <div class="form-check">
        <input
          class="form-check-input"
          type="checkbox"
          disabled
          :checked="materielType.est_numerote"
        />
        <label class="form-check-label">Est numéroté</label>
      </div> -->
    </div>
  </div>
</template>

<style scoped>
.form-check-input ~ .form-check-label {
  opacity: 1;
}
</style>
