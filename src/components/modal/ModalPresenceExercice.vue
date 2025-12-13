<script setup>
import { computed, inject, ref } from 'vue';
import { useSapeurStore } from '../../stores/sapeur/Sapeur.js';
import { useLocaliteStore } from '../../stores/common/Localite.js';
import { useExcuseTypeStore } from '../../stores/exercice/ExcuseType.js';
import { useExerciceCategorieStore } from '../../stores/exercice/ExerciceCategorie.js';
import { useModalStore } from '../../stores/common/Modal.js';
import ExerciceService from '../../services/ExerciceService';
import permissions from '/src/store/permissions.js';
import useHasPermission from '../../hooks/usePermission.js';
import { useExerciceStore } from '../../stores/exercice/Exercice.js';

const localiteStore = useLocaliteStore();
const sapeurStore = useSapeurStore();
const exerciceStore = useExerciceStore();
const excuseTypeStore = useExcuseTypeStore();
const exerciceCategorieStore = useExerciceCategorieStore();

const { callback, data } = defineProps({
  callback: {
    type: Function,
    default: () => {},
  },
  data: {
    type: Object,
    default: () => {},
  },
});

const excusesTypes = computed(() => excuseTypeStore.liste);
const sapeur = computed(() =>
  sapeurStore.liste.find((s) => s.id == sapeurStore.active.id),
);
const localites = computed(() => localiteStore.liste);
const categories = computed(() => exerciceCategorieStore.liste);
const activeSapeurExercice = computed(() => sapeurStore.active.exercices);
const hasPresencePermission = useHasPermission(permissions.EXERCICE.PRESENCE);
const hasValidationPermission = useHasPermission(
  permissions.EXERCICE.VALIDATION,
);
const computeExercices = computed(() => {
  return activeSapeurExercice.value
    .map((exercice) => ({
      ...exercice,
      canceled: exercice.statut == 0,
      date: new Date(exercice.date),
      heure: exercice.heure.substr(0, 5),
      categorie: categories.value.find(
        (e) => e.id == exercice.exercice_categorie_id,
      )?.designation,
      localite: localites.value.find((l) => l.id == exercice.localite_id)
        ?.designation,
      amendable: categories.value.find(
        (c) => c.id == exercice.exercice_categorie_id,
      )?.amendable,
    }))
    .sort((a, b) => a.date - b.date);
});

const presences = ref([
  ...computeExercices.value.map((e) => ({ ...e.presence, ...e })),
]);

const { closeModal, confirm, showModal } = useModalStore();
const awn = inject('awn');

const canEditAbsence = (exercice) => {
  // Possible de l'éditer si permission de validation ou si pas encore validé
  return (
    exercice.statut > 0 &&
    (hasValidationPermission.value ||
      (hasPresencePermission.value && exercice.statut <= 2))
  );
};
const canEditPresence = (exercice) => {
  return (
    exercice.statut > 0 &&
    ((hasPresencePermission.value && exercice.statut <= 2) ||
      (hasValidationPermission.value && exercice.statut <= 3))
  );
};
const savePresence = async (sapeur) => {
  try {
    const res = await exerciceStore.editPresenceExercice(
      sapeur?.presence?.id,
      sapeur,
    );
    awn.success(res?.message || 'Modifications enregistrées');
  } catch (err) {
    awn.alert(err?.message || "Erreur lors de l'enregistrement");
  }
};
const selectPresent = (sapeur) => {
  sapeur.remplace = 0;
  sapeur.absent = 0;
  savePresence(sapeur);
};
const selectAbsent = (sapeur) => {
  sapeur.remplace = 0;
  sapeur.present = 0;
  savePresence(sapeur);
};
const selectRemplace = (sapeur) => {
  sapeur.present = 0;
  sapeur.absent = 0;
  savePresence(sapeur);
};
const detailExcuse = (sapeur) => {
  const savedPresences = presences.value.map((p) => ({ ...p }));
  showModal({
    component: 'ModalExcuse',
    data: sapeur,
    callback: (presence) => {
      if (presence !== null && presence !== undefined) {
        presence.present = 0;
        presence.remplace = 0;
        savePresence(presence);
        presences.value = [
          ...presences.value?.map((p) =>
            parseInt(p.id) == parseInt(presence.id) ? presence : p,
          ),
        ];
      }
      showModal({
        component: 'ModalPresenceExercice',
        size: 2,
      });
      return Promise.resolve(false);
    },
  });
};
const addExcuse = (sapeur) => {
  showModal({
    component: 'ModalExcuse',
    data: sapeur,
    callback: async (presence) => {
      if (presence !== null && presence !== undefined) {
        presence.present = 0;
        presence.absent = 1;
        presence.remplace = 0;
        await savePresence(presence);
        presences.value = [
          ...presences.value.map((p) =>
            parseInt(p.id) == parseInt(presence.id) ? presence : p,
          ),
        ];
      }
      showModal({
        component: 'ModalPresenceExercice',
        size: 2,
      });
      return Promise.resolve(false);
    },
  });
};
const removeExcuse = async (sapeur) => {
  try {
    await confirm(
      'Voulez-vous vraiment supprimer cette excuse ?',
      "Attention, la suppression d'une excuse est irréversible ! Toutes les données relatives à celle-ci seront supprimées définitivement.",
    );
    await exerciceStore.removeExcuse(sapeur?.presence);
  } catch {}

  showModal({
    component: 'ModalPresenceExercice',
    size: 2,
  });
};
const downloadJustificatif = (sapeur) => {
  ExerciceService.downloadExcuseJustificatif(
    sapeur.exercice_id,
    sapeur.sapeur_id,
    'justificatif.pdf',
  ).catch((err) =>
    awn.alert(err?.message ?? 'Erreur lors du chargement du justificatif'),
  );
};
</script>

