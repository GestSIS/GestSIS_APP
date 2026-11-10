<script setup>
import { computed, watchEffect } from "vue";
import { useNotification } from "../../composables/useNotification.js";
import { useSapeurStore } from "../../stores/sapeur/Sapeur.js";
import permissions from "/src/composables/permissions.js";
import { useHasPermission } from "../../composables/useHasPermission.js";
import { useSubmit } from "../../composables/useSubmit.js";

const sapeurStore = useSapeurStore();
const awn = useNotification();

const activeSapeur = computed(() => sapeurStore.active.data);
const hasEditPermission = useHasPermission(permissions.SAPEUR.MODIFICATION);
const { errors, isSubmitting, submit } = useSubmit();

watchEffect(() => sapeurStore.fetchSapeur(sapeurStore.active.id));

const save = async () => {
  const { ok } = await submit(
    () => sapeurStore.saveActiveSapeur({ iban: activeSapeur.value.iban }),
    "Erreur lors de la sauvegarde",
  );
  if (ok) {
    awn.success("Modification enregistrée");
  }
};
</script>

<template>
  <div class="row">
    <div class="col-12">
      <div class="card card-primary card-outline">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Informations bancaires</h3>
          <button
            :disabled="isSubmitting"
            v-if="hasEditPermission"
            class="btn btn-primary"
            @click.prevent="save"
          >
            Enregistrer
          </button>
        </div>
        <div class="card-body">
          <div class="mb-3">
            <label for="f-sap-nom">IBAN</label>
            <input
              id="f-sap-nom"
              v-model="activeSapeur.iban"
              type="text"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['iban'] }"
              name="nom"
              :readonly="!hasEditPermission"
            />
            <div v-if="errors['iban']" class="invalid-feedback d-block">
              {{ errors["iban"] }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
