<script setup>
import { computed, inject, ref, watchEffect } from 'vue';
import { useStore } from 'vuex';
import { useModalStore } from '../../stores/common/Modal.js';
import ExerciceService from '../../services/ExerciceService';
import SapeurService from '../../services/SapeurService';

const { data } = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
});

const loading = ref(true);
const errors = ref({});

const activeSapeurId = ref(null);

const form = ref({
  exercice_comptable_id: null,
  sapeurs: [{ sapeur_id: null, quantite: null }],
});
const activeSapeurExercices = ref([]);

const store = useStore();

const absences = computed(() => store.state.exercice.absences);
const exercices = computed(() => store.state.exercice.liste);
const categories = computed(() => store.state.exerciceCategorie.liste);
const sapeurs = computed(() => store.state.sapeur.liste.filter((s) => s.actif));
const activeExerciceComptableId = computed(
  () => store.state.exerciceComptable.activeId,
);
const excuseTypes = computed(() => store.state.excuseType.liste);
const localites = computed(() => store.state.localite.liste);

const awn = inject('awn');

const computedData = computed(() => {
  return activeSapeurExercices.value
    ?.map((e) => ({
      ...e.presence,
      ...e,
      excuse: excuseTypes.value.find((t) => t.id == e.excuse_type_id)
        ?.designation,
      localite: localites.value.find((l) => l.id == e.localite_id)?.designation,
      categorie: categories.value.find((c) => c.id == e.exercice_categorie_id)
        ?.designation,
    }))
    ?.sort((e1, e2) => e1.date?.localeCompare(e2.date));
});
const activeExercice = computed(() => {
  return exercices.value.find((e) => e.id == form.value?.exercice_id);
});
const computedAbsences = computed(() => {
  return absences.value
    .map((a) => ({
      ...a,
      nom_prenom: sapeurs.value.find((s) => s.id == a.sapeur_id)?.nom_prenom,
      exercice_date: exercices.value.find((e) => e.id == a.exercice_id)?.date,
    }))
    .sort(
      (a, b) =>
        a?.nom_prenom?.localeCompare(b?.nom_prenom) ||
        a?.exercice_date?.localeCompare(b?.exercice_date),
    );
});

const { closeModal } = useModalStore();

if (data?.id) {
  form.value = computedAbsences.value.find((a) => a.id == data.id);
} else if (!computedAbsences.value.length) {
  closeModal();
  awn.warning('Attention, aucune absence à traiter');
} else {
  form.value = computedAbsences.value[0];
}
activeSapeurId.value = form.value.sapeur_id;

watchEffect(async () => {
  // Load sapeurs exercices
  // FIXME: Check permissions pour cette route
  loading.value = true;
  try {
    const res = await SapeurService.getExercices(
      activeSapeurId.value,
      activeExerciceComptableId.value,
    );
    activeSapeurExercices.value = res;
    loading.value = false;
  } catch {
    awn.alert(
      'Une erreur a eu lieu durant la récupération des exercices du sapeur',
    );
  }
});

const review = async (state) => {
  form.value.excuse_statut = state;
  try {
    const res = await store.dispatch('editPresenceExercice', {
      presenceId: form.value?.id,
      presence: form.value,
    });
    activeSapeurExercices.value = activeSapeurExercices.value.map((e) =>
      e.presence.id === res.id ? { ...e, presence: res } : e,
    );
    awn.success(res?.message || 'Modifications enregistrées');
  } catch (err) {
    return awn.alert(err?.message || "Erreur lors de l'enregistrement");
  }
};
const nextAbsence = () => {
  // Switch to next absence
  const activeIndex = computedAbsences.value.findIndex(
    (a) => a.id == form.value?.id,
  );
  if (computedAbsences.value.length - 1 > activeIndex) {
    form.value = { ...computedAbsences.value[activeIndex + 1] };
  } else {
    // TODO: Loop sur les excuses non-traitées ??
  }

  if (activeSapeurId.value != form.value.sapeur_id) {
    activeSapeurId.value = form.value.sapeur_id;
  }
};
const previousAbsence = () => {
  // Switch to next absence
  const activeIndex = computedAbsences.value.findIndex(
    (a) => a.id == form.value?.id,
  );
  if (activeIndex > 0) {
    form.value = { ...computedAbsences.value[activeIndex - 1] };
  } else {
    // TODO: Loop sur les excuses non-traitées ??
  }

  if (activeSapeurId.value != form.value.sapeur_id) {
    activeSapeurId.value = form.value.sapeur_id;
  }
};
const downloadJustificatif = (exercice) => {
  ExerciceService.downloadExcuseJustificatif(
    exercice.exercice_id,
    exercice.sapeur_id,
    'justificatif.pdf',
  ).catch((err) =>
    awn.alert(err?.message ?? 'Erreur lors du chargement du justificatif'),
  );
};
const rowClass = (rowData) => {
  return rowData.id == form.value.exercice_id ? 'table-primary' : '';
};

