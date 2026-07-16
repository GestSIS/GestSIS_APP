<script setup>
import { useModalStore } from "../../stores/common/Modal.js";
import { useTelephoneStore } from "../../stores/sapeur/Telephone.js";
import { computed } from "vue";

const telephoneStore = useTelephoneStore();
await telephoneStore.fetchTelephones();

const fields = [
  { title: "Tri", key: "tri" },
  { title: "Nom", key: "nom" },
  { title: "Numéro", key: "numero" },
  { title: "Actions", slot: "actions" },
];
const listeTelephone = computed(() => telephoneStore.liste.slice().sort((a, b) => a.tri - b.tri));

const { confirm, showModal } = useModalStore();
const ajoutTelephone = () => showModal({ component: "ModalTelephone", data: {} });

const updateTelephone = (telephone) =>
  showModal({ component: "ModalTelephone", data: { ...telephone } });

const deleteTelephone = (telephone) =>
  confirm(
    "Voulez-vous vraiment supprimer ce contact ?",
    "Attention, la suppression d'un contact est irréversible ! Toutes les données de ce contact seront perdues !",
  ).then(() => telephoneStore.removeTelephone(telephone.id));
</script>

<template>
  <div class="card card-primary card-outline">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Téléphones</h3>
      <button type="button" class="btn btn-primary" @click="ajoutTelephone()">
        Ajouter une numéro
      </button>
    </div>
    <div class="card-body table-responsive p-0">
      <base-table
        :data="listeTelephone"
        :fields="fields"
        no-data="Aucun téléphone"
        :selectable="true"
      >
        <template #actions="{ rowData }">
          <button
            type="button"
            class="btn btn-outline-primary border-0"
            @click="updateTelephone(rowData)"
          >
            <font-awesome-icon :icon="['far', 'edit']" />
          </button>
          <button
            type="button"
            class="btn btn-outline-danger border-0"
            @click="deleteTelephone(rowData)"
          >
            <font-awesome-icon :icon="['far', 'trash-alt']" />
          </button>
        </template>
      </base-table>
    </div>
  </div>
</template>
