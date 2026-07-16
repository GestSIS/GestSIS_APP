<script setup>
import { computed, ref } from 'vue';
import { groupedByData } from '../../tools/index.js';
import RtaService from '../../services/RtaService.js';
import useNotification from '../../composables/useNotification.js';
import { useModalStore } from '../../stores/common/Modal.js';
import MoyenContact from './MoyenContact.vue';
import useHasPermission from '../../composables/usePermission.js';
import permissions from '../../composables/permissions.js';

const loading = ref(true);
const communes = ref([]);

const agriculteurs = ref([]);
const loadData = async () => {
  loading.value = true;
  await RtaService.getAgriculteurs().then(
    (data) => (agriculteurs.value = data),
  );
  loading.value = false;
};
loadData();

const computedAgriculteurs = computed(() => {
  return Object.fromEntries([
    ...(communes.value ?? []).map((commune) => [commune, []]),
    ...Object.entries(groupedByData(agriculteurs.value ?? [], 'communes')),
  ]);
});

const awn = useNotification();
const { confirm, showModal } = useModalStore();

const computedListes = computed(
  () =>
    new Set([
      ...agriculteurs.value.map((a) => a.communes),
      ...Object.values(communes.value).flat(),
    ]),
);
const ajoutAgriculteur = () =>
  showModal({
    component: 'ModalAgriculteur',
    callback: loadData,
    data: { agriculteur: {}, communes: computedListes.value },
  });
const update = (agriculteur) =>
  showModal({
    component: 'ModalAgriculteur',
    callback: loadData,
    data: { agriculteur, communes: computedListes.value },
  });
const reorder = (agriculteur, priorite) =>
  RtaService.reorderAgriculteur({ ...agriculteur, tri: priorite })
    .then(loadData)
    .catch((e) => {
      loadData();
      awn.warning(
        e?.message ??
          "Une erreur est survenue durant le changement de priorité. Veuillez réessayer ou contacter l'administrateur",
      );
    });
const remove = (agriculteur) =>
  confirm(
    'Êtes-vous sûr de vouloir supprimer cet agriculteur ?',
    "Attention, la suppression d'un agriculteur est irréversible !",
  ).then(async () => {
    await RtaService.deleteAgriculteur(agriculteur.id);
    loadData();
  });

const ajoutListe = () =>
  showModal({
    component: 'ModalCommunes',
    callback: (commune) => {
      if (commune) {
        communes.value = [...communes.value, commune];
      }
    },
  });

const modifierListe = (communes, agriculteurs) =>
  showModal({
    component: 'ModalCommunes',
    data: { communes },
    callback: (commune) => {
      if (commune && commune.toUpperCase() !== communes.toUpperCase()) {
        Promise.all(
          agriculteurs.map((agriculteur) =>
            RtaService.updateAgriculteur({
              ...agriculteur,
              communes: commune,
            }),
          ),
        )
          .then(() => loadData())
          .catch(() => {
            loadData();
            awn.warning(
              "Une erreur est survenue durant la modification de la liste. Veuillez réessayer ou contacter l'administrateur",
            );
          });
      }
    },
  });

const hasEditPermission = useHasPermission(permissions.RTA.MODIFICATION);
const fields = [
  { title: 'Priorité', key: 'tri' },
  { title: 'Nom', key: 'agriculteur' },
  { title: 'Lieu-dit', key: 'lieudit' },
  { title: 'Capacité', key: 'capacites', slot: 'capacites' },
  { title: 'Contacts', key: 'moyensContact', slot: 'contacts' },
  ...(hasEditPermission.value ? [{ title: 'Actions', slot: 'actions' }] : []),
];
</script>

<template>
  <div class="row">
    <div class="col-12">
      <base-card v-if="Object.keys(computedAgriculteurs).length === 0">
        <template #header>
          <h2>Aucune liste</h2>
        </template>
        <template #body>
          <p>Il n'y a aucune liste d'agriculteurs pour le moment.</p>
          <button type="button" class="btn btn-primary" @click="ajoutListe()">
            Ajouter une liste
          </button>
        </template>
      </base-card>
      <base-card>
        <template #header>
          <div>
            <button
              type="button"
              class="btn btn-outline-primary"
              @click="ajoutAgriculteur()"
            >
              Ajouter agriculteur
            </button>
            <button
              type="button"
              class="btn btn-outline-primary ms-2"
              @click="ajoutListe()"
            >
              Ajouter une liste
            </button>
          </div>
        </template>
        <template #body-table>
          <div
            v-for="(agriculteurs, communes) in computedAgriculteurs"
            :key="communes"
          >
            <h5 class="ms-3 mt-2">
              {{ communes }}
              <button
                type="button"
                class="btn btn-sm btn-outline-primary border-0"
                aria-label="Modifier la liste"
                @click="modifierListe(communes, agriculteurs)"
              >
                <font-awesome-icon :icon="['far', 'edit']" />
              </button>
            </h5>
            <base-table
              :fields="fields"
              :loading="loading"
              :data="agriculteurs"
              no-data="Aucun agriculteur dans cette liste"
            >
              <template #capacites="{ rowData }">
                {{
                  rowData.capacites
                    .map((c) => c.capacite + ' litres')
                    .join(', ')
                }}
              </template>
              <template #contacts="{ rowData }">
                <ol class="mb-0">
                  <li
                    v-for="contact in rowData.moyens_contact"
                    :key="contact.id"
                  >
                    <MoyenContact :moyen-contact="contact" />
                  </li>
                </ol>
              </template>
              <template #actions="{ rowData }">
                <button
                  type="button"
                  class="btn btn-sm btn-outline-primary border-0"
                  aria-label="Modifier l'agriculteur"
                  @click="update(rowData)"
                >
                  <font-awesome-icon :icon="['far', 'edit']" />
                </button>
                <button
                  type="button"
                  class="btn btn-sm btn-outline-danger border-0"
                  aria-label="Supprimer l'agriculteur"
                  @click="remove(rowData)"
                >
                  <font-awesome-icon :icon="['far', 'trash-alt']" />
                </button>
                <button
                  v-if="agriculteurs[0].id !== rowData.id"
                  type="button"
                  class="btn btn-sm btn-outline-primary border-0"
                  aria-label="Déplacer vers le haut"
                  @click="reorder(rowData, rowData.tri - 1)"
                >
                  <font-awesome-icon :icon="['fas', 'arrow-up']" />
                </button>
                <button
                  v-if="agriculteurs[agriculteurs.length - 1].id !== rowData.id"
                  type="button"
                  class="btn btn-sm btn-outline-primary border-0"
                  aria-label="Déplacer vers le bas"
                  @click="reorder(rowData, rowData.tri + 1)"
                >
                  <font-awesome-icon :icon="['fas', 'arrow-down']" />
                </button>
              </template>
            </base-table>
          </div>
        </template>
      </base-card>
    </div>
  </div>
</template>
