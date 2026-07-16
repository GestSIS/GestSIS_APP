<script setup>
import { computed, ref, useTemplateRef } from "vue";
import useNotification from "../composables/useNotification.js";
import { useSapeurStore } from "../stores/sapeur/Sapeur.js";
import { useModalStore } from "../stores/common/Modal";
import { useGroupeStore } from "../stores/groupe/Groupe.js";
import GroupeEdition from "../components/groupe/GroupeEdition.vue";
import ExerciceComptable from "../components/exercice_comptable/ExerciceComptable.vue";
import permissions from "../composables/permissions.js";
import useHasPermission from "../composables/usePermission.js";

const active = ref(null);
const groupeEdit = ref({});
const editMode = ref(false);
const groupesTypes = ref(["groupe", "groupeInter"]);
const errors = ref({});

const sapeurStore = useSapeurStore();
const groupeStore = useGroupeStore();
const awn = useNotification();

await groupeStore.fetchGroupes();
await sapeurStore.fetchListeSapeur();

const groupeEdition = useTemplateRef("groupe-edition-component");

const groupes = computed(() =>
  groupeStore.liste.map((g) => ({
    ...g,
    label: (g.no ? g.no + " " : "") + g.designation,
  })),
);
const hasEditPermission = useHasPermission(permissions.ORGANISATION.MODIFICATION);

const filteredGroupes = computed(() => {
  const activeId = active.value?.data?.id || 0;
  if (activeId) {
    const rec = (groupeId) => {
      // Retourne la liste des ids des groupes enfants
      const children = groupes.value.filter((g) => g.parent_id == groupeId);
      return children.flatMap((g) => [g.id, ...rec(g.id)]);
    };
    const filteredIds = new Set([activeId, ...rec(activeId)]);
    return groupes.value.filter((g) => !filteredIds.has(g.id));
  } else {
    return [];
  }
});
const activeIsGroupe = computed(() => {
  return (
    (!!active.value &&
      (active.value.data.type == "groupe" || active.value.data.type == "groupeInter")) ||
    false
  );
});
const canMoveDown = computed(() => {
  return (groupesTypes.value.includes(active.value?.data?.type) && !active.value?.isLast) || false;
});
const canMoveUp = computed(() => {
  return (groupesTypes.value.includes(active.value?.data?.type) && !active.value?.isFirst) || false;
});
const canMoveLeft = computed(() => {
  return (groupesTypes.value.includes(active.value?.data?.type) && !active.value?.isRoot) || false;
});
const canMoveRight = computed(() => {
  return (
    (groupesTypes.value.includes(active.value?.data?.type) && !active.value?.isFirstOfLevel) ||
    false
  );
});

const { confirm, showModal } = useModalStore();

const contract = () => {
  groupeEdition.value.contract();
};
const expand = () => {
  groupeEdition.value.expand();
};
const selected = (elem) => {
  active.value = elem;
  if (groupesTypes.value.includes(elem.data.type)) {
    groupeEdit.value = { ...groupes.value.find((g) => g.id == elem.data.id) };
  } else {
    groupeEdit.value = {};
  }
};
const save = async () => {
  groupeStore
    .updateGroupe({
      groupeId: groupeEdit.value.id,
      data: {
        ...groupeEdit.value,
      },
    })
    .then(() => {
      awn.success("Groupe modifié avec succès");
    })
    .catch((err) => {
      errors.value = err;
      awn.alert(err.message || "Erreur lors de la modification du groupe");
    });
};
const up = () => groupeEdition.value.up(active.value);
const down = () => groupeEdition.value.down(active.value);
const right = () => groupeEdition.value.right(active.value);
const left = () => groupeEdition.value.left(active.value);
const deleteGroupe = () => {
  if (activeIsGroupe.value) {
    confirm(
      "Voulez-vous vraiment supprimer ce groupe ?",
      "Attention, la suppression du groupe entraînera la suppression de tous les sous-groupes. Cette action n'est pas réversible !",
    ).then(() => groupeStore.deleteGroupe(active.value.data.id));
  } else {
    awn.warning("Sélectionnez un groupe afin de pouvoir le supprimer.");
  }
};
const addGroupe = () => {
  showModal({
    component: "ModalGroupe",
  });
};
const addSapeurs = (node) => {
  if (!groupesTypes.value.includes(node.data.type)) {
    return;
  }
  const id = node.data.id;
  const groupe = groupes.value.find((g) => g.id == id);
  const data = {
    ids: groupe.sapeur_ids.map((s) => s.sapeur_id).slice(0),
  };

  const callback = (res) => {
    if (!res) {
      return;
    }
    const { tous } = res;
    return groupeStore.updateGroupeSapeurs({
      groupeId: id,
      sapeurIds: tous,
    });
  };

  showModal({
    component: "ModalSapeurSelect",
    size: 2,
    callback,
    data,
  });
};
</script>

