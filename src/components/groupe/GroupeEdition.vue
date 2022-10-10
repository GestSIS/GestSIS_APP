<template>
  <editable-tree
    ref="tree"
    :tree="groupeTree"
    :_types="types"
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

<script>
import { mapMutations, mapState } from 'vuex';

import EditableTree from '@/components/editable_tree/EditableTree.vue';

export default {
  name: 'GroupeEdition',
  components: {
    EditableTree,
  },
  props: ['callback', 'data', 'editMode'],
  emits: ['selected'],
  data() {
    return {
      active: null,
      types: {
        homme: {
          icon: ['fas', 'mars'],
          color: '#3498db',
        },
        femme: {
          icon: ['fas', 'venus'],
          color: '#9b59b6',
        },
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
      },
      tree: [
        {
          id: 'g',
          type: 'groupe',
          label: 'Groupes',
          children: [],
        },
      ],
    };
  },
  computed: {
    ...mapState({
      groupes: (state) => state.groupe.liste,
      sapeurs: (state) => state.sapeur.liste,
    }),
    groupeTree() {
      const groupFilter = (pereId) => (g) => g.pere_id == pereId;
      const sapeurMapping = (s) => {
        const sapeur = this.sapeurs.find((sap) => sap.id == s.sapeur_id) || {
          nom: 'Ancien',
          prenom: 'Sapeur',
          civilite: 1,
          id: s.sapeur_id,
        };
        return {
          id: s.sapeur_id,
          key: `s-${s.sapeur_id}`,
          label: `${sapeur.nom} ${sapeur.prenom}`,
          type: sapeur.civilite_id == 1 ? 'homme' : 'femme',
        };
      };
      const groupeMapping = (g) => ({
        label: g.no ? `${g.no} ${g.designation}` : g.designation,
        type: g.type == 0 ? 'groupe' : 'groupeInter',
        id: g.id,
        key: `g-${g.id}`,
        tri: g.tri,
        children: [
          ...this.groupes.filter(groupFilter(g.id)).map(groupeMapping),
          ...g.sapeur_ids
            .map(sapeurMapping)
            .sort((a, b) => a.label.localeCompare(b.label)),
        ],
      });

      return this.groupes.filter(groupFilter(null)).map(groupeMapping);
    },
  },
  mounted() {
    this.tree.children = this.groupeTree;
  },
  methods: {
    ...mapMutations(['HIDE_MODAL']),
    contract() {
      this.$refs.tree.contract();
    },
    expand() {
      this.$refs.tree.expand();
    },
    selected(elem) {
      this.active = elem;
      this.$emit('selected', elem);
    },
    modifierGroupes() {
      const data = [];
      this.SHOW_MODAL({
        component: 'ModalGroupeEdition',
        size: 1,
        data,
      });
    },
    close() {
      this.HIDE_MODAL();
    },
    left(node) {
      const groupe = this.groupes.find((g) => g.id == node.data.id);

      // On ne change que pere_id
      const parent = this.groupes.find((g) => g.id == groupe.pere_id);
      this.$store.dispatch('updateGroupe', {
        groupeId: groupe.id,
        data: {
          ...groupe,
          pere_id: parent.pere_id,
        },
      });
    },
    right(node) {
      const groupe = this.groupes.find((g) => g.id == node.data.id);

      // On ne change que pere_id
      const groupesOfSameLevel = this.groupes
        .filter((g) => g.pere_id == groupe.pere_id)
        .filter((g) => g.tri < groupe.tri);
      const previousGroupe = groupesOfSameLevel[groupesOfSameLevel.length - 1];
      this.$store.dispatch('updateGroupe', {
        groupeId: groupe.id,
        data: {
          ...groupe,
          pere_id: previousGroupe.id,
        },
      });
    },
    up(node) {
      const groupe = this.groupes.find((g) => g.id == node.data.id);

      if (node.isFirstOfLevel) {
        // On change pere_id uniquement
        const parent = this.groupes.find((g) => g.id == groupe.pere_id);
        const groupesOfSameLevelAsParent = this.groupes
          .filter((g) => g.pere_id == parent.pere_id)
          .filter((g) => g.tri < parent.tri);
        const previousParentGroupe =
          groupesOfSameLevelAsParent[groupesOfSameLevelAsParent.length - 1];
        this.$store.dispatch('updateGroupe', {
          groupeId: groupe.id,
          data: {
            ...groupe,
            pere_id: previousParentGroupe.id,
          },
        });
      } else {
        // On échange tri avec l'autre élément adjacent
        const groupeTri = groupe.tri;
        const groupesOfSameLevel = this.groupes
          .filter((g) => g.pere_id == groupe.pere_id)
          .filter((g) => g.tri < groupe.tri);
        const previousGroupe =
          groupesOfSameLevel[groupesOfSameLevel.length - 1];
        this.$store.dispatch('updateGroupe', {
          groupeId: groupe.id,
          data: {
            ...groupe,
            tri: previousGroupe.tri,
          },
        });
        this.$store.dispatch('updateGroupe', {
          groupeId: previousGroupe.id,
          data: {
            ...previousGroupe,
            tri: groupeTri,
          },
        });
      }
    },
    down(node) {
      const groupe = this.groupes.find((g) => g.id == node.data.id);

      if (node.isLastOfLevel) {
        // FIXME: problème lorsque le groupe parent n'a pas de groupe suivant direct
        // On change pere_id uniquement
        let nextParentGroupe = null;
        let groupeId = groupe.pere_id;
        while (!nextParentGroupe) {
          const parent = this.groupes.find((g) => g.id == groupeId);
          const groupesOfSameLevelAsParent = this.groupes
            .filter((g) => g.pere_id == parent.pere_id)
            .filter((g) => g.tri > parent.tri);
          nextParentGroupe = groupesOfSameLevelAsParent[0];
          groupeId = parent.pere_id;
        }

        this.$store.dispatch('updateGroupe', {
          groupeId: groupe.id,
          data: {
            ...groupe,
            pere_id: nextParentGroupe.id,
          },
        });
      } else {
        // On échange tri avec l'autre élément adjacent
        const groupeTri = groupe.tri;
        const groupesOfSameLevel = this.groupes
          .filter((g) => g.pere_id == groupe.pere_id)
          .filter((g) => g.tri > groupe.tri);
        const nextGroupe = groupesOfSameLevel[0];
        this.$store.dispatch('updateGroupe', {
          groupeId: groupe.id,
          data: {
            ...groupe,
            tri: nextGroupe.tri,
          },
        });
        this.$store.dispatch('updateGroupe', {
          groupeId: nextGroupe.id,
          data: {
            ...nextGroupe,
            tri: groupeTri,
          },
        });
      }
    },
  },
};
</script>

<style scoped></style>
