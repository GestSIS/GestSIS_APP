<template>
  <div>
    <div class="modal-header">
      <h5 class="modal-title" id="exampleModalLabel">
        Imputer indemnités et frais annuels
      </h5>
      <button type="button" class="btn-close" @click="cancel"></button>
    </div>
    <div class="modal-body">
      <!--progress bar-->
      <multi-step
        :steps="['Type de frais', 'Résultat']"
        :activeIndex="phase - 1"
      />
      <div class="alert alert-dismissible alert-primary" v-if="phase === 1">
        <button
          type="button"
          class="btn-close"
          data-bs-dismiss="alert"
        ></button>
        <h4 class="alert-heading">Aide</h4>
        <p class="mb-0">
          Les frais et indemnités annuels ci-dessous seront imputés
          automatiquement pour <strong>chaque</strong> sapeur selon ses
          fonctions. Pour effectuer l'imputation, cliquez sur le bouton
          <strong>Imputer</strong> en bas de la fenêtre.
        </p>
      </div>
      <div v-if="phase === 1" class="row">
        <div class="col-12">
          <table id="frais-annuels" class="table table-sm">
            <thead>
              <tr>
                <th></th>
                <th
                  v-for="type in typesAnnuel"
                  :key="type.id + '-' + type.type"
                  class="text-center"
                >
                  {{ type.designation }}
                </th>
              </tr>
              <tr>
                <th>Compte</th>
                <td
                  v-for="type in typesAnnuel"
                  :key="type.id + '-' + type.type"
                  class="text-center"
                >
                  {{ compte(type.compte_id) }}
                </td>
              </tr>
              <tr>
                <th>Cumulable</th>
                <td
                  v-for="type in typesAnnuel"
                  :key="type.id + '-' + type.type"
                  class="text-center"
                >
                  <input
                    type="checkbox"
                    class="form-check-input"
                    :checked="type.cumulable"
                    disabled
                  />
                </td>
              </tr>
            </thead>
            <tbody>
              <tr v-for="fonction in filteredFonctions" :key="fonction.id">
                <td>{{ fonction.nom }}</td>
                <td
                  v-for="type in typesAnnuel"
                  :key="type.id + '-' + type.type"
                  class="text-end"
                >
                  <template v-if="!detailsTypes">
                    {{ montantAnnuelTypePourFonction(type, fonction) }}
                  </template>
                  <template v-if="detailsTypes">
                    {{ montantAnnuelTypePourFonctionDetails(type, fonction) }}
                  </template>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div v-if="phase === 2">
        <div class="alert alert-dismissible alert-success">
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="alert"
          ></button>
          Imputations effectuées avec <strong>succès</strong>!
        </div>
        <table class="table table-sm">
          <thead>
            <tr>
              <th>Sapeur</th>
              <th>Designation</th>
              <th>Tarif</th>
              <th>Quantité</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ecriture in ecritures" :key="ecriture.id">
              <td>
                {{
                  formatSapeur(sapeurs.find((s) => s.id == ecriture.sapeur_id))
                }}
              </td>
              <td>{{ ecriture.designation }}</td>
              <td class="text-right">{{ ecriture.tarif }}</td>
              <td class="text-right">{{ ecriture.quantite }}</td>
              <td class="text-right">{{ ecriture.total }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="HIDE_MODAL()">
        {{ phase === 1 ? 'Annuler' : 'Fermer' }}
      </button>
      <button
        type="button"
        class="btn btn-primary"
        @click="imputer()"
        v-if="phase === 1"
      >
        Imputer
      </button>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex';
import MultiStep from '@/components/MultiStep.vue';

export default {
  name: 'ModalImputerAnnuel',
  components: { MultiStep },
  props: ['data'],
  data() {
    return {
      phase: 1,
      detailsTypes: false,
      allFonctions: false,
      ecritures: [],
      successMessageVisibility: true,
    };
  },
  computed: {
    ...mapState({
      fonctions: (state) => state.fonction.liste,
      fraisAnnuel: (state) => state.imputation.frais.annuels,
      indemnitesAnnuel: (state) => state.imputation.indemnites.annuels,
      comptes: (state) => state.compte.liste,
      unites: (state) => state.unite.liste,
      categories: (state) => state.ecritureCategorie.liste,
      sapeurs: (state) => state.sapeur.liste,
    }),
    typesAnnuel() {
      return [
        ...this.fraisAnnuel.map((f) => ({
          ...f,
          fonctions: f.fraisAnnuels || [],
          type: 'frais',
        })),
        ...this.indemnitesAnnuel.map((f) => ({
          ...f,
          fonctions: f.indemniteAnnuels || [],
          type: 'indemnite',
        })),
      ];
    },
    filteredFonctions() {
      const fonctionIds = new Set(
        this.typesAnnuel.flatMap((t) => t.fonctions.map((f) => f.fonction_id))
      );
      return this.fonctions.filter((f) => fonctionIds.has(f.id));
    },
  },
  methods: {
    ...mapMutations(['HIDE_MODAL']),
    montantAnnuelTypePourFonction(type, fonction) {
      const elem = type.fonctions?.find((e) => e.fonction_id == fonction.id);
      return elem?.quantite * elem?.montant || '';
    },
    formatSapeur(sapeur) {
      return `${sapeur?.nom} ${sapeur?.prenom}`;
    },
    compte(id) {
      if (!id) {
        return '';
      }
      const compte = this.comptes.find((f) => f.id === id);
      return `${compte?.numero} ${compte?.designation}`;
    },
    unite(id) {
      return id ? this.unites.find((u) => u.id === id)?.abreviation : '';
    },
    categorie(id) {
      return id ? this.categories.find((c) => c.id === id)?.designation : '';
    },
    cancel() {
      this.HIDE_MODAL();
    },
    imputer() {
      this.$store.dispatch('imputerAnnuel').then((data) => {
        this.phase = 2;
        this.ecritures = [...data.frais, ...data.indemnites].sort(
          (e1, e2) => e2.sapeur_id - e1.sapeur_id
        );
      });
    },
  },
};
</script>

<style scoped></style>
