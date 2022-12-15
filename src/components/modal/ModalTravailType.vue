<template>
  <div>
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">
        {{ activeTravailType.id ? 'Modifier' : 'Ajouter' }} un travail type
      </h5>
      <button type="button" class="btn-close" @click="HIDE_MODAL()"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label for="designation">Désignation</label>
        <input
          id="designation"
          v-model="activeTravailType.designation"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['designation'] }"
        />
      </div>
      <div class="mb-3">
        <table class="table table-sm">
          <thead>
            <tr>
              <th>Type</th>
              <th>Tarif</th>
              <th>Unité</th>
              <th>Compte</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(indemnite, i) in base" :key="i">
              <td class="col-3">
                <base-select
                  v-model="base[i].type"
                  :class="{ 'is-invalid': errors['base-type' + i] }"
                  :options="[
                    { id: 1, designation: 'Solde' },
                    { id: 2, designation: 'Indemnite' },
                    { id: 3, designation: 'Frais forfaitaire' },
                    { id: 4, designation: 'Frais effectif' },
                  ]"
                />
              </td>
              <td class="col-2">
                <input
                  id="tarif"
                  v-model="base[i].tarif"
                  type="text"
                  class="form-control form-control-sm"
                  :class="{ 'is-invalid': errors['base-tarif' + i] }"
                />
              </td>
              <td class="col-3">
                <base-select
                  v-model="base[i].type_unite_id"
                  :class="{ 'is-invalid': errors['base-unite' + i] }"
                  display-key="unite"
                  :options="unites"
                />
              </td>
              <td class="col-4">
                <base-select
                  v-model="base[i].compte_id"
                  :class="{ 'is-invalid': errors['base-compte' + i] }"
                  display-key="label"
                  :options="comptes"
                />
              </td>
              <td v-if="base.length > 1" class="text-center">
                <button
                  type="button"
                  class="btn btn-outline-danger border-0"
                  @click="supprimerType(i)"
                >
                  <font-awesome-icon :icon="['far', 'trash-alt']" />
                </button>
              </td>
            </tr>
            <tr>
              <td :colspan="base.length > 1 ? 6 : 5">
                <button
                  type="button"
                  class="btn btn-outline-primary"
                  @click="ajoutType()"
                >
                  Ajouter
                  <font-awesome-icon size="1x" :icon="['far', 'plus-square']" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <base-select
        v-model="activeTravailType.ecriture_categorie_id"
        class="mb-3"
        :class="{ 'is-invalid': errors['ecriture_categorie_id'] }"
        :options="categories"
        label="Catégorie comptable"
      />
      <base-checkbox
        v-model="activeTravailType.actif"
        class="mb-3"
        label="Actif"
      />
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="HIDE_MODAL()">
        Fermer
      </button>
      <button type="button" class="btn btn-primary" @click="save()">
        {{ activeTravailType.id ? 'Modifier' : 'Ajouter' }}
      </button>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';

