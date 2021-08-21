<template>
  <editable-tree
    :tree="groupeTree"
    :_types="types"
    :selectable="true"
    @selected="selected"
  >
    <template v-slot:default="{ node }">
      <button
        class="btn btn-sm"
        @click.prevent="gauche(node)"
        v-if="!node.isRoot"
      >
        ←
      </button>
      <button
        class="btn btn-sm"
        @click.prevent="droite(node)"
        v-if="!node.isFirstOfLevel"
      >
        →
      </button>
      <button
        class="btn btn-sm"
        @click.prevent="haut(node)"
        v-if="!node.isFirst"
      >
        ↑
      </button>
      <button class="btn btn-sm" @click.prevent="bas(node)" v-if="!node.isLast">
        ↓
      </button>
    </template>
  </editable-tree>
</template>

<script>
import { mapGetters, mapMutations, mapState } from 'vuex';

import EditableTree from '@/components/editable_tree/EditableTree.vue';

export default {
  name: 'ModalSapeurSelect',
  props: ['callback', 'data'],
  components: {
    EditableTree,
  },
  data() {
    return {
      active: null,
      types: {
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
          children: this.groupeTree,
        },
      ],
    };
  },
  computed: {
    ...mapState({
      groupes: (state) => state.groupe.liste.filter((g) => g.actif),
    }),
    groupeTree() {
      const groupFilter = (pereId) => (g) => g.pere_id == pereId;
      const groupeMapping = (g) => ({
        label: g.no ? `${g.no} ${g.designation}` : g.designation,
        type: g.type == 0 ? 'groupe' : 'groupeInter',
        id: g.id,
        key: `g-${g.id}`,
        tri: g.tri,
        children: [
          ...this.groupes.filter(groupFilter(g.id)).map(groupeMapping),
        ],
      });

      return this.groupes.filter(groupFilter(null)).map(groupeMapping);
    },
  },
  methods: {
    ...mapMutations(['HIDE_MODAL']),
    selected(elem) {
      this.active = elem;
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
    gauche(node) {
      const groupe = this.groupes.find((g) => g.id == node.data.id);

      // On ne change que pere_id
      const parent = this.groupes.find((g) => g.id == groupe.pere_id);
      this.$store.dispatch('updateGroupe', {
        groupeId: groupe.id,
        data: {
          ...groupe,
          pere_id: parent.pere_id,
        }
      });
    },
    droite(node) {
      const groupe = this.groupes.find((g) => g.id == node.data.id);

      // On ne change que pere_id
      const groupesOfSameLevel = this.groupes
        .filter(g => g.pere_id === groupe.pere_id)
        .filter(g => g.tri < groupe.tri);
      const previousGroupe = groupesOfSameLevel[groupesOfSameLevel.length - 1];
      this.$store.dispatch('updateGroupe', {
        groupeId: groupe.id,
        data: {
          ...groupe,
          pere_id: previousGroupe.id,
        }
      });
    },
    haut(node) {
      const groupe = this.groupes.find((g) => g.id == node.data.id);

      if(node.isFirstOfLevel) {
        // On change pere_id uniquement
        const parent = this.groupes.find((g) => g.id == groupe.pere_id);
        const groupesOfSameLevelAsParent = this.groupes
          .filter(g => g.pere_id === parent.pere_id)
          .filter(g => g.tri < parent.tri);
        const previousParentGroupe = groupesOfSameLevelAsParent[groupesOfSameLevelAsParent.length - 1];
        this.$store.dispatch('updateGroupe', {
          groupeId: groupe.id,
          data: {
            ...groupe,
            pere_id: previousParentGroupe.id,
          }
        });
      } else {
        // On échange tri avec l'autre élément adjacent
        const groupeTri = groupe.tri;
        const groupesOfSameLevel = this.groupes
          .filter(g => g.pere_id === groupe.pere_id)
          .filter(g => g.tri < groupe.tri);;
        const previousGroupe = groupesOfSameLevel[groupesOfSameLevel.length - 1];
        this.$store.dispatch('updateGroupe', {
          groupeId: groupe.id,
          data: {
            ...groupe,
            tri: previousGroupe.tri,
          }
        });
        this.$store.dispatch('updateGroupe', {
          groupeId: previousGroupe.id,
          data: {
            ...previousGroupe,
            tri: groupeTri,
          }
        });
      }
    },
    bas(node) {
      const groupe = this.groupes.find((g) => g.id == node.data.id);

      if(node.isLastOfLevel) {
        // On change pere_id uniquement
        const parent = this.groupes.find((g) => g.id == groupe.pere_id);
        const groupesOfSameLevelAsParent = this.groupes
          .filter(g => g.pere_id === parent.pere_id)
          .filter(g => g.tri > parent.tri);
        const nextParentGroupe = groupesOfSameLevelAsParent[0];
        this.$store.dispatch('updateGroupe', {
          groupeId: groupe.id,
          data: {
            ...groupe,
            pere_id: nextParentGroupe.id,
          }
        });
      } else {
        // On échange tri avec l'autre élément adjacent
        const groupeTri = groupe.tri;
        const groupesOfSameLevel = this.groupes
          .filter(g => g.pere_id === groupe.pere_id)
          .filter(g => g.tri > groupe.tri);;
        const nextGroupe = groupesOfSameLevel[0];
        this.$store.dispatch('updateGroupe', {
          groupeId: groupe.id,
          data: {
            ...groupe,
            tri: nextGroupe.tri,
          }
        });
        this.$store.dispatch('updateGroupe', {
          groupeId: nextGroupe.id,
          data: {
            ...nextGroupe,
            tri: groupeTri,
          }
        });
      }
    },
    save(node) {},
  }
};
</script>

<style scoped></style>
