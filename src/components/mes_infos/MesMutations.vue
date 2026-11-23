<script setup>
import { useLocaliteStore } from "../../stores/common/Localite";
import { useMesInfosStore } from "../../stores/mesinfos/MesInfos";
import { computed } from "vue";

const localiteStore = useLocaliteStore();
const infosStore = useMesInfosStore();

await Promise.all([infosStore.fetchMesMutations(), localiteStore.fetchLocalites()]);

const fonctions = computed(() =>
  infosStore.mutations.map((t) => ({
    ...t,
    localite: localiteStore.liste.find((l) => l.id == t.localite_id)?.designation,
  })),
);

const fields = [
  { title: "Incorporation", key: "incorporation", type: Date },
  { title: "Sortie", key: "sortie", type: Date },
  { title: "Motif", key: "motif" },
  { title: "Localité", key: "localite" },
];
</script>

<template>
  <base-card title="Mes mutations">
    <template #body-table>
      <base-table
        class="table-striped"
        :fields="fields"
        :data="fonctions"
        :selectable="true"
        :hide-download="true"
        no-data="Aucune mutation"
      />
    </template>
  </base-card>
</template>
