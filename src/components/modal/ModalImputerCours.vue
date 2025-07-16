<template>
  <div>
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">Imputer le cours</h5>
      <button type="button" class="btn-close" @click="cancel"></button>
    </div>
    <div class="modal-body">
      <multi-step
        :steps="['Type de frais', 'Résultat']"
        :active-index="phase - 1"
      />
      <div v-if="phase === 1" class="row">
        <div class="col-12">
          <base-table
            ref="table"
            :data="computedIndemnites"
            :fields="fields"
            no-data="Aucune indemnité de cours"
            detail-row-class="m-td-0"
            :detail-row-column="true"
            :selectable="true"
            @selected="(indemnite) => selectIndemnite(indemnite)"
          >
            <template #detail-row="{ rowData }">
              <generic-details-row
                :options="detailRowOptions"
                :row-data="rowData"
              />
            </template>
            <template #actions="{ rowData }">
              <td class="align-middle text-center">
                <button
                  type="button"
                  class="btn btn-outline-primary border-0"
                  @click="updateIndemnite(rowData)"
                >
                  <font-awesome-icon :icon="['far', 'edit']" />
                </button>
                <button
                  type="button"
                  class="btn btn-outline-danger border-0"
                  @click="deleteIndemnite(rowData)"
                >
                  <font-awesome-icon :icon="['far', 'trash-alt']" />
                </button>
              </td>
            </template>
          </base-table>
        </div>
      </div>
      <div v-if="phase === 2">
        <div
          v-if="successMessageVisibility"
          class="alert alert-dismissible alert-success"
        >
          <button
            type="button"
            class="btn-close"
            @click="successMessageVisibility = false"
          ></button>
          Imputations effectuées avec <strong>succès</strong>!
        </div>
        <table class="table table-sm">
          <thead>
            <tr>
              <th>Designation</th>
              <th>Sapeur</th>
              <th>Quantité</th>
              <th>Tarif</th>
              <th>Total</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ecriture in ecritures" :key="ecriture.id">
              <td>{{ ecriture.designation }}</td>
              <td>
                {{
                  sapeurs.find((f) => f.id == ecriture.sapeur_id)?.nom_prenom
                }}
              </td>
              <td>{{ ecriture.quantite }}</td>
              <td>{{ ecriture.tarif }}</td>
              <td>{{ ecriture.total }}</td>
              <td>{{ formatType(ecriture.type) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="cancel">
        {{ phase === 1 ? 'Annuler' : 'Fermer' }}
      </button>
      <button
        v-if="phase === 1"
        type="button"
        class="btn btn-primary"
        :disabled="activeIndemnite === null"
        @click="imputer()"
      >
        Imputer
      </button>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { mapActions } from 'pinia';
import { useModalStore } from '../../stores/common/Modal.js';
import MultiStep from '/src/components/base/MultiStep.vue';
import GenericDetailsRow from '../table/GenericDetailsRow.vue';

export default {
  name: 'ModalImputerCours',
  components: { MultiStep, GenericDetailsRow },
  props: {
    data: {
      type: Object,
      default: () => {},
    },
    callback: {
      type: Function,
      default: () => {},
    },
  },
  data() {
    return {
      phase: 1,
      fields: [
        { title: 'Désignation', key: 'designation' },
        { title: 'Catégorie comptable', key: 'categorie' },
        { title: 'Actions', slot: 'actions' },
      ],
      detailRowOptions: {
        fields: [
          {
            title: 'Type',
            key: 'type',
            formatter: (type) => {
              const mapping = {
                0: 'Autre',
                1: 'Solde',
                2: 'Indemnité',
                3: 'Frais forfaitaire',
                4: 'Frais effectif',
                5: 'Charges AVS/AC',
              };
              return mapping[type] || '';
            },
          },
          { title: 'Tarif', key: 'tarif' },
          { title: 'Unité', key: 'unite' },
          { title: 'Compte', key: 'compte' },
        ],
        noData: 'Aucune indemnité',
      },
      activeIndemnite: null,
      ecritures: [],
      successMessageVisibility: true,
    };
  },
  computed: {
    ...mapState({
      indemnitesTypes: (state) => state.imputation.fraisIndemnites.cours,
      categories: (state) => state.ecritureCategorie.liste,
      fonctions: (state) => state.fonction.liste,
      sapeurs: (state) => state.sapeur.liste,
      comptes: (state) => state.compte.liste,
      unites: (state) => state.unite.liste,
      anneeComptableId: (state) => state.exerciceComptable.activeId,
    }),
    computedIndemnites() {
      return this.indemnitesTypes.map((c) => ({
        ...c,
        getData: () =>
          Promise.resolve(
            c.fonctions.map((e) => ({
              ...e,
              unite: this.unites.find((u) => u.id == e.type_unite_id)?.unite,
              compte: this.comptes.find((c) => c.id == e.compte_id)
                ?.designation,
            })),
          ),
        categorie: this.categories.find((e) => e.id == c.ecriture_categorie_id)
          ?.designation,
      }));
    },
  },
  mounted() {
    this.$refs.table.showAllDetailRow();
  },
  methods: {
    ...mapActions(useModalStore, { HIDE_MODAL: 'closeModal' }),
    selectIndemnite(indemnite) {
      this.activeIndemnite = indemnite;
    },
    cancel() {
      //TODO Cancel depending on state
      (this.callback() ?? Promise.resolve()).then((close) => {
        if (close ?? true) {
          this.HIDE_MODAL();
        }
      });
    },
    imputer() {
      if (this.indemniteType === null) {
        return;
      }

      //TODO
      this.$store
        .dispatch('imputerCours', {
          id: this.data.id,
          indemnite_cours_type_id: this.activeIndemnite.id,
          exercice_comptable_id: this.anneeComptableId,
        })
        .then((ecritures) => {
          this.phase = 2;
          this.ecritures = ecritures;
        });
    },
    formatType(type) {
      const mapping = {
        0: 'Autre',
        1: 'Solde',
        2: 'Indemnité',
        3: 'Frais forfaitaire',
        4: 'Frais effectif',
        5: 'Charges AVS/AC',
      };
      return mapping[type] || '';
    },
  },
};
</script>
