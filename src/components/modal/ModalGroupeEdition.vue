<template>
  <div>
    <div class="modal-header">
      <h5 class="modal-title">Gérer les groupes</h5>
      <button type="button" class="btn-close" @click="close"></button>
    </div>
    <div class="modal-body">
      <div class="row mt-2">
        <div class="col-12">
          <h2 class="h5">Actions</h2>
          <button class="btn btn-primary">Ajouter un groupe</button>
        </div>
      </div>
      <div class="row mb-2">
        <div class="col-12">
          <editable-tree
            :tree="groupeTree"
            :types="types"
            :selectable="true"
            @selected="selected"
            >1</editable-tree
          >
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline-secondary" @click="close">Fermer</button>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { mapActions } from 'pinia';
import { useModalStore } from '../../stores/common/Modal.js';

import EditableTree from '/src/components/editable_tree/EditableTree.vue';

export default {
  name: 'ModalGroupeEdition',
  components: {
    EditableTree,
  },
  props: {
    callback: {
      type: Function,
      default: () => {},
    },
    data: {
      type: Object,
      default: () => {},
    },
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
          children: [],
        },
      ],
    };
  },
  computed: {
    ...mapState({
      groupes: (state) => state.groupe.liste,
    }),
    groupeTree() {
      const groupFilter = (parentId) => (g) => g.parent_id == parentId;
      const groupeMapping = (g) => ({
        label: g.no ? `${g.no} ${g.designation}` : g.designation,
        type: g.type == 0 ? 'groupe' : 'groupeInter',
        id: g.id,
        key: `g-${g.id}`,
        children: [
          ...this.groupes.filter(groupFilter(g.id)).map(groupeMapping),
        ],
      });

      return this.groupes.filter(groupFilter(null)).map(groupeMapping);
    },
  },
  mounted() {
    this.tree.children = this.groupeTree;
  },
  methods: {
    ...mapActions(useModalStore, { HIDE_MODAL: 'closeModal' }),
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
    async save() {},
  },
};
</script>

<style scoped></style>