export default {
  name: 'ModalTravailType',
  props: {
    data: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      errors: {},
      columnCreationIndex: 0,
      columns: [],
      base: [],
      activeTravailType: {
        actif: true,
        fonctions: [],
      },
    };
  },
  computed: {
    ...mapState({
      unites: (state) => state.unite.liste, //.filter(u => !(u.id in [3, 4, 5, 7])),
      comptes: (state) => state.compte.liste,
      categories: (state) => state.ecritureCategorie.liste,
    }),
  },
  watch: {
    parFonction: function (val) {
      this.UPDATE_MODAL_SIZE(val ? 2 : 0);
    },
  },
  mounted() {
    // Calcul des différentes combinaisons existantes
    const configurations = new Set(
      this.data?.fonctions
        ?.filter((f) => f.fonction_id)
        ?.map((f) => f.type + ' ' + f.compte_id) || []
    );
    this.columns = Object.fromEntries(
      [...configurations]
        .map((e) => [e, e.split(' ')])
        .map(([index, e]) => [
          index,
          {
            type: e[0],
            compte_id: e[1],
            fonctions: {},
          },
        ])
    );

    this.data?.fonctions
      ?.filter((f) => f.fonction_id)
      ?.forEach((f) => {
        this.columns[f.type + ' ' + f.compte_id].fonctions[f.fonction_id] =
          f.tarif;
      });

    // Ajout un type par défault en cas d'utilisation des indemnités par fonction
    if (!Object.keys(this.columns).length) {
      this.columns[this.columnCreationIndex] = {
        type: 1,
        compte_id: null,
        fonctions: [],
      };
      this.columnCreationIndex++;
    }

    this.activeTravailType = {
      ...this.activeTravailType,
      type_unite_id: 6, // Set unité type défault à forfait
      ...this.data,
    };

    this.base = this.data?.fonctions?.filter((f) => !f.fonction_id) || [];
    if (!this.base.length) {
      // Ajout d'un revenu de base de type solde
      this.base.push({
        type: 1,
        id: null,
        tarif: null,
        tarif_min: null,
        tarif_min_pour: null,
        compte_id: null,
        fonction_id: null,
      });
    }
  },
  methods: {
    ...mapMutations(['HIDE_MODAL', 'UPDATE_MODAL_SIZE']),
    updateTarif(index, e) {
      this.activeTravailType.fonctions[index].tarif = e.target.value;
    },
    updateIndemnite(index, e) {
      this.activeTravailType.fonctions[index].indemnite = e.target.value;
    },
    ajoutType() {
      this.base.push({
        type: 1,
        tarif: null,
        tarif_min: null,
        tarif_min_pour: null,
        compte_id: null,
        fonction_id: null,
      });
    },
    supprimerType(i) {
      this.base.splice(i, 1);
    },
    ajoutTypePourFonction() {
      this.columns[this.columnCreationIndex] = {
        type: 1,
        compte_id: null,
        fonctions: [],
      };
      this.columnCreationIndex++;
    },
    supprimerTypePourFonction(i) {
      delete this.columns[i];
    },
    async save() {
      this.errors = {};

      // Contrôle qu'aucune colonne n'est dupliquée
      const baseSet = new Set(this.base.map((e) => e.type + ' ' + e.compte_id));
      if (baseSet.size != this.base.length) {
        this.$awn.alert(
          "Erreur, la même combinaison 'type' & 'compte' est utilisé plusieurs reprise."
        );
        return;
      }

      // Contrôle des données de base
      this.base.forEach((e, i) => {
        if (!e.type) this.errors['base-type' + i] = true;
        if (!e.compte_id) this.errors['base-compte' + i] = true;
        if (!e.tarif || e.tarif < 0) this.errors['base-tarif' + i] = true;
        if (e.tarif_min && e.tarif_min < 0)
          this.errors['base-tarif-min' + i] = true;
        if (e.tarif_min_pour && e.tarif_min_pour < 0)
          this.errors['base-tarif-min-pour' + i] = true;
      });
      if (this.activeTravailType.par_fonction) {
        Object.values(this.columns).forEach((e, i) => {
          if (!e.type) this.errors['column-type' + i] = true;
          if (!e.compte_id) this.errors['column-compte' + i] = true;
        });
      }

      // Return en cas d'erreurs
      if (Object.keys(this.errors).length > 0) {
        return;
      }

      // Generate data
      const fonctions = [...this.base];

      const indemnite = {
        ...this.activeTravailType,
        fonctions,
      };

      const action =
        (indemnite.id || 0) === 0 ? 'addTravailType' : 'updateTravailType';
      this.$store
        .dispatch(action, indemnite)
        .then(() => {
          this.errors = {};
          this.HIDE_MODAL();
        })
        .catch(
          (errors) =>
            (this.errors = {
              ...errors,
            })
        );
    },
  },
};
</script>

<style scoped></style>
