<template>
  <div>
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">
        {{ activeIndemnite.id ? 'Modifier' : 'Ajouter' }} une indemnité pour
        exercice
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
          <base-select
            v-model="activeIndemnite.type_unite_id"
            class="mb-3"
            :class="{ 'is-invalid': errors['type_unite_id'] }"
            label="Unité"
            display-key="unite"
            :options="unites"
          />
          <div class="mb-3">
            <table class="table table-sm">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Tarif</th>
                  <th>Compte</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(indemnite, i) in base" :key="i">
                  <td class="col-4">
                    <base-select
                      v-model="base[i].type"
                      :class="{ 'is-invalid': errors['base-type' + i] }"
                      :options="[
                        { id: 1, designation: 'Solde' },
                        { id: 2, designation: 'Indemnite' },
                      ]"
                    />
                  </td>
                  <td class="col-4">
                    <input
                      id="tarif"
                      v-model="base[i].tarif"
                      type="text"
                      class="form-control form-control-sm"
                      :class="{ 'is-invalid': errors['base-tarif' + i] }"
                    />
                  </td>
                  <td class="col-4">
                    <select
                      id="compte"
                      v-model="base[i].compte_id"
                      class="form-select form-select-sm"
                      :class="{ 'is-invalid': errors['base-compte' + i] }"
                    >
                      <option v-for="c in comptes" :key="c.id" :value="c.id">
                        {{ compte(c) }}
                      </option>
                    </select>
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
          <div class="mb-3">
            <div class="form-check">
              <input
                id="par-fonction-modal"
                v-model="activeIndemnite.par_fonction"
                type="checkbox"
                class="form-check-input"
              />
              <label class="form-check-label" for="par-fonction-modal"
                >Par fonction</label
              >
            </div>
          </div>

          <base-select
            v-model="activeIndemnite.ecriture_categorie_id"
            class="mb-3"
            :class="{ 'is-invalid': errors['ecriture_categorie_id'] }"
            label="Catégorie comptable"
            :options="categories"
          />
        </div>

        <div v-if="activeIndemnite.par_fonction" class="col-6">
          <table class="table table-sm">
            <thead>
              <tr v-if="Object.keys(columns).length > 1">
                <th></th>
                <th v-for="(column, i) in columns" :key="i" class="text-center">
                  <button
                    type="button"
                    class="btn btn-outline-danger border-0"
                    @click="supprimerTypePourFonction(i)"
                  >
                    <font-awesome-icon :icon="['far', 'trash-alt']" />
                  </button>
                </th>
              </tr>
              <tr>
                <th>Type</th>
                <th v-for="(column, i) in columns" :key="i">
                  <base-select
                    v-model="columns[i].type"
                    :class="{ 'is-invalid': errors['type'] }"
                    :options="[
                      { id: 1, designation: 'Solde' },
                      { id: 2, designation: 'Indemnite' },
                    ]"
                  />
                </th>
                <th rowspan="2" class="align-middle">
                  <button
                    type="button"
                    class="btn btn-outline-primary border-0"
                    @click="ajoutTypePourFonction()"
                  >
                    <font-awesome-icon
                      size="2x"
                      :icon="['far', 'plus-square']"
                    />
                  </button>
                </th>
              </tr>
              <tr>
                <th>Compte</th>
                <th v-for="(column, i) in columns" :key="i">
                  <select
                    id="compte"
                    v-model="columns[i].compte_id"
                    class="form-select form-select-sm"
                    :class="{ 'is-invalid': errors['column-compte' + i] }"
                  >
                    <option v-for="c in comptes" :key="c.id" :value="c.id">
                      {{ compte(c) }}
                    </option>
                  </select>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!fonctions.length">
                <td colspan="3">Aucune fonction paramétrée</td>
              </tr>
              <tr v-for="f in fonctions" :key="f.id">
                <td>
                  {{ fonction(f.id) }}
                </td>
                <td v-for="(column, i) in columns" :key="i">
                  <input
                    class="form-control form-control-sm"
                    :class="{
                      'is-invalid': errors['column-tarif' + i + '-' + f.id],
                    }"
                    type="text"
                    :value="columns[i].fonctions[f.id] || 0.0"
                    @change="
                      (e) => (columns[i].fonctions[f.id] = e.target.value)
                    "
                  />
                </td>
              </tr>
            </tbody>
          </table>
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
      columnCreationIndex: 0,
      columns: [],
      base: [],
      activeIndemnite: {
        fonctions: [],
        par_fonction: false,
        type_unite_id: null,
      },
    };
  },
  computed: {
    ...mapState({
      fonctions: (state) => state.fonction.liste,
      unites: (state) => state.unite.liste, //.filter(u => !(u.id in [3, 4, 5, 7])),
      comptes: (state) => state.compte.liste,
      categories: (state) => state.ecritureCategorie.liste,
    }),
    parFonction() {
      return this.activeIndemnite.par_fonction;
    },
    uniteComptable() {
      // Désactive sold_min/solde_min_pour car a priori non-nécessaire pour des exercices
      return false;
      // const uniteId = this.activeIndemnite.type_unite_id;
      // return (
      //   this.unites.find((u) => u.id == uniteId)?.comptable || uniteId == 1
      // ); // Comptable ou par pièces
    },
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

    // Ajout un type par défault en cas d'utilisation des indemnités par fonction
    if (!Object.keys(this.columns).length) {
      this.columns[this.columnCreationIndex] = {
        type: 1,
        compte_id: null,
        fonctions: [],
      };
      this.columnCreationIndex++;
    }

    this.activeIndemnite = {
      ...this.activeIndemnite,
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
    ...mapActions(useModalStore, {
      HIDE_MODAL: 'closeModal',
      UPDATE_MODAL_SIZE: 'resize',
    }),
    unite(id) {
      return this.unites.find((u) => u.id == id)?.abreviation;
    },
    compte(compte) {
      return `${compte?.numero} ${compte.designation}`;
    },
    fonction(id) {
      return this.fonctions.find((f) => f.id === id)?.nom;
    },
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
          "Erreur, la même combinaison 'type' & 'compte' est utilisé à plusieurs reprises.",
        );
        return;
      }

      if (this.activeIndemnite.par_fonction) {
        const columnsFonctionsSet = new Set(
          Object.values(this.columns).map((e) => e.type + ' ' + e.compte_id),
        );
        if (columnsFonctionsSet.size != Object.keys(this.columns).length) {
          this.$awn.alert(
            "Erreur, la même combinaison 'type' & 'compte' est utilisé à plusieurs reprise dans les fonctions.",
          );
          return;
        }
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
      if (this.activeIndemnite.par_fonction) {
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

      // TODO: Set tarif_min to null if unite == forfait
      if (this.activeIndemnite.par_fonction) {
        fonctions.push(
          ...Object.values(this.columns)
            .map((e) => [
              ...Object.entries(e.fonctions).map(([f, tarif]) => ({
                type: e.type,
                compte_id: e.compte_id,
                fonction_id: f,
                tarif: tarif,
              })),
            ])
            .reduce((e, acc) => [...acc, ...e], []),
        );
      }

      const indemnite = {
        ...this.activeIndemnite,
        fonctions,
      };

      const action =
        (indemnite.id || 0) === 0
          ? 'addIndemniteExercice'
          : 'updateIndemniteExercice';
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

<style scoped></style>
