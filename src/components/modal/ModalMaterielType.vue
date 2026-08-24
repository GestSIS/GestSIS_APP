<script setup>
import { ref } from "vue";
import useNotification from "../../composables/useNotification.js";
import { useMaterielTypeStore } from "../../stores/materiel/Type.js";
import { useTuyauDiametreStore } from "../../stores/materiel/TuyauDiametre.js";
import { useBatterieTypeStore } from "../../stores/materiel/BatterieType.js";
import { useModalStore } from "../../stores/common/Modal.js";
import SelectCategorie from "../materiel/SelectCategorie.vue";

const { data } = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
});

const errors = ref({});
const activeItem = ref({
  type: 0,
  est_attribuable: false,
  est_numerote: false,
  est_taillee: false,
  est_lavable: false,
  ...data,
  tuyau: data?.tuyau ?? {
    separement: true,
  },
  batterie: data.batterie ?? {},
});

const typeStore = useMaterielTypeStore();
const diametreStore = useTuyauDiametreStore();
const batterieStore = useBatterieTypeStore();

await Promise.all([diametreStore.fetchTuyauDiametres(), batterieStore.fetchBatterieTypes()]);

const { closeModal, resize } = useModalStore();
resize(1);
const awn = useNotification();
const save = async () => {
  if (activeItem.value.materiel_categorie_id == null) {
    awn.alert("Veuillez sélectionnez une catégorie");
    return;
  }
  ((activeItem.value.id || 0) === 0 ? typeStore.addMaterielType : typeStore.updateMaterielType)(
    activeItem.value,
  )
    .then(closeModal)
    .catch((err) => (errors.value = err));
};
</script>

<template>
  <form @submit.prevent="save">
    <div class="modal-header">
      <h5 class="modal-title">{{ activeItem.id ? "Modifier" : "Ajouter" }} un matériel type</h5>
      <button type="button" class="btn-close" @click="closeModal"></button>
    </div>
    <div class="modal-body">
      <div class="row">
        <div class="col-6">
          <div class="mb-3">
            <label for="designation">Désignation</label>
            <input
              id="designation"
              v-model="activeItem.designation"
              required
              type="text"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['designation'] }"
            />
          </div>
          <base-select
            v-model="activeItem.type"
            :required="true"
            class="mb-3"
            label="Type"
            :options="[
              { id: 0, designation: 'Standard' },
              { id: 1, designation: 'Tuyau' },
              { id: 2, designation: 'Batterie' },
              { id: 3, designation: 'Vehicule' },
            ]"
          />
          <select-categorie
            v-model="activeItem.materiel_categorie_id"
            :class="{ 'is-invalid': errors['materiel_categorie_id'] }"
            label="Catégorie"
            class="mb-3"
          />
          <div class="mb-3">
            <label for="designation">Fournisseur</label>
            <input
              id="fournisseur"
              v-model="activeItem.fournisseur"
              type="text"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['fournisseur'] }"
            />
          </div>
          <div class="mb-3">
            <label for="prix">Prix</label>
            <input
              id="prix"
              v-model="activeItem.prix"
              type="text"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['prix'] }"
            />
          </div>
          <div class="mb-3">
            <label for="reparateur">Réparateur</label>
            <input
              id="reparateur"
              v-model="activeItem.reparateur"
              type="text"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['reparateur'] }"
            />
          </div>
          <div class="mb-0">
            <label for="remarque">Remarque</label>
            <input
              id="remarque"
              v-model="activeItem.remarque"
              type="text"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['remarque'] }"
            />
          </div>
        </div>
        <div class="col-6">
          <legend class="w-auto px-2 fs-6 mb-2">Propriétés</legend>
          <fieldset class="border rounded p-3 mb-3">
            <base-checkbox
              v-if="activeItem.type !== 3"
              v-model="activeItem.est_attribuable"
              class="mb-3"
              label="Est attribuable"
            />
            <base-checkbox
              v-if="activeItem.type !== 3"
              v-model="activeItem.est_taillee"
              class="mb-3"
              label="Possède une taille"
            />
            <base-checkbox
              v-if="activeItem.type !== 3"
              v-model="activeItem.est_lavable"
              class="mb-3"
              label="Suivi des lavages"
            />
            <base-checkbox
              v-model="activeItem.est_numerote"
              :class="activeItem.est_numerote ? 'mb-3' : 'mb-0'"
              label="Est numéroté"
            />
            <div v-if="activeItem.est_numerote" class="mb-0">
              <label for="designation">Préfix (numérotation)</label>
              <input
                id="prefix"
                v-model="activeItem.prefix"
                type="text"
                class="form-control form-control-sm"
                :class="{ 'is-invalid': errors['prefix'] }"
              />
            </div>
          </fieldset>
          <template v-if="activeItem.type === 1">
            <legend class="w-auto px-2 fs-6 mb-2">Tuyau</legend>
            <fieldset class="border rounded p-3">
              <div class="mb-3">
                <label for="longeur">Longeur (m)</label>
                <input
                  id="longeur"
                  v-model="activeItem.tuyau.longeur"
                  type="number"
                  class="form-control form-control-sm"
                  :class="{ 'is-invalid': errors['longeur'] }"
                  placeholder="20"
                  required
                />
              </div>
              <base-select
                v-model="activeItem.tuyau.tuyau_diametre_id"
                label="Diamètre"
                class="mb-3"
                :options="diametreStore.liste"
                display-key="diametre"
                :required="true"
              />
              <base-select
                v-model="activeItem.tuyau.separement"
                label="Roulé"
                class="mb-0"
                :options="[
                  { id: true, designation: 'Séparément' },
                  { id: false, designation: 'Dévidoire' },
                ]"
                :required="true"
              />
            </fieldset>
          </template>
          <template v-if="activeItem.type === 2">
            <legend class="w-auto px-2 fs-6 mb-2">Batterie</legend>
            <fieldset class="border rounded p-3">
              <div class="mb-3">
                <label for="nombre">Nombre</label>
                <input
                  id="nombre"
                  v-model="activeItem.batterie.nombre"
                  type="number"
                  class="form-control form-control-sm"
                  :class="{ 'is-invalid': errors['nombre'] }"
                  min="1"
                  required
                />
              </div>
              <base-select
                v-model="activeItem.batterie.batterie_type_id"
                label="Modèle"
                class="mb-0"
                :options="batterieStore.liste"
                display-key="nom"
                :required="true"
              />
            </fieldset>
          </template>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="closeModal">Fermer</button>
      <button type="submit" class="btn btn-primary">
        {{ activeItem.id ? "Modifier" : "Ajouter" }}
      </button>
    </div>
  </form>
</template>
