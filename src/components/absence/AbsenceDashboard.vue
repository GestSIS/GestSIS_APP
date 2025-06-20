<script setup>
import { useStore } from 'vuex';
import permissions from '../../store/permissions.js';
import { useModalStore } from '../../stores/common/Modal.js';
import { computed, ref, watchEffect } from 'vue';
import useHasPermission from '../../hooks/usePermission.js';

const store = useStore();

await store.dispatch('fetchExercicesComptables');

const loadSapeurs = store.dispatch('fetchListeSapeur');

const loadFonctions = store.dispatch('fetchFonctions');
const loadPermis = store.dispatch('fetchPermisType');
const loadGroupes = store.dispatch('fetchGroupes');
const loadLocalites = store.dispatch('fetchLocalites');
const loadLocalitesSis = store.dispatch('fetchLocalitesSis');

const loading = ref(true);
await Promise.all([
  loadSapeurs,
  loadFonctions,
  loadPermis,
  loadGroupes,
  loadLocalites,
  loadLocalitesSis,
]).then(() => (loading.value = false));

watchEffect(async () => {
  loading.value = true;
  await store.dispatch('fetchAbsences', store.state.exerciceComptable.activeId);
  loading.value = false;
});

const displayKey = ref('groupe');
const displayMonth = ref(new Date().getMonth() + 1);
const mois = [
  { id: 1, designation: 'Janvier' },
  { id: 2, designation: 'Février' },
  { id: 3, designation: 'Mars' },
  { id: 4, designation: 'Avril' },
  { id: 5, designation: 'Mai' },
  { id: 6, designation: 'Juin' },
  { id: 7, designation: 'Juillet' },
  { id: 8, designation: 'Août' },
  { id: 9, designation: 'Septembre' },
  { id: 10, designation: 'Octobre' },
  { id: 11, designation: 'Novembre' },
  { id: 12, designation: 'Decembre' },
];

const sapeurs = computed(() =>
  store.state.sapeur.liste.filter((s) => s.actif && s.type == 0),
);
const absences = computed(() =>
  store.state.absence.liste.sort((a, b) => a.debut?.localeCompare(b.debut)),
);
const localitesSis = computed(() =>
  store.state.localite.listeSis.map((l) => ({
    id: l,
    ...store.state.localite.liste.find((e) => e.id == l),
  })),
);
const groupes = computed(() =>
  store.state.groupe.liste
    .filter((g) => g.type && g.no)
    .sort((a, b) => a.no - b.no),
);
const fonctions = computed(() =>
  store.state.fonction.liste
    .filter((f) => !f.cumulable && f.actif)
    .sort((a, b) => b.tri - a.tri),
);
const permisTypes = computed(() => store.state.baseData.permisTypes);
const activeExerciceComptable = computed(() =>
  store.state.exerciceComptable.liste.find(
    (e) => store.state.exerciceComptable.activeId === e.id,
  ),
);
const hasEditPermission = useHasPermission(permissions.ABSENCE.MODIFICATION);

const computedSapeurs = computed(() =>
  sapeurs.value.map((s) => {
    const fonctionsIds = new Set(s.fonctions);
    return {
      ...s,
      mainFonctionId: fonctions.value.find((f) => fonctionsIds.has(f.id))?.id,
      groupeIds: groupes.value.map(
        (g) => g.sapeur_ids.find((gs) => gs.sapeur_id == s.id)?.groupe_id,
      ),
    };
  }),
);
const indexedSapeurs = computed(() => {
  const indexedSapeurs = {};
  computedSapeurs.value.forEach((s) => (indexedSapeurs[s.id] = s));
  return indexedSapeurs;
});
const referenceData = computed(() => {
  const data = {
    permis: {},
    groupes: {},
    fonctions: {},
    localites: {},
    total: 0,
  };

  computedSapeurs.value.forEach((s) => {
    data.total++;
    data.localites[s.localite_id] = (data.localites[s.localite_id] ?? 0) + 1;
    data.fonctions[s.mainFonctionId] =
      (data.fonctions[s.mainFonctionId] ?? 0) + 1;

    s.groupeIds?.forEach(
      (groupeId) =>
        (data.groupes[groupeId] = (data.groupes[groupeId] ?? 0) + 1),
    );
    s.permis.forEach(
      (permisId) => (data.permis[permisId] = (data.permis[permisId] ?? 0) + 1),
    );
  });
  return data;
});
const computedAbsences = computed(() => {
  if (!activeExerciceComptable.value) {
    return [];
  }
  const year = activeExerciceComptable.value?.annee;

  const nbDays = new Date(year, displayMonth.value, 0).getDate();
  const data = [...Array(nbDays).keys()].map((day) => ({
    jourSemaine: new Date(year, displayMonth.value - 1, 1 + day).getDay(),
    date:
      ('0' + (1 + day)).slice(-2) + '.' + ('0' + displayMonth.value).slice(-2),
    permis: {},
    groupes: {},
    fonctions: {},
    localites: {},
    total: 0,
  }));

  const moisDebut = new Date(year, displayMonth.value - 1, 1);
  const moisFin = new Date(year, displayMonth.value, 0);

  absences.value
    .filter((a) => new Date(a.debut) <= moisFin && new Date(a.fin) >= moisDebut)
    .forEach((a) => {
      let date = new Date(a.debut);
      const fin = new Date(a.fin);
      while (date <= fin) {
        if (date.getMonth() + 1 == displayMonth.value) {
          const sapeur = indexedSapeurs.value[a.sapeur_id];
          if (!sapeur) {
            return;
          }
          const record = data[date.getDate() - 1];
          record.total++;

          sapeur.permis.forEach(
            (permisId) =>
              (record.permis[permisId] = (
                record.permis[permisId] ?? new Set()
              ).add(sapeur.id)),
          );
          sapeur.groupeIds?.forEach(
            (groupeId) =>
              (record.groupes[groupeId] = (
                record.groupes[groupeId] ?? new Set()
              ).add(sapeur.id)),
          );
          record.fonctions[sapeur.mainFonctionId] = (
            record.fonctions[sapeur.mainFonctionId] ?? new Set()
          ).add(sapeur.id);
          record.localites[sapeur.localite_id] = (
            record.localites[sapeur.localite_id] ?? new Set()
          ).add(sapeur.id);

          data[date.getDate() - 1] = record;
        }
        date.setDate(date.getDate() + 1);
      }
    });

  return data;
});
const filteredPermis = computed(() => {
  const ids = new Set(
    Object.keys(referenceData.value.permis).map((id) => parseInt(id)),
  );
  return permisTypes.value.filter((p) => ids.has(p.id));
});

