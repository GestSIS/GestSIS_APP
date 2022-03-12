<template>
  <tree :tree="groupeTree" :_types="types" :selectable="true" @selected="selected" />
</template>

<script>
import { mapState, mapMutations } from 'vuex';

import Tree from '@/components/tree/Tree.vue';

export default {
  name: 'groupes',
  components: {
    Tree,
  },
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
        // fonction: {icon: ['fas', 'medal'],},cours: {icon: ['fas', 'book'],},grade: {icon: ['fas', 'award'],},alphabetique: {icon: ['fas', 'sort-alpha-up-alt'],},civilite: {icon: ['fas', 'user'],},date: {icon: ['fas', 'birthday-cake'],},exercice: {icon: ['fas', 'calendar-alt'],},excuse: {icon: ['fas', 'scroll'],},intervention: {icon: ['fas', 'fire-extinguisher'],},permis: {icon: ['fas', 'car'],},
      },
      tree: [
        {
          id: 'g',
          type: 'groupe',
          label: 'Groupes',
          children: () => this.groupeTree,
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
        const sapeur = this.sapeurs.find((sap) => sap.id === s.sapeur_id) || {
          nom: 'Ancien',
          prenom: 'Sapeur',
          civilite: 1,
          id: s.sapeur_id,
        };
        return {
          id: s.sapeur_id,
          key: `s-${s.sapeur_id}`,
          label: `${sapeur.nom} ${sapeur.prenom}`,
          type: sapeur.civilite_id === 1 ? 'homme' : 'femme',
        };
      };
      const groupeMapping = (g) => ({
        label: g.no ? `${g.no} ${g.designation}` : g.designation,
        type: g.type == 0 ? 'groupe' : 'groupeInter',
        id: g.id,
        key: `g-${g.id}`,
        children: () => [
          ...this.groupes.filter(groupFilter(g.id)).map(groupeMapping),
          ...g.sapeur_ids.map(sapeurMapping),
        ],
      });

      return this.groupes.filter(groupFilter(null)).map(groupeMapping);
    },
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    selected(elem) {
      this.$emit('selected', elem);
    },
  },
};
</script>

<style lang="scss" scoped></style>
