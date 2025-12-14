<script setup>
import { computed, inject, ref } from 'vue';
import { useUniteStore } from '../../stores/common/Unite.js';
import { useFonctionStore } from '../../stores/sapeur/Fonction.js';
import { useAmendeStore } from '../../stores/comptabilite/Amende.js';
import { useCompteStore } from '../../stores/comptabilite/Compte.js';
import { useEcritureCategorieStore } from '../../stores/comptabilite/EcritureCategorie.js';

const uniteStore = useUniteStore();
const fonctionStore = useFonctionStore();
const amendeStore = useAmendeStore();
const compteStore = useCompteStore();
const ecritureCategorieStore = useEcritureCategorieStore();

const loadAmendes = amendeStore.fetchAmendes();
const loadFonctions = fonctionStore.fetchFonctions();
const loadComptes = compteStore.fetchComptes();
const loadUnites = uniteStore.fetchUnites();

await Promise.all([loadAmendes, loadFonctions, loadComptes, loadUnites]);

const errors = ref({});
const params = ref({
  compte_id: null,
  ecriture_categorie_id: null,
  amendes: [],
});

const listeAmende = computed(() =>
  amendeStore.liste.sort((a, b) => a.order - b.order),
);
const listeCompte = computed(() => compteStore.liste);
const listeCategorie = computed(() => ecritureCategorieStore.liste);

if (listeAmende.value.length > 0) {
  params.value.compte_id = listeAmende.value[0]?.compte_id;
  params.value.ecriture_categorie_id =
    listeAmende.value[0]?.ecriture_categorie_id;
  params.value.amendes = listeAmende.value.map((a) => ({
    montant: a.montant,
  }));
}

const removeAmende = (index) => {
  params.value.amendes.splice(index, 1);
};
const updateAmende = (index, e) => {
  params.value.amendes[index].montant = e.target.value;
};
const addAmende = () => {
  params.value.amendes = [...params.value.amendes, { montant: 0 }];
};

const awn = inject('awn');
const save = async () => {
  amendeStore
    .updateAmendes(params.value)
    .then((res) => {
      errors.value = {};
      awn.success(res?.message || 'Modifications enregistrées');
    })
    .catch((err) => {
      errors.value = err;
      awn.alert(e?.message || "Erreur lors de l'enregistrement");
    });
};
</script>

<template>
  <div class="card card-primary card-outline">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Amendes</h3>
      <button type="button" class="btn btn-primary" @click="save()">
        Enregistrer
      </button>
    </div>
    <div class="card-body">
      <div class="row">
        <base-select
          v-model="params.compte_id"
          class="mb-3 col-6"
          :class="{ 'is-invalid': errors['compte_id'] }"
          label="Compte"
          :options="listeCompte.map((c) => ({ ...c, designation: c?.label }))"
        />
        <base-select
          v-model="params.ecriture_categorie_id"
          class="mb-3 col-6"
          :class="{ 'is-invalid': errors['ecriture_categorie_id'] }"
          label="Catégorie comptable"
          :options="listeCategorie"
        />
      </div>
      <table id="indemnites-anuelles" class="table table-sm">
        <thead>
          <tr>
            <th>#</th>
            <th>Montant</th>
            <th class="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!params.amendes.length">
            <td colspan="3">Aucune amende</td>
          </tr>
          <tr v-for="(a, index) in params.amendes" :key="a.id">
            <td>{{ index + 1 }}</td>
            <td>
              <input
                class="form-control form-control-sm"
                type="text"
                :value="params.amendes[index].montant"
                @change="(e) => updateAmende(index, e)"
              />
            </td>
            <td class="align-middle text-center">
              <button
                type="button"
                class="btn btn-outline-danger border-0"
                @click="removeAmende(index)"
              >
                <font-awesome-icon :icon="['far', 'trash-alt']" />
              </button>
            </td>
          </tr>
        </tbody>
        <button class="btn btn-primary" @click="addAmende">+</button>
      </table>
    </div>
  </div>
</template>