const { showModal } = useModalStore();
const addAbsence = () => showModal({ component: 'ModalAbsence' });
const showAbsences = (absences) =>
  showModal({ component: 'ModalAbsencesStats', data: { absences } });
</script>

<template>
  <div class="row">
    <div class="col-md-3">
      <div class="card card-primary card-outline mb-2">
        <div class="card-header d-flex justify-content-between">
          <h5>Actions</h5>
        </div>
        <div class="card-body d-grid gap-2">
          <button
            v-if="hasEditPermission"
            class="btn btn-outline-primary"
            @click="addAbsence"
          >
            Ajouter une absence
          </button>
        </div>
      </div>
    </div>
    <div class="col-md-6">
      <div class="card card-primary card-outline mb-2">
        <div class="card-header d-flex justify-content-between">
          <h5>Affichage</h5>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-6">
              <base-select
                v-model="displayKey"
                :options="[
                  { designation: 'Par fonction', id: 'fonction' },
                  { designation: 'Par permis', id: 'permis' },
                  { designation: 'Par localité', id: 'localite' },
                  { designation: 'Par groupe', id: 'groupe' },
                ]"
              />
            </div>
            <div class="col-6">
              <base-select v-model="displayMonth" :options="mois" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="row">
    <div class="col-md-12">
      <div class="card card-primary card-outline mb-3">
        <div v-if="loading" class="card-body d-flex justify-content-center">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Chargement...</span>
          </div>
        </div>
        <div class="card-body table-responsive p-0">
          <table class="table">
            <thead>
              <tr>
                <th rowspan="2" class="sticky">
                  <base-select
                    v-model="displayKey"
                    style="min-width: 100px"
                    :options="[
                      { designation: 'Fonction', id: 'fonction' },
                      { designation: 'Permis', id: 'permis' },
                      { designation: 'Localité', id: 'localite' },
                      { designation: 'Groupe', id: 'groupe' },
                    ]"
                  />
                </th>
                <td
                  v-for="({ jourSemaine }, i) in computedAbsences"
                  :key="i"
                  :class="{ 'table-secondary': [0, 6].includes(jourSemaine) }"
                >
                  {{
                    [
                      'Dimanche',
                      'Lundi',
                      'Mardi',
                      'Mercredi',
                      'Jeudi',
                      'Vendredi',
                      'Samedi',
                    ][jourSemaine]
                  }}
                </td>
              </tr>
              <tr>
                <th
                  v-for="({ date, jourSemaine }, i) in computedAbsences"
                  :key="i"
                  :class="{ 'table-secondary': [0, 6].includes(jourSemaine) }"
                >
                  {{ date }}
                </th>
              </tr>
            </thead>

            <tbody v-if="displayKey == 'fonction'">
              <tr
                v-for="f in [
                  ...fonctions,
                  { id: undefined, nom: 'Sans fonction' },
                ]"
                :key="f.id"
              >
                <th class="sticky">{{ f.nom }}</th>
                <td
                  v-for="({ jourSemaine, fonctions }, i) in computedAbsences"
                  :key="i"
                  :class="{ 'table-secondary': [0, 6].includes(jourSemaine) }"
                  :style="
                    'background-color:hsl(' +
                    (
                      (((referenceData.fonctions[f.id] ?? 0) -
                        (fonctions[f.id] ?? new Set()).size) /
                        referenceData.fonctions[f.id] ?? 0) * 120
                    ).toString(10) +
                    ',100%,50%)'
                  "
                >
                  <template v-if="referenceData.fonctions[f.id]">
                    <span
                      class="clickable"
                      @click="showAbsences(fonctions[f.id] ?? new Set())"
                    >
                      {{
                        (referenceData.fonctions[f.id] ?? 0) -
                        (fonctions[f.id] ?? new Set()).size
                      }}/{{ referenceData.fonctions[f.id] ?? 0 }}
                    </span>
                  </template>
                  <template v-else>-</template>
                </td>
              </tr>
            </tbody>

            <tbody v-if="displayKey == 'permis'">
              <tr v-for="p in filteredPermis" :key="p.id">
                <th class="sticky">{{ p.type }}</th>
                <td
                  v-for="({ jourSemaine, permis }, i) in computedAbsences"
                  :key="i"
                  :class="{ 'table-secondary': [0, 6].includes(jourSemaine) }"
                  :style="
                    'background-color:hsl(' +
                    (
                      (((referenceData.permis[p.id] ?? 0) -
                        (permis[p.id] ?? new Set()).size) /
                        referenceData.permis[p.id] ?? 0) * 120
                    ).toString(10) +
                    ',100%,50%)'
                  "
                >
                  <template v-if="referenceData.permis[p.id]">
                    <span
                      class="clickable"
                      @click="showAbsences(permis[p.id] ?? new Set())"
                    >
                      {{
                        (referenceData.permis[p.id] ?? 0) -
                        (permis[p.id] ?? new Set()).size
                      }}/{{ referenceData.permis[p.id] ?? 0 }}
                    </span>
                  </template>
                  <template v-else>-</template>
                </td>
              </tr>
            </tbody>

            <tbody v-if="displayKey == 'localite'">
              <tr v-for="l in localitesSis" :key="l.id">
                <th class="sticky">{{ l.designation }}</th>
                <td
                  v-for="({ jourSemaine, localites }, i) in computedAbsences"
                  :key="i"
                  :class="{ 'table-secondary': [0, 6].includes(jourSemaine) }"
                  :style="
                    'background-color:hsl(' +
                    (
                      (((referenceData.localites[l.id] ?? 0) -
                        (localites[l.id] ?? new Set()).size) /
                        referenceData.localites[l.id] ?? 0) * 120
                    ).toString(10) +
                    ',100%,50%)'
                  "
                >
                  <template v-if="referenceData.localites[l.id]">
                    <span
                      class="clickable"
                      @click="showAbsences(localites[l.id] ?? new Set())"
                    >
                      {{
                        (referenceData.localites[l.id] ?? 0) -
                        (localites[l.id] ?? new Set()).size
                      }}/{{ referenceData.localites[l.id] ?? 0 }}
                    </span>
                  </template>
                  <template v-else>-</template>
                </td>
              </tr>
            </tbody>

            <tbody v-if="displayKey == 'groupe'">
              <tr v-for="g in groupes" :key="g.id">
                <th class="sticky">{{ g.no }} {{ g.designation }}</th>
                <td
                  v-for="({ jourSemaine, groupes }, i) in computedAbsences"
                  :key="i"
                  :class="{ 'table-secondary': [0, 6].includes(jourSemaine) }"
                  :style="
                    'background-color:hsl(' +
                    (
                      (((referenceData.groupes[g.id] ?? 0) -
                        (groupes[g.id] ?? new Set()).size) /
                        referenceData.groupes[g.id] ?? 0) * 120
                    ).toString(10) +
                    ',100%,50%)'
                  "
                >
                  <template v-if="referenceData.groupes[g.id]">
                    <span
                      class="clickable"
                      @click="showAbsences(groupes[g.id] ?? new Set())"
                    >
                      {{
                        (referenceData.groupes[g.id] ?? 0) -
                        (groupes[g.id] ?? new Set()).size
                      }}/{{ referenceData.groupes[g.id] ?? 0 }}
                    </span>
                  </template>
                  <template v-else>-</template>
                </td>
              </tr>
            </tbody>

            <tfoot v-if="displayKey !== 'permis'">
              <tr>
                <th class="sticky">Total</th>
                <th
                  v-for="({ jourSemaine, total }, i) in computedAbsences"
                  :key="i"
                  :class="{ 'table-secondary': [0, 6].includes(jourSemaine) }"
                >
                  {{ referenceData.total - total }}/{{ referenceData.total }}
                </th>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sticky {
  position: sticky;
  left: 0px;
  background-color: white;
}

.clickable {
  cursor: pointer;
}
</style>
