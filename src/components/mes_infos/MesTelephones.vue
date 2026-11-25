<script setup>
import { computed } from "vue";
import { useBaseDataStore } from "../../stores/common/BaseData.js";

const model = defineModel({ type: Array });
const { estSapeur } = defineProps({
  estSapeur: {
    type: Boolean,
    default: false,
  },
});

const baseDataStore = useBaseDataStore();

const telephones = computed(() =>
  [...(model.value?.filter((t) => t)?.map((t) => ({ ...t })) ?? [])]?.sort((t1, t2) =>
    t1.priorite?.toString()?.localeCompare(t2.priorite),
  ),
);

const telephoneTypes = computed(() => baseDataStore.telephoneTypes);

const fields = computed(() => [
  {
    title: "Priorité",
    key: "priorite",
    titleClass: telephones.value.length <= 1 ? "d-none" : "",
    columnClass: telephones.value.length <= 1 ? "d-none" : "text-center",
  },
  { title: "Numéro", key: "numero" },
  {
    title: "Type",
    key: "telephone_type_id",
    formatter: (id) => telephoneTypes.value.find((t) => t.id === id)?.type,
  },
  ...(estSapeur ? [{ title: "RTA", key: "rta", type: Boolean }] : []),
]);
</script>

<template>
  <base-card title="Téléphones">
    <template #body-table>
      <base-table
        class="table-striped"
        :fields="fields"
        :data="telephones"
        no-data="Aucun numéro enregistré"
        :hide-download="true"
      >
        <template v-if="estSapeur" #head>
          <thead>
            <tr>
              <th :class="{ 'd-none': telephones.length <= 1 }">Priorité</th>
              <th>Numéro</th>
              <th>Type</th>
              <th>
                RTA
                <font-awesome-icon
                  v-tooltip.bottom="'Cocher pour transmettre à la centrale d\'alarme RTA'"
                  class="ms-1"
                  :icon="['far', 'question-circle']"
                />
              </th>
            </tr>
          </thead>
        </template>
      </base-table>
    </template>
  </base-card>
</template>
