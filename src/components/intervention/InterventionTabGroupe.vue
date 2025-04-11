<template>
  <div class="col-xs-12 col-md-6">
    <!-- general form elements -->
    <div class="card card-primary card-outline mb-3">
      <div class="card-header d-flex justify-content-between">
        <h3 class="card-title">Groupes</h3>
        <button
          v-if="hasEditPermission"
          type="button"
          class="btn btn-primary"
          @click="save"
        >
          Enregistrer
        </button>
      </div>
      <div class="card-body table-responsive p-0">
        <table id="int-groupes" class="table table-sm">
          <thead>
            <tr>
              <th>Groupe</th>
              <th class="text-center">Alarmé</th>
            </tr>
          </thead>
          <tbody id="groupes">
            <tr v-if="groupes.length <= 0">
              <td colspan="2">
                Aucun groupe de disponible pour votre SIS, ajoutez-en dans
                <em>organisation</em>.
              </td>
            </tr>
            <tr v-for="g in groupes" :key="g.pseudo_id">
              <td>
                <label :for="'g-' + g.pseudo_id">
                  {{ (g.no ? g.no + ' ' : '') + g.designation }}
                </label>
              </td>
              <td>
                <div class="text-center">
                  <input
                    :id="'g-' + g.pseudo_id"
                    v-model="selected[g.pseudo_id]"
                    type="checkbox"
                    :disabled="!hasEditPermission"
                    class="form-check-input"
                  />
                  <label
                    class="form-check-label"
                    :for="'g-' + g.pseudo_id"
                  ></label>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import permissions from '/src/store/permissions.js';

export default {
  name: 'InterventionTabGroupes',
  data() {
    return {
      selected: {},
    };
  },
  computed: {
    ...mapState({
      groupes: (state) =>
        state.groupe.liste
          .filter((g) => g.type === 1)
          .map((g) => ({ ...g, pseudo_id: g.no + '_' + g.designation })),
      interventionGroupes: (state) =>
        state.intervention.active.groupes.map((g) => ({
          ...g,
          pseudo_id: g.no + '_' + g.designation,
        })),
      activeInterventionId: (state) => state.intervention.active.id,
      // TODO: Check si intervention pas déjà imputé
      hasEditPermission: (state) =>
        state.auth.admin ||
        state.auth.sis.permissions.includes(
          permissions.INTERVENTION.MODIFICATION
        ),
    }),
    filteredGroupes() {
      const ids = new Set(this.interventionGroupes.map((g) => g.pseudo_id));
      return [
        ...this.interventionGroupes,
        ...this.groupes.filter((g) => !ids.has(g.pseudo_id)),
      ];
    },
    additionalGroupes() {
      return 0;
    },
  },
  watch: {
    interventionGroupes(value) {
      this.updateGroupes(value);
    },
  },
  mounted() {
    if (this.groupes.length === 0) {
      this.$store.dispatch('fetchGroupes');
    }
    this.$store
      .dispatch('fetchInterventionGroupes', this.activeInterventionId)
      .then(() => {
        this.updateGroupes(this.interventionGroupes);
      });
  },
  methods: {
    async save() {
      let groupesIds = this.interventionGroupes.map((g) => g.pseudo_id);
      let ids = Object.keys(this.selected).filter(
        (item) => this.selected[item]
      );

      //New One
      let newOnes = ids.filter((item) => !groupesIds.includes(item));

      //Removed
      let removed = groupesIds.filter((item) => !ids.includes(item));
      let removedIds = [
        ...this.interventionGroupes
          .filter((g) => removed.includes(g.pseudo_id))
          .map((g) => g.id),
      ];

      Promise.all([
        removedIds.length > 0
          ? this.$store.dispatch('removeInterventionGroupes', removedIds)
          : Promise.resolved,
        newOnes.length > 0
          ? this.$store.dispatch('addInterventionGroupes', [
              ...this.groupes.filter((g) => newOnes.includes(g.pseudo_id)),
            ])
          : Promise.resolved,
      ]).then(() => this.$awn.success('Modifications enregistrées'));
    },
    updateGroupes(value) {
      this.selected = {};
      const svm = this;

      value.forEach(
        (v) => (svm.selected = { ...svm.selected, [v.pseudo_id]: true })
      );
    },
  },
};
</script>

<style scoped></style>
