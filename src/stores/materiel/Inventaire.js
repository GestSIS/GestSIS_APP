import InventaireService from "../../services/materiel/InventaireService.js";
import { defineStore } from "pinia";
import { groupedByData, indexedData } from "../../tools/index.js";
import { articlesParNoeud, descendantsEtSoi } from "../../tools/inventaire.js";

// Chaque appel de saisie renvoie l'inventaire complet : ils partent l'un après l'autre pour
// qu'une réponse plus ancienne n'écrase jamais une plus récente.
let saisieEnCours = Promise.resolve();

export const useInventaireStore = defineStore("inventaire", {
  state: () => ({
    liste: [],
    // Inventaire ouvert dans la page de saisie : périmètre figé (emplacements) et lignes
    courant: null,
    // Écarts de l'inventaire validé, comparés par l'API au stock actuel
    ecarts: [],
  }),
  getters: {
    enCours: (state) => state.liste.filter((i) => i.statut === "EN_COURS"),
    // La liste arrive triée du plus récent au plus ancien
    valides: (state) => state.liste.filter((i) => i.statut === "VALIDE"),
    noeuds: (state) => state.courant?.emplacements ?? [],
    racine: (state) => state.courant?.emplacements.find((n) => n.parent_id === null) ?? null,
    indexedNoeuds: (state) => indexedData(state.courant?.emplacements ?? []),
    noeudsParParent: (state) => groupedByData(state.courant?.emplacements ?? [], "parent_id"),
    articlesParNoeud: (state) => articlesParNoeud(state.courant?.lignes ?? []),
    // Écarts constatés pendant la saisie (manquant, défectueux, en plus), dans l'ordre de
    // l'arbre ; un lot en porte un par nature
    ecartsSaisie() {
      if (!this.racine) return [];
      return descendantsEtSoi(this.racine.id, this.noeudsParParent).flatMap((noeudId) =>
        (this.articlesParNoeud[noeudId] ?? []).flatMap((a) => a.ecarts),
      );
    },
  },
  actions: {
    async fetchInventaires() {
      this.liste = await InventaireService.getInventaires();
    },
    async fetchInventaire(inventaireId) {
      this.courant = await InventaireService.getInventaire(inventaireId);
      await this.fetchEcarts();
    },
    async fetchEcarts() {
      this.ecarts =
        this.courant?.statut === "VALIDE" ? await InventaireService.getEcarts(this.courant.id) : [];
    },
    async demarrerInventaire(inventaire) {
      const data = await InventaireService.demarrerInventaire(inventaire);
      await this.fetchInventaires();
      return data;
    },
    async supprimerInventaire(inventaireId) {
      await InventaireService.supprimerInventaire(inventaireId);
      await this.fetchInventaires();
    },
    async saisir(appel) {
      const reponse = saisieEnCours.then(appel);
      saisieEnCours = reponse.catch(() => {});
      this.courant = await reponse;
      return this.courant;
    },
    ajouterEnPlus(materiel) {
      return this.saisir(() => InventaireService.ajouterEnPlus(this.courant.id, materiel));
    },
    modifierLigne(ligneId, modification) {
      return this.saisir(() =>
        InventaireService.modifierLigne(this.courant.id, ligneId, modification),
      );
    },
    retirerLigne(ligneId) {
      return this.saisir(() => InventaireService.retirerLigne(this.courant.id, ligneId));
    },
    // `defectueux` omis : l'API garde le nombre de pièces défectueuses déjà saisi
    compterLot(ligneId, quantite, defectueux) {
      return this.saisir(() =>
        InventaireService.compterLot(this.courant.id, ligneId, { quantite, defectueux }),
      );
    },
    async validerInventaire(remarque) {
      await this.saisir(() => InventaireService.validerInventaire(this.courant.id, { remarque }));
      await this.fetchEcarts();
    },
    // En cas de refus (le stock a changé…), les écarts sont recalculés pour afficher l'état réel
    async traiterEcart(traitement) {
      try {
        this.ecarts = await InventaireService.traiterEcart(this.courant.id, traitement);
      } catch (error) {
        await this.fetchEcarts();
        throw error;
      }
    },
    chercherArticle(numero) {
      return InventaireService.getArticleParNumero(this.courant.id, numero);
    },
    marquerConformes(noeudId) {
      return this.saisir(() => InventaireService.marquerConformes(this.courant.id, noeudId));
    },
  },
});
