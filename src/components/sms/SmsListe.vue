<script setup>
import { computed } from "vue";

const { sms, loading, showExercice } = defineProps({
  sms: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  showExercice: {
    type: Boolean,
    default: false,
  },
});

const smsListe = computed(() =>
  sms.map((s) => ({
    ...s,
    numeros: s.sms_numeros.map((n) => n.numero).join("; "),
    exerciceLabel: s.exercice
      ? `${s.exercice.categorie?.designation ?? ""} : ${new Date(s.exercice.date).toLocaleDateString("fr-CH")}`
      : null,
  })),
);

const fields = computed(() => [
  {
    title: "Programmé le",
    key: "date_envoie",
    titleClass: "align-middle",
    type: "datetime",
  },
  {
    title: "Envoyé le",
    key: "date_programme",
    titleClass: "align-middle",
    type: "datetime",
  },
  ...(showExercice
    ? [
        {
          title: "Exercice",
          key: "exerciceLabel",
          slot: "exercice",
          titleClass: "align-middle",
        },
      ]
    : []),
  {
    title: "Message",
    key: "message",
    type: "multiline",
  },
  {
    title: "Numéros",
    key: "numeros",
    type: "multiline",
  },
]);
</script>

<template>
  <base-table :loading="loading" :fields="fields" no-data="Aucun sms" :data="smsListe">
    <template #exercice="{ rowData }">
      <router-link
        v-if="rowData.exercice_id"
        :to="{ name: 'exercice-details', params: { id: rowData.exercice_id } }"
      >
        {{ rowData.exerciceLabel }}
      </router-link>
    </template>
  </base-table>
</template>
