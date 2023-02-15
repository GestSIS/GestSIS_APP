<template>
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
              :disabled="!hasEditPermission"
              placeholder="..."
            />
          </td>
          <td>
            <select
              v-model="t.telephone_type_id"
              class="form-select form-select-sm"
              :disabled="!hasEditPermission"
            >
              <option v-for="t in telephoneTypes" :key="t.id" :value="t.id">
                {{ t.type }}
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

export default {
  name: 'MesTelephones',
  props: {
    modelValue: {
      type: Array,
      required: true,
    },
    sapeurType: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      telephones: [
        ...(this.modelValue?.filter((t) => t)?.map((t) => ({ ...t })) ?? []),
      ]?.sort((t1, t2) => t1.priorite?.toString()?.localeCompare(t2.priorite)),
      hasEditPermission: false,
      fields: [
        { title: 'Priorité', key: 'priorite' },
        { title: 'Numéro', key: 'numero' },
        { title: 'Type', key: 'type' },
        { title: 'RTA', key: 'rta', type: Boolean },
      ],
    };
  },
  computed: {
    ...mapState({
      telephoneTypes: (state) => state.baseData.telephoneTypes,
    }),
  },
};
</script>

<style scoped></style>
