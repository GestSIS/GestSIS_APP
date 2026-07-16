<script setup>
import { computed, nextTick, reactive, ref, useTemplateRef } from "vue";
import useNotification from "../../composables/useNotification.js";
import { useSapeurStore } from "../../stores/sapeur/Sapeur.js";
import { useExerciceComptableStore } from "../../stores/comptabilite/ExerciceComptable.js";
import { useModalStore } from "../../stores/common/Modal.js";
import { useUniteStore } from "../../stores/common/Unite.js";
import { useTravailTypeStore } from "../../stores/travail/TravailType.js";
import { useAuthStore } from "../../stores/auth/Auth.js";

import permissions from "../../composables/permissions.js";
import useHasPermission from "../../composables/usePermission.js";
import { useTravailStore } from "../../stores/travail/Travail.js";

const { callback, data } = defineProps({
  callback: {
    type: Function,
    default: () => {},
  },
  data: {
    type: Object,
    default: () => {},
  },
});

const authStore = useAuthStore();
const sapeurStore = useSapeurStore();
const exerciceComptableStore = useExerciceComptableStore();
const uniteStore = useUniteStore();
const travailStore = useTravailStore();
const travailTypeStore = useTravailTypeStore();

const errors = ref({});
const form = reactive({
  exercice_comptable_id: exerciceComptableStore.activeId,
  sapeurs: [
    {
      sapeur_id: data.sapeur_id ?? authStore.sapeurId,
      quantite: data.quantite,
    },
  ],
  ...data,
});

const unites = computed(() => uniteStore.liste);
const travailTypes = computed(() => travailTypeStore.liste);
const sapeurs = computed(() => sapeurStore.liste.filter((s) => s.actif));
const hasSaisieCommunePermission = useHasPermission(permissions.FICHE_TRAVAIL.SAISIE_COMMUNE);

const activeUnite = computed(() =>
  unites.value.find(
    (u) => u.id === travailTypes.value.find((t) => t.id === form.travail_type_id)?.type_unite_id,
  ),
);

const { closeModal } = useModalStore();
const awn = useNotification();

const sapeurSelecteurInputs = useTemplateRef(`sapeur-selecteur`);
const ajoutType = () => {
  form.sapeurs.push({
    sapeur_id: null,
    quantite: null,
  });

  nextTick(() => {
    sapeurSelecteurInputs.value[sapeurSelecteurInputs.value.length - 1].focus();
  });
};
const supprimerType = (i) => {
  form.sapeurs.splice(i, 1);
};
const save = async () => {
  errors.value = {};

  // Contrôle qu'aucune colonne n'est dupliquée
  const sapeurIds = new Set(form.sapeurs.map((e) => e.sapeur_id));
  if (sapeurIds.size != form.sapeurs.length) {
    awn.alert("Erreur, un sapeur a été saisie à double.");
    return;
  }

  // Return en cas d'erreurs
  if (Object.keys(errors.value).length > 0) {
    return;
  }

  if (!activeUnite.value?.comptable) {
    form.sapeurs = form.sapeurs.map((s) => ({
      ...s,
      quantite: 1,
    }));
  }

  let promise = null;
  if ((form.id ?? 0) === 0) {
    const travaux = form.sapeurs.map((s) => ({
      ...form,
      sapeurs: undefined,
      ...s,
    }));
    promise = travailStore.addTravaux(travaux);
  } else {
    if (!form.sapeurs[0]) return;
    const travail = {
      ...form,
      sapeur_id: form.sapeurs[0].sapeur_id,
      quantite: form.sapeurs[0].quantite,
    };
    promise = travailStore.updateTravail(travail);
  }
  promise
    .then(() => {
      callback(true);
      closeModal();
    })
    .catch((err) => {
      errors.value = err;
      awn.alert(err?.message ?? "Erreur lors de l'enregistrement");
    });
};
</script>

<template>
  <form @submit.prevent="save">
    <div class="modal-header">
      <h5 class="modal-title">{{ form.id ? "Modifier" : "Ajouter" }} un travail</h5>
      <button type="button" class="btn-close" @click="closeModal()"></button>
    </div>
    <div class="modal-body">
      <base-select
        v-model="form.travail_type_id"
        :required="true"
        class="mb-3"
        :class="{ 'is-invalid': errors['travail_type_id'] }"
        :options="travailTypes"
        label="Travail"
      />
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
      <div class="mb-3">
        <label for="date">Date</label>
        <input
          id="date"
          v-model="form.date"
          required
          type="date"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['date'] }"
        />
      </div>
      <base-select
        v-if="form?.id && hasSaisieCommunePermission"
        v-model="form.sapeurs[0].sapeur_id"
        :required="true"
        class="mb-3"
        label="Sapeur"
        display-key="nom_prenom"
        :options="sapeurs"
      />
      <label v-if="form?.id || !hasSaisieCommunePermission" for="quantite">Quantité</label>
      <div v-if="form?.id || !hasSaisieCommunePermission" class="input-group input-group-sm mb-3">
        <input
          id="quantite"
          v-model="form.sapeurs[0].quantite"
          required
          name="quantite"
          type="number"
          min="0"
          step=".01"
          class="form-control form-control-sm"
        />
        <span class="input-group-text">
          {{
            unites.find(
              (u) => u.id == travailTypes.find((t) => t.id == form.travail_type_id)?.type_unite_id,
            )?.unite
          }}</span
        >
      </div>
      <div v-if="!form?.id && hasSaisieCommunePermission" class="mb-3">
        <table class="table table-sm">
          <thead>
            <tr>
              <th>Sapeur</th>
              <th>Quantité</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, i) in form.sapeurs" :key="i">
              <td class="col-8">
                <base-select
                  ref="sapeur-selecteur"
                  v-model="item.sapeur_id"
                  :required="true"
                  :class="{ 'is-invalid': errors['base-type' + i] }"
                  display-key="nom_prenom"
                  :options="sapeurs"
                />
              </td>
              <td class="col-3">
                <div class="input-group input-group-sm">
                  <input
                    v-if="activeUnite?.comptable"
                    id="quantite"
                    v-model="item.quantite"
                    required
                    type="number"
                    min="0"
                    step=".01"
                    class="form-control form-control-sm"
                    :class="{ 'is-invalid': errors['base-quantite' + i] }"
                  />
                  <input
                    v-if="!activeUnite?.comptable"
                    :value="1"
                    required
                    type="number"
                    :disabled="true"
                    class="form-control form-control-sm"
                    :class="{ 'is-invalid': errors['base-quantite' + i] }"
                  />
                  <span class="input-group-text"> {{ activeUnite?.unite }}</span>
                </div>
              </td>
              <td class="text-center">
                <button
                  type="button"
                  class="btn btn-outline-danger border-0"
                  :disabled="form.sapeurs.length <= 1"
                  @click="supprimerType(i)"
                >
                  <font-awesome-icon :icon="['far', 'trash-alt']" />
                </button>
              </td>
            </tr>
            <tr>
              <td colspan="3">
                <button type="button" class="btn btn-outline-primary" @click="ajoutType()">
                  Ajouter
                  <font-awesome-icon size="1x" :icon="['far', 'plus-square']" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="closeModal()">Fermer</button>
      <button type="submit" class="btn btn-primary">
        {{ form.id ? "Modifier" : "Ajouter" }}
      </button>
    </div>
  </form>
</template>
