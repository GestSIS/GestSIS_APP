<script setup>
import useNotification from '../../composables/useNotification.js';
import { useModalStore } from '../../stores/common/Modal.js';
import LavageService from '../../services/materiel/LavageService';

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

const awn = useNotification();
const { closeModal } = useModalStore();
const save = async () => {
  const lavages = activeAttribution.value.articles.map((a) => ({
    date: activeAttribution.value.date,
    article_id: a.id,
  }));
  LavageService.creerLavages(lavages)
    .then((data) => {
      callback();
      closeModal();
    })
    .catch((error) =>
      awn.alert(error.message ?? 'Erreur lors de la création des lavages'),
    );
};

const fields = [{ title: 'Date', key: 'date' }];
</script>

<template>
  <div class="overflow-visible">
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">Ajouter des lavages</h5>
      <button type="button" class="btn-close" @click="closeModal"></button>
    </div>
    <div class="modal-body overflow-visible">
      <div class="row">
        <div class="col-6 mb-3">
          <label for="date">Date attribution</label>
          <input
            id="date"
            v-model="activeAttribution.date"
            type="date"
            class="form-control form-control-sm"
            :class="{ 'is-invalid': errors['attributions.0.date'] }"
          />
        </div>
        <div class="col-md-12">
          <base-table :fields="fields" />
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="closeModal">
        Fermer
      </button>
      <button type="button" class="btn btn-primary" @click="save">
        Ajouter
      </button>
    </div>
  </div>
</template>
