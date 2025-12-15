<script setup>
import { computed, onMounted, ref, useTemplateRef, watchEffect } from 'vue';
import { useSapeurStore } from '../../stores/sapeur/Sapeur.js';
import { useModalStore } from '../../stores/common/Modal.js';
import useHasPermission from '../../composables/usePermission.js';
import permissions from '/src/composables/permissions.js';
import InterventionTabGroupe from '/src/components/intervention/InterventionTabGroupe.vue';
import InterventionTabPhase from '/src/components/intervention/InterventionTabPhase.vue';
import { useInterventionStore } from '../../stores/intervention/Intervention.js';
import { usePhaseTypeStore } from '../../stores/intervention/PhaseType.js';

const sapeurStore = useSapeurStore();
const interventionStore = useInterventionStore();
const phaseTypeStore = usePhaseTypeStore();

phaseTypeStore.fetchPhaseTypes();
sapeurStore.fetchListeSapeur();

const { id } = defineProps({
  id: {
    type: String,
    required: true,
  },
});

const loading = ref(false);
watchEffect(async () => {
  loading.value = true;
  await Promise.all([
    interventionStore.fetchInterventionQuittances(id),
    interventionStore.fetchInterventionPhases(id),
    interventionStore.fetchInterventionSapeurs(id),
  ]);
  loading.value = false;
});

const columns = ref([]);
const toggles = ref({});
const dismissedWarning = ref(false);

const dataInter = computed(() => interventionStore.active.data);
const quittances = computed(() => interventionStore.active.quittances);
const presences = computed(() => interventionStore.active.sapeurs);
const phases = computed(() => interventionStore.active.phases);
const sapeurs = computed(() => sapeurStore.liste);

// TODO: Check si intervention pas déjà imputé
const hasEditPermission = useHasPermission(
  permissions.INTERVENTION.MODIFICATION,
);

const listSapeurs = computed(() => {
  return Array.from(
    new Set([
      ...presences.value.map((s) => s.sapeur_id),
      ...quittances.value.map((s) => s.sapeur_id),
    ]),
  ).map((id) => sapeurs.value.find((s) => s.id == id));
});
const sortedSapeurs = computed(() => {
  return [
    ...Object.keys(computedPresences.value)
      .map((s) => sapeurs.value.find((sapeur) => sapeur.id == parseInt(s)))
      .sort((s1, s2) => s1.nom_prenom.localeCompare(s2.nom_prenom)),
  ];
});

const computeSapeur = (id) => {
  let res = {};
  const start = new Date(
    dataInter.value.date_debut + ' ' + dataInter.value.heure_debut,
  );
  start.setMinutes(0);

  presences.value
    .filter((s) => s.sapeur_id === id)
    .forEach((q) => {
      // Offset calculé à partir de l'heure de début d'intervention arrondi
      const offset = ((new Date(q.debut) - start) / 3600000.0) * 4.0;
      // Durée de la présence en quart d'heures
      const duree = ((new Date(q.fin) - new Date(q.debut)) / 3600000.0) * 4.0;

      for (let i = 0; i < duree; ++i) {
        let code = null;
        if (q.piquet) {
          // Piquet
          code = 3;
        } else {
          // DetectPhase
          const currentDate = new Date(q.debut);
          currentDate.setMinutes(currentDate.getMinutes() + i * 15);
          code = getPhaseTypeAt(currentDate);
        }
        res = {
          ...res,
          [offset + i]: code,
        };
      }
    });
  return res;
};
const computedPresences = computed(() => {
  let temp = [];
  listSapeurs.value.forEach(
    (s) =>
      (temp = {
        ...temp,
        [s.id]: computeSapeur(s.id),
      }),
  );
  return temp;
});

const startFloored = new Date(
  dataInter.value.date_debut + ' ' + dataInter.value.heure_debut,
);
const end = new Date(
  dataInter.value.date_fin + ' ' + dataInter.value.heure_fin,
);

startFloored.setMinutes(0);
const diff = Math.abs(startFloored - end) / 3600000;

// Génère une colonne par heure
const min = startFloored.getHours();
for (let i = 0; i < Math.ceil(diff); ++i) {
  columns.value.push((min + i) % 24);
}

