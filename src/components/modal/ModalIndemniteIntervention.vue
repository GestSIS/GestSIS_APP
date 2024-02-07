<template>
  <div>
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">
        {{ activeIndemnite.id ? 'Modifier' : 'Ajouter' }} une indemnité pour
        intervention
      </h5>
      <button type="button" class="btn-close" @click="HIDE_MODAL()"></button>
    </div>
    <div class="modal-body">
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
      <div class="row mb-3">
        <div :class="imputationType != 'taux' ? 'col-9' : 'col-12'">
          <label for="tarif">Tarif</label>
          <input
            id="tarif"
            v-model="activeIndemnite.tarif"
            type="text"
            class="form-control form-control-sm"
            :class="{ 'is-invalid': errors['tarif'] }"
          />
        </div>
        <div :class="imputationType != 'taux' ? 'col-3' : 'd-none'">
          <label for="pro-rata">Pro-rata</label>
          <font-awesome-icon
            v-tooltip.bottom="
              'A cocher si le nombre d\'heures effectives doit être arrondi à l\'heure pleine précédente.'
            "
            class="ms-1"
            :icon="['far', 'question-circle']"
          />
          <div class="form-check text-center col-6">
            <input
              id="pro-rata"
              v-model="activeIndemnite.tarif_pro_rata"
              type="checkbox"
              class="form-check-input"
            />
            <label class="form-check-label" for="pro-rata"></label>
          </div>
        </div>
      </div>
      <div class="mb-3">
        <label class="d-block">Type d'imputation</label>
        <div class="form-check form-check-inline">
          <input
            id="tarif-min"
            v-model="imputationType"
            class="form-check-input"
            type="radio"
            name="tarif-min"
            value="tarif-min"
          />
          <label class="form-check-label" for="tarif-min">Tarif min</label>
        </div>
        <div class="form-check form-check-inline">
          <input
            id="taux"
            v-model="imputationType"
            class="form-check-input"
            type="radio"
            name="taux"
            value="taux"
          />
          <label class="form-check-label" for="taux"
            >Taux week-end et taux nuit</label
          >
        </div>
      </div>
      <div class="container-fluid">
        <div v-if="imputationType != 'taux'" class="row">
          <div class="mb-3 col-3">
            <label for="tarif_min">Tarif min</label>
            <input
              id="tarif_min"
              v-model="activeIndemnite.tarif_min"
              type="text"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['tarif_min'] }"
            />
          </div>
          <div class="mb-3 col-2">
            <label for="tarif_min_pour">Pour</label>
            <input
              id="tarif_min_pour"
              v-model="activeIndemnite.tarif_min_pour"
              type="text"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['tarif_min_pour'] }"
            />
          </div>
          <div class="mb-3 col-4">
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
          <div class="mb-3 col-3">
            <label for="min-pro-rata">Pro-rata</label>
            <font-awesome-icon
              v-tooltip.bottom="
                'A cocher si le montant du tarif min doit être calculé au pro-rata du nombre d\'heures effectuées.'
              "
              class="ms-1"
              :icon="['far', 'question-circle']"
            />
            <div class="form-check text-center col-6">
              <input
                id="min-pro-rata"
                v-model="activeIndemnite.tarif_min_pro_rata"
                type="checkbox"
                class="form-check-input"
              />
              <label class="form-check-label" for="min-pro-rata"></label>
            </div>
          </div>
          <div class="mb-3 col-12">
            <label for="phase_id">Tarif min pour phase</label>
            <select
              id="phase_id"
              v-model="activeIndemnite.phase_id"
              class="form-select form-select-sm"
              :class="{ 'is-invalid': errors['phase_id'] }"
            >
              <option :value="null">toutes les phases</option>
              <option v-for="p in phases" :key="p.id" :value="p.id">
                uniquement phase {{ p.designation }}
              </option>
            </select>
          </div>
        </div>
        <div v-if="imputationType == 'taux'" class="row">
          <div class="mb-3 col-6">
            <label for="taux_nuit">Taux nuit</label>
            <input
              id="taux_nuit"
              v-model="activeIndemnite.taux_nuit"
              type="text"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['taux_nuit'] }"
            />
          </div>
          <div class="mb-3 col-6">
            <label for="taux_weekend">Taux weekend</label>
            <input
              id="taux_weekend"
              v-model="activeIndemnite.taux_weekend"
              type="text"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['taux_weekend'] }"
            />
          </div>
          <div class="mb-3 col-6">
            <label for="debut">Début nuit</label>
            <input
              id="debut"
              v-model="activeIndemnite.debut"
              type="time"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['debut'] }"
            />
          </div>
          <div class="mb-3 col-6">
            <label for="fin">Fin nuit</label>
            <input
              id="fin"
              v-model="activeIndemnite.fin"
              type="time"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['fin'] }"
            />
          </div>
        </div>
      </div>
      <div class="mb-3">
        <label for="compte">Compte</label>
        <select
          id="compte"
          v-model="activeIndemnite.compte_id"
          class="form-select form-select-sm"
          :class="{ 'is-invalid': errors['compte_id'] }"
        >
          <option v-for="c in comptes" :key="c.id" :value="c.id">
            {{ c.designation }}
          </option>
        </select>
      </div>
      <div class="mb-3">
        <label for="categorie">Catégorie comptable</label>
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
      <base-select
        v-model="activeIndemnite.type"
        class="mb-3"
        :class="{ 'is-invalid': errors['type'] }"
        label="Type comptable"
        :options="[
          { id: 1, designation: 'Solde' },
          { id: 2, designation: 'Indemnite' },
        ]"
      />
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
import { mapMutations, mapState } from 'vuex';

