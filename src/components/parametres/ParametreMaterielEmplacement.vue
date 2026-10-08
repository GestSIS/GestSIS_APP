<script setup>
import { computed, ref } from "vue";
import useNotification from "../../composables/useNotification.js";
import { groupedByData, indexedData } from "../../tools/index.js";
import { useCouleurStore } from "../../stores/materiel/Couleur";
import TagCouleur from "../materiel/TagCouleur.vue";
import { useModalStore } from "../../stores/common/Modal.js";
import { useEmplacementStore } from "../../stores/materiel/Emplacement";

const couleurStore = useCouleurStore();
const emplacementStore = useEmplacementStore();

await Promise.all([couleurStore.fetchCouleurs(), emplacementStore.fetchEmplacements()]);

const emplacements = computed(() => emplacementStore.liste);

const indexedCouleurs = computed(() => indexedData(couleurStore.liste));
const emplacementsGroupedByParent = computed(() => groupedByData(emplacements.value, "parent_id"));

const computedData = computed(() => {
  const recursive = (parent_id, level = 0) => {
    return [...(emplacementsGroupedByParent.value[parent_id] ?? [])].flatMap((elem) => [
      { ...elem, level },
      ...recursive(elem.id, level + 1),
    ]);
  };

  return recursive(null);
});

const { confirm, showModal } = useModalStore();
const awn = useNotification();

const ajout = () => showModal({ component: "ModalChoixTypeEmplacement", data: {} });
const update = (elem) =>
  showModal({
    component: elem.hangar ? "ModalHangar" : elem.article ? "ModalArticle" : "ModalEmplacement",
    data: elem.article ? { ...elem.article, emplacement_representee: elem } : { ...elem },
    callback: elem.article ? () => emplacementStore.fetchEmplacements() : undefined,
  });
const dupliquerEnfants = (elem) =>
  showModal({ component: "ModalDupliquerEmplacementsEnfants", data: { ...elem } });
const remove = async (elem) => {
  if (
    await confirm(
      `Voulez-vous vraiment supprimer cet emplacement ?`,
      "Attention, la suppression de cet élément est irréversible !",
    )
  ) {
    emplacementStore
      .removeEmplacement(elem.id)
      .catch((res) => awn.alert(res.message || "Erreur lors de la suppression"));
  }
};

const fields = [
  { title: "Emplacement", slot: "emplacement" },
  { title: "Actif", key: "statut", type: Boolean },
  { title: "Remarque", key: "remarque" },
  { title: "Est etiqueté", key: "est_etiquete", type: Boolean },
  { title: "Couleur", slot: "couleur" },
  { title: "Actions", slot: "actions" },
];

// État initial : tout est replié sauf les hangars.
const replies = ref(new Set(emplacements.value.filter((e) => !e.hangar).map((e) => e.id)));
const toggleLine = (id) =>
  replies.value.has(id) ? replies.value.delete(id) : replies.value.add(id);

const emplacementVisible = computed(() =>
  computedData.value.reduce((visible, e) => {
    visible[e.id] = e.level === 0 || (visible[e.parent_id] && !replies.value.has(e.parent_id));
    return visible;
  }, {}),
);

const rowClass = (dataItem) => (emplacementVisible.value[dataItem.id] ? "" : "d-none");
</script>

<template>
  <div class="card card-primary card-outline">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title me-auto">Emplacements</h3>
      <button type="button" class="btn btn-primary me-2" @click="ajout">
        Ajouter un emplacement
      </button>
    </div>
    <div class="card-body table-responsive p-0">
      <base-table :data="computedData" :fields="fields" :rowClass="rowClass" :selectable="true">
        <template #emplacement="{ rowData }">
          <div :style="{ 'padding-left': rowData.level * 25 + 'px' }">
            <font-awesome-icon
              v-tooltip.bottom="replies.has(rowData.id) ? 'Afficher' : 'Masquer'"
              :icon="['fas', replies.has(rowData.id) ? 'angle-right' : 'angle-down']"
              class="me-1"
              :class="{ invisible: !emplacementsGroupedByParent[rowData.id]?.length }"
              @click.stop="toggleLine(rowData.id)"
            />
            <tag-couleur :couleur="indexedCouleurs[rowData.couleur_id]">
              <font-awesome-icon
                v-if="rowData.hangar"
                v-tooltip.bottom="'Hangar'"
                :icon="['far', 'house']"
                class="me-1"
              />
              <font-awesome-icon
                v-if="rowData.article_id"
                v-tooltip.bottom="'Véhicule'"
                :icon="['fas', 'car']"
                class="me-1"
              />
              {{ rowData.designation }}
            </tag-couleur>
          </div>
        </template>
        <template #couleur="{ rowData }">
          <tag-couleur :couleur="indexedCouleurs[rowData.couleur_id]"> A </tag-couleur>
          {{ indexedCouleurs[rowData.couleur_id]?.nom }}
        </template>
        <template #actions="{ rowData }">
          <button type="button" class="btn btn-outline-primary border-0" @click="update(rowData)">
            <font-awesome-icon :icon="['far', 'edit']" />
          </button>
          <button type="button" class="btn btn-outline-danger border-0" @click="remove(rowData)">
            <font-awesome-icon :icon="['far', 'trash-alt']" />
          </button>
          <button
            v-if="emplacementsGroupedByParent[rowData.id]?.length"
            v-tooltip.bottom="'Dupliquer emplacements enfants'"
            type="button"
            class="btn btn-outline-primary border-0"
            @click="dupliquerEnfants(rowData)"
          >
            <font-awesome-icon :icon="['fas', 'copy']" />
          </button>
        </template>
      </base-table>
    </div>
  </div>
</template>
