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

const destinataireLabel = (numero) =>
  numero.sapeur ? `${numero.sapeur.nom} ${numero.sapeur.prenom}` : numero.numero;

const smsListe = computed(() =>
  sms.map((s) => ({
    ...s,
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
    key: "sms_numeros",
    slot: "numeros",
  },
]);
</script>

<template>
  <base-table :loading="loading" :fields="fields" no-data="Aucun sms" :data="smsListe">
    <template #exercice="{ rowData }">
      <router-link
        v-if="rowData.exercice_id"
        class="badge bg-primary text-decoration-none"
        :to="{ name: 'exercice-details', params: { id: rowData.exercice_id } }"
      >
        <font-awesome-icon :icon="['fas', 'calendar-alt']" class="me-1" />{{
          rowData.exerciceLabel
        }}
      </router-link>
    </template>
    <template #numeros="{ rowData }">
      <template v-for="n in rowData.sms_numeros" :key="n.id">
        <router-link
          v-if="n.sapeur"
          class="badge bg-primary text-decoration-none me-1"
          v-tooltip.bottom="n.numero"
          :to="{ name: 'sapeur-details', params: { id: n.sapeur_id } }"
        >
          <font-awesome-icon :icon="['fas', 'user']" class="me-1" />{{ destinataireLabel(n) }}
        </router-link>
        <span v-else class="badge bg-secondary me-1">{{ n.numero }}</span>
      </template>
    </template>
  </base-table>
</template>
