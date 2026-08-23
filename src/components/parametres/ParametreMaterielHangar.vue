<script setup>
import { computed } from "vue";
import useNotification from "../../composables/useNotification.js";
import { indexedData } from "../../tools/index.js";
import { useCouleurStore } from "../../stores/materiel/Couleur";
import { useEmplacementStore } from "../../stores/materiel/Emplacement";
import { useLocaliteStore } from "../../stores/common/Localite.js";
import TagCouleur from "../materiel/TagCouleur.vue";
import { useModalStore } from "../../stores/common/Modal.js";

const couleurStore = useCouleurStore();
const emplacementStore = useEmplacementStore();
const localiteStore = useLocaliteStore();

await Promise.all([
  couleurStore.fetchCouleurs(),
  emplacementStore.fetchEmplacements(),
  localiteStore.fetchLocalites(),
]);

const indexedCouleurs = computed(() => indexedData(couleurStore.liste));
const indexedLocalites = computed(() => indexedData(localiteStore.liste));

const hangars = computed(() => emplacementStore.liste.filter((e) => e.hangar != null));

const { confirm, showModal } = useModalStore();
const awn = useNotification();

const ajout = () => showModal({ component: "ModalHangar", data: {} });
const update = (elem) =>
  showModal({
    component: "ModalHangar",
    data: { ...elem },
  });
const remove = (elem) =>
  confirm(
    "Voulez-vous vraiment supprimer ce hangar ?",
    "Attention, la suppression de cet élément est irréversible !",
  ).then(() =>
    emplacementStore
      .removeEmplacement(elem.id)
      .catch((res) => awn.alert(res.message || "Erreur lors de la suppression")),
  );

const fields = [
  { title: "Hangar", slot: "hangar" },
  { title: "Adresse", slot: "adresse" },
  { title: "Actif", key: "statut", type: Boolean },
  { title: "Remarque", key: "remarque" },
  { title: "Actions", slot: "actions" },
];
</script>

<template>
  <div class="card card-primary card-outline">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title me-auto">Hangars</h3>
      <button type="button" class="btn btn-primary me-2" @click="ajout">Ajouter un hangar</button>
    </div>
    <div class="card-body table-responsive p-0">
      <base-table :data="hangars" :fields="fields" no-data="Aucun hangar">
        <template #hangar="{ rowData }">
          <tag-couleur :couleur="indexedCouleurs[rowData.couleur_id]">
            {{ rowData.designation }}
          </tag-couleur>
        </template>
        <template #adresse="{ rowData }">
          {{ [rowData.hangar.rue, rowData.hangar.no_rue].filter(Boolean).join(" ") }}
          <span v-if="rowData.hangar.rue || rowData.hangar.no_rue">, </span>
          {{ indexedLocalites[rowData.hangar.localite_id]?.designation }}
        </template>
        <template #actions="{ rowData }">
          <button type="button" class="btn btn-outline-primary border-0" @click="update(rowData)">
            <font-awesome-icon :icon="['far', 'edit']" />
          </button>
          <button type="button" class="btn btn-outline-danger border-0" @click="remove(rowData)">
            <font-awesome-icon :icon="['far', 'trash-alt']" />
          </button>
        </template>
      </base-table>
    </div>
  </div>
</template>
