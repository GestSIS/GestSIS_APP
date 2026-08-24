<script setup>
import { computed, reactive, ref, watchEffect } from "vue";
import { useModalStore } from "../../stores/common/Modal.js";
import { useMaterielTypeStore } from "../../stores/materiel/Type";
import ArticleService from "../../services/materiel/ArticleService";
import SelectEmplacement from "../materiel/SelectEmplacement.vue";
import SelectCouleur from "../materiel/SelectCouleur.vue";
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

const { vehiculeUniquement, ...articleData } = data ?? {};

const errors = ref({});
const form = reactive({
  quantite: 1,
  ...articleData,
  emplacementRepresentee: { ...data?.emplacement_representee },
});

const typeStore = useMaterielTypeStore();
await typeStore.fetchMaterielTypes();

const type = computed(() => typeStore.liste.find((t) => t.id == form.materiel_type_id));

// Un article est_emplacement (ex: véhicule) déjà existant peut changer de type,
// mais uniquement vers un autre sous-type partageant le même discriminant. Ne
// s'applique pas à la création : un nouvel article doit pouvoir choisir
// n'importe quel type, y compris changer d'avis après un premier choix.
// Depuis le flux "Ajouter un emplacement > Véhicule", seuls les types véhicule
// (est_emplacement) sont pertinents à la création.
const typeOptions = computed(() => {
  if (form.id && type.value?.est_emplacement) {
    return typeStore.liste.filter((t) => t.type === type.value.type);
  }
  if (!form.id && vehiculeUniquement) {
    return typeStore.liste.filter((t) => t.est_emplacement);
  }
  return typeStore.liste;
});

const { closeModal, resize } = useModalStore();
watchEffect(() => resize(type.value?.est_emplacement ? 1 : 0));

const save = async () => {
  const isCreation = (form.id || 0) === 0;

  if (type.value?.est_emplacement) {
    if (!form.emplacementRepresentee.couleur_id) {
      awn.warning("Veuillez sélectionner une couleur");
      return;
    }
  } else if (!form.sapeur_id && !form.emplacement_id) {
    // Un article doit être rattaché soit à un sapeur, soit à un emplacement.
    // Ici seul l'emplacement est saisissable (les articles attribués à un sapeur
    // masquent ce champ), donc le seul cas invalide possible est « ni l'un ni
    // l'autre » : on l'empêche pour ne pas envoyer un payload rejeté par l'API.
    awn.warning("Veuillez sélectionner un emplacement");
    return;
  }

  const payload = type.value?.est_emplacement
    ? { ...form, emplacement_id: null, sapeur_id: null, emplacement: form.emplacementRepresentee }
    : form;

  (isCreation ? ArticleService.creerArticles : ArticleService.updateArticles)([payload])
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
        :disabled="form.id && !type?.est_emplacement"
        class="mb-3"
        :class="{ 'is-invalid': errors['materiel_type_id'] }"
        label="Matériel type"
        display-key="designation"
        :options="typeOptions"
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
        v-if="!type?.est_emplacement && (!form.id || form.emplacement_id)"
        v-model="form.emplacement_id"
        :required="!form.sapeur_id"
        label="Emplacement"
        class="mb-3"
      />

      <div v-if="type && type.est_emplacement" class="row">
        <div class="col-6">
          <legend class="w-auto px-2 fs-6 mb-2">Véhicule</legend>
          <fieldset class="border rounded p-3 h-100">
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
            <base-checkbox v-model="form.statut" class="mb-3" label="Actif" />
            <div class="mb-3">
              <label for="immatriculation">Immatriculation</label>
              <input
                id="immatriculation"
                v-model="form.immatriculation"
                type="text"
                class="form-control form-control-sm"
                :class="{ 'is-invalid': errors['immatriculation'] }"
              />
            </div>
            <div class="mb-3">
              <label for="chassis">Chassis</label>
              <input
                id="chassis"
                v-model="form.chassis"
                type="text"
                class="form-control form-control-sm"
                :class="{ 'is-invalid': errors['chassis'] }"
              />
            </div>
            <base-checkbox
              v-model="form.est_etiquete"
              class="mb-3"
              label="Est étiquetté correctement"
            />
            <div v-if="type.est_numerote" class="mb-3">
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
            <div class="mb-0">
              <label for="remarque">Remarque</label>
              <input
                id="remarque"
                v-model="form.remarque"
                type="text"
                class="form-control form-control-sm"
                :class="{ 'is-invalid': errors['remarque'] }"
              />
            </div>
          </fieldset>
        </div>
        <div class="col-6">
          <legend class="w-auto px-2 fs-6 mb-2">Emplacement</legend>
          <fieldset class="border rounded p-3 h-100">
            <select-emplacement
              v-model="form.emplacementRepresentee.parent_id"
              :emplacement-id-to-ignore="form.emplacementRepresentee.id ?? -1"
              :emplacement-racine="true"
              label="Où sera garé ce véhicule"
              class="mb-3"
            />
            <select-couleur
              v-model="form.emplacementRepresentee.couleur_id"
              label="Couleur de l'emplacement"
              class="mb-3"
            />
            <base-checkbox
              v-model="form.emplacementRepresentee.est_etiquete"
              class="mb-3"
              label="Emplacement étiqueté"
            />
            <base-checkbox
              v-model="form.emplacementRepresentee.est_compartimentable"
              class="mb-0"
              label="Emplacement compartimenté"
            />
          </fieldset>
        </div>
      </div>

      <template v-else>
        <div v-if="type && form.emplacement_id" class="mb-3">
          <label for="compartiment">Compartiment</label>
          <input
            id="compartiment"
            v-model="form.compartiment"
            type="text"
            class="form-control form-control-sm"
            :class="{ 'is-invalid': errors['compartiment'] }"
          />
        </div>
        <base-checkbox
          v-model="form.est_etiquete"
          class="mb-3"
          label="Est étiquetté correctement"
        />
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
      </template>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="closeModal">Fermer</button>
      <button type="submit" class="btn btn-primary">
        {{ form.id ? "Modifier" : "Ajouter" }}
      </button>
    </div>
  </form>
</template>
