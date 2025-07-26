<script setup>
import { computed, reactive, ref } from 'vue';
import { useStore } from 'vuex';
import { useModalStore } from '../../stores/common/Modal.js';
import ConvocationService from '/src/services/ConvocationService.js';

const { data } = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
});

const store = useStore();

const errors = ref({});
const form = ref({
  sapeurIds: [],
});
const params = reactive({
  affichage_duree: true,
  affichage_pour_info: true,
  ...store.state.convocationParam.params,
});

if (data.remount) {
  form.value = data.save;
}

const exerciceComptableId = computed(
  () => store.state.exerciceComptable.activeId,
);

const { showModal, closeModal } = useModalStore();

const convoquer = () => {
  showModal({ component: 'ModalChargement' });
  ConvocationService.downloadConvocations(exerciceComptableId.value, form.value)
    .then(closeModal)
    .catch(closeModal);
};
const saveParam = () => {
  store.dispatch('updateConvocationParams', params);
};
const select = () => {
  const save = {
    ...data,
    remount: true,
    save: { ...form.value },
  };
  const callback = (res) => {
    if (res) {
      save.save.sapeurIds = res.tous;
    }
    showModal({
      component: 'ModalConvoquer',
      size: 1,
      callback,
      data: save,
    });
    return Promise.resolve(false);
  };
  showModal({
    component: 'ModalSapeurSelect',
    size: 1,
    callback,
    data: {
      ids: form.value.sapeurIds.slice(0) ?? [],
    },
  });
};
const resetSelection = () => {
  form.value.sapeurIds = [];
};
</script>

<template>
  <form @submit.prevent="convoquer">
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">Convocations</h5>
      <button type="button" class="btn-close" @click="closeModal()"></button>
    </div>
    <div class="modal-body">
      <div class="row mb-3">
        <div class="col-12 mb-3">
          <span v-if="!form.sapeurIds.length" class="me-3"
            >Tous les sapeurs actifs</span
          >
          <span v-else-if="form.sapeurIds.length === 1" class="me-3"
            >1 sapeur sélectionné</span
          >
          <span v-else class="me-3"
            >{{ form.sapeurIds.length }} sapeurs sélectionnés</span
          >
          <button
            class="me-3 btn btn-outline-primary"
            type="button"
            @click="select()"
          >
            Sélection des sapeurs
          </button>
          <button
            v-if="form.sapeurIds.length"
            class="btn btn-outline-secondary"
            type="button"
            @click="resetSelection()"
          >
            Annuler la sélection
          </button>
        </div>
        <hr />
        <div class="col-12">
          <h6>Informations</h6>
          <div class="input-group input-group-sm mb-3">
            <span id="titre" class="input-group-text">Titre</span>
            <input
              v-model="params.titre"
              required
              type="text"
              class="form-control form-control-sm"
              placeholder="Convocation"
              aria-label="Convocation"
              aria-describedby="titre"
              @blur="saveParam"
            />
          </div>
          <base-checkbox
            v-model="params.affichage_duree"
            class="mb-3"
            label="Affichage de la durée"
            @change="saveParam"
          />
          <base-checkbox
            v-model="params.affichage_pour_info"
            class="mb-3"
            label="Affichage des personnes 'Pour information'"
            @change="saveParam"
          />
          <div class="input-group input-group-sm mb-3">
            <span id="info" class="input-group-text"
              >Info
              <font-awesome-icon
                v-tooltip.bottom="
                  'Ce texte sera affiché pour les sapeurs ajouté à un exercice mais qui ne sont pas convoqué officiellement.'
                "
                class="ms-1"
                :icon="['far', 'question-circle']"
              />
            </span>
            <input
              v-model="params.texte_pour_info"
              type="text"
              class="form-control form-control-sm"
              :disabled="!params.affichage_pour_info"
              placeholder="Pour information"
              aria-label="Pour information"
              aria-describedby="info"
              @blur="saveParam"
            />
          </div>
        </div>
      </div>
      <hr />
      <div class="mb-3">
        <label for="debut">Texte de début de convocation</label>
        <textarea
          id="debut"
          v-model="params.texte_debut"
          rows="4"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['texte_debut'] }"
          @blur="saveParam"
        />
      </div>
      <div class="mb-3">
        <label for="fin">Texte de fin de convocation</label>
        <textarea
          id="fin"
          v-model="params.texte_fin"
          rows="4"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['texte_fin'] }"
          @blur="saveParam"
        />
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="closeModal()">
        Fermer
      </button>
      <button type="submit" class="btn btn-primary">Convoquer</button>
    </div>
  </form>
</template>