const wrapperNode = useTemplateRef('wrapper');
onMounted(() => {
  if (wrapperNode.value.addEventListener) {
    // IE9, Chrome, Safari, Opera
    wrapperNode.value.addEventListener('mousewheel', scrollHorizontally, false);
    // Firefox
    wrapperNode.value.addEventListener(
      'DOMMouseScroll',
      scrollHorizontally,
      false,
    );
  } else {
    // IE 6/7/8
    wrapperNode.value.attachEvent('onmousewheel', scrollHorizontally);
  }
});

const { confirm, showModal } = useModalStore();
const formatDatePresence = (d) => {
  return d.slice(-8, -3);
};
const scrollHorizontally = (e) => {
  e = window.event || e;
  var delta = Math.max(-1, Math.min(1, e.wheelDelta || -e.detail));
  wrapperNode.value.scrollLeft -= delta * 40; // Multiplied by 40
  e.preventDefault();
};
const addPresences = () => {
  showModal({
    component: 'ModalPresenceIntervention',
    callback: () => {},
    data: {
      mode: 'add',
      id: dataInter.value.id,
      min: dataInter.value.date_debut + ' ' + dataInter.value.heure_debut,
      max: dataInter.value.date_fin + ' ' + dataInter.value.heure_fin,
    },
  });
};
const editPresence = (presence) => {
  const clone = {};
  Object.assign(clone, presence);
  showModal({
    component: 'ModalPresenceIntervention',
    callback: () => {},
    data: {
      mode: 'edit',
      sapeurs: [clone.sapeur_id],
      presence: clone,
      min: dataInter.value.date_debut + ' ' + dataInter.value.heure_debut,
      max: dataInter.value.date_fin + ' ' + dataInter.value.heure_fin,
    },
  });
};
const removePresence = (id) =>
  confirm(
    'Voulez-vous vraiment supprimer cette présence ?',
    "Attention, la suppression d'une présence est irréversible ! Toutes les données de cette présence seront perdues !",
  ).then(() => interventionStore.removePresence(id));

const editQuittance = (e, id) => {
  const filteredQuittances = quittances.value.filter(
    (q) => q.sapeur_id === parseInt(id),
  );
  if (filteredQuittances.length === 1) {
    interventionStore.removeQuittance(filteredQuittances[0].id);
  } else {
    interventionStore.addQuittance(id);
  }
};

const getPhaseTypeAt = (date) => {
  const res = phases.value
    .filter((p) => p.debut == null || new Date(p.debut) <= date)
    .sort((d1, d2) =>
      d1.debut == null
        ? 1
        : d2.debut == null
          ? -1
          : new Date(d1.debut) < new Date(d2.debut),
    );
  if (res.length > 0) {
    return res[0].phase_type_id;
  }
  return 1;
};

const expandSap = (id) => {
  toggles.value = {
    ...toggles.value,
    [id]: !toggles.value[id],
  };
};
const sortedPresences = (id) => {
  return presences.value
    .filter((p) => p.sapeur_id === id)
    .sort((p1, p2) => new Date(p1.debut) > new Date(p2.debut));
};
</script>

