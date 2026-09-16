<script setup>
import { computed, ref } from "vue";
import { useModalStore } from "../../stores/common/Modal.js";
import { useMaterielTypeStore } from "../../stores/materiel/Type.js";
import { useEmplacementStore } from "../../stores/materiel/Emplacement.js";
import { useSapeurStore } from "../../stores/sapeur/Sapeur.js";
import { useCouleurStore } from "../../stores/materiel/Couleur.js";
import { useControleStore } from "../../stores/materiel/Controle.js";
import ControleExecService from "../../services/materiel/ControleExecService.js";
import TagCouleur from "../materiel/TagCouleur.vue";
import { indexedData } from "../../tools/index.js";
import { emplacementIdPourArticle, estPerime } from "../../tools/materiel.js";

const { data } = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
});

const { closeModal } = useModalStore();

// Point d'entrée le plus fiable pour l'id de l'article : la plupart des
// tableaux passent l'article directement (data.id = id de l'article), mais
// TabLavages.vue passe un enregistrement de lavage dont l'id est celui du
// lavage — l'article réel est alors exposé sous data.article_id.
const articleId = data.article_id ?? data.id;

const typeStore = useMaterielTypeStore();
const emplacementStore = useEmplacementStore();
const sapeurStore = useSapeurStore();
const couleurStore = useCouleurStore();
const controleStore = useControleStore();

const execs = ref([]);
await Promise.all([
  typeStore.fetchMaterielTypes(),
  emplacementStore.fetchEmplacements(),
  sapeurStore.fetchListeSapeur(),
  couleurStore.fetchCouleurs(),
  controleStore.fetchControles(),
  ControleExecService.getExecsPourArticle(articleId).then((r) => {
    execs.value = r;
  }),
]);

const type = computed(() => typeStore.liste.find((t) => t.id === data.materiel_type_id));

const indexedEmplacements = computed(() => indexedData(emplacementStore.liste));
const indexedCouleurs = computed(() => indexedData(couleurStore.liste));

const linearEmplacements = (emplacementId) => {
  if (emplacementId === null) {
    return [];
  }
  const emplacement = indexedEmplacements.value[emplacementId] ?? null;
  if (emplacement === null) {
    return [];
  }
  return [...linearEmplacements(emplacement.parent_id), emplacement];
};

const sapeur = computed(() =>
  data.sapeur_id ? sapeurStore.liste.find((s) => s.id === data.sapeur_id) : null,
);

// emplacementIdPourArticle gère déjà le cas véhicule (emplacement_representee)
// en plus du cas standard (emplacement_id).
const emplacements = computed(() => linearEmplacements(emplacementIdPourArticle(data)));

const addMonths = (date, months) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
};

const articlePerime = computed(() => estPerime(data));

// Contrôles à afficher : ceux applicables au type de cet article, complétés
// par ceux ayant déjà une exécution saisie pour cet article même s'ils ne
// sont plus applicables au type aujourd'hui (ex: type retiré du contrôle
// après coup).
const controlesAffiches = computed(() => {
  const parType = controleStore.liste.filter((c) =>
    c.materiel_types?.some((mt) => mt.materiel_type_id === data.materiel_type_id),
  );
  const dejaSaisis = execs.value.map((e) => e.controle).filter((c) => c);

  return Object.values(Object.fromEntries([...parType, ...dejaSaisis].map((c) => [c.id, c])));
});

const derniereExecPourControle = (controleId) =>
  execs.value
    .filter((e) => e.controle_id === controleId)
    .sort((a, b) => new Date(b.executed_at) - new Date(a.executed_at))[0] ?? null;

const lignesControles = computed(() =>
  controlesAffiches.value.map((controle) => {
    const derniere = derniereExecPourControle(controle.id);
    const prochaine =
      derniere && controle.recurrence_type === "PERIODIQUE"
        ? addMonths(derniere.executed_at, controle.recurrence_value)
        : null;

    let niveau = null;
    const messages = [];

    if (derniere && !derniere.conforme) {
      niveau = "danger";
      messages.push("Dernier contrôle en échec");
    }

    if (controle.recurrence_type === "PERIODIQUE") {
      if (!derniere) {
        niveau = niveau ?? "warning";
        messages.push("Jamais");
      } else {
        const maintenant = new Date();
        if (maintenant >= prochaine) {
          niveau = "danger";
          messages.push("En retard");
        } else if (
          controle.duree_preavis &&
          maintenant >= addMonths(prochaine, -controle.duree_preavis)
        ) {
          niveau = niveau ?? "warning";
          messages.push("Préavis");
        }
      }
    } else if (controle.nb_execution_max) {
      const nbExecutions = execs.value.filter((e) => e.controle_id === controle.id).length;
      if (nbExecutions >= controle.nb_execution_max) {
        niveau = "danger";
        messages.push(`Nombre d'exécutions atteint (${nbExecutions}/${controle.nb_execution_max})`);
      } else if (controle.nb_execution_preavis && nbExecutions >= controle.nb_execution_preavis) {
        niveau = niveau ?? "warning";
        messages.push(`Préavis (${nbExecutions}/${controle.nb_execution_max})`);
      }
    }

    return { controle, derniere, prochaine, niveau, message: messages.join(" · ") };
  }),
);
</script>