<template>
  <div>
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">
        Modifier présences de {{ sapeur?.nom_prenom }}
      </h5>
      <button type="button" class="btn-close" @click="closeModal()"></button>
    </div>
    <div class="modal-body table-responsive p-0">
      <table id="sap-fonctions" class="table table-sm">
        <thead>
          <tr>
            <th>Date</th>
            <th>heure</th>
            <th>Catégorie</th>
            <th>Localité</th>
            <th>Désignation</th>
            <th class="text-center">Convoqué</th>
            <th class="text-center">Présent</th>
            <th class="text-center">Absent</th>
            <th class="text-center">Remplacé</th>
            <th class="text-center">Excusé</th>
            <th class="text-center">Statut</th>
            <th class="text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="presences.length <= 0">
            <td colspan="12">Aucun exercice à afficher</td>
          </tr>
          <tr v-for="e in presences" :key="e.id">
            <td>
              <component :is="e.canceled ? 'del' : 'span'">
                {{ e.date.toLocaleDateString('fr-CH') }}
              </component>
            </td>
            <td>
              <component :is="e.canceled ? 'del' : 'span'">
                {{ e.heure }}
              </component>
            </td>
            <td>
              <component :is="e.canceled ? 'del' : 'span'">
                {{ e.categorie }}
              </component>
            </td>
            <td>
              <component :is="e.canceled ? 'del' : 'span'">
                {{ e.localite }}
              </component>
            </td>
            <td>
              <component :is="e.canceled ? 'del' : 'span'">
                {{ e.designation }}
              </component>
            </td>
            <td class="text-center">
              <input
                v-model="e.convoque"
                type="checkbox"
                class="form-check-input"
                :true-value="1"
                :false-value="0"
                :disabled="!canEditAbsence(e)"
              />
            </td>
            <td class="text-center">
              <input
                v-model="e.present"
                type="checkbox"
                class="form-check-input"
                :true-value="1"
                :false-value="0"
                :disabled="!canEditPresence(e)"
                @change="selectPresent(e)"
              />
            </td>
            <td class="text-center">
              <input
                v-model="e.absent"
                type="checkbox"
                class="form-check-input"
                :true-value="1"
                :false-value="0"
                :disabled="
                  !canEditAbsence(e) || (!canEditPresence(e) && e.present)
                "
                @change="selectAbsent(e)"
              />
            </td>
            <td class="text-center">
              <input
                v-model="e.remplace"
                type="checkbox"
                class="form-check-input"
                :true-value="1"
                :false-value="0"
                :disabled="
                  !canEditAbsence(e) || (!canEditPresence(e) && e.present)
                "
                @change="selectRemplace(e)"
              />
            </td>
            <td>
              <div class="text-center">
                <span
                  v-if="e.excuse_type_id && e.excuse_type_id !== true"
                  class="badge rounded-pill"
                  :class="{
                    'text-bg-danger': e.excuse_statut == -2,
                    'text-bg-warning': e.excuse_statut == -1,
                    'text-bg-secondary': e.excuse_statut == 0,
                    'text-bg-success': e.excuse_statut == 1,
                  }"
                  @click="detailExcuse(e)"
                  >{{
                    excusesTypes.find((i) => i.id == e.excuse_type_id)
                      ?.designation
                  }}</span
                >
                <button
                  v-if="e.justificatif_filename"
                  type="button"
                  class="btn"
                  @click="downloadJustificatif(e)"
                >
                  <font-awesome-icon :icon="['far', 'file-pdf']" />
                </button>
                <button
                  v-if="!e.excuse_type_id"
                  type="button"
                  class="btn btn-outline-primary border-0"
                  @click="addExcuse(e)"
                >
                  <font-awesome-icon :icon="['fas', 'plus']" />
                </button>
                <button
                  v-else
                  type="button"
                  class="btn btn-outline-danger border-0"
                  @click="removeExcuse(e)"
                >
                  <font-awesome-icon :icon="['far', 'trash-alt']" />
                </button>
              </div>
            </td>
            <td class="text-center">
              <span
                v-if="!e.present && !e.remplace"
                class="badge rounded-pill"
                :class="{
                  'text-bg-danger': e.excuse_statut == -2,
                  'text-bg-warning': e.excuse_statut == -1,
                  'text-bg-secondary': e.excuse_statut == 0,
                  'text-bg-success': e.excuse_statut == 1,
                }"
                >{{
                  {
                    '-2': 'Amendée',
                    '-1': 'Refusée',
                    '0': 'A traiter',
                    '1': 'Acceptée',
                  }[e.excuse_statut.toString()]
                }}</span
              >
            </td>
            <td>
              <router-link
                v-slot="{ navigate }"
                :to="'/exercices/' + e.exercice_id"
                custom
              >
                <button
                  type="button"
                  title="modifier"
                  class="btn btn-outline-primary border-0"
                  @click="
                    () => {
                      closeModal();
                      navigate();
                    }
                  "
                >
                  <font-awesome-icon :icon="['far', 'edit']" />
                </button>
              </router-link>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="closeModal()">
        Fermer
      </button>
    </div>
  </div>
</template>
