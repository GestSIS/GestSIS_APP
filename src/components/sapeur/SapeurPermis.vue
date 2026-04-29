<script setup>
import { computed, ref, watch, watchEffect } from 'vue';
import useNotification from '../../composables/useNotification.js';
import { useSapeurStore } from '../../stores/sapeur/Sapeur.js';
import { useBaseDataStore } from '../../stores/common/BaseData.js';
import permissions from '/src/composables/permissions.js';
import useHasPermission from '../../composables/usePermission.js';

const sapeurStore = useSapeurStore();
const baseDataStore = useBaseDataStore();

watchEffect(() => {
  sapeurStore.fetchSapeurPermis(sapeurStore.active.id);
});

await baseDataStore.fetchPermisType();

const publicPath = import.meta.env.BASE_URL;
const permisData = ref({});
const errors = ref({});

const listPermisType = computed(() => baseDataStore.permisTypes);
const activeSapeurPermis = computed(() => sapeurStore.active.permis);
const hasEditPermission = useHasPermission(permissions.SAPEUR.MODIFICATION);

watch(
  activeSapeurPermis,
  () => {
    listPermisType.value.forEach((p) => {
      permisData.value[p.id] = {
        permis_type_id: p.id,
        type: p.type,
        date: null,
        id: null,
      };
    });
    activeSapeurPermis.value.forEach((p) => {
      permisData.value[p.permis_type_id] = {
        ...permisData.value[p.permis_type_id],
        date: p.date,
        id: p.id,
      };
    });
  },
  { immediate: true },
);

const awn = useNotification();

const saveSuccessfull = (permis_type_id) => {
  errors.value = {
    ...errors.value,
    [permis_type_id]: undefined,
  };
};
const saveError = (permis_type_id, error) => {
  errors.value = {
    ...errors.value,
    [permis_type_id]: error,
  };
};
const supprimerPermis = (permis_type_id) => {
  permisData.value = {
    ...permisData.value,
    [permis_type_id]: {
      ...permisData.value[permis_type_id],
      date: '',
    },
  };
};
const savePermis = () => {
  Object.values(permisData.value).forEach((p) => {
    //New one
    if (p.id === null && p.date !== null) {
      sapeurStore
        .addPermis({
          permis_type_id: p.permis_type_id,
          date: p.date,
        })
        .then(() => saveSuccessfull(p.permis_type_id))
        .catch((err) => saveError(p.permis_type_id, err));
    }
    //Removed
    else if (p.id !== null && (p.date === null || p.date === '')) {
      sapeurStore
        .removePermis(p.id)
        .then(() => saveSuccessfull(p.permis_type_id))
        .catch((err) => saveError(p.permis_type_id, err));
    }
    //Edited
    else if (
      p.id !== null &&
      p.date !==
        activeSapeurPermis.value.find((permis) => permis.id == p.id)?.date
    ) {
      sapeurStore
        .editPermis({ id: p.id, date: p.date })
        .then(() => saveSuccessfull(p.permis_type_id))
        .catch((err) => saveError(p.permis_type_id, err));
    } else {
      //Remove potential error messages
      saveSuccessfull(p.permis_type_id);
    }
  });
  awn.success('Modifications enregistrées en avec succès');
};
const isInvalid = (key) => {
  return errors.value[key] !== undefined;
};
</script>

<template>
  <div class="card card-primary card-outline">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Permis de conduire</h3>
      <button
        v-if="hasEditPermission"
        class="btn btn-primary flex-shrink-1"
        @click.prevent="savePermis"
      >
        Enregistrer
      </button>
    </div>
    <div class="card-body table-responsive p-0">
      <table class="table table-sm col-6">
        <tbody>
          <tr
            v-for="permis in permisData"
            :key="permis.permis_type_id"
            :class="{ 'table-primary': permis.date }"
          >
            <td class="text-end col-1">
              <font-awesome-icon
                v-if="permis.type.toLowerCase().includes('118')"
                class="text-danger"
                style="font-size: 1.7em"
                :icon="['fab', 'gripfire']"
              />
              <img
                :src="`${publicPath}permis/${permis.type
                  .toLowerCase()
                  .replace(' ', '_')}.gif`"
              />
            </td>
            <td class="col-1">
              {{ permis.type }}
            </td>
            <td>
              <div class="input-group input-group-sm">
                <div class="input-group-text">
                  <font-awesome-icon :icon="['far', 'calendar-alt']" />
                </div>
                <input
                  v-model="permis.date"
                  type="date"
                  class="form-control form-control-sm"
                  :readonly="!hasEditPermission"
                  :class="{
                    'is-invalid': isInvalid(permis.permis_type_id),
                  }"
                />
                <button
                  v-if="(permis.date || '') !== '' && hasEditPermission"
                  type="button"
                  class="btn btn-outline-danger border-0"
                  @click="supprimerPermis(permis.permis_type_id)"
                >
                  <font-awesome-icon :icon="['far', 'trash-alt']" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
