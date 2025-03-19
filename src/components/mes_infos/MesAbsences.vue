<template>
  <div class="card card-primary card-outline mb-3">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Mes absences</h3>
      <button
        v-if="absenceParams?.actif"
        type="button"
        class="btn btn-primary"
        @click="addAbsence"
      >
        Saisir une absence
      </button>
    </div>
    <div class="card-body table-responsive">
      <base-table
        ref="table"
        class="table-striped"
        :fields="fields"
        :data="absences"
        :selectable="true"
        no-data="Aucun absence de saisie"
        @selected="(elem) => (activeItemId = elem?.id)"
      >
        <template #actions="{ rowData }">
          <button
            v-if="absenceParams?.actif"
            title="modifier"
            class="btn btn-outline-primary border-0"
            @click="modifierAbsence(rowData)"
          >
            <font-awesome-icon :icon="['far', 'edit']" />
          </button>
          <button
            v-if="absenceParams?.actif"
            class="btn btn-outline-danger border-0"
            @click="removeAbsence(rowData)"
          >
            <font-awesome-icon :icon="['far', 'trash-alt']" />
          </button>
        </template>
      </base-table>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import store from '/src/store/index';

async function loadData(routeTo, next) {
  await store.dispatch('fetchExercicesComptables');

  const loadMesAbsences = store.dispatch('fetchMesAbsences');
  const loadAbsenceParams = store.dispatch('fetchAbsenceParams');

  Promise.all([loadMesAbsences, loadAbsenceParams]).then(() => {
    next();
  });
}

export default {
  name: 'MesAbsences',
  beforeRouteEnter(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  data() {
    return {
      activeItemId: null,
      fields: [
        { title: 'Début', key: 'debut', type: Date },
        { title: 'Fin', key: 'fin', type: Date },
        { title: 'Actions', slot: 'actions' },
      ],
    };
  },
  computed: {
    ...mapState({
      absenceParams: (state) => state.absenceParam.params,
      anneeComptableId: (state) => state.exerciceComptable.activeId,
      absences: (state) =>
        state.mesInfos.absences.sort((e1, e2) =>
          e1.debut?.localeCompare(e2.debut)
        ),
    }),
  },
  watch: {
    anneeComptableId() {
      this.$store.dispatch('fetchMesAbsences');
    },
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    addAbsence() {
      this.SHOW_MODAL({
        component: 'ModalSAbsenter',
      });
    },
    modifierAbsence(absence) {
      this.SHOW_MODAL({
        component: 'ModalSAbsenter',
        data: absence,
      });
    },
    removeAbsence(absence) {
      this.SHOW_MODAL({
        component: 'ModalConfirmation',
        data: {
          title: 'Voulez-vous vraiment supprimer votre absence ?',
          question:
            "Attention, la suppression d'une absence est irréversible ! Toutes les données relatives à celle-ci seront supprimées définitivement.",
        },
        callback: (confirmed) => {
          if (confirmed) {
            this.$store
              .dispatch('removeMonAbsence', absence)
              .then(() => this.$awn.success('Absence supprimée avec succès'))
              .catch((err) =>
                this.$awn.alert(
                  err?.message ?? "Impossible de supprimer l'absence"
                )
              );
          }
        },
      });
    },
  },
};
</script>

<style scoped></style>
