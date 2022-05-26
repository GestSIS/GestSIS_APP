<template>
  <!-- Téléphones -->
  <div class="card card-primary card-outline mb-3">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Téléphones</h3>
      <button @click.prevent="saveTelephones" class="btn btn-primary" v-if="hasEditPermission">
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
              <font-awesome-icon class="ms-1" v-tooltip.bottom="
                'Cocher pour transmettre à la centrale d\'alarme RTA'
              " :icon="['far', 'question-circle']" />
            </th>
            <th class="text-center" v-if="hasEditPermission">Actions</th>
          </tr>
        </thead>
        <tr v-if="telephones.length <= 0">
          <td :colspan="hasEditPermission ? 5 : 4">Aucun numéro enregistré</td>
        </tr>
        <draggable tag="tbody" v-model="telephones" item-key="priorite">
          <template #item="{ element }">
            <tr>
              <td class="text-center" :class="{ 'd-none': telephones.length <= 1 }">
                {{ element.priorite }}
              </td>
              <td>
                <input class="form-control form-control-sm" type="text" :readonly="!hasEditPermission"
                  v-model="element.numero" placeholder="..." />
              </td>
              <td>
                <select class="form-select form-select-sm" v-model="element.telephone_type_id"
                  :disabled="!hasEditPermission">
                  <option v-for="t in telephonesTypes" :value="t.id" :key="t.id">
                    {{ t.type }}
                  </option>
                </select>
              </td>
              <td class="align-middle text-center" v-if="sapeurType === 0">
                <input type="checkbox" class="form-check-input" v-model="element.rta" :disabled="!hasEditPermission" />
              </td>
              <td class="align-middle text-center" v-if="hasEditPermission">
                <button type="button" class="btn btn-outline-danger border-0" @click="removeTelephone(element.priorite)"
                  required>
                  <font-awesome-icon :icon="['far', 'trash-alt']" />
                </button>
              </td>
            </tr>
          </template>
        </draggable>
      </table>
      <button type="button" class="btn btn-outline-primary" @click="addTelephone()"
        :disabled="this.telephonesData.length >= 3" v-if="hasEditPermission">
        <font-awesome-icon class="me-1" :icon="['fas', 'plus']" />Ajouter un
        numéro
      </button>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import permissions from '@/store/permissions.js';
import draggable from 'vuedraggable';

export default {
  components: {
    draggable,
  },
  mounted() {
    this.telephonesData = [
      ...(this.activeSapeurTelephones || []).map((t) => ({ ...t })),
    ];
  },
  data() {
    return {
      telephonesData: [],
      errorsTel: {},
    };
  },
  watch: {
    activeSapeurTelephones() {
      this.telephonesData = this.activeSapeurTelephones.map((t) => ({ ...t }));
    },
  },
  computed: {
    ...mapState({
      sapeurType: (state) => state.sapeur.active.data.type,
      telephonesTypes: (state) => state.baseData.telephoneTypes,
      hasEditPermission: (state) =>
        state.auth.sis.permissions.includes(permissions.SAPEUR.MODIFICATION),
    }),
    ...mapGetters(['activeSapeurTelephones']),
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
            telephone_type_id: 0, //this.listTelephoneTypes[0].id, //TODO Choisir si select de base
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

<style lang="scss" scoped>
</style>
