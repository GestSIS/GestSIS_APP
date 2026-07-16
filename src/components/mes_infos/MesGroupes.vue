<script setup>
import { computed } from "vue";
import { useMesInfosStore } from "../../stores/mesinfos/MesInfos";
import { useGroupeStore } from "../../stores/groupe/Groupe.js";

const infosStore = useMesInfosStore();
const groupeStore = useGroupeStore();

await Promise.all([infosStore.fetchMesGroupes(), groupeStore.fetchGroupes()]);

const groupes = computed(() =>
  infosStore.groupes
    .map((t) => ({
      ...t,
      designation: groupeStore.liste.find((e) => e.id == t.groupe_id)?.designation,
      numero: groupeStore.liste.find((e) => e.id == t.groupe_id)?.no,
      type: groupeStore.liste.find((e) => e.id == t.groupe_id)?.type,
    }))
    .filter((g) => g.type),
);

const fields = [
  { title: "Numéro", key: "numero", columnClass: "col-2" },
  { title: "Désignation", key: "designation" },
];
</script>

<template>
  <div class="card card-primary card-outline mb-3">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Mes groupes d'alarme</h3>
    </div>
    <div class="card-body table-responsive p-0">
      <base-table
        class="table-striped"
        :fields="fields"
        :data="groupes"
        :selectable="true"
        :hide-download="true"
        no-data="Aucun groupe"
      />
    </div>
  </div>
</template>
