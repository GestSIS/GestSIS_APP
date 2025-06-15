<script setup>
import { computed, ref, watchEffect } from 'vue';
import { useStore } from 'vuex';
import permissions from '/src/store/permissions.js';
import useHasPermission from '../../hooks/usePermission';

const store = useStore();
const loading = ref(true);

watchEffect(async () => {
  loading.value = true;
  await store.dispatch('fetchSapeurTelephones', store.state.sapeur.active.id);
  loading.value = false;
});
await store.dispatch('fetchTelephoneTypes');

const telephonesData = ref([]);
const telephones = computed({
  get: () => telephonesData.value,
  set: (tels) => {
    tels.forEach((t, i) => (t.priorite = i + 1));
    telephonesData.value = tels.sort((t1, t2) => t1.priorite - t2.priorite);
  },
});

const activeSapeurTelephones = computed(() =>
  store.state.sapeur.active.telephones
    .slice(0)
    .sort((t1, t2) => t1.priorite - t2.priorite),
);
watchEffect(
  () =>
    (telephonesData.value = [
      ...(activeSapeurTelephones.value || []).map((t) => ({ ...t })),
    ]),
);

const sapeurType = computed(() => store.state.sapeur.active.data.type);
const telephoneTypes = computed(() => store.state.baseData.telephoneTypes);

const hasEditPermission = useHasPermission(permissions.SAPEUR.MODIFICATION);

const saveTelephones = () => {
  const savedTelephones = [...telephones.value];
  activeSapeurTelephones.value.forEach((t) => {
    //Suppression des numéros supprimé
    if (telephones.value.filter((t2) => t2.id === t.id).length === 0) {
      store.dispatch('removeTelephoneSapeur', t.id);
    }
  });

  savedTelephones.forEach((t) => {
    //Numéros modifiés
    if (t.id !== null) {
      store.dispatch('editTelephoneSapeur', t);
    }
    //Nouveaux numéros
    else {
      store.dispatch('addTelephoneSapeur', t);
    }
  });
};
const addTelephone = () => {
  if (telephonesData.value.length < 3) {
    telephones.value = [
      ...telephones.value,
      {
        id: null,
        telephone_type_id: 0,
        rta: 0,
        priorite: telephones.value.length + 1,
      },
    ];
  }
};
const removeTelephone = (priorite) => {
  telephones.value = telephones.value.filter((t) => t.priorite !== priorite);
};
</script>

<template>
  <!-- Téléphones -->
  <div class="card card-primary card-outline mb-3">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Téléphones</h3>
      <button
        v-if="hasEditPermission"
        class="btn btn-primary"
        @click.prevent="saveTelephones"
      >
        Enregistrer
      </button>
    </div>
    <div class="card-body table-responsive p-0">
      <div v-if="loading" class="p-3 d-flex justify-content-center">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Chargement...</span>
        </div>
      </div>
      <table v-else class="table table-sm">
        <thead>
          <tr>
            <th class="col-1" :class="{ 'd-none': telephones.length <= 1 }">
              Priorité
            </th>
            <th>Numéro</th>
            <th>Type</th>
            <th v-if="sapeurType === 0">
              RTA
              <font-awesome-icon
                v-tooltip.bottom="
                  'Cocher pour transmettre à la centrale d\'alarme RTA'
                "
                class="ms-1"
                :icon="['far', 'question-circle']"
              />
            </th>
            <th v-if="hasEditPermission" class="text-center">Actions</th>
          </tr>
        </thead>
        <tr v-if="telephones.length <= 0">
          <td :colspan="hasEditPermission ? 5 : 4">Aucun numéro enregistré</td>
        </tr>
        <tr
          v-for="t in telephones.sort((t1, t2) => t1?.priorite > t2?.priorite)"
          :key="t.id"
        >
          <td class="text-center" :class="{ 'd-none': telephones.length <= 1 }">
            {{ t.priorite }}
          </td>
          <td>
            <input
              v-model="t.numero"
              class="form-control form-control-sm"
              type="text"
              :readonly="!hasEditPermission"
              placeholder="..."
            />
          </td>
          <td>
            <select
              v-model="t.telephone_type_id"
              class="form-select form-select-sm"
              :disabled="!hasEditPermission"
            >
              <option
                v-for="telType in telephoneTypes"
                :key="telType.id"
                :value="telType.id"
              >
                {{ telType.type }}
              </option>
            </select>
          </td>
          <td v-if="sapeurType === 0" class="align-middle text-center">
            <input
              v-model="t.rta"
              type="checkbox"
              class="form-check-input"
              :disabled="!hasEditPermission"
            />
          </td>
          <td v-if="hasEditPermission" class="align-middle text-center">
            <button
              type="button"
              class="btn btn-outline-danger border-0"
              required
              @click="removeTelephone(t.priorite)"
            >
              <font-awesome-icon :icon="['far', 'trash-alt']" />
            </button>
          </td>
        </tr>
      </table>
      <button
        v-if="hasEditPermission"
        type="button"
        class="btn btn-outline-primary"
        :disabled="telephonesData.length >= 3"
        @click="addTelephone()"
      >
        <font-awesome-icon class="me-1" :icon="['fas', 'plus']" />Ajouter un
        numéro
      </button>
    </div>
  </div>
</template>