<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-sm-6">
        <ol class="breadcrumb m-3">
          <li class="breadcrumb-item">
            <router-link :to="{ name: 'accueil' }">Accueil</router-link>
          </li>
          <li class="breadcrumb-item active" aria-current="page">Organisation</li>
        </ol>
      </div>
      <div class="col-sm-6 d-flex justify-content-end">
        <exercice-comptable />
      </div>
    </div>
    <div class="row">
      <div class="col-md-8 mb-3">
        <div class="card card-primary card-outline">
          <div class="card-header d-flex justify-content-between">
            <h3>Groupes</h3>
            <!-- <button class="btn btn-outline-primary">Modifier</button> -->
          </div>
          <div class="card-body">
            <groupe-edition
              ref="groupe-edition-component"
              :edit-mode="editMode"
              @selected="selected"
            />
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card card-primary card-outline">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h3>Actions</h3>
            <div v-if="hasEditPermission" class="form-check form-switch">
              <input
                id="modeEdition"
                v-model="editMode"
                class="form-check-input"
                type="checkbox"
                role="switch"
              />
              <label class="form-check-label" for="modeEdition">Mode édition</label>
            </div>
          </div>
          <div class="card-body pb-2">
            <button v-tooltip.top="'Tout développer'" class="btn btn-info me-1" @click="expand">
              <font-awesome-icon :icon="['far', 'plus-square']" />
            </button>
            <button v-tooltip.top="'Tout réduire'" class="btn btn-info me-1" @click="contract">
              <font-awesome-icon :icon="['far', 'minus-square']" />
            </button>
          </div>
          <div v-if="!editMode" class="card-body pt-0">
            <button
              class="btn btn-primary mb-2"
              :disabled="!activeIsGroupe"
              @click="addSapeurs(active)"
            >
              Ajouter/enlever des sapeurs
            </button>
          </div>
          <div v-if="editMode" class="card-body pt-0">
            <button class="btn btn-primary d-block mb-2" @click="addGroupe">
              Ajouter un groupe
            </button>
            <button
              class="btn btn-primary d-block mb-2"
              :disabled="!activeIsGroupe"
              @click="deleteGroupe"
            >
              Supprimer
            </button>
          </div>
          <div v-if="editMode" class="card-body pt-0">
            <h3>Réorganiser le groupe</h3>
            <button
              class="btn btn-sm"
              :class="{
                'btn-primary': canMoveLeft,
                'btn-secondary': !canMoveLeft,
              }"
              :disabled="!canMoveLeft"
              @click.prevent="left"
            >
              ←
            </button>
            <button
              class="btn btn-sm"
              :class="{
                'btn-primary': canMoveRight,
                'btn-secondary': !canMoveRight,
              }"
              :disabled="!canMoveRight"
              @click.prevent="right"
            >
              →
            </button>
            <button
              class="btn btn-sm"
              :class="{
                'btn-primary': canMoveUp,
                'btn-secondary': !canMoveUp,
              }"
              :disabled="!canMoveUp"
              @click.prevent="up"
            >
              ↑
            </button>
            <button
              class="btn btn-sm"
              :class="{
                'btn-primary': canMoveDown,
                'btn-secondary': !canMoveDown,
              }"
              :disabled="!canMoveDown"
              @click.prevent="down"
            >
              ↓
            </button>
          </div>
        </div>
        <div
          v-if="editMode && active && groupesTypes.includes(active.data.type)"
          class="card card-primary card-outline mt-2"
        >
          <div class="card-header d-flex justify-content-between">
            <h3>Modifier</h3>
          </div>
          <div class="card-body">
            <div class="mb-3">
              <label for="abreviation">No</label>
              <input
                id="no"
                v-model="groupeEdit.no"
                maxlength="10"
                class="form-control form-control-sm"
                :class="{ 'is-invalid': errors['no'] }"
              />
            </div>
            <div class="mb-3">
              <label for="abreviation">Nom</label>
              <input
                id="designation"
                v-model="groupeEdit.designation"
                type="text"
                class="form-control form-control-sm"
                :class="{ 'is-invalid': errors['designation'] }"
              />
            </div>
            <base-select
              v-model="groupeEdit.parent_id"
              class="mb-3"
              label="Groupe parent"
              base-option="-"
              :base-value="null"
              display-key="label"
              :options="filteredGroupes"
            />
            <div class="mb-3">
              <div class="form-check">
                <input
                  id="type"
                  v-model="groupeEdit.type"
                  type="checkbox"
                  class="form-check-input"
                  :true-value="1"
                  :false-value="0"
                />
                <label class="form-check-label" for="type">Groupe d'alarme</label>
              </div>
            </div>
            <button class="btn btn-primary" @click="save">Modifier</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
