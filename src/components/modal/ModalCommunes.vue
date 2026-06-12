<script setup>
import { ref } from 'vue';
import { useModalStore } from '../../stores/common/Modal';

const { data, callback } = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
  callback: {
    type: Function,
    default: () => {},
  },
});
const { closeModal } = useModalStore();

const form = ref(data.communes ? data.communes.split(', ') : ['']);

const ajoutCommune = () => form.value.push('');
const supprimerCommune = (commune) =>
  (form.value = form.value.filter((c) => c !== commune));

const save = async () => {
  callback(form.value.join(', '));
  closeModal();
};
</script>

<template>
  <form @submit.prevent="save">
    <div class="modal-header">
      <h5 class="modal-title">
        {{ form.id ? 'Modifier' : 'Ajouter' }} la liste
      </h5>
      <button
        type="button"
        class="btn-close"
        aria-label="Fermer"
        @click="closeModal()"
      ></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label>Communes</label>
        <table class="table table-sm">
          <tbody v-for="(commune, index) in form" :key="index">
            <tr>
              <td>
                <input
                  required
                  v-model="form[index]"
                  type="adresse"
                  class="form-control form-control-sm"
                />
              </td>
              <td v-if="form.length > 1">
                <button
                  type="button"
                  class="btn btn-sm btn-outline-danger"
                  @click="supprimerCommune(commune)"
                >
                  <font-awesome-icon :icon="['far', 'trash-alt']" />
                </button>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td :colspan="form.length > 1 ? 2 : 1">
                <button
                  type="button"
                  class="btn btn-sm btn-outline-primary"
                  @click="ajoutCommune"
                >
                  <font-awesome-icon :icon="['fas', 'plus']" />
                </button>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
    <div class="modal-footer">
      <button
        autofocus
        type="button"
        class="btn btn-secondary"
        @click="closeModal(false)"
      >
        Annuler
      </button>
      <button type="submit" class="btn btn-primary">
        {{ form.id ? 'Modifier' : 'Ajouter' }}
      </button>
    </div>
  </form>
</template>
