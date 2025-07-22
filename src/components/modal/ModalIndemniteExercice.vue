<script setup>
import { computed, inject, reactive, ref, watchEffect } from 'vue';
import { useStore } from 'vuex';
import { useModalStore } from '../../stores/common/Modal.js';

const store = useStore();

const { data } = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
});

const errors = ref({});
const form = reactive({
  type_unite_id: 6,
  fonctions: [],
  par_fonction: false,
  ...data,
});
const columnCreationIndex = ref(0);
const columns = ref([]);
const base = ref([]);

const { closeModal, resize } = useModalStore();
const awn = inject('awn');

watchEffect(() => resize(form.par_fonction ? 2 : 1));

const configurations = new Set(
  data?.fonctions
    ?.filter((f) => f.fonction_id)
    ?.map((f) => f.type + ' ' + f.compte_id) || [],
);
columns.value = Object.fromEntries(
  [...configurations]
    .map((e) => [e, e.split(' ')])
    .map(([index, e]) => [
      index,
      {
        type: e[0],
        compte_id: e[1],
        fonctions: {},
      },
    ]),
);

data?.fonctions
  ?.filter((f) => f.fonction_id)
  ?.forEach((f) => {
    columns.value[f.type + ' ' + f.compte_id].fonctions[f.fonction_id] =
      f.tarif;
  });

// Ajout un type par défault en cas d'utilisation des indemnités par fonction
if (!Object.keys(columns.value).length) {
  columns.value[columnCreationIndex.value] = {
    type: 1,
    compte_id: null,
    fonctions: [],
  };
  columnCreationIndex.value++;
}

base.value = data?.fonctions?.filter((f) => !f.fonction_id) || [];
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

const fonctions = computed(() => store.state.fonction.liste);
const unites = computed(() => store.state.unite.liste); //.filter(u => !(u.id in [3, 4, 5, 7])),
const comptes = computed(() => store.state.compte.liste);
const categories = computed(() => store.state.ecritureCategorie.liste);

