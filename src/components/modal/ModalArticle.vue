<script setup>
import { computed, reactive, ref } from "vue";
import { useModalStore } from "../../stores/common/Modal.js";
import { useMaterielTypeStore } from "../../stores/materiel/Type";
import ArticleService from "../../services/materiel/ArticleService";
import SelectEmplacement from "../materiel/SelectEmplacement.vue";
import useNotification from "../../composables/useNotification.js";

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

const errors = ref({});
const form = reactive({ quantite: 1, ...data });

const typeStore = useMaterielTypeStore();
await typeStore.fetchMaterielTypes();

const type = computed(() => typeStore.liste.find((t) => t.id == form.materiel_type_id));

const { closeModal } = useModalStore();

const save = async () => {
  const isCreation = (form.id || 0) === 0;

  // Un article doit être rattaché soit à un sapeur, soit à un emplacement.
  // Ici seul l'emplacement est saisissable (les articles attribués à un sapeur
  // masquent ce champ), donc le seul cas invalide possible est « ni l'un ni
  // l'autre » : on l'empêche pour ne pas envoyer un payload rejeté par l'API.
  if (!form.sapeur_id && !form.emplacement_id) {
    awn.warning("Veuillez sélectionner un emplacement");
    return;
  }

  (isCreation ? ArticleService.creerArticles : ArticleService.updateArticles)([form])
    .then(() => {
      closeModal();
      callback();
    })
    .catch((err) => (errors.value = err));
};
</script>

<template>
  <form @submit.prevent="save">
    <div class="modal-header">
      <h5 class="modal-title">{{ form.id ? "Modifier" : "Ajouter" }} un article</h5>
      <button type="button" class="btn-close" @click="closeModal"></button>
    </div>
    <div class="modal-body">
      <base-select
        v-model="form.materiel_type_id"
        :required="true"
        placeholder="<Sélectionnez un type de matériel>"
        :disabled="form.id"
        class="mb-3"
        :class="{ 'is-invalid': errors['materiel_type_id'] }"
        label="Matériel type"
        display-key="designation"
        :options="typeStore.liste"
      />
      <div v-if="!form.id && type && !type.est_numerote" class="mb-3">
        <label for="quantite">Quantité</label>
        <input
          id="quantite"
          v-model="form.quantite"
          required
          min="1"
          type="number"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['quantite'] }"
        />
      </div>
      <select-emplacement
        v-if="!form.id || form.emplacement_id"
        v-model="form.emplacement_id"
        :required="!form.sapeur_id"
        label="Emplacement"
        class="mb-3"
      />
      <div v-if="type && type.type === 3" class="mb-3">
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
      <div v-if="type && type.type === 3" class="mb-3">
        <input id="actif" v-model="form.statut" type="checkbox" class="form-check-input" />
        <label class="form-check-label" for="actif">Actif</label>
      </div>
      <div v-if="type && type.type === 3" class="mb-3">
        <label for="immatriculation">Immatriculation</label>
        <input
          id="immatriculation"
          v-model="form.immatriculation"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['immatriculation'] }"
        />
      </div>
      <div v-if="type && type.type === 3" class="mb-3">
        <label for="chassis">Chassis</label>
        <input
          id="chassis"
          v-model="form.chassis"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['chassis'] }"
        />
      </div>
      <div v-if="type && form.emplacement_id && type.type !== 3" class="mb-3">
        <label for="compartiment">Compartiment</label>
        <input
          id="compartiment"
          v-model="form.compartiment"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['compartiment'] }"
        />
      </div>
      <base-checkbox v-model="form.est_etiquete" class="mb-3" label="Est étiquetté correctement" />
      <div v-if="type && type.est_numerote" class="mb-3">
        <label for="numero">Numéro</label>
        <input
          id="numero"
          v-model="form.numero"
          required
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['numero'] }"
        />
      </div>
      <div v-if="type && type.est_taillee" class="mb-3">
        <label for="taille">Taille</label>
        <input
          id="taille"
          v-model="form.taille"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['taille'] }"
        />
      </div>
      <div class="mb-3">
        <label for="achat">Achat</label>
        <input
          id="achat"
          v-model="form.achat"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['achat'] }"
        />
      </div>
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