const fields = [
  { title: 'Date', key: 'date', type: Date },
  { title: 'Categorie', key: 'categorie' },
  { title: 'Exercice', key: 'designation' },
  { title: 'Localité', key: 'localite' },
  { title: 'Convoqué', type: Boolean, key: 'convoque' },
  { title: 'Présent', type: Boolean, key: 'present' },
  { title: 'Absent', type: Boolean, key: 'absent' },
  { title: 'Remplacé', type: Boolean, key: 'remplace' },
  { title: 'Excuse', slot: 'excuse', key: 'excuse_statut' },
  { title: 'Statut', slot: 'statut', key: 'excuse_statut' },
];
</script>

<template>
  <div>
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">Revue absence</h5>
      <button type="button" class="btn-close" @click="closeModal()"></button>
    </div>
    <div class="modal-body">
      <div class="row">
        <div class="col-3">
          <base-select
            :model-value="activeExercice?.exercice_categorie_id"
            class="mb-3"
            :options="categories"
            label="Catégorie"
            disabled
          />
          <div class="mb-3">
            <label for="designation">Désignation</label>
            <input
              id="designation"
              :value="activeExercice?.designation"
              type="text"
              class="form-control form-control-sm"
              disabled
            />
          </div>
          <div class="row">
            <div class="col-6">
              <div class="mb-3">
                <label for="date">Date</label>
                <input
                  id="date"
                  :value="activeExercice?.date"
                  type="date"
                  class="form-control form-control-sm"
                  disabled
                />
              </div>
            </div>
            <div class="col-6">
              <base-select
                v-model="form.sapeur_id"
                class="mb-3"
                label="Sapeur"
                display-key="nom_prenom"
                :options="sapeurs"
                disabled
              />
            </div>
          </div>
          <base-select
            v-model="form.excuse_type_id"
            class="mb-3"
            :options="excuseTypes"
            base-option="<Non excusé>"
            :base-value="null"
            label="Excuse type"
            disabled
          />
          <div class="mb-3">
            <label for="remarque">Raison <em>(optionnel)</em></label>
            <input
              id="remarque"
              v-model="form.remarque"
              type="text"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['remarque'] }"
              disabled
            />
          </div>
          <div class="mb-3">
            <label>Justificatif</label>
            <button
              v-if="form.justificatif_filename"
              class="btn btn-outline-primary"
              @click="downloadJustificatif(form)"
            >
              Justificatif
              <font-awesome-icon :icon="['far', 'file-pdf']" />
            </button>
            <!-- {{ form.justificatif_filename }} -->
            <span v-else>Aucun justificatif</span>
          </div>
          <!-- <div class="row">
            <div class="col-6">
              <base-select
                v-model="form.auteur_id"
                class="mb-3"
                label="Saisie par"
                display-key="nom_prenom"
                :options="sapeurs"
                disabled
              />
            </div>
            <div class="col-6">
              <div class="mb-3">
                <label for="date">Le</label>
                <input
                  id="date"
                  v-model="form.date_demande"
                  type="date"
                  class="form-control form-control-sm"
                  disabled
                />
              </div>
            </div>
          </div> -->

          <div class="mb-3">
            <label for="justification"
              >Justification <em>(optionnel)</em></label
            >
            <textarea
              id="justification"
              ref="justification"
              v-model="form.justification"
              class="form-control form-control-sm"
              placeholder="(optionnel)"
            ></textarea>
          </div>
          <div
            class="btn-group btn-group-sm mb-3"
            role="group"
            aria-label="Small button group"
          >
            <button
              type="button"
              class="btn"
              :class="
                'btn-' + (form.excuse_statut == -2 ? '' : 'outline-') + 'danger'
              "
              :disabled="
                !categories.find(
                  (c) => c.id == activeExercice?.exercice_categorie_id,
                )?.amendable
              "
              @click="review(-2)"
            >
              Amendé
            </button>
            <button
              type="button"
              class="btn"
              :class="
                'btn-' +
                (form.excuse_statut == -1 ? '' : 'outline-') +
                'warning'
              "
              @click="review(-1)"
            >
              Refusé
            </button>
            <button
              type="button"
              class="btn"
              :class="
                'btn-' + (form.excuse_statut == 0 ? '' : 'outline-') + 'primary'
              "
              @click="review(0)"
            >
              A traiter
            </button>
            <button
              type="button"
              class="btn"
              :class="
                'btn-' + (form.excuse_statut == 1 ? '' : 'outline-') + 'success'
              "
              @click="review(1)"
            >
              Accepté
            </button>
          </div>
        </div>
        <div class="col-9">
          <base-table
            ref="table"
            :loading="loading"
            :fields="fields"
            :data="computedData"
            :selectable="false"
            :row-class="rowClass"
            no-data="Aucun exercice pour ce sapeur"
          >
            <template #excuse="{ value, rowData }">
              <div class="text-center">
                <span
                  v-if="
                    rowData.excuse_type_id && rowData.excuse_type_id !== true
                  "
                  class="badge rounded-pill"
                  :class="{
                    'text-bg-danger': value == -2,
                    'text-bg-warning': value == -1,
                    'text-bg-secondary': value == 0,
                    'text-bg-success': value == 1,
                  }"
                  >{{
                    excuseTypes.find((e) => e.id == rowData?.excuse_type_id)
                      ?.designation
                  }}</span
                >
                <button
                  v-if="rowData.justificatif_filename != ''"
                  class="btn"
                  @click="downloadJustificatif(rowData)"
                >
                  <font-awesome-icon :icon="['far', 'file-pdf']" />
                </button>
              </div>
            </template>
            <template #statut="{ value }">
              <div class="text-center">
                <span
                  class="badge rounded-pill"
                  :class="{
                    'text-bg-danger': value == -2,
                    'text-bg-warning': value == -1,
                    'text-bg-secondary': value == 0,
                    'text-bg-success': value == 1,
                  }"
                  >{{
                    {
                      '-2': 'Amendée',
                      '-1': 'Refusée',
                      '0': 'A traiter',
                      '1': 'Acceptée',
                    }[value.toString()]
                  }}</span
                >
              </div>
            </template>
            <template #foot>
              <tr>
                <th colspan="4">Total</th>
                <th class="text-center">
                  {{
                    computedData.reduce(
                      (acc, e) => acc + (e.convoque ? 1 : 0),
                      0,
                    )
                  }}
                </th>
                <th class="text-center">
                  {{
                    computedData.reduce(
                      (acc, e) => acc + (e.present ? 1 : 0),
                      0,
                    )
                  }}
                </th>
                <th class="text-center">
                  {{
                    computedData.reduce((acc, e) => acc + (e.absent ? 1 : 0), 0)
                  }}
                </th>
                <th class="text-center">
                  {{
                    computedData.reduce(
                      (acc, e) => acc + (e.remplace ? 1 : 0),
                      0,
                    )
                  }}
                </th>
                <th class="text-center">
                  {{
                    computedData.reduce(
                      (acc, e) => acc + (e.excuse_type_id ? 1 : 0),
                      0,
                    )
                  }}
                </th>
                <th class="text-center">
                  {{
                    computedData.reduce(
                      (acc, e) => acc + (e.excuse_statut == -2 ? 1 : 0),
                      0,
                    )
                  }}
                </th>
              </tr>
            </template>
          </base-table>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button
        type="button"
        class="btn btn-outline-primary"
        :disabled="!computedAbsences || computedAbsences[0]?.id == form?.id"
        @click="previousAbsence()"
      >
        Précédent
      </button>
      <button
        type="button"
        class="btn btn-outline-primary"
        :disabled="
          !computedAbsences ||
          computedAbsences[computedAbsences.length - 1]?.id == form?.id
        "
        @click="nextAbsence()"
      >
        Suivant
      </button>
      <button
        type="button"
        class="btn btn-outline-secondary"
        @click="closeModal()"
      >
        Fermer
      </button>
    </div>
  </div>
</template>
