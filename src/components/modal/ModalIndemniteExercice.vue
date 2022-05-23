<template>
  <div>
    <div class="modal-header">
      <h5 class="modal-title" id="exampleModalLabel">
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
              type="text"
              v-model="activeIndemnite.designation"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['designation'] }"
              id="designation"
            />
          </div>
          <div class="mb-3">
            <label for="unite">Unité</label>
            <select
              id="unite"
              v-model="activeIndemnite.type_unite_id"
              class="form-select form-select-sm"
              :class="{ 'is-invalid': errors['type_unite_id'] }"
            >
              <option v-for="u in unites" :key="u.id" :value="u.id">
                {{ u.unite }}
              </option>
            </select>
          </div>
          <div class="mb-3">
            <table class="table table-sm">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Tarif</th>
                  <th v-if="uniteComptable">Tarif min</th>
                  <th v-if="uniteComptable">Pour</th>
                  <th>Compte</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(indemnite, i) in base" :key="i">
                  <td :class="uniteComptable ? 'col-2' : 'col-4'">
                    <base-select
                      :class="{ 'is-invalid': errors['base-type' + i] }"
                      valueKey="value"
                      displayKey="label"
                      :options="[
                        { value: 1, label: 'Solde' },
                        { value: 2, label: 'Indemnite' },
                      ]"
                      v-model="base[i].type"
                    />
                  </td>
                  <td :class="uniteComptable ? 'col-2' : 'col-4'">
                    <input
                      type="text"
                      v-model="base[i].tarif"
                      class="form-control form-control-sm"
                      :class="{ 'is-invalid': errors['base-tarif' + i] }"
                      id="tarif"
                    />
                  </td>
                  <td class="col-2" v-if="uniteComptable">
                    <input
                      type="text"
                      v-model="base[i].tarif_min"
                      class="form-control form-control-sm"
                      :class="{ 'is-invalid': errors['base-tarif-min' + i] }"
                      id="tarif_min"
                    />
                  </td>
                  <td class="col-2" v-if="uniteComptable">
                    <div class="input-group input-group-sm">
                      <input
                        type="text"
                        v-model="base[i].tarif_min_pour"
                        class="form-control form-control-sm"
                        :class="{
                          'is-invalid': errors['base-tarif-min-pour' + i],
                        }"
                        id="tarif_min_pour"
                      />
                      <span class="input-group-text">{{
                        unite(activeIndemnite.type_unite_id)
                      }}</span>
                    </div>
                  </td>
                  <td :class="uniteComptable ? 'col-3' : 'col-4'">
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
                  <td class="text-center" v-if="base.length > 1">
                    <button
                      type="button"
                      class="btn btn-outline-danger border-0"
                      @click="supprimerType()"
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
                type="checkbox"
                class="form-check-input"
                id="par-fonction-modal"
                v-model="activeIndemnite.par_fonction"
              />
              <label class="form-check-label" for="par-fonction-modal"
                >Par fonction</label
              >
            </div>
          </div>

          <div class="mb-3">
            <label for="categorie">Catégorie</label>
            <select
              id="categorie"
              v-model="activeIndemnite.ecriture_categorie_id"
              class="form-select form-select-sm"
              :class="{ 'is-invalid': errors['ecriture_categorie_id'] }"
            >
              <option v-for="c in categories" :key="c.id" :value="c.id">
                {{ c.designation }}
              </option>
            </select>
          </div>
        </div>

        <div class="col-6" v-if="activeIndemnite.par_fonction">
          <table class="table table-sm">
            <thead>
              <tr v-if="Object.keys(columns).length > 1">
                <th></th>
                <th class="text-center" v-for="(column, i) in columns" :key="i">
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
                    :class="{ 'is-invalid': errors['type'] }"
                    valueKey="value"
                    displayKey="label"
                    :options="[
                      { value: 1, label: 'Solde' },
                      { value: 2, label: 'Indemnite' },
                    ]"
                    v-model="columns[i].type"
                  />
                </th>
                <th rowspan="2">
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
                    @change="
                      (e) => (columns[i].fonctions[f.id] = e.target.value)
                    "
                    :value="columns[i].fonctions[f.id] || 0.0"
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
import { mapState, mapMutations } from 'vuex';

export default {
  name: 'ModalIndemniteExercice',
  props: {
    data: {
      type: Object,
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
      return false;
      // Désactive sold_min/solde_min_pour car a priori non-nécessaire pour des exercices
      const uniteId = this.activeIndemnite.type_unite_id;
      return (
        this.unites.find((u) => u.id == uniteId)?.comptable || uniteId == 1
      ); // Comptable ou par pièces
    },
  },
  watch: {
    parFonction: function (val) {
      this.UPDATE_MODAL_SIZE(this.uniteComptable || val ? 2 : 0);
    },
    uniteComptable: function (val) {
      this.UPDATE_MODAL_SIZE(val || this.parFonction ? 2 : 0);
    },
  },
  methods: {
    ...mapMutations(['HIDE_MODAL', 'UPDATE_MODAL_SIZE']),
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
          "Erreur, la même combinaison 'type' & 'compte' est utilisé plusieurs reprise."
        );
        return;
      }

      if (this.activeIndemnite.par_fonction) {
        const columnsFonctionsSet = new Set(
          Object.values(this.columns).map((e) => e.type + ' ' + e.compte_id)
        );
        if (columnsFonctionsSet.size != Object.keys(this.columns).length) {
          this.$awn.alert(
            "Erreur, la même combinaison 'type' & 'compte' est utilisé plusieurs reprise dans les fonctions."
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
            .reduce((e, acc) => [...acc, ...e], [])
        );
      }

      const indemnite = {
        ...this.activeIndemnite,
        fonctions,
      };

      if ((indemnite.id || 0) === 0) {
        this.$store
          .dispatch('addIndemniteExercice', indemnite)
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
      } else {
        this.$store
          .dispatch('updateIndemniteExercice', indemnite)
          .then(() => {
            this.errors = {};
            this.HIDE_MODAL();
          })
          .catch((errors) => {
            this.errors = {
              ...errors,
            };
          });
      }
    },
  },
};
</script>

<style scoped></style>
