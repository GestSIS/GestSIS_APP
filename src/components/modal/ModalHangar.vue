<script setup>
import { reactive, ref } from "vue";
import useNotification from "../../composables/useNotification.js";
import { useModalStore } from "../../stores/common/Modal.js";
import { useEmplacementStore } from "../../stores/materiel/Emplacement.js";
import { useLocaliteStore } from "../../stores/common/Localite.js";
import SelectCouleur from "../materiel/SelectCouleur.vue";

const { data } = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
});

const localiteStore = useLocaliteStore();
await localiteStore.fetchLocalites();

const errors = ref({});
const form = reactive({
  statut: true,
  est_etiquete: false,
  est_compartimentable: false,
  ...data,
  hangar: { rue: "", no_rue: "", localite_id: null, ...data?.hangar },
});

const emplacementStore = useEmplacementStore();
const { closeModal } = useModalStore();
const awn = useNotification();

const save = async () => {
  if (!form.couleur_id) {
    awn.warning("Veuillez sélectionner une couleur");
    return;
  }
  if (!form.hangar.localite_id) {
    awn.warning("Veuillez sélectionner une localité");
    return;
  }

  ((form.id || 0) === 0 ? emplacementStore.addEmplacement : emplacementStore.updateEmplacement)(
    form,
  )
    .then(closeModal)
    .catch((err) => (errors.value = err));
};
</script>

<template>
  <form @submit.prevent="save">
    <div class="modal-header">
      <h5 class="modal-title">{{ form.id ? "Modifier" : "Ajouter" }} un hangar</h5>
      <button type="button" class="btn-close" @click="closeModal"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label for="designation">Désignation</label>
        <input
          id="designation"
          v-model="form.designation"
          required
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['designation'] }"
        />
      </div>
      <select-couleur v-model="form.couleur_id" label="Couleur" class="mb-3" />
      <base-checkbox v-model="form.est_etiquete" label="Est étiqueté" class="mb-3" />
      <base-checkbox v-model="form.est_compartimentable" label="Est compartimenté" class="mb-3" />
      <base-checkbox v-model="form.statut" label="Actif" class="mb-3" />
      <div class="mb-3">
        <label for="rue">Rue</label>
        <input
          id="rue"
          v-model="form.hangar.rue"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['rue'] }"
        />
      </div>
      <div class="mb-3">
        <label for="no_rue">Numéro</label>
        <input
          id="no_rue"
          v-model="form.hangar.no_rue"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['no_rue'] }"
        />
      </div>
      <base-select
        v-model="form.hangar.localite_id"
        :required="true"
        label="Localité"
        class="mb-3"
        :class="{ 'is-invalid': errors['localite_id'] }"
        :options="localiteStore.liste"
      />
      <div class="mb-3">
        <label for="remarque">Remarque</label>
        <input
          id="remarque"
          v-model="form.remarque"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['remarque'] }"
        />
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="closeModal">Fermer</button>
      <button type="submit" class="btn btn-primary">
        {{ form.id ? "Modifier" : "Ajouter" }}
      </button>
    </div>
  </form>
</template>