<template>
  <div>
    <div class="modal-header">
      <h5 class="modal-title">
        Informations — {{ data.numero || data.designation || type?.designation }}
      </h5>
      <button type="button" class="btn-close" @click="closeModal"></button>
    </div>
    <div class="modal-body">
      <div class="row">
        <div class="col-4">
          <dl class="row mb-0">
            <dt class="col-6">Type</dt>
            <dd class="col-6">{{ type?.designation }}</dd>

            <dt class="col-6">Statut</dt>
            <dd class="col-6">
              <span class="badge" :class="data.statut ? 'bg-success' : 'bg-secondary'">
                {{ data.statut ? "Actif" : "Inactif" }}
              </span>
            </dd>

            <template v-if="type?.est_emplacement">
              <dt class="col-6">Désignation</dt>
              <dd class="col-6">{{ data.designation || "-" }}</dd>

              <dt class="col-6">Immatriculation</dt>
              <dd class="col-6">{{ data.immatriculation || "-" }}</dd>

              <dt class="col-6">Chassis</dt>
              <dd class="col-6">{{ data.chassis || "-" }}</dd>
            </template>

            <template v-else>
              <dt v-if="type?.est_numerote" class="col-6">Numéro</dt>
              <dd v-if="type?.est_numerote" class="col-6">{{ data.numero || "-" }}</dd>

              <dt v-if="type?.est_taillee" class="col-6">Taille</dt>
              <dd v-if="type?.est_taillee" class="col-6">{{ data.taille || "-" }}</dd>

              <dt v-if="data.emplacement_id" class="col-6">Compartiment</dt>
              <dd v-if="data.emplacement_id" class="col-6">{{ data.compartiment || "-" }}</dd>
            </template>

            <dt class="col-6">Étiqueté</dt>
            <dd class="col-6">
              <span class="badge" :class="data.est_etiquete ? 'bg-success' : 'bg-secondary'">
                {{ data.est_etiquete ? "Oui" : "Non" }}
              </span>
            </dd>

            <dt class="col-6">Achat</dt>
            <dd class="col-6">{{ data.achat || "-" }}</dd>

            <template v-if="type?.est_perimable">
              <dt class="col-6">Péremption</dt>
              <dd class="col-6">
                <span v-if="data.date_peremption" :class="{ 'text-danger': articlePerime }">
                  <font-awesome-icon
                    v-if="articlePerime"
                    v-tooltip.bottom="'Matériel périmé'"
                    :icon="['fas', 'triangle-exclamation']"
                    class="me-1"
                  />
                  {{ new Date(data.date_peremption).toLocaleDateString("fr-CH") }}
                </span>
                <span v-else>-</span>
              </dd>
            </template>

            <dt class="col-6">Remarque</dt>
            <dd class="col-6">{{ data.remarque || "-" }}</dd>
          </dl>
        </div>

        <div class="col-8">
          <strong class="d-block mb-2">Emplacement</strong>
          <div class="mb-3">
            <div v-if="sapeur" class="badge bg-primary">
              {{ sapeur.nom_prenom }}
            </div>
            <div v-else-if="emplacements.length > 0">
              <tag-couleur
                v-for="e in emplacements"
                :key="e.id"
                :couleur="indexedCouleurs[e.couleur_id]"
                >{{ e.designation }}</tag-couleur
              >
            </div>
            <span v-else class="text-muted">Aucun emplacement ni attribution</span>
          </div>

          <template v-if="lignesControles.length > 0">
            <strong class="d-block mb-2">Contrôles</strong>
            <table class="table table-sm mb-3">
              <thead>
                <tr>
                  <th>Contrôle</th>
                  <th>Dernier</th>
                  <th>Prochain</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="ligne in lignesControles" :key="ligne.controle.id">
                  <td>{{ ligne.controle.nom }}</td>
                  <td>
                    {{
                      ligne.derniere
                        ? new Date(ligne.derniere.executed_at).toLocaleDateString("fr-CH")
                        : "Jamais"
                    }}
                  </td>
                  <td>{{ ligne.prochaine ? ligne.prochaine.toLocaleDateString("fr-CH") : "-" }}</td>
                  <td>
                    <span
                      v-if="ligne.niveau"
                      class="badge"
                      :class="ligne.niveau === 'danger' ? 'bg-danger' : 'bg-warning text-dark'"
                    >
                      {{ ligne.message }}
                    </span>
                    <span v-else-if="ligne.derniere" class="badge bg-success">Conforme</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </template>

          <strong class="d-block mb-2">Historique</strong>
          <dl class="row mb-0">
            <dt class="col-3">Créé le</dt>
            <dd class="col-9">
              {{ data.created_at ? new Date(data.created_at).toLocaleDateString("fr-CH") : "-" }}
            </dd>

            <template v-if="type?.est_lavable && data.lavages !== undefined">
              <dt class="col-3">Lavages</dt>
              <dd class="col-9">{{ data.lavages.length }}</dd>
            </template>
          </dl>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="closeModal">Fermer</button>
    </div>
  </div>
</template>