<template>
  <div class="row">
    <div class="col-xs-12 col-md-12">
      <div
        v-if="!dismissedWarning && dataInter.statut > 2 && hasEditPermission"
        class="alert alert-dismissible alert-warning"
      >
        <button
          type="button"
          class="btn-close"
          data-bs-dismiss="alert"
          @click="dismissedWarning = true"
        ></button>
        Intervention déjà imputée, impossible de modifier les présences.
      </div>
    </div>
    <InterventionTabGroupe :id="id" />
    <InterventionTabPhase :id="id" />
    <div class="col-sm-12 col-md-12 col-xl-12">
      <div class="card card-primary card-outline mb-3">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Présences</h3>
          <button
            type="button"
            class="btn btn-primary"
            :disabled="dataInter.statut > 2"
            @click="addPresences"
          >
            Ajouter des présences
          </button>
        </div>
        <div class="card-body">
          <div class="mb-2">
            <span class="badge bg-secondary me-2">Intervention</span>
            <span class="badge bg-primary me-2">Entretien</span>
            <span class="badge bg-success me-2">Piquet</span>
          </div>
          <div
            ref="wrapper"
            class="overflow-x-scroll overflow-y-visible position-relative"
          >
            <table class="table table-sm table-bordered">
              <thead>
                <tr>
                  <th rowspan="2">Sapeurs</th>
                  <th rowspan="2">Quittance</th>
                  <th
                    v-for="(col, i) in columns"
                    :key="i"
                    colspan="4"
                    class="text-center ps-3 pe-3"
                  >
                    {{ col }}h
                  </th>
                </tr>
                <tr>
                  <th
                    v-for="(col, i) in columns"
                    :key="'1' + i"
                    class="ps-3 pe-3"
                  ></th>
                  <th
                    v-for="(col, i) in columns"
                    :key="'2' + i"
                    class="ps-3 pe-3"
                  ></th>
                  <th
                    v-for="(col, i) in columns"
                    :key="'3' + i"
                    class="ps-3 pe-3"
                  ></th>
                  <th
                    v-for="(col, i) in columns"
                    :key="'4' + i"
                    class="ps-3 pe-3"
                  ></th>
                </tr>
              </thead>
              <tbody v-if="sortedSapeurs.length <= 0">
                <tr>
                  <td colspan="2">Aucun sapeur présent pour l'instant</td>
                </tr>
              </tbody>
              <tbody v-for="s in sortedSapeurs" :key="s.id" class="no-wrap">
                <tr>
                  <th class="ms-0 ps-1">
                    <button
                      class="btn btn-link border-0"
                      @click="expandSap(s.id)"
                    >
                      <font-awesome-icon
                        v-if="toggles[s.id] || false"
                        :icon="['fas', 'angle-down']"
                      />
                      <font-awesome-icon
                        v-if="!(toggles[s.id] || false)"
                        :icon="['fas', 'angle-right']"
                      />
                    </button>
                    {{ s?.nom_prenom }}
                  </th>
                  <td class="text-center">
                    <input
                      :id="s.id"
                      type="checkbox"
                      :disabled="!hasEditPermission"
                      class="form-check-input"
                      :checked="
                        quittances.filter((q) => q.sapeur_id === parseInt(s.id))
                          .length === 1
                      "
                      @click="(e) => editQuittance(e, s.id)"
                    />
                    <label class="form-check-label" :for="s.id"></label>
                  </td>
                  <td
                    v-for="i in Array(columns.length * 4).keys()"
                    :key="s.id + '-' + i"
                    :class="{
                      'bg-secondary': computedPresences[s.id][i] === 1,
                      'bg-primary': computedPresences[s.id][i] === 2,
                      'bg-success': computedPresences[s.id][i] === 3,
                    }"
                    class="ps-3 pe-3"
                  ></td>
                </tr>
                <template v-if="toggles[s.id]">
                  <tr
                    v-for="p in sortedPresences(s.id)"
                    :key="p.id"
                    :class="{
                      'alert-success': !!p.piquet === true,
                    }"
                  >
                    <td :colspan="2 + columns.length * 4">
                      {{ formatDatePresence(p.debut) }} -
                      {{ formatDatePresence(p.fin) }}
                      <button
                        v-if="hasEditPermission"
                        type="button"
                        class="btn btn-outline-primary border-0 ms-2"
                        :disabled="dataInter.statut > 2"
                        @click="editPresence(p)"
                      >
                        <font-awesome-icon :icon="['far', 'edit']" />
                      </button>
                      <button
                        v-if="hasEditPermission"
                        type="button"
                        class="btn btn-outline-danger border-0"
                        :disabled="dataInter.statut > 2"
                        @click="removePresence(p.id)"
                      >
                        <font-awesome-icon :icon="['far', 'trash-alt']" />
                      </button>
                    </td>
                  </tr>
                </template>
              </tbody>
              <tfoot>
                <tr>
                  <th :colspan="4 + 4 * columns.length">
                    Nombre sapeurs : {{ sortedSapeurs.length }}
                  </th>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.no-wrap {
  white-space: nowrap;
}

td,
th {
  padding: 5px 20px;
  width: 100px;
}

th:first-child {
  position: relative;
  left: 5px;
}
</style>
