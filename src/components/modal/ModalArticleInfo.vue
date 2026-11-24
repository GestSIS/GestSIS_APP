<script setup>
import { computed, ref } from "vue";
import { useModalStore } from "../../stores/common/Modal.js";
import { useMaterielTypeStore } from "../../stores/materiel/Type.js";
import { useEmplacementStore } from "../../stores/materiel/Emplacement.js";
import { useSapeurStore } from "../../stores/sapeur/Sapeur.js";
import { useCouleurStore } from "../../stores/materiel/Couleur.js";
import { useControleStore } from "../../stores/materiel/Controle.js";
import ArticleService from "../../services/materiel/ArticleService.js";
import ControleExecService from "../../services/materiel/ControleExecService.js";
import TagCouleur from "../materiel/TagCouleur.vue";
import { indexedData, toDateInputValue, toLocalIsoDate } from "../../tools/index.js";
import { formatDate, formatDateTime, parseDate } from "../../tools/formatters.js";
import { emplacementIdPourArticle, estPerime } from "../../tools/materiel.js";

const { data } = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
});

const { closeModal } = useModalStore();

const articleId = data.id;

const typeStore = useMaterielTypeStore();
const emplacementStore = useEmplacementStore();
const sapeurStore = useSapeurStore();
const couleurStore = useCouleurStore();
const controleStore = useControleStore();

// Les emplacements ne servent qu'à afficher le chemin d'un article rangé : un
// article attribué à un sapeur affiche ce dernier à la place. Ne pas les charger
// dans ce cas évite d'exiger l'accès aux emplacements (materiel.lecture) depuis
// la fiche d'un sapeur.
const afficheEmplacement = !data.sapeur_id && emplacementIdPourArticle(data) !== null;

