<script setup>
import { computed, ref, useTemplateRef } from "vue";
import { useNotification } from "../composables/useNotification.js";
import { useSapeurStore } from "../stores/sapeur/Sapeur.js";
import { useModalStore } from "../stores/common/Modal";
import { useGroupeStore } from "../stores/groupe/Groupe.js";
import GroupeEdition from "../components/groupe/GroupeEdition.vue";
import ExerciceComptable from "../components/exercice_comptable/ExerciceComptable.vue";
import permissions from "../composables/permissions.js";
import { useHasPermission } from "../composables/useHasPermission.js";
import { useSubmit } from "../composables/useSubmit.js";

const active = ref(null);
const editMode = ref(false);
const groupesTypes = ref(["groupe", "groupeInter"]);

const sapeurStore = useSapeurStore();
const groupeStore = useGroupeStore();
const awn = useNotification();

await groupeStore.fetchGroupes();
await sapeurStore.fetchSapeurs();

const groupeEdition = useTemplateRef("groupe-edition-component");

const groupes = computed(() =>
  groupeStore.avecPosition.map((g) => ({
    ...g,
    label: (g.no ? g.no + " " : "") + g.designation,
  })),
);
const hasEditPermission = useHasPermission(permissions.ORGANISATION.MODIFICATION);

const activeIsGroupe = computed(() => {
  return (
    (!!active.value &&
      (active.value.data.type == "groupe" || active.value.data.type == "groupeInter")) ||
    false
  );
});

// `groupes` porte déjà isRoot/isFirstOfLevel/isLastOfLevel (getter réactif
// `avecPosition` du store), donc ce lookup reste à jour après un déplacement
// sans devoir re-sélectionner le groupe dans l'arbre.
const activeGroupe = computed(() => {
  if (!activeIsGroupe.value) {
    return null;
  }
  return groupes.value.find((g) => g.id == active.value.data.id) || null;
});
const canMoveDown = computed(() => !!activeGroupe.value && !activeGroupe.value.isLastOfLevel);
const canMoveUp = computed(() => !!activeGroupe.value && !activeGroupe.value.isFirstOfLevel);
const canMoveLeft = computed(() => !!activeGroupe.value && !activeGroupe.value.isRoot);
const canMoveRight = computed(() => !!activeGroupe.value && !activeGroupe.value.isFirstOfLevel);

const { confirm, showModal } = useModalStore();
const { isSubmitting, submit } = useSubmit();

const contract = () => {
  groupeEdition.value.contract();
};
const expand = () => {
  groupeEdition.value.expand();
};
const selected = (elem) => {
  active.value = elem;
};
const up = () => groupeEdition.value.up(active.value);
const down = () => groupeEdition.value.down(active.value);
const right = () => groupeEdition.value.right(active.value);
const left = () => groupeEdition.value.left(active.value);
const deleteGroupe = async () => {
  if (!activeIsGroupe.value) {
    awn.warning("Sélectionnez un groupe afin de pouvoir le supprimer.");
    return;
  }
  if (
    await confirm(
      "Voulez-vous vraiment supprimer ce groupe ?",
      "Attention, la suppression du groupe entraînera la suppression de tous les sous-groupes. Cette action n'est pas réversible !",
    )
  ) {
    await submit(
      () => groupeStore.deleteGroupe(active.value.data.id),
      "Erreur lors de la suppression du groupe.",
      "Groupe supprimé.",
    );
  }
};
const addGroupe = () => {
  showModal({
    component: "ModalGroupe",
  });
};
const editGroupe = () => {
  showModal({
    component: "ModalGroupe",
    data: { ...groupes.value.find((g) => g.id == active.value.data.id) },
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
      <div class="col-md-4">
        <base-card title="Actions" body-class="d-grid gap-2">
          <template #body>
            <button
              class="btn btn-outline-primary"
              :disabled="!activeIsGroupe"
              @click="addSapeurs(active)"
            >
              Ajouter/enlever des sapeurs
            </button>
            <template v-if="hasEditPermission">
              <button class="btn btn-outline-primary" @click="addGroupe">Ajouter un groupe</button>
              <button
                class="btn btn-outline-primary"
                :disabled="!activeIsGroupe"
                @click="editGroupe"
              >
                Modifier le groupe
              </button>
              <button
                class="btn btn-outline-danger"
                :disabled="!activeIsGroupe || isSubmitting"
                @click="deleteGroupe"
              >
                Supprimer
              </button>
              <div>
                <div class="fw-bold mb-1">Réorganiser le groupe</div>
                <div class="d-flex gap-1">
                  <button
                    class="btn btn-sm flex-fill"
                    :class="{ 'btn-outline-primary': canMoveLeft }"
                    :disabled="!canMoveLeft"
                    @click.prevent="left"
                  >
                    ←
                  </button>
                  <button
                    class="btn btn-sm flex-fill"
                    :class="{ 'btn-outline-primary': canMoveRight }"
                    :disabled="!canMoveRight"
                    @click.prevent="right"
                  >
                    →
                  </button>
                  <button
                    class="btn btn-sm flex-fill"
                    :class="{ 'btn-outline-primary': canMoveUp }"
                    :disabled="!canMoveUp"
                    @click.prevent="up"
                  >
                    ↑
                  </button>
                  <button
                    class="btn btn-sm flex-fill"
                    :class="{ 'btn-outline-primary': canMoveDown }"
                    :disabled="!canMoveDown"
                    @click.prevent="down"
                  >
                    ↓
                  </button>
                </div>
              </div>
            </template>
          </template>
        </base-card>
      </div>
      <div class="col-md-4">
        <base-card title="Affichage" body-class="d-grid gap-2">
          <template #body>
            <button title="Tout développer" class="btn btn-outline-primary" @click="expand">
              <font-awesome-icon :icon="['far', 'plus-square']" /> Tout développer
            </button>
            <button title="Tout réduire" class="btn btn-outline-primary" @click="contract">
              <font-awesome-icon :icon="['far', 'minus-square']" /> Tout réduire
            </button>
          </template>
        </base-card>
      </div>
      <div class="col-md-12">
        <base-card title="Groupes">
          <template #header>
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
          </template>
          <template #body>
            <groupe-edition
              ref="groupe-edition-component"
              :edit-mode="editMode"
              @selected="selected"
            />
          </template>
        </base-card>
      </div>
    </div>
  </div>
</template>
