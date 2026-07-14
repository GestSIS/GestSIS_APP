<script setup>
import { computed, reactive, ref } from 'vue';
import useNotification from '../../composables/useNotification.js';
import { useCompteStore } from '../../stores/comptabilite/Compte.js';
import { useTravailTypeStore } from '../../stores/travail/TravailType.js';
import { useEcritureCategorieStore } from '../../stores/comptabilite/EcritureCategorie.js';
import { useModalStore } from '../../stores/common/Modal.js';
import { useUniteStore } from '../../stores/common/Unite.js';

const uniteStore = useUniteStore();
const compteStore = useCompteStore();
const ecritureCategorieStore = useEcritureCategorieStore();
const travailTypeStore = useTravailTypeStore();

const { data } = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
});

const errors = ref({});
const form = reactive({
  actif: true,
  fonctions: [],
  type_unite_id: 6,
  ...data,
});
const base = ref(data?.fonctions?.filter((f) => !f.fonction_id) || []);
if (!base.value.length) {
  // Ajout d'un revenu de base de type solde
  base.value.push({
    type: 1,
    id: null,
    tarif: null,
    tarif_min: null,
    tarif_min_pour: null,
    compte_id: null,
    fonction_id: null,
  });
}

const unites = computed(() => uniteStore.liste); //.filter(u => !(u.id in [3, 4, 5, 7])))
const comptes = computed(() => compteStore.liste);
const categories = computed(() => ecritureCategorieStore.liste);

const { closeModal } = useModalStore();
const awn = useNotification();

const ajoutType = () => {
  base.value.push({
    type: 1,
    tarif: null,
    tarif_min: null,
    tarif_min_pour: null,
    compte_id: null,
    fonction_id: null,
  });
};
const supprimerType = (i) => {
  base.value.splice(i, 1);
};
const save = async () => {
  errors.value = {};

  // Contrôle qu'aucune colonne n'est dupliquée
  const baseSet = new Set(base.value.map((e) => e.type + ' ' + e.compte_id));
  if (baseSet.size != base.value.length) {
    awn.alert(
      "Erreur, la même combinaison 'type' & 'compte' est utilisé à plusieurs reprises.",
    );
    return;
  }

  // Contrôle des données de base
  base.value.forEach((e, i) => {
    if (!e.type) errors.value['base-type' + i] = true;
    if (!e.compte_id) errors.value['base-compte' + i] = true;
    if (!e.tarif || e.tarif < 0) errors.value['base-tarif' + i] = true;
    if (e.tarif_min && e.tarif_min < 0)
      errors.value['base-tarif-min' + i] = true;
    if (e.tarif_min_pour && e.tarif_min_pour < 0)
      errors.value['base-tarif-min-pour' + i] = true;
  });

  // Return en cas d'erreurs
  if (Object.keys(errors.value).length > 0) {
    return;
  }

  // Generate data
  const indemnite = {
    ...form,
    fonctions: [...base.value],
  };

  ((indemnite.id || 0) === 0
    ? travailTypeStore.addTravailType
    : travailTypeStore.updateTravailType)(indemnite)
    .then(closeModal)
    .catch((err) => (errors.value = err));
};
</script>

<template>
  <form @submit.prevent="save">
    <div class="modal-header">
      <h5 class="modal-title">
        {{ form.id ? 'Modifier' : 'Ajouter' }} un travail type
      </h5>
      <button type="button" class="btn-close" @click="closeModal()"></button>
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
      <base-select
        v-model="form.type_unite_id"
        class="mb-3"
        :required="true"
        :class="{ 'is-invalid': errors['type_unite_id'] }"
        label="Unité"
        display-key="unite"
        :options="unites"
      />
      <div class="mb-3">
        <table class="table table-sm">
          <thead>
            <tr>
              <th>Type</th>
              <th>Tarif</th>
              <th>Compte</th>
              <th v-if="base.length > 1"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(indemnite, i) in base" :key="i">
              <td class="col-3">
                <base-select
                  v-model="base[i].type"
                  :required="true"
                  :class="{ 'is-invalid': errors['base-type' + i] }"
                  :options="[
                    { id: 1, designation: 'Solde' },
                    { id: 2, designation: 'Indemnite' },
                    { id: 3, designation: 'Frais forfaitaire' },
                    { id: 4, designation: 'Frais effectif' },
                  ]"
                />
              </td>
              <td class="col-3">
                <div class="input-group input-group-sm">
                  <input
                    id="tarif"
                    v-model="base[i].tarif"
                    required
                    type="text"
                    class="form-control form-control-sm"
                    :class="{ 'is-invalid': errors['base-tarif' + i] }"
                  />
                  <span class="input-group-text">
                    CHF /
                    {{
                      unites.find((u) => u.id == form.type_unite_id)?.unite
                    }}</span
                  >
                </div>
              </td>
              <td class="col-7">
                <base-select
                  v-model="base[i].compte_id"
                  :required="true"
                  :class="{ 'is-invalid': errors['base-compte' + i] }"
                  display-key="label"
                  :options="comptes"
                />
              </td>
              <td v-if="base.length > 1" class="text-center">
                <button
                  type="button"
                  class="btn btn-outline-danger border-0"
                  @click="supprimerType(i)"
                >
                  <font-awesome-icon :icon="['far', 'trash-alt']" />
                </button>
              </td>
            </tr>
            <tr>
              <td :colspan="base.length > 1 ? 5 : 4">
                <button
                  type="button"
                  class="btn btn-outline-primary"
                  @click="ajoutType()"
                >
                  Ajouter
                  <font-awesome-icon size="1x" :icon="['far', 'plus-square']" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <base-select
        v-model="form.ecriture_categorie_id"
        :required="true"
        class="mb-3"
        :class="{ 'is-invalid': errors['ecriture_categorie_id'] }"
        :options="categories"
        label="Catégorie comptable"
      />
      <base-checkbox v-model="form.actif" class="mb-3" label="Actif" />
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="closeModal()">
        Fermer
      </button>
      <button type="submit" class="btn btn-primary">
        {{ form.id ? 'Modifier' : 'Ajouter' }}
      </button>
    </div>
  </form>
</template>