const compte = (compte) => {
  return `${compte?.numero} ${compte.designation}`;
};
const fonction = (id) => {
  return fonctions.value.find((f) => f.id === id)?.nom;
};
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
const ajoutTypePourFonction = () => {
  columns.value[columnCreationIndex.value] = {
    type: 1,
    compte_id: null,
    fonctions: [],
  };
  columnCreationIndex.value++;
};
const supprimerTypePourFonction = (i) => {
  delete columns.value[i];
};
const save = () => {
  errors.value = {};

  // Contrôle qu'aucune colonne n'est dupliquée
  const baseSet = new Set(base.value.map((e) => e.type + ' ' + e.compte_id));
  if (baseSet.size != base.value.length) {
    awn.alert(
      "Erreur, la même combinaison 'type' & 'compte' est utilisé à plusieurs reprises.",
    );
    return;
  }

  if (form.par_fonction) {
    const columnsFonctionsSet = new Set(
      Object.values(columns.value).map((e) => e.type + ' ' + e.compte_id),
    );
    if (columnsFonctionsSet.size != Object.keys(columns.value).length) {
      awn.alert(
        "Erreur, la même combinaison 'type' & 'compte' est utilisé à plusieurs reprise dans les fonctions.",
      );
      return;
    }
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
  if (form.par_fonction) {
    Object.values(columns.value).forEach((e, i) => {
      if (!e.type) errors.value['column-type' + i] = true;
      if (!e.compte_id) errors.value['column-compte' + i] = true;
    });
  }

  // Return en cas d'erreurs
  if (Object.keys(errors.value).length > 0) {
    return;
  }

  // Generate data
  const foncs = [...base.value];

  // TODO: Set tarif_min to null if unite == forfait
  if (form.par_fonction) {
    foncs.push(
      ...Object.values(columns.value)
        .map((e) => [
          ...Object.entries(e.fonctions).map(([f, tarif]) => ({
            type: e.type,
            compte_id: e.compte_id,
            fonction_id: f,
            tarif: tarif,
          })),
        ])
        .reduce((e, acc) => [...acc, ...e], []),
    );
  }

  const indemnite = {
    ...form,
    foncs,
  };

  const action =
    (indemnite.id || 0) === 0
      ? 'addIndemniteExercice'
      : 'updateIndemniteExercice';
  store
    .dispatch(action, indemnite)
    .then(closeModal)
    .catch((err) => (errors.value = err));
};
</script>

<template>
  <form @submit.prevent="save">
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">
        {{ form.id ? 'Modifier' : 'Ajouter' }} une indemnité pour exercice
      </h5>
      <button type="button" class="btn-close" @click="closeModal()"></button>
    </div>
    <div class="modal-body">
      <div class="row">
        <div
          :class="{
            'col-6': form.par_fonction,
            'col-12': !form.par_fonction,
          }"
        >
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
            :required="true"
            class="mb-3"
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
                  <td class="col-2">
                    <base-select
                      v-model="base[i].type"
                      :class="{ 'is-invalid': errors['base-type' + i] }"
                      :required="true"
                      :options="[
                        { id: 1, designation: 'Solde' },
                        { id: 2, designation: 'Indemnite' },
                      ]"
                    />
                  </td>
                  <td class="col-2">
                    <input
                      v-model="base[i].tarif"
                      required
                      type="text"
                      class="form-control form-control-sm"
                      :class="{ 'is-invalid': errors['base-tarif' + i] }"
                    />
                  </td>
                  <td class="col-6">
                    <select
                      v-model="base[i].compte_id"
                      required
                      class="form-select form-select-sm"
                      :class="{ 'is-invalid': errors['base-compte' + i] }"
                    >
                      <option v-for="c in comptes" :key="c.id" :value="c.id">
                        {{ compte(c) }}
                      </option>
                    </select>
                  </td>
                  <td v-if="base.length > 1" class="text-center col-1">
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
                  <td :colspan="base.length > 1 ? 6 : 5">
                    <button
                      type="button"
                      class="btn btn-outline-primary"
                      @click="ajoutType()"
                    >
                      Ajouter
                      <font-awesome-icon
                        size="1x"
                        :icon="['far', 'plus-square']"
                      />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="mb-3">
            <div class="form-check">
              <input
                id="par-fonction-modal"
                v-model="form.par_fonction"
                type="checkbox"
                class="form-check-input"
              />
              <label class="form-check-label" for="par-fonction-modal"
                >Par fonction</label
              >
            </div>
          </div>

          <base-select
            v-model="form.ecriture_categorie_id"
            class="mb-3"
            :class="{ 'is-invalid': errors['ecriture_categorie_id'] }"
            label="Catégorie comptable"
            :options="categories"
          />
        </div>

        <div v-if="form.par_fonction" class="col-6">
          <table class="table table-sm">
            <thead>
              <tr v-if="Object.keys(columns).length > 1">
                <th></th>
                <th v-for="(column, i) in columns" :key="i" class="text-center">
                  <button
                    type="button"
                    class="btn btn-outline-danger border-0"
                    @click="supprimerTypePourFonction(i)"
                  >
                    <font-awesome-icon :icon="['far', 'trash-alt']" />
                  </button>
                </th>
              </tr>
              <tr>
                <th>Type</th>
                <th v-for="(column, i) in columns" :key="i">
                  <base-select
                    v-model="columns[i].type"
                    :class="{ 'is-invalid': errors['type'] }"
                    :options="[
                      { id: 1, designation: 'Solde' },
                      { id: 2, designation: 'Indemnite' },
                    ]"
                  />
                </th>
                <th rowspan="2" class="align-middle">
                  <button
                    type="button"
                    class="btn btn-outline-primary border-0"
                    @click="ajoutTypePourFonction()"
                  >
                    <font-awesome-icon
                      size="2x"
                      :icon="['far', 'plus-square']"
                    />
                  </button>
                </th>
              </tr>
              <tr>
                <th>Compte</th>
                <th v-for="(column, i) in columns" :key="i">
                  <select
                    id="compte"
                    v-model="columns[i].compte_id"
                    class="form-select form-select-sm"
                    :class="{ 'is-invalid': errors['column-compte' + i] }"
                  >
                    <option v-for="c in comptes" :key="c.id" :value="c.id">
                      {{ compte(c) }}
                    </option>
                  </select>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!fonctions.length">
                <td colspan="3">Aucune fonction paramétrée</td>
              </tr>
              <tr v-for="f in fonctions" :key="f.id">
                <td>
                  {{ fonction(f.id) }}
                </td>
                <td v-for="(column, i) in columns" :key="i">
                  <input
                    class="form-control form-control-sm"
                    :class="{
                      'is-invalid': errors['column-tarif' + i + '-' + f.id],
                    }"
                    type="text"
                    :value="columns[i].fonctions[f.id] || 0.0"
                    @change="
                      (e) => (columns[i].fonctions[f.id] = e.target.value)
                    "
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
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
