<template>
  <div class="card card-primary card-outline">
    <!-- /.card-header -->
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Frais &amp; indemnités annuels</h3>
      <div class="form-check form-switch mb-2">
        <input
          type="checkbox"
          class="form-check-input"
          id="switch"
          v-model="detailsTypes"
        />
        <label class="form-check-label" for="switch"
          >Afficher les détails</label
        >
      </div>
    </div>
    <div class="card-body">
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
              <button
                type="button"
                class="btn btn-outline-primary border-0"
                @click="updateType(type)"
              >
                <font-awesome-icon :icon="['far', 'edit']" />
              </button>
              <button
                type="button"
                class="btn btn-outline-danger border-0"
                @click="deleteType(type)"
              >
                <font-awesome-icon :icon="['far', 'trash-alt']" />
              </button>
            </th>
            <th rowspan="4" class="text-center align-middle">
              <button
                type="button"
                class="btn btn-outline-primary border-0"
                @click="ajoutType()"
              >
                <font-awesome-icon size="2x" :icon="['far', 'plus-square']" />
              </button>
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
            <th>Catégorie</th>
            <td
              v-for="type in typesAnnuel"
              :key="type.id + '-' + type.type"
              class="text-center"
            >
              {{ categorie(type.ecriture_categorie_id) }}
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
          <tr v-for="fonction in fonctions" :key="fonction.id">
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
              <button
                type="button"
                v-if="!type.fonctions.find((f) => f.fonction_id == fonction.id)"
                class="btn btn-outline-primary border-0"
                @click="addFonction(type, fonction)"
              >
                <font-awesome-icon :icon="['far', 'plus-square']" />
              </button>
              <button
                v-if="type.fonctions.find((f) => f.fonction_id == fonction.id)"
                type="button"
                class="btn btn-outline-primary border-0"
                @click="updateFonction(type, fonction)"
              >
                <font-awesome-icon :icon="['far', 'edit']" />
              </button>
              <button
                v-if="type.fonctions.find((f) => f.fonction_id == fonction.id)"
                type="button"
                class="btn btn-outline-danger border-0"
                @click="deleteFonction(type, fonction)"
              >
                <font-awesome-icon :icon="['far', 'trash-alt']" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import store from '@/store/index';

async function loadData(_, next) {
  const loadFrais = store.dispatch('fetchFraisTypes');
  const loadIndemnites = store.dispatch('fetchIndemnitesTypes');
  const loadFonctions = store.dispatch('fetchFonctions');
  const loadComptes = store.dispatch('fetchComptes');
  const loadUnites = store.dispatch('fetchUnites');

  Promise.all([
    loadFrais,
    loadIndemnites,
    loadFonctions,
    loadComptes,
    loadUnites,
  ]).then(() => {
    next();
  });
}

export default {
  name: 'ParametreIndemniteFraisAnnuel',
  beforeRouteEnter(routeTo, _, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, _, next) {
    loadData(routeTo, next);
  },
  data() {
    return {
      detailsTypes: false,
    };
  },
  computed: {
    ...mapState({
      fraisAnnuel: (state) => state.imputation.frais.annuels,
      indemnitesAnnuel: (state) => state.imputation.indemnites.annuels,
      fonctions: (state) => state.fonction.liste,
      comptes: (state) => state.compte.liste,
      unites: (state) => state.unite.liste,
      categories: (state) => state.ecritureCategorie.liste,
    }),
    typesAnnuel() {
      return [
        ...this.fraisAnnuel.map((f) => ({
          ...f,
          fonctions: f.fraisAnnuels,
          type: 'frais',
        })),
        ...this.indemnitesAnnuel.map((f) => ({
          ...f,
          fonctions: f.indemniteAnnuels,
          type: 'indemnite',
        })),
      ];
    },
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    montantAnnuelTypePourFonction(type, fonction) {
      const elem = type.fonctions.find((e) => e.fonction_id == fonction.id);
      return elem?.quantite * elem?.montant || '';
    },
    montantAnnuelTypePourFonctionDetails(type, fonction) {
      const elem = type.fonctions.find((e) => e.fonction_id == fonction.id);
      if (!elem) {
        return '';
      }
      const _ = (value) => {
        const numericalValue = Number.parseFloat(value);
        return Number.isInteger(numericalValue)
          ? parseInt(numericalValue)
          : numericalValue;
      };
      return `${_(elem?.quantite)} x ${_(elem?.montant)} ${this.unite(
        elem?.type_unite_id
      )}`;
    },
    ajoutType() {
      this.SHOW_MODAL({ component: 'ModalIndemniteFraisAnnuelType', data: {} });
    },
    updateType(type) {
      this.SHOW_MODAL({
        component: 'ModalIndemniteFraisAnnuelType',
        data: { ...type },
      });
    },
    deleteType(type) {
      const description =
        type.type == 'frais' ? 'ce frais type' : 'cette indemnité type';
      const action =
        type.type == 'frais'
          ? 'removeFraisAnnuelType'
          : 'removeIndemniteAnnuelType';
      this.SHOW_MODAL({
        component: 'ModalConfirmation',
        data: {
          title: `Voulez-vous vraiment supprimer ${description} ?`,
          question:
            'Attention, cette action est irréversible ! Les frais/indemnités générés avec ce type ne seront cependant pas affecté.',
        },
        callback: () => {
          this.$store.dispatch(action, type.id);
        },
      });
    },
    addFonction(type, fonction) {
      const elem = (type.indemniteAnnuels || type.fraisAnnuels).find(
        (e) => e.fonction_id == fonction.id
      );
      this.SHOW_MODAL({
        component: 'ModalIndemniteFraisAnnuel',
        data: {
          fonction_id: fonction.id,
          frais_annuel_type_id: type.id,
          indemnite_annuel_type_id: type.id,
          type: type.type,
          ...elem,
        },
      });
    },
    updateFonction(type, fonction) {
      const elem = (type.indemniteAnnuels || type.fraisAnnuels).find(
        (e) => e.fonction_id == fonction.id
      );
      this.SHOW_MODAL({
        component: 'ModalIndemniteFraisAnnuel',
        data: {
          fonction_id: fonction.id,
          frais_annuel_type_id: type.frais_annuel_type_id,
          indemnite_annuel_type_id: type.indemnite_annuel_type_id,
          type: type.type,
          ...elem,
        },
      });
    },
    deleteFonction(type, fonction) {
      const elem = type.fonctions.find((e) => e.fonction_id == fonction.id);
      const description = type.type == 'frais' ? 'ce frais' : 'cette indemnité';
      const action =
        type.type == 'frais' ? 'removeFraisAnnuel' : 'removeIndemniteAnnuel';
      this.SHOW_MODAL({
        component: 'ModalConfirmation',
        data: {
          title: `Voulez-vous vraiment supprimer ${description} ?`,
          question:
            'Attention, cette action est irréversible ! Les frais/indemnités générés avec ce type ne seront cependant pas affecté.',
        },
        callback: () => {
          this.$store.dispatch(action, elem.id);
        },
      });
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
  },
};
</script>

<style scoped></style>