export default {
  name: 'ModalIndemniteIntervention',
  props: {
    data: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      errors: {},
      activeIndemnite: {
        phase_id: 0,
        par_fonction: 0,
        tarif_pro_rata: true,
        tarif_min_pro_rata: false,
        taux_nuit: 1,
        taux_weekend: 1,
      },
      imputationType: 1,
    };
  },
  computed: {
    ...mapState({
      fonctions: (state) => state.fonction.liste,
      comptes: (state) => state.compte.liste,
      unites: (state) => state.unite.liste,
      categories: (state) => state.ecritureCategorie.liste,
      phases: (state) => state.phaseType.liste,
    }),
  },
  mounted() {
    this.activeIndemnite = {
      ...this.activeIndemnite,
      ...this.data,
      debut: this.data?.debut?.slice(0, 5),
      fin: this.data?.fin?.slice(0, 5),
    };
    this.imputationType =
      this.activeIndemnite.taux_nuit || this.activeIndemnite.taux_weekend
        ? 'taux'
        : 'tarif-min';
  },
  methods: {
    ...mapMutations(['HIDE_MODAL']),
    async save() {
      if (this.imputationType == 'taux') {
        this.activeIndemnite.type_unite_id = 2; // Par heure
        this.activeIndemnite.tarif_pro_rata = null;
        this.activeIndemnite.tarif_min = null;
        this.activeIndemnite.tarif_min_pour = null;
        this.activeIndemnite.phase_id = null;

        if (
          !this.activeIndemnite.taux_nuit ||
          !this.activeIndemnite.taux_weekend ||
          this.activeIndemnite.taux_nuit <= 0 ||
          this.activeIndemnite.taux_weekend <= 0
        ) {
          this.errors = {
            taux_nuit:
              !this.activeIndemnite.taux_nuit ||
              this.activeIndemnite.taux_nuit <= 0
                ? 'invalide'
                : null,
            taux_weekend:
              !this.activeIndemnite.taux_weekend ||
              this.activeIndemnite.taux_weekend <= 0
                ? 'invalide'
                : null,
          };
          return;
        }
      } else {
        this.activeIndemnite.taux_nuit = null;
        this.activeIndemnite.taux_weekend = null;
        this.activeIndemnite.debut = null;
        this.activeIndemnite.fin = null;
      }

      if ((this.activeIndemnite.id || 0) === 0) {
        this.$store
          .dispatch('addIndemniteIntervention', this.activeIndemnite)
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
          .dispatch('updateIndemniteIntervention', this.activeIndemnite)
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
