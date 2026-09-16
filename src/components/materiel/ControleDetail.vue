<script setup>
import { computed } from "vue";
import { useControleStore } from "../../stores/materiel/Controle.js";
import { useModalStore } from "../../stores/common/Modal.js";
import ParametreTachesControle from "../parametres/ParametreTachesControle.vue";

const { id } = defineProps({
  id: { type: String, required: true },
});

const controleStore = useControleStore();
await controleStore.fetchControles();

const controle = computed(() => controleStore.liste.find((c) => c.id === parseInt(id)));

const recurrenceTypeLabel = (type) => (type === "PERIODIQUE" ? "Périodique" : "Non périodique");

const recurrenceLabel = (c) => {
  if (c.recurrence_type === "PERIODIQUE") {
    const preavis = c.duree_preavis ? ` (préavis ${c.duree_preavis} mois)` : "";
    return `Tous les ${c.recurrence_value} mois${preavis}`;
  }
  if (c.nb_execution_max) {
    const preavis = c.nb_execution_preavis ? ` (préavis dès ${c.nb_execution_preavis})` : "";
    return `Max ${c.nb_execution_max} exécutions${preavis}`;
  }
  return "";
};

const { showModal } = useModalStore();
const editControle = () =>
  showModal({ component: "ModalControle", data: { ...controle.value }, size: 2 });
</script>

<template>
  <!-- Le contrôle peut avoir disparu depuis que l'URL a été ouverte (lien
       direct, favori, suppression depuis les paramètres) : sans cette garde,
       le rendu échoue sur un contrôle introuvable. -->
  <div v-if="!controle" class="alert alert-warning mb-0">
    Ce contrôle n'existe pas ou n'existe plus.
  </div>
  <div v-else class="row">
    <div class="col-12">
      <base-card>
        <template #title>Détails du contrôle</template>
        <template #header>
          <button type="button" class="btn btn-primary btn-sm" @click="editControle">
            <font-awesome-icon :icon="['far', 'edit']" />
          </button>
        </template>
        <template #body>
          <table class="table mb-0">
            <tr>
              <th class="col-3">Nom</th>
              <td>{{ controle.nom }}</td>
            </tr>
            <tr>
              <th>Description</th>
              <td>{{ controle.description || "-" }}</td>
            </tr>
            <tr>
              <th>Récurrence</th>
              <td>
                <span class="badge bg-primary me-2">{{
                  recurrenceTypeLabel(controle.recurrence_type)
                }}</span>
                {{ recurrenceLabel(controle) }}
              </td>
            </tr>
            <tr>
              <th>Responsable</th>
              <td>
                <span v-if="controle.externe" class="badge bg-warning text-dark me-2">Externe</span>
                {{ controle.reparateur || "-" }}
              </td>
            </tr>
            <tr>
              <th>Types de matériel concernés</th>
              <td>
                <span
                  v-for="mt in controle.materiel_types"
                  :key="mt.id"
                  class="badge bg-secondary me-1"
                >
                  {{ mt.materiel_type.designation }}
                </span>
              </td>
            </tr>
          </table>
        </template>
      </base-card>
    </div>
    <div class="col-12">
      <base-card>
        <template #title>Tâches</template>
        <template #body-table>
          <parametre-taches-controle :controle="controle" />
        </template>
      </base-card>
    </div>
  </div>
</template>