const execs = ref([]);
const composants = ref([]);
const attributions = ref([]);
const colonnesComposants = [
  { title: "Date", key: "executed_at", type: "date" },
  { title: "Contrôle", key: "controle_nom" },
  { title: "Composant", key: "composant_nom" },
  { title: "Article contrôlé", slot: "articleControle" },
];
// Date en slot : date seule ou date-heure selon l'événement ; pas de tri par colonne pour
// garder l'ordre de l'historique (ordre des événements d'un même jour).
const colonnesHistorique = [
  { title: "Date", slot: "date" },
  { title: "Événement", slot: "evenement" },
];
await Promise.all([
  typeStore.fetchMaterielTypes(),
  afficheEmplacement ? emplacementStore.fetchEmplacements() : null,
  sapeurStore.fetchSapeurs(),
  couleurStore.fetchCouleurs(),
  controleStore.fetchControles(),
  ControleExecService.getExecsPourArticle(articleId).then((r) => {
    execs.value = r;
  }),
  ArticleService.getAttributionsArticle(articleId).then((r) => {
    attributions.value = r;
  }),
  ControleExecService.getComposantsPourArticle(articleId).then((r) => {
    composants.value = r;
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
const emplacements = computed(() =>
  afficheEmplacement ? linearEmplacements(emplacementIdPourArticle(data)) : [],
);

const nomSapeur = (sapeurId) =>
  sapeurStore.liste.find((s) => s.id === sapeurId)?.nom_prenom ?? null;

// Ordre des événements d'un même jour (du plus ancien au plus récent).
const ORDRE_EVENEMENT = {
  AJOUT: 0,
  ATTRIBUTION: 1,
  FIN_ATTRIBUTION: 2,
  CONTROLE: 3,
  SUPPRESSION: 4,
};

// Jour (« YYYY-MM-DD ») d'un événement : une date pure est tronquée telle quelle
// (la convertir en heure locale pourrait la décaler d'un jour), une date-heure
// est ramenée au jour local.
const jourEvenement = (evt) =>
  evt.dateSeule ? toDateInputValue(evt.date) : toLocalIsoDate(parseDate(evt.date) ?? new Date(0));

// Une attribution close le jour où une autre attribution du même article commence
// (transfert) ou le jour de la suppression de l'article n'a pas été « rendue ».
const estFinSansRetour = (attribution) => {
  const jourFin = toDateInputValue(attribution.fin);
  const transfert = attributions.value.some(
    (a) => a.id !== attribution.id && toDateInputValue(a.debut) === jourFin,
  );
  return transfert || (!!data.supprime_le && toDateInputValue(data.supprime_le) === jourFin);
};

// Historique de l'article, du plus récent au plus ancien ; à jour égal, selon
// l'ordre des événements (ex : une suppression après le retour du même jour).
const historique = computed(() => {
  const events = [];
  if (data.created_at) {
    events.push({
      id: "ajout",
      date: data.created_at,
      ordre: ORDRE_EVENEMENT.AJOUT,
      label: "Ajouté",
    });
  }
  attributions.value.forEach((a) => {
    const attribuePar = nomSapeur(a.attribue_par_sapeur_id);
    const nom = a.sapeur?.nom_prenom ?? "-";
    events.push({
      id: `attribution-${a.id}`,
      date: a.debut,
      dateSeule: true,
      ordre: ORDRE_EVENEMENT.ATTRIBUTION,
      label: `Attribué à ${nom}`,
      detail: attribuePar ? `par ${attribuePar}` : null,
    });
    if (a.fin) {
      const cloturePar = nomSapeur(a.cloture_par_sapeur_id);
      events.push({
        id: `fin-attribution-${a.id}`,
        date: a.fin,
        dateSeule: true,
        ordre: ORDRE_EVENEMENT.FIN_ATTRIBUTION,
        label: estFinSansRetour(a) ? `Fin d'attribution à ${nom}` : `Rendu par ${nom}`,
        detail: cloturePar ? `enregistré par ${cloturePar}` : null,
      });
    }
  });
  execs.value.forEach((e) => {
    events.push({
      id: `controle-${e.id}`,
      date: e.executed_at,
      ordre: ORDRE_EVENEMENT.CONTROLE,
      label: `Contrôle ${e.controle?.nom ?? ""}`.trim(),
      detail: e.conforme ? "conforme" : "non conforme",
    });
  });
  if (data.supprime_le) {
    events.push({
      id: "suppression",
      date: data.supprime_le,
      dateSeule: true,
      ordre: ORDRE_EVENEMENT.SUPPRESSION,
      label: "Supprimé",
      detail: data.remarque_suppression || null,
    });
  }
  return events
    .map((evt) => ({ ...evt, jour: jourEvenement(evt) }))
    .sort(
      (a, b) =>
        b.jour.localeCompare(a.jour) ||
        b.ordre - a.ordre ||
        (parseDate(b.date) ?? 0) - (parseDate(a.date) ?? 0),
    );
});

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
    // Échéance enregistrée sur la dernière exécution (voir
    // ControleExecBusiness::resolveDateEcheance), pas recalculée depuis la
    // récurrence du contrôle : elle peut s'en écarter (ex : premier service
    // véhicule à 5 ans, puis tous les 2 ans).
    const prochaine =
      derniere && controle.recurrence_type === "PERIODIQUE"
        ? new Date(derniere.date_echeance)
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
      <button aria-label="Fermer" type="button" class="btn-close" @click="closeModal"></button>
    </div>
    <div class="modal-body">
      <div class="row">
        <div class="col-4">
          <dl class="row mb-0">
            <dt class="col-6">Type</dt>
            <dd class="col-6">{{ type?.designation }}</dd>

            <dt class="col-6">Statut</dt>
            <dd class="col-6">
              <span class="badge" :class="data.supprime_le ? 'bg-secondary' : 'bg-success'">
                {{ data.supprime_le ? `Supprimé le ${formatDate(data.supprime_le)}` : "Actif" }}
              </span>
              <div v-if="data.supprime_le && data.remarque_suppression" class="small text-muted">
                {{ data.remarque_suppression }}
              </div>
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
          <base-table
            :data="historique"
            :fields="colonnesHistorique"
            :hide-download="true"
            no-data="Aucun événement"
          >
            <template #date="{ rowData }">
              {{ rowData.dateSeule ? formatDate(rowData.date) : formatDateTime(rowData.date) }}
            </template>
            <template #evenement="{ rowData }">
              {{ rowData.label }}
              <span v-if="rowData.detail" class="text-muted"> — {{ rowData.detail }}</span>
            </template>
          </base-table>

          <template v-if="composants.length > 0">
            <strong class="d-block mt-3 mb-2">Utilisé comme composant</strong>
            <base-table :data="composants" :fields="colonnesComposants" :hide-download="true">
              <template #articleControle="{ rowData }">
                {{ rowData.article_controle.numero || rowData.article_controle.designation }}
              </template>
            </base-table>
          </template>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="closeModal">Fermer</button>
    </div>
  </div>
</template>
