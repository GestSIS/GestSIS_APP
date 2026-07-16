<script setup>
import { computed } from "vue";
import { useBaseDataStore } from "../../stores/common/BaseData.js";

const model = defineModel({ type: Array });
defineProps({
  sapeurType: {
    type: Number,
    required: true,
  },
});

const baseDataStore = useBaseDataStore();

const telephones = computed(() =>
  [...(model.value?.filter((t) => t)?.map((t) => ({ ...t })) ?? [])]?.sort((t1, t2) =>
    t1.priorite?.toString()?.localeCompare(t2.priorite),
  ),
);

const fields = [
  { title: "Priorité", key: "priorite" },
  { title: "Numéro", key: "numero" },
  { title: "Type", key: "type" },
  { title: "RTA", key: "rta", type: Boolean },
];
const telephoneTypes = computed(() => baseDataStore.telephoneTypes);
</script>

<template>
  <div class="card card-primary card-outline mb-3">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Téléphones</h3>
    </div>
    <div class="card-body table-responsive p-0">
      <table class="table table-sm table-striped">
        <thead>
          <tr>
            <th :class="{ 'd-none': telephones.length <= 1 }">Priorité</th>
            <th>Numéro</th>
            <th>Type</th>
            <th v-if="sapeurType === 0">
              RTA
              <font-awesome-icon
                v-tooltip.bottom="'Cocher pour transmettre à la centrale d\'alarme RTA'"
                class="ms-1"
                :icon="['far', 'question-circle']"
              />
            </th>
          </tr>
        </thead>
        <tr v-if="telephones.length <= 0">
          <td colspan="4">Aucun numéro enregistré</td>
        </tr>
        <tr v-for="t in telephones.sort((t1, t2) => t1?.priorite > t2?.priorite)" :key="t.id">
          <td class="text-center" :class="{ 'd-none': telephones.length <= 1 }">
            {{ t.priorite }}
          </td>
          <td>
            <input
              v-model="t.numero"
              class="form-control form-control-sm"
              type="text"
              disabled
              placeholder="..."
            />
          </td>
          <td>
            <select v-model="t.telephone_type_id" class="form-select form-select-sm" disabled>
              <option v-for="type in telephoneTypes" :key="type.id" :value="type.id">
                {{ type.type }}
              </option>
            </select>
          </td>
          <td v-if="sapeurType === 0" class="align-middle text-center">
            <input v-model="t.rta" type="checkbox" class="form-check-input" disabled />
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>
