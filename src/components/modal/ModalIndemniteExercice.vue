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
              class="form-control"
              :class="{ 'is-invalid': errors['designation'] }"
              id="designation"
            />
          </div>
          <div class="mb-3">
            <label for="solde">Solde</label>
            <input
              type="text"
              v-model="activeIndemnite.solde"
              class="form-control"
              :class="{ 'is-invalid': errors['solde'] }"
              id="solde"
            />
          </div>
          <div>
            <label for="solde_min">Solde min</label>
            <input
              type="text"
              v-model="activeIndemnite.solde_min"
              class="form-control"
              :class="{ 'is-invalid': errors['solde_min'] }"
              id="solde_min"
            />
          </div>
          <div>
            <label for="solde_min_pour">Pour</label>
            <input
              type="text"
              v-model="activeIndemnite.solde_min_pour"
              class="form-control"
              :class="{ 'is-invalid': errors['solde_min_pour'] }"
              id="solde_min_pour"
            />
          </div>
          <div class="mb-3">
            <label for="unite">Unité</label>
            <select
              id="unite"
              v-model="activeIndemnite.type_unite_id"
              class="form-select"
              :class="{ 'is-invalid': errors['type_unite_id'] }"
            >
              <option v-for="u in unites" :key="u.id" :value="u.id">
                {{ u.unite }}
              </option>
            </select>
          </div>
          <div>
            <label for="indemnite">Indemnite</label>
            <input
              type="text"
              v-model="activeIndemnite.indemnite"
              class="form-control"
              :class="{ 'is-invalid': errors['indemnite'] }"
              id="indemnite"
            />
          </div>
          <div class="mb-3">
            <label for="compte">Compte</label>
            <select
              id="compte"
              v-model="activeIndemnite.compte_id"
              class="form-select"
              :class="{ 'is-invalid': errors['compte_id'] }"
            >
              <option v-for="c in comptes" :key="c.id" :value="c.id">
                {{ compte(c) }}
              </option>
            </select>
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
              class="form-select"
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
              <tr>
                <th>Fonction</th>
                <th>Solde</th>
                <th>Indemnité</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!activeIndemnite.fonctions.length">
                <td colspan="3">Aucune fonction paramétrée</td>
              </tr>
              <tr
                v-for="index in activeIndemnite.fonctions.length"
                :key="index"
              >
                <td>
                  {{
                    fonction(activeIndemnite.fonctions[index - 1].fonction_id)
                  }}
                </td>
                <td>
                  <input
                    class="form-control form-control-sm"
                    type="text"
                    @change="(e) => updateSolde(index - 1, e)"
                    :value="activeIndemnite.fonctions[index - 1].solde"
                  />
                </td>
                <td>
                  <input
                    class="form-control form-control-sm"
                    type="text"
                    @change="(e) => updateIndemnite(index - 1, e)"
                    :value="activeIndemnite.fonctions[index - 1].indemnite"
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
      activeIndemnite: {
        fonctions: [],
      },
    };
  },
  mounted() {
    const base = Object.fromEntries(
      this.activeIndemnite.fonctions.map((f) => [f.fonction_id, f])
    );
    const data = Object.fromEntries(
      this.fonctions.map((f) => [
        f.id,
        { ...f, fonction_id: f.id, solde: 0, indemnite: 0 },
      ])
    );

    const objects = {
      ...data,
      ...base,
    };
    const fonctions = Object.values(objects).sort((a, b) => b.tri - a.tri);

    this.activeIndemnite = {
      ...this.data,
      fonctions: fonctions,
    };
  },
  computed: {
    ...mapState({
      fonctions: (state) => state.fonction.liste,
      unites: (state) => state.unite.liste,
      comptes: (state) => state.compte.liste,
      categories: (state) => state.ecritureCategorie.liste,
    }),
    parFonction() {
      return this.activeIndemnite.par_fonction;
    },
  },
  watch: {
    parFonction: function (val) {
      this.UPDATE_MODAL_SIZE(val ? 2 : 1);
    },
  },
  methods: {
    ...mapMutations(['HIDE_MODAL', 'UPDATE_MODAL_SIZE']),
    compte(compte) {
      return `${compte?.numero} ${compte.designation}`;
    },
    fonction(id) {
      return this.fonctions.find((f) => f.id === id)?.nom;
    },
    updateSolde(index, e) {
      this.activeIndemnite.fonctions[index].solde = e.target.value;
    },
    updateIndemnite(index, e) {
      this.activeIndemnite.fonctions[index].indemnite = e.target.value;
    },
    save() {
      const fonctions = this.activeIndemnite.fonctions
        .filter((f) => f.solde != 0 || f.indemnite != 0)
        .map((f) => ({
          solde: f.solde,
          indemnite: f.indemnite,
          fonction_id: f.fonction_id,
        }));

      let indemnite = {
        ...this.activeIndemnite,
        fonctions,
      };

      if ((indemnite || 0) === 0) {
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
