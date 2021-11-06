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
            :_types="types"
            :selectable="true"
            @selected="selected"
            >1
          </editable-tree>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline-secondary" @click="close">Fermer</button>
    </div>
  </div>
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
      groupes: (state) => state.groupe.liste,
    }),
    groupeTree() {
      const groupFilter = (pereId) => (g) => g.pere_id == pereId;
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
    save() {
      //     // Sapeurs ajoutés
      //     const newSap = this.chosenSapeurs.filter((s) => !this.data.includes(s));
      //     // Sapeurs supprimés
      //     const removedSap = this.data.filter((s) => !this.chosenSapeurs.includes(s));
      //     // Sapeurs tous
      //     const sapeurs = this.chosenSapeurs;
      //     const svm = this;
      //     this.callback({ajoute: newSap, supprime: removedSap, tous: sapeurs})
      //       .then(() => {
      //         svm.HIDE_MODAL();
      //       })
      //       .catch((errorMessage) => {
      //         console.error(errorMessage);
      //         svm.$awn.warning(errorMessage);
      //       });
    },
  },

  // mounted() {
  //   this.chosenSapeurs = this.data.slice(0);

  //   this.$store.dispatch('fetchGroupes').then(() => {
  //     let svm = this;
  //     let recursive = (item) => {
  //       svm.expanded = { ...svm.expanded, [item.id]: false };
  //       item.groupes.forEach(recursive);
  //     };
  //     this.treeGroupesSapeurs.forEach(recursive);
  //   });
  // },
  // computed: {
  //   ...mapState({
  //     groupes: (state) => state.groupe.liste.
  //     grades: (state) => state.grade.liste,
  //     civilites: (state) => state.baseData.civilites,
  //     fonctions: (state) => state.fonction.liste,
  //     sapeurs: (state) => state.sapeur.liste,
  //   }),
  //   ...mapGetters(['getSapeur', 'treeGroupesSapeurs']),
  //   listeSapeurSelect() {
  //     let svm = this;
  //     if (this.groupBy === 'groupe') {
  //       return this.flattenedTree;
  //     } else if (this.groupBy === 'fonction') {
  //       let liste = [];
  //       this.fonctions.forEach((fonction) => {
  //         let expanded = svm.expanded[fonction.id];
  //         liste = [
  //           ...liste,
  //           {
  //             designation: fonction.nom,
  //             level: 0,
  //             leaf: false,
  //             id: fonction.id,
  //             expanded: expanded,
  //             parent_id: 0,
  //             empty: !svm.sapeurs
  //               .map((s) => ({ ...s, sapeur_id: s.id }))
  //               .filter(svm.filtreSapeur())
  //               .filter((s) => s.fonction_id === fonction.id).length,
  //           },
  //         ];
  //         if (expanded) {
  //           liste = [
  //             ...liste,
  //             ...svm.sapeurs
  //               .map((s) => ({ ...s, sapeur_id: s.id }))
  //               .filter(svm.filtreSapeur())
  //               .filter((s) => s.fonction_id === fonction.id)
  //               .map((sapeur) => ({
  //                 designation: `${sapeur.nom} ${sapeur.prenom}`,
  //                 level: 1,
  //                 leaf: true,
  //                 id: sapeur.id,
  //                 parent_id: sapeur.fonction_id,
  //               })),
  //           ];
  //         }
  //       });
  //       return liste;
  //     }
  //     return [];
  //   },
  //   flattenedTree() {
  //     let flattened = [];
  //     const svm = this;
  //     const recursive = function (groupe, level) {
  //       let expanded = svm.expanded[groupe.id];
  //       let flaten = [
  //         {
  //           designation: svm.groupeFormatter(groupe),
  //           level: level,
  //           leaf: false,
  //           id: groupe.id,
  //           expanded: expanded,
  //           empty:
  //             !groupe.groupes.length &&
  //             !groupe.sapeurs.filter(svm.filtreSapeur()).length,
  //         },
  //       ];
  //       if (expanded) {
  //         groupe.groupes.forEach(
  //           (g) => (flaten = [...flaten, ...recursive(g, level + 1)])
  //         );
  //         groupe.sapeurs
  //           .filter(svm.filtreSapeur())
  //           .map((s) => svm.getSapeur(s))
  //           .forEach(
  //             (s) =>
  //               (flaten = [
  //                 ...flaten,
  //                 {
  //                   designation: svm.sapeurFormatter(s),
  //                   leaf: true,
  //                   level: level + 1,
  //                   parent_id: groupe.id,
  //                   id: s.id,
  //                 },
  //               ])
  //           );
  //       }
  //       return flaten;
  //     };

  //     this.treeGroupesSapeurs.forEach(
  //       (i) => (flattened = [...flattened, ...recursive(i, 0)])
  //     );
  //     return flattened;
  //   },
  //   availableSapeurs() {
  //     return this.sapeurs
  //       .slice(0)
  //       .filter((s) => !this.chosenSapeurs.includes(s.id))
  //       .map((s) => s.id);
  //   },
  //   addSapeurState() {
  //     return (
  //       this.selectedSapeurs.filter((x) => !this.chosenSapeurs.includes(x))
  //         .length > 0
  //     );
  //   },
  //   removeSapeurState() {
  //     return (
  //       this.selectedSapeurs.filter((x) => this.chosenSapeurs.includes(x))
  //         .length > 0
  //     );
  //   },
  // },
  // methods: {
  //   ...mapMutations(['HIDE_MODAL']),
  //   close() {
  //     this.callback(null);
  //     this.HIDE_MODAL();
  //   },
  //   save() {
  //     // Sapeurs ajoutés
  //     const newSap = this.chosenSapeurs.filter((s) => !this.data.includes(s));
  //     // Sapeurs supprimés
  //     const removedSap = this.data.filter((s) => !this.chosenSapeurs.includes(s));
  //     // Sapeurs tous
  //     const sapeurs = this.chosenSapeurs;

  //     const svm = this;
  //     this.callback({ajoute: newSap, supprime: removedSap, tous: sapeurs})
  //       .then(() => {
  //         svm.HIDE_MODAL();
  //       })
  //       .catch((errorMessage) => {
  //         console.error(errorMessage);
  //         svm.$awn.warning(errorMessage);
  //       });
  //   },
  //   select(id, leaf = true) {
  //     if (leaf) {
  //       this.selectSapeur(id);
  //     } else {
  //       this.selectGroupe(id);
  //     }
  //   },
  //   selectSapeur(id) {
  //     this.selectedSapeurs = this.selectedSapeurs.includes(id)
  //       ? this.selectedSapeurs.filter((i) => i !== id)
  //       : [...this.selectedSapeurs, id];
  //   },
  //   selectGroupe(id, state = undefined) {
  //     let selected = state || !this.selectedGroups.includes(id);
  //     let svm = this;

  //     //Select groupe itself
  //     let recursiveSearch = (item) => {
  //       let found = item.id === id;
  //       if (found) {
  //         svm.selectGroupSingle(item, selected, true);
  //       } else {
  //         item.groupes.forEach(recursiveSearch);
  //       }
  //     };

  //     // recursive search
  //     this.treeGroupesSapeurs.forEach(recursiveSearch);
  //   },
  //   selectGroupSingle(groupe, state, first = false) {
  //     let svm = this;
  //     if (!first) {
  //       this.displaySelected = {
  //         ...this.displaySelected,
  //         [this.computeId({ leaf: false, id: groupe.id })]: state,
  //       };
  //     }

  //     this.selectedGroups = state
  //       ? Array.from(new Set([...this.selectedGroups, groupe.id]))
  //       : this.selectedGroups.filter((i) => i !== groupe.id);

  //     if (this.groupBy === 'groupe') {
  //       groupe.sapeurs.filter(this.filtreSapeur()).forEach((s) => {
  //         svm.displaySelected = {
  //           ...svm.displaySelected,
  //           [svm.computeId({ leaf: true, id: s })]: state,
  //         };
  //         svm.selectedSapeurs = state
  //           ? Array.from(new Set([...svm.selectedSapeurs, s]))
  //           : svm.selectedSapeurs.filter((i) => i !== s);
  //       });
  //       groupe.groupes.forEach((g) => svm.selectGroupSingle(g, state));
  //     } else if (this.groupBy === 'fonction') {
  //       svm.sapeurs
  //         .map((s) => ({ ...s, sapeur_id: s.id }))
  //         .filter(this.filtreSapeur())
  //         .filter((s) => s.fonction_id === groupe.id)
  //         .forEach((s) => {
  //           svm.displaySelected = {
  //             ...svm.displaySelected,
  //             [svm.computeId({ leaf: true, id: s.id })]: state,
  //           };
  //           svm.selectedSapeurs = state
  //             ? Array.from(new Set([...svm.selectedSapeurs, s.id]))
  //             : svm.selectedSapeurs.filter((i) => i !== s.id);
  //         });
  //     }
  //   },
  //   sapeurFormatter(s) {
  //     return s.nom + ' ' + s.prenom;
  //   },
  //   groupeFormatter(g) {
  //     return g.no ? g.no + ' ' + g.designation : g.designation;
  //   },
  // },
};
</script>

<style scoped></style>
