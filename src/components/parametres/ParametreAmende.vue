<script setup>
import { computed, ref } from "vue";
import useNotification from "../../composables/useNotification.js";
import { useUniteStore } from "../../stores/common/Unite.js";
import { useFonctionStore } from "../../stores/sapeur/Fonction.js";
import { useAmendeStore } from "../../stores/comptabilite/Amende.js";
import { useCompteStore } from "../../stores/comptabilite/Compte.js";
import { useEcritureCategorieStore } from "../../stores/comptabilite/EcritureCategorie.js";

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

const listeAmende = computed(() => amendeStore.liste.slice().sort((a, b) => a.order - b.order));
const listeCompte = computed(() => compteStore.liste);
const listeCategorie = computed(() => ecritureCategorieStore.liste);

// idx sert de clé stable pour l'édition/suppression par position (les
// amendes n'ont pas d'identifiant propre côté formulaire).
const amendesData = computed(() => params.value.amendes.map((a, idx) => ({ ...a, idx })));
const fields = [
  { title: "#", key: "idx", formatter: (idx) => idx + 1 },
  { title: "Montant", key: "montant", slot: "montant" },
  {
    title: "Actions",
    slot: "actions",
    titleClass: "text-center",
    columnClass: "align-middle text-center",
  },
];

if (listeAmende.value.length > 0) {
  params.value.compte_id = listeAmende.value[0]?.compte_id;
  params.value.ecriture_categorie_id = listeAmende.value[0]?.ecriture_categorie_id;
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

const awn = useNotification();
const save = async () => {
  amendeStore
    .updateAmendes(params.value)
    .then((res) => {
      errors.value = {};
      awn.success(res?.message || "Modifications enregistrées");
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
      <button type="button" class="btn btn-primary" @click="save()">Enregistrer</button>
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
      <base-table
        id="indemnites-anuelles"
        class="table-sm"
        select-key="idx"
        :fields="fields"
        :data="amendesData"
        no-data="Aucune amende"
        :hide-download="true"
      >
        <template #montant="{ rowData }">
          <input
            class="form-control form-control-sm"
            type="text"
            :value="rowData.montant"
            @change="(e) => updateAmende(rowData.idx, e)"
          />
        </template>
        <template #actions="{ rowData }">
          <button
            type="button"
            class="btn btn-outline-danger border-0"
            @click="removeAmende(rowData.idx)"
          >
            <font-awesome-icon :icon="['far', 'trash-alt']" />
          </button>
        </template>
      </base-table>
      <button class="btn btn-primary mt-2" @click="addAmende">+</button>
    </div>
  </div>
</template>
