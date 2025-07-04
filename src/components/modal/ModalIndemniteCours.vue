<template>
  <div>
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">
        {{ activeIndemnite.id ? 'Modifier' : 'Ajouter' }} une indemnité pour
        cours
      </h5>
      <button type="button" class="btn-close" @click="HIDE_MODAL()"></button>
    </div>
    <div class="modal-body">
      <div class="row">
        <div
          :class="{
            'col-6': activeIndemnite.par_fonction,
            'col-12': !activeIndemnite.par_fonction,
          }"
        >
          <div class="mb-3">
            <label for="designation">Désignation</label>
            <input
              id="designation"
              v-model="activeIndemnite.designation"
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
                  <td class="col-2">
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
                  <td class="col-2">
                    <base-select
                      v-model="base[i].type_unite_id"
                      :class="{ 'is-invalid': errors['base-unite' + i] }"
                      display-key="unite"
                      :options="unites"
                    />
                  </td>
                  <td class="col-6">
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
                      <font-awesome-icon
                        size="1x"
                        :icon="['far', 'plus-square']"
                      />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <base-select
            v-model="activeIndemnite.ecriture_categorie_id"
            class="mb-3"
            :class="{ 'is-invalid': errors['ecriture_categorie_id'] }"
            :options="categories"
            label="Catégorie comptable"
          />
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="HIDE_MODAL()">
        Fermer
      </button>
      <button type="button" class="btn btn-primary" @click="save()">
        {{ activeIndemnite.id ? 'Modifier' : 'Ajouter' }}
      </button>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { mapActions } from 'pinia';
import { useModalStore } from '../../stores/common/Modal.js';

export default {
  name: 'ModalIndemniteExercice',
  props: {
    data: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      errors: {},
      base: [],
      activeIndemnite: {
        fonctions: [],
      },
    };
  },
  computed: {
    ...mapState({
      fonctions: (state) => state.fonction.liste,
      unites: (state) =>
        state.unite.liste.filter((u) => new Set([1, 5, 6]).has(parseInt(u.id))),
      comptes: (state) => state.compte.liste,
      categories: (state) => state.ecritureCategorie.liste,
    }),
    uniteComptable() {
      // Désactive sold_min/solde_min_pour car a priori non-nécessaire pour des exercices
      return false;
      // const uniteId = this.activeIndemnite.type_unite_id;
      // return (
      //   this.unites.find((u) => u.id == uniteId)?.comptable || uniteId == 1
      // ); // Comptable ou par pièces
    },
  },
  mounted() {
    // Calcul des différentes combinaisons existantes
    const configurations = new Set(
      this.data?.fonctions
        ?.filter((f) => f.fonction_id)
        ?.map((f) => f.type + ' ' + f.compte_id) || [],
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
        ]),
    );

    this.data?.fonctions
      ?.filter((f) => f.fonction_id)
      ?.forEach((f) => {
        this.columns[f.type + ' ' + f.compte_id].fonctions[f.fonction_id] =
          f.tarif;
      });

    this.activeIndemnite = {
      ...this.activeIndemnite,
      ...this.data,
    };

    this.base = this.data?.fonctions?.filter((f) => !f.fonction_id) || [];
    if (!this.base.length) {
      // Ajout d'un revenu de base de type solde
      this.base.push({
        type: 1,
        id: null,
        tarif: null,
        compte_id: null,
        fonction_id: null,
        type_unite_id: null,
      });
    }
  },
  methods: {
    ...mapActions(useModalStore, {
      HIDE_MODAL: 'closeModal',
      UPDATE_MODAL_SIZE: 'resize',
    }),
    updateTarif(index, e) {
      this.activeIndemnite.fonctions[index].tarif = e.target.value;
    },
    updateIndemnite(index, e) {
      this.activeIndemnite.fonctions[index].indemnite = e.target.value;
    },
    ajoutType() {
      this.base.push({
        type: 1,
        tarif: null,
        compte_id: null,
        fonction_id: null,
        type_unite_id: null,
      });
    },
    supprimerType(i) {
      this.base.splice(i, 1);
    },
    async save() {
      this.errors = {};

      // Contrôle qu'aucune colonne n'est dupliquée
      const baseSet = new Set(this.base.map((e) => e.type + ' ' + e.compte_id));
      if (baseSet.size != this.base.length) {
        this.$awn.alert(
          "Erreur, la même combinaison 'type' & 'compte' est utilisé à plusieurs reprises.",
        );
        return;
      }

      // Contrôle des données de base
      this.base.forEach((e, i) => {
        if (!e.type) this.errors['base-type' + i] = true;
        if (!e.compte_id) this.errors['base-compte' + i] = true;
        if (!e.tarif || e.tarif < 0) this.errors['base-tarif' + i] = true;
        if (!e.type_unite_id || e.type_unite_id <= 0)
          this.errors['base-unite' + i] = true;
      });

      // Return en cas d'erreurs
      if (Object.keys(this.errors).length > 0) {
        return;
      }

      // Generate data
      const fonctions = [...this.base];

      const indemnite = {
        ...this.activeIndemnite,
        fonctions,
      };

      const action =
        (indemnite.id || 0) === 0
          ? 'addIndemniteCours'
          : 'updateIndemniteCours';

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
            }),
        );
    },
  },
};
</script>
