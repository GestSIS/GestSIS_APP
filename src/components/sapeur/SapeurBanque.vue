<script setup>
import { computed, inject, watchEffect } from 'vue';
import { useSapeurStore } from '../../stores/sapeur/Sapeur.js';
import permissions from '/src/store/permissions.js';
import useHasPermission from '../../hooks/usePermission';

const sapeurStore = useSapeurStore();
const awn = inject('awn');

const activeSapeur = computed(() => sapeurStore.active.data);
const hasEditPermission = useHasPermission(permissions.SAPEUR.MODIFICATION);

watchEffect(() => sapeurStore.fetchSapeur(sapeurStore.active.id));

const save = async () => {
  sapeurStore
    .saveActiveSapeur({
      iban: activeSapeur.value.iban,
    })
    .then(() => awn.success('Modification enregistrée'))
    .catch((err) => awn.alert(err?.message ?? 'Erreur lors la sauvegarde'));
};
</script>

<template>
  <div class="row">
    <div class="col-12">
      <div class="card card-primary card-outline">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Informations bancaires</h3>
          <button
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
              name="nom"
              :readonly="!hasEditPermission"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
