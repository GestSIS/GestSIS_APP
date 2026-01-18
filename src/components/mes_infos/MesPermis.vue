<script setup>
import { useBaseDataStore } from '../../stores/common/BaseData';
import { useMesInfosStore } from '../../stores/mesinfos/MesInfos';
import { computed } from 'vue';

const baseDataStore = useBaseDataStore();
const infosStore = useMesInfosStore();

await Promise.all([
  baseDataStore.fetchPermisType(),
  infosStore.fetchMesPermis(),
]);

const listPermisType = computed(() => baseDataStore.permisTypes);
const activeSapeurPermis = computed(() => infosStore.permis);
const permisData = computed(() => {
  let permisData = Object.fromEntries(
    listPermisType.value.map((p) => [
      p.id,
      {
        id: p.id,
        type: p.type,
        date: null,
      },
    ]),
  );
  activeSapeurPermis.value.forEach((p) => {
    permisData[p.permis_type_id] = {
      ...permisData[p.permis_type_id],
      date: p.date,
    };
  });
  return Object.values(permisData);
});

const publicPath = import.meta.env.BASE_URL;
const fields = [
  {
    title: 'Permis',
    slot: 'logo',
    key: 'type',
    columnClass: 'col-1 text-end',
  },
  {
    key: 'type',
    columnClass: 'col-1 ',
  },
  {
    title: 'date',
    key: 'date',
    type: Date,
  },
];
</script>

<template>
  <div class="card card-primary card-outline mb-3">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Permis de conduire</h3>
    </div>
    <div class="card-body table-responsive p-0">
      <base-table
        :fields="fields"
        :data="permisData"
        :selectable="true"
        no-data="Aucun permis"
      >
        <template #head>
          <tr>
            <th colspan="2" class="text-center">Permis</th>
            <th>Date</th>
          </tr>
        </template>
        <template #logo="{ rowData }">
          <font-awesome-icon
            v-if="rowData.type.toLowerCase().includes('118')"
            class="text-danger"
            style="font-size: 1.7em"
            :icon="['fab', 'gripfire']"
          />
          <img
            :src="`${publicPath}permis/${rowData.type
              .toLowerCase()
              .replace(' ', '_')}.gif`"
          />
        </template>
      </base-table>
    </div>
  </div>
</template>
