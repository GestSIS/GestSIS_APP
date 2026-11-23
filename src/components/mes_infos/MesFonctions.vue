<script setup>
import { computed } from "vue";
import { useMesInfosStore } from "../../stores/mesinfos/MesInfos";
import { useFonctionStore } from "../../stores/sapeur/Fonction.js";

const infosStore = useMesInfosStore();
const fonctionStore = useFonctionStore();

await Promise.all([infosStore.fetchMesFonctions(), fonctionStore.fetchFonctions()]);

const fonctions = computed(() =>
  infosStore.fonctions
    .map((t) => ({
      ...t,
      fonction: fonctionStore.liste.find((e) => e.id == t.fonction_id)?.nom,
    }))
    .sort((a, b) => b.debut.localeCompare(a.debut)),
);

const fields = [
  { title: "Début", key: "debut", type: Date },
  { title: "Fin", key: "fin", type: Date },
  { title: "Fonction", key: "fonction" },
  { title: "Remarques", key: "remarques" },
];
</script>

<template>
  <base-card title="Mes fonctions">
    <template #body-table>
      <base-table
        class="table-striped"
        :fields="fields"
        :data="fonctions"
        :selectable="true"
        :hide-download="true"
        no-data="Aucune fonction"
      />
    </template>
  </base-card>
</template>
