<script setup>
import { computed, ref } from 'vue';
import useNotification from '../../composables/useNotification.js';
import { useAvsParamStore } from '../../stores/comptabilite/AvsParam.js';
import { useCompteStore } from '../../stores/comptabilite/Compte.js';
import { useEcritureCategorieStore } from '../../stores/comptabilite/EcritureCategorie.js';
import { useImputationStore } from '../../stores/comptabilite/Imputation.js';

const avsParamStore = useAvsParamStore();
const compteStore = useCompteStore();
const ecritureCategorieStore = useEcritureCategorieStore();
const imputationStore = useImputationStore();
await imputationStore.fetchFraisIndemnitesTypes();

const listeCompte = computed(() => compteStore.liste);
const listeCategorie = computed(() => ecritureCategorieStore.liste);
const avsParams = computed(() => avsParamStore.params);

const errors = ref({});
const params = ref({
  taux_avs: null,
  taux_ac: null,
  franchise_avs: null,
  franchise_imposition: null,
  franchise_imposition_cantonale: null,
  compte_id: null,
});

params.value = avsParams.value ? avsParams.value : params.value;

const awn = useNotification();

const save = async () => {
  try {
    const res = await avsParamStore.updateAvsParams(params.value);
    errors.value = {};
    awn.success(res?.message || 'Modifications enregistrées');
  } catch (err) {
    errors.value = err;
    awn.alert(err?.message || "Erreur lors de l'enregistrement");
  }
};
</script>

<template>
  <div class="row">
    <div class="col-12">
      <div class="card card-primary card-outline">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Côtisations sociales</h3>
          <button type="button" class="btn btn-primary" @click="save">
            Enregistrer
          </button>
        </div>
        <div class="card-body">
          <div class="mb-3">
            <label for="taux_avs"
              >Taux AVS/AI/APG<font-awesome-icon
                v-tooltip.bottom="{
                  content: 'Taux disponible dans le memento AVS 2.01',
                  html: true,
                }"
                class="ms-1"
                :icon="['far', 'question-circle']"
            /></label>
            <input
              id="taux_avs"
              v-model="params.taux_avs"
              type="text"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['taux_avs'] }"
            />
          </div>
          <div class="mb-3">
            <label for="taux_ac"
              >Taux AC<font-awesome-icon
                v-tooltip.bottom="{
                  content: 'Taux disponible dans le memento AC 2.08',
                  html: true,
                }"
                class="ms-1"
                :icon="['far', 'question-circle']"
            /></label>
            <input
              id="taux_ac"
              v-model="params.taux_ac"
              type="text"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['taux_ac'] }"
            />
          </div>
          <div class="mb-3">
            <label for="franchise_avs">Franchise AVS</label>
            <input
              id="franchise_avs"
              v-model="params.franchise_avs"
              type="text"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['franchise_avs'] }"
            />
          </div>
          <div class="mb-3">
            <label for="franchise_imposition"
              >Franchise imposition fédéral</label
            >
            <input
              id="franchise_imposition"
              v-model="params.franchise_imposition"
              type="text"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['franchise_imposition'] }"
            />
          </div>
          <div class="mb-3">
            <label for="franchise_imposition"
              >Franchise imposition cantonale</label
            >
            <input
              id="franchise_imposition_cantonale"
              v-model="params.franchise_imposition_cantonale"
              type="text"
              class="form-control form-control-sm"
              :class="{
                'is-invalid': errors['franchise_imposition_cantonale'],
              }"
            />
          </div>
          <base-select
            v-model="params.compte_id"
            class="mb-3"
            :class="{ 'is-invalid': errors['compte_id'] }"
            label="Compte"
            :options="listeCompte.map((c) => ({ ...c, designation: c?.label }))"
          />
          <base-select
            v-model="params.ecriture_categorie_id"
            class="mb-3"
            :class="{ 'is-invalid': errors['ecriture_categorie_id'] }"
            label="Catégorie comptable"
            :options="listeCategorie"
          />
        </div>
      </div>
    </div>
  </div>
</template>
