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
  <div class="card card-primary card-outline mb-3">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Mes mutations</h3>
    </div>
    <div class="card-body table-responsive p-0">
      <base-table
        class="table-striped"
        :fields="fields"
        :data="fonctions"
        :selectable="true"
        :hide-download="true"
        no-data="Aucune mutation"
      />
    </div>
  </div>
</template>
