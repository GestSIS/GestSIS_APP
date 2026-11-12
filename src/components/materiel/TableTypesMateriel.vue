<script setup>
import { ref, watch, computed, nextTick } from "vue";
import { useMaterielTypeStore } from "../../stores/materiel/Type.js";

const { titre } = defineProps({
  titre: { type: String, default: "Type de matériel" },
});
const model = defineModel({ type: Array, default: () => [] });

const materielTypeStore = useMaterielTypeStore();

let typeKey = 0;
const mkLigne = (materielTypeId = null) => ({ _key: ++typeKey, materiel_type_id: materielTypeId });

const lignes = ref(model.value.length ? model.value.map((id) => mkLigne(id)) : [mkLigne()]);

watch(
  lignes,
  () => {
    model.value = lignes.value.map((l) => l.materiel_type_id).filter((id) => id !== null);
  },
  { deep: true },
);

// Un même type de matériel ne doit pas pouvoir être sélectionné sur deux
// lignes : chaque ligne masque les types déjà choisis ailleurs, en gardant
// le sien propre visible.
const typesDejaChoisis = computed(() => new Set(model.value));
// Seul un type numéroté peut être contrôlé ou scanné (règle imposée par l'API) :
// sans numéro, rien ne distingue les articles d'un même type. Un type déjà rattaché
// mais non numéroté (donnée antérieure à la règle) reste affiché sur sa ligne.
const optionsPourLigne = (rowData) =>
  materielTypeStore.liste.filter(
    (t) =>
      t.id === rowData.materiel_type_id || (t.est_numerote && !typesDejaChoisis.value.has(t.id)),
  );

// Le ref="..." classique ne fonctionne pas ici : ce champ est rendu dans un
// slot scopé de base-table, dont le v-for vit dans le template de BaseTable.vue
// et non dans celui-ci. Vue ne peut donc pas détecter à la compilation que ce
// ref se répète (pas de collecte en tableau) — un ref-fonction, ciblé par clé
// de ligne, contourne le problème.
const typeSelectRefs = new Map();
const setTypeSelectRef = (key, el) => {
  if (el) {
    typeSelectRefs.set(key, el);
  } else {
    typeSelectRefs.delete(key);
  }
};

const ajouter = () => {
  const ligne = mkLigne();
  lignes.value.push(ligne);
  nextTick(() => {
    typeSelectRefs.get(ligne._key)?.focus();
  });
};
const retirer = (key) => {
  lignes.value = lignes.value.filter((l) => l._key !== key);
};

const fields = computed(() => [
  { key: "materiel_type_id", title: titre, slot: "type-select" },
  { title: "", slot: "actions", columnClass: "text-center" },
]);
</script>

<template>
  <base-table
    :fields="fields"
    :data="lignes"
    select-key="_key"
    :hide-download="true"
    no-data="Aucun type associé"
  >
    <template #type-select="{ rowData }">
      <base-select
        :ref="(el) => setTypeSelectRef(rowData._key, el)"
        v-model="rowData.materiel_type_id"
        :options="optionsPourLigne(rowData)"
        display-key="designation"
      />
    </template>
    <template #actions="{ rowData }">
      <button
        aria-label="Supprimer"
        type="button"
        class="btn btn-outline-danger border-0"
        @click="retirer(rowData._key)"
      >
        <font-awesome-icon :icon="['far', 'trash-alt']" />
      </button>
    </template>
    <template #foot="{ colspan }">
      <tr>
        <td :colspan="colspan">
          <button type="button" class="btn btn-outline-primary" @click="ajouter()">
            Ajouter
            <font-awesome-icon size="1x" :icon="['far', 'plus-square']" />
          </button>
        </td>
      </tr>
    </template>
  </base-table>
</template>
