<template>
  <!-- Téléphones -->
  <div class="card card-primary card-outline mb-3">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Téléphones</h3>
      <button
        v-if="hasEditPermission"
        class="btn btn-primary"
        @click.prevent="saveTelephones"
      >
        Enregistrer
      </button>
    </div>
    <div class="card-body table-responsive">
      <table class="table table-sm">
        <thead>
          <tr>
            <th :class="{ 'd-none': telephones.length <= 1 }">Priorité</th>
            <th>Numéro</th>
            <th>Type</th>
            <th v-if="sapeurType === 0">
              RTA
              <font-awesome-icon
                v-tooltip.bottom="
                  'Cocher pour transmettre à la centrale d\'alarme RTA'
                "
                class="ms-1"
                :icon="['far', 'question-circle']"
              />
            </th>
            <th v-if="hasEditPermission" class="text-center">Actions</th>
          </tr>
        </thead>
        <tr v-if="telephones.length <= 0">
          <td :colspan="hasEditPermission ? 5 : 4">Aucun numéro enregistré</td>
        </tr>
        <tr
          v-for="t in telephones.sort((t1, t2) => t1?.priorite > t2?.priorite)"
          :key="t.id"
        >
          <td class="text-center" :class="{ 'd-none': telephones.length <= 1 }">
            {{ t.priorite }}
          </td>
          <td>
            <input
              v-model="t.numero"
              class="form-control form-control-sm"
              type="text"
              :readonly="!hasEditPermission"
              placeholder="..."
            />
          </td>
          <td>
            <select
              v-model="t.telephone_type_id"
              class="form-select form-select-sm"
              :disabled="!hasEditPermission"
            >
              <option
                v-for="telType in telephoneTypes"
                :key="telType.id"
                :value="t.id"
              >
                {{ telType.type }}
              </option>
            </select>
          </td>
          <td v-if="sapeurType === 0" class="align-middle text-center">
            <input
              v-model="t.rta"
              type="checkbox"
              class="form-check-input"
              :disabled="!hasEditPermission"
            />
          </td>
          <td v-if="hasEditPermission" class="align-middle text-center">
            <button
              type="button"
              class="btn btn-outline-danger border-0"
              required
              @click="removeTelephone(t.priorite)"
            >
              <font-awesome-icon :icon="['far', 'trash-alt']" />
            </button>
          </td>
        </tr>
      </table>
      <button
        v-if="hasEditPermission"
        type="button"
        class="btn btn-outline-primary"
        :disabled="telephonesData.length >= 3"
        @click="addTelephone()"
      >
        <font-awesome-icon class="me-1" :icon="['fas', 'plus']" />Ajouter un
        numéro
      </button>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import permissions from '/src/store/permissions.js';

export default {
  data() {
    return {
      telephonesData: [],
      errorsTel: {},
    };
  },
  computed: {
    ...mapState({
      sapeurType: (state) => state.sapeur.active.data.type,
      telephoneTypes: (state) => state.baseData.telephoneTypes,
      activeSapeurTelephones: (state) =>
        state.sapeur.active.telephones
          .slice(0)
          .sort((t1, t2) => t1.priorite - t2.priorite),
      hasEditPermission: (state) =>
        state.auth.admin ||
        state.auth.sis.permissions.includes(permissions.SAPEUR.MODIFICATION),
    }),

    telephones: {
      get() {
        return this.telephonesData;
      },
      set(telephones) {
        telephones.forEach((t, i) => (t.priorite = i + 1));

        this.telephonesData = telephones.sort(
          (t1, t2) => t1.priorite - t2.priorite
        );
      },
    },
  },
  watch: {
    activeSapeurTelephones() {
      this.telephonesData = this.activeSapeurTelephones.map((t) => ({ ...t }));
    },
  },
  mounted() {
    this.telephonesData = [
      ...(this.activeSapeurTelephones || []).map((t) => ({ ...t })),
    ];
  },
  methods: {
    saveTelephones() {
      //TODO: Validation de toutes les données

      this.activeSapeurTelephones.forEach((t) => {
        //Suppression des numéros supprimé
        if (this.telephones.filter((t2) => t2.id === t.id).length === 0) {
          this.$store.dispatch('removeTelephoneSapeur', t.id);
        }
      });

      this.telephones.forEach((t) => {
        //Numéros modifiés
        if (t.id !== null) {
          this.$store.dispatch('editTelephoneSapeur', t);
        }
        //Nouveaux numéros
        else {
          this.$store.dispatch('addTelephoneSapeur', t);
        }
      });
    },
    addTelephone() {
      if (this.telephonesData.length < 3) {
        this.telephones = [
          ...this.telephones,
          {
            id: null,
            telephone_type_id: 0,
            rta: 0,
            priorite: this.telephones.length + 1,
          },
        ];
      }
    },
    removeTelephone(priorite) {
      this.telephones = this.telephones.filter((t) => t.priorite !== priorite);
    },
  },
};
</script>

<style lang="scss" scoped></style>
