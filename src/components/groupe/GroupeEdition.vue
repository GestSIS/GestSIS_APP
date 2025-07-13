<script setup>
import { computed, ref, useTemplateRef } from 'vue';
import EditableTree from '/src/components/editable_tree/EditableTree.vue';
import { useStore } from 'vuex';

const store = useStore();

const { editMode } = defineProps({
  editMode: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(['selected']);

const active = ref(null);
const types = {
  groupe: {
    icon: ['fas', 'sitemap'],
    color: '#2c3e50',
  },
  groupeInter: {
    icon: ['fas', 'fire'],
    color: '#f39c12',
  },
  groupeInactif: {
    icon: ['fas', 'sitemap'],
    color: '#bdc3c7',
  },
};
const tree = ref([
  {
    id: 'g',
    type: 'groupe',
    label: 'Groupes',
    children: [],
  },
]);

const groupes = computed(() => store.state.groupe.liste);
const groupeTree = computed(() => {
  const groupFilter = (parentId) => (g) => g.parent_id == parentId;
  const sapeurMapping = (s) => {
    const sapeur = store.state.sapeur.liste.find(
      (sap) => sap.id == s.sapeur_id,
    ) || {
      nom: 'Ancien',
      prenom: 'Sapeur',
      civilite: 1,
      id: s.sapeur_id,
    };
    return {
      id: s.sapeur_id,
      key: `s-${s.sapeur_id}`,
      label: sapeur.nom_prenom,
      type: 'sapeur',
    };
  };
  const groupeMapping = (g) => ({
    label:
      (g.no ? `${g.no} ${g.designation}` : g.designation) +
      (g.sapeur_ids.length ? ` (${g.sapeur_ids.length})` : ''),
    type: g.type == 0 ? 'groupe' : 'groupeInter',
    id: g.id,
    key: `g-${g.id}`,
    tri: g.tri,
    children: [
      ...store.state.groupe.liste.filter(groupFilter(g.id)).map(groupeMapping),
      ...g.sapeur_ids
        .map(sapeurMapping)
        .sort((a, b) => a.label.localeCompare(b.label)),
    ],
  });

  return store.state.groupe.liste.filter(groupFilter(null)).map(groupeMapping);
});

tree.value.children = groupeTree.value;

const selected = (elem) => {
  active.value = elem;
  emit('selected', elem);
};

const left = (node) => {
  const groupe = groupes.value.find((g) => g.id == node.data.id);

  // On ne change que parent_id
  const parent = groupes.value.find((g) => g.id == groupe.parent_id);
  store.dispatch('updateGroupe', {
    groupeId: groupe.id,
    data: {
      ...groupe,
      parent_id: parent.parent_id,
    },
  });
};
const right = (node) => {
  const groupe = groupes.value.find((g) => g.id == node.data.id);

  // On ne change que parent_id
  const groupesOfSameLevel = groupes.value
    .filter((g) => g.parent_id == groupe.parent_id)
    .filter((g) => g.tri < groupe.tri);
  const previousGroupe = groupesOfSameLevel[groupesOfSameLevel.length - 1];
  store.dispatch('updateGroupe', {
    groupeId: groupe.id,
    data: {
      ...groupe,
      parent_id: previousGroupe.id,
    },
  });
};
const up = (node) => {
  const groupe = groupes.value.find((g) => g.id == node.data.id);

  if (node.isFirstOfLevel) {
    // On change parent_id uniquement
    const parent = groupes.value.find((g) => g.id == groupe.parent_id);
    const groupesOfSameLevelAsParent = groupes.value
      .filter((g) => g.parent_id == parent.parent_id)
      .filter((g) => g.tri < parent.tri);
    const previousParentGroupe =
      groupesOfSameLevelAsParent[groupesOfSameLevelAsParent.length - 1];
    store.dispatch('updateGroupe', {
      groupeId: groupe.id,
      data: {
        ...groupe,
        parent_id: previousParentGroupe.id,
      },
    });
  } else {
    // On échange tri avec l'autre élément adjacent
    const groupeTri = groupe.tri;
    const groupesOfSameLevel = groupes.value
      .filter((g) => g.parent_id == groupe.parent_id)
      .filter((g) => g.tri < groupe.tri);
    const previousGroupe = groupesOfSameLevel[groupesOfSameLevel.length - 1];
    store.dispatch('updateGroupe', {
      groupeId: groupe.id,
      data: {
        ...groupe,
        tri: previousGroupe.tri,
      },
    });
    store.dispatch('updateGroupe', {
      groupeId: previousGroupe.id,
      data: {
        ...previousGroupe,
        tri: groupeTri,
      },
    });
  }
};
const down = (node) => {
  const groupe = groupes.value.find((g) => g.id == node.data.id);

  if (node.isLastOfLevel) {
    // FIXME: problème lorsque le groupe parent n'a pas de groupe suivant direct
    // On change parent_id uniquement
    let nextParentGroupe = null;
    let groupeId = groupe.parent_id;
    while (!nextParentGroupe) {
      const parent = groupes.value.find((g) => g.id == groupeId);
      const groupesOfSameLevelAsParent = groupes.value
        .filter((g) => g.parent_id == parent.parent_id)
        .filter((g) => g.tri > parent.tri);
      nextParentGroupe = groupesOfSameLevelAsParent[0];
      groupeId = parent.parent_id;
    }

    store.dispatch('updateGroupe', {
      groupeId: groupe.id,
      data: {
        ...groupe,
        parent_id: nextParentGroupe.id,
      },
    });
  } else {
    // On échange tri avec l'autre élément adjacent
    const groupeTri = groupe.tri;
    const groupesOfSameLevel = groupes.value
      .filter((g) => g.parent_id == groupe.parent_id)
      .filter((g) => g.tri > groupe.tri);
    const nextGroupe = groupesOfSameLevel[0];
    store.dispatch('updateGroupe', {
      groupeId: groupe.id,
      data: {
        ...groupe,
        tri: nextGroupe.tri,
      },
    });
    store.dispatch('updateGroupe', {
      groupeId: nextGroupe.id,
      data: {
        ...nextGroupe,
        tri: groupeTri,
      },
    });
  }
};

const treeRef = useTemplateRef('tree');
const contract = () => treeRef.contract();
const expand = () => treeRef.expand();

defineExpose({
  expand,
  contract,
});
</script>

<template>
  <editable-tree
    ref="tree"
    :tree="groupeTree"
    :types="types"
    :selectable="true"
    :active="active"
    @selected="selected"
  >
    <template v-if="editMode" #default="{ node }">
      <div v-if="node.data.type == 'groupe' || node.data.type == 'groupeInter'">
        <button
          v-if="!node.isRoot"
          class="btn btn-sm pt-0 pb-0"
          @click.prevent="left(node)"
        >
          ←
        </button>
        <button
          v-if="!node.isFirstOfLevel"
          class="btn btn-sm pt-0 pb-0"
          @click.prevent="right(node)"
        >
          →
        </button>
        <button
          v-if="!node.isFirst"
          class="btn btn-sm pt-0 pb-0"
          @click.prevent="up(node)"
        >
          ↑
        </button>
        <button
          v-if="!node.isLast"
          class="btn btn-sm pt-0 pb-0"
          @click.prevent="down(node)"
        >
          ↓
        </button>
      </div>
    </template>
  </editable-tree>
</template>
